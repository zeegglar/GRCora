import { supabase } from './supabaseClient';
import { sanitizePrompt, validatePromptSafety } from '../utils/sanitization';
import type { Risk, AssessmentItem, Control, Vendor, Project } from '../types';

interface QueryClassification {
  type: 'dataset' | 'knowledge';
  confidence: number;
  entities: string[];
  dataTypes: ('risks' | 'controls' | 'policies' | 'vendors' | 'evidence' | 'dashboards')[];
}

interface DatasetQuery {
  hasData: boolean;
  results: any[];
  source: 'supabase' | 'local' | 'none';
  error?: string;
}

interface GRCAIResponse {
  content: string;
  type: 'dataset-grounded' | 'knowledge-based';
  sources: string[];
  dataStatus: 'available' | 'empty' | 'error';
  confidence: number;
}

export class GRCAIService {
  private static instance: GRCAIService;
  private llm: any = null;

  private constructor() {
    this.initializeLLM();
  }

  public static getInstance(): GRCAIService {
    if (!GRCAIService.instance) {
      GRCAIService.instance = new GRCAIService();
    }
    return GRCAIService.instance;
  }

  private async initializeLLM() {
    try {
      const { ChatOllama } = await import('@langchain/ollama');
      this.llm = new ChatOllama({
        model: 'mistral:latest',
        baseUrl: 'http://localhost:11434',
        temperature: 0.3,
      });
    } catch (error) {
      console.warn('LLM initialization failed:', error);
    }
  }

  /**
   * Main entry point - classifies query and routes to appropriate handler
   */
  async processQuery(
    query: string,
    context: {
      project?: Project;
      risks?: Risk[];
      assessmentItems?: AssessmentItem[];
      controls?: Map<string, Control>;
      vendors?: Vendor[];
    }
  ): Promise<GRCAIResponse> {
    // Validate and sanitize input
    const validation = validatePromptSafety(query);
    if (!validation.isValid) {
      throw new Error(`Invalid query: ${validation.reason}`);
    }

    const sanitizedQuery = sanitizePrompt(query);

    // Step 1: Classify the query
    const classification = await this.classifyQuery(sanitizedQuery);

    console.log(`📝 Query classified as: ${classification.type} (confidence: ${(classification.confidence * 100).toFixed(1)}%)`);
    console.log(`🔍 Detected data types: ${classification.dataTypes.join(', ')}`);

    // Step 2: Route to appropriate handler
    if (classification.type === 'dataset') {
      return this.handleDatasetQuery(sanitizedQuery, classification, context);
    } else {
      return this.handleKnowledgeQuery(sanitizedQuery, classification);
    }
  }

  /**
   * Classify query as dataset-grounded or knowledge-based
   */
  private async classifyQuery(query: string): Promise<QueryClassification> {
    const lowerQuery = query.toLowerCase();

    // Dataset indicators
    const datasetKeywords = [
      'my controls', 'my risks', 'my policies', 'my vendors', 'my evidence',
      'current risks', 'our controls', 'show me', 'what are my',
      'how many', 'list my', 'dashboard', 'status', 'compliance rate',
      'risk level', 'assessment results', 'vendor status'
    ];

    // Knowledge indicators
    const knowledgeKeywords = [
      'what is', 'define', 'explain', 'difference between', 'how does',
      'what are the types', 'list the', 'summarize', 'purpose of',
      'best practices', 'framework', 'standard', 'methodology'
    ];

    // GRC frameworks and standards (always knowledge-based)
    const frameworkKeywords = [
      'nist', 'iso 27001', 'iso 27002', 'sox', 'pci dss', 'hipaa',
      'gdpr', 'cobit', 'coso', 'annex a', 'csf', 'rmf', 'ai rmf'
    ];

    let datasetScore = 0;
    let knowledgeScore = 0;
    let detectedDataTypes: string[] = [];

    // Score dataset indicators
    for (const keyword of datasetKeywords) {
      if (lowerQuery.includes(keyword)) {
        datasetScore += 2;
      }
    }

    // Score knowledge indicators
    for (const keyword of knowledgeKeywords) {
      if (lowerQuery.includes(keyword)) {
        knowledgeScore += 2;
      }
    }

    // Framework mentions are always knowledge
    for (const framework of frameworkKeywords) {
      if (lowerQuery.includes(framework)) {
        knowledgeScore += 3;
      }
    }

    // Detect specific data types
    if (lowerQuery.includes('risk')) detectedDataTypes.push('risks');
    if (lowerQuery.includes('control')) detectedDataTypes.push('controls');
    if (lowerQuery.includes('policy') || lowerQuery.includes('policies')) detectedDataTypes.push('policies');
    if (lowerQuery.includes('vendor')) detectedDataTypes.push('vendors');
    if (lowerQuery.includes('evidence')) detectedDataTypes.push('evidence');
    if (lowerQuery.includes('dashboard')) detectedDataTypes.push('dashboards');

    // Determine final classification
    const isDataset = datasetScore > knowledgeScore;
    const confidence = Math.max(datasetScore, knowledgeScore) / (datasetScore + knowledgeScore + 1);

    return {
      type: isDataset ? 'dataset' : 'knowledge',
      confidence,
      entities: [],
      dataTypes: detectedDataTypes as any[]
    };
  }

  /**
   * Handle dataset-grounded queries with enhanced validation
   */
  private async handleDatasetQuery(
    query: string,
    classification: QueryClassification,
    context: any
  ): Promise<GRCAIResponse> {
    console.log('🗄️ Processing dataset query...');

    // Retrieve relevant data
    const dataQuery = await this.queryDataset(classification.dataTypes, context);

    // Enhanced validation - must have actual data
    if (!dataQuery.hasData || dataQuery.results.length === 0) {
      return {
        content: 'No data available for this query. Please upload or check your dataset.',
        type: 'dataset-grounded',
        sources: [dataQuery.source || 'none'],
        dataStatus: 'empty',
        confidence: 1.0
      };
    }

    if (dataQuery.error) {
      return {
        content: `Error retrieving data: ${dataQuery.error}. Please check your dataset connection.`,
        type: 'dataset-grounded',
        sources: [dataQuery.source],
        dataStatus: 'error',
        confidence: 1.0
      };
    }

    // Validate data quality before proceeding
    const dataValidation = this.validateDatasetQuality(dataQuery.results, classification.dataTypes);
    if (!dataValidation.isValid) {
      return {
        content: `Dataset validation failed: ${dataValidation.reason}. Please check your data quality.`,
        type: 'dataset-grounded',
        sources: [dataQuery.source],
        dataStatus: 'error',
        confidence: 1.0
      };
    }

    // Generate AI response based on actual data with strict validation
    const response = await this.generateDatasetResponse(query, dataQuery, context);

    // Final validation: ensure no placeholder values in response
    if (this.containsPlaceholderValues(response)) {
      const fallbackResponse = this.generateValidatedDatasetResponse(query, dataQuery, context);
      return {
        content: fallbackResponse,
        type: 'dataset-grounded',
        sources: [`${dataQuery.source} dataset`, 'Validated Output'],
        dataStatus: 'available',
        confidence: 0.8
      };
    }

    return {
      content: response,
      type: 'dataset-grounded',
      sources: [`${dataQuery.source} dataset`],
      dataStatus: 'available',
      confidence: 0.9
    };
  }

  /**
   * Handle knowledge-based queries
   */
  private async handleKnowledgeQuery(
    query: string,
    classification: QueryClassification
  ): Promise<GRCAIResponse> {
    console.log('🧠 Processing knowledge query...');

    if (!this.llm) {
      await this.initializeLLM();
    }

    if (!this.llm) {
      throw new Error('AI service unavailable. Please check Ollama configuration.');
    }

    const knowledgePrompt = `You are a GRC (Governance, Risk, and Compliance) expert. Answer this question using your domain knowledge of cybersecurity frameworks, risk management, compliance standards, and best practices.

Question: ${query}

CRITICAL REQUIREMENTS:
1. Base your answer ONLY on established GRC frameworks and standards
2. ALWAYS cite specific sources (e.g., "NIST CSF 2.0", "ISO 27001:2022", "COBIT 2019")
3. If you don't know something, explicitly state "This information is not available in my knowledge base"
4. Do NOT make up statistics, percentages, or specific requirements
5. Do NOT provide organization-specific advice without dataset context

Provide a comprehensive, accurate answer with:
- Clear definitions and explanations
- Specific framework citations for each claim
- Industry best practices with sources
- Framework mappings where relevant
- Practical applications from established standards
- Regulatory context if applicable

Format your response with clear source attribution for each major point.`;

    try {
      const response = await this.llm.invoke(knowledgePrompt);
      const responseContent = response.content as string;

      // Validate response for hallucinations and source citations
      const validationResult = this.validateKnowledgeResponse(responseContent, query);

      if (!validationResult.isValid) {
        console.warn('🚨 Hallucination detected in knowledge response:', validationResult.reason);
        // Fall back to curated knowledge
        const fallbackResponse = this.getFallbackKnowledgeResponse(query);
        return {
          content: fallbackResponse + '\n\n**Note:** LLM response validation failed, using curated knowledge base.',
          type: 'knowledge-based',
          sources: ['Built-in GRC Knowledge', 'Validation Fallback'],
          dataStatus: 'available',
          confidence: 0.7
        };
      }

      return {
        content: responseContent,
        type: 'knowledge-based',
        sources: validationResult.detectedSources || ['GRC Domain Knowledge', 'Industry Frameworks'],
        dataStatus: 'available',
        confidence: validationResult.confidence
      };
    } catch (error) {
      console.error('Knowledge query failed:', error);

      // Fallback to basic GRC knowledge
      const fallbackResponse = this.getFallbackKnowledgeResponse(query);

      return {
        content: fallbackResponse,
        type: 'knowledge-based',
        sources: ['Built-in GRC Knowledge'],
        dataStatus: 'available',
        confidence: 0.6
      };
    }
  }

  /**
   * Query the actual dataset
   */
  private async queryDataset(
    dataTypes: string[],
    context: any
  ): Promise<DatasetQuery> {
    try {
      let hasData = false;
      let results: any[] = [];

      // Check local context first
      if (context.risks && context.risks.length > 0) {
        hasData = true;
        results.push(...context.risks);
      }

      if (context.assessmentItems && context.assessmentItems.length > 0) {
        hasData = true;
        results.push(...context.assessmentItems);
      }

      if (context.vendors && context.vendors.length > 0) {
        hasData = true;
        results.push(...context.vendors);
      }

      if (context.controls && context.controls.size > 0) {
        hasData = true;
        results.push(...Array.from(context.controls.values()));
      }

      // Try Supabase if no local data
      if (!hasData) {
        try {
          for (const dataType of dataTypes) {
            const { data, error } = await supabase
              .from(this.getTableName(dataType))
              .select('*')
              .limit(100);

            if (error) throw error;
            if (data && data.length > 0) {
              hasData = true;
              results.push(...data);
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase query failed:', supabaseError);
        }
      }

      return {
        hasData,
        results,
        source: hasData ? (context.risks ? 'local' : 'supabase') : 'none'
      };

    } catch (error) {
      return {
        hasData: false,
        results: [],
        source: 'none',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getTableName(dataType: string): string {
    const tableMap: Record<string, string> = {
      'risks': 'risks',
      'controls': 'controls',
      'policies': 'policies',
      'vendors': 'vendors',
      'evidence': 'evidence',
      'dashboards': 'projects'
    };
    return tableMap[dataType] || 'projects';
  }

  /**
   * Generate response based on actual dataset
   */
  private async generateDatasetResponse(
    query: string,
    dataQuery: DatasetQuery,
    context: any
  ): Promise<string> {
    const stats = this.calculateDatasetStats(dataQuery.results, context);

    const dataPrompt = `Based on the actual dataset provided, answer this query: "${query}"

Dataset Statistics:
${stats}

Raw Data Sample:
${JSON.stringify(dataQuery.results.slice(0, 5), null, 2)}

Provide a factual analysis based ONLY on this actual data. Do not add placeholder percentages or made-up statistics. If specific metrics aren't available in the data, state that clearly.`;

    if (this.llm) {
      try {
        const response = await this.llm.invoke(dataPrompt);
        return response.content as string;
      } catch (error) {
        console.error('Dataset response generation failed:', error);
      }
    }

    // Fallback to template-based response
    return this.generateDatasetFallback(query, stats);
  }

  private calculateDatasetStats(results: any[], context: any): string {
    const stats: string[] = [];

    if (context.risks) {
      const risks = context.risks;
      stats.push(`Risks: ${risks.length} total`);
      if (risks.length > 0) {
        const critical = risks.filter((r: Risk) => r.level === 'Critical').length;
        const high = risks.filter((r: Risk) => r.level === 'High').length;
        const medium = risks.filter((r: Risk) => r.level === 'Medium').length;
        const low = risks.filter((r: Risk) => r.level === 'Low').length;
        stats.push(`  - Critical: ${critical}, High: ${high}, Medium: ${medium}, Low: ${low}`);
      }
    }

    if (context.assessmentItems) {
      const items = context.assessmentItems;
      stats.push(`Assessment Items: ${items.length} total`);
      if (items.length > 0) {
        const compliant = items.filter((i: AssessmentItem) => i.status === 'Compliant').length;
        const nonCompliant = items.filter((i: AssessmentItem) => i.status === 'Non-Compliant').length;
        const inProgress = items.filter((i: AssessmentItem) => i.status === 'In Progress').length;
        stats.push(`  - Compliant: ${compliant}, Non-Compliant: ${nonCompliant}, In Progress: ${inProgress}`);
      }
    }

    if (context.vendors) {
      stats.push(`Vendors: ${context.vendors.length} total`);
    }

    if (context.controls) {
      stats.push(`Controls: ${context.controls.size} total`);
    }

    if (context.project) {
      stats.push(`Project: ${context.project.name}`);
      stats.push(`Frameworks: ${context.project.frameworks?.join(', ') || 'None'}`);
    }

    return stats.join('\n');
  }

  /**
   * Validate dataset quality to prevent misleading outputs
   */
  private validateDatasetQuality(results: any[], dataTypes: string[]): { isValid: boolean; reason?: string } {
    if (!results || results.length === 0) {
      return { isValid: false, reason: 'No data records found' };
    }

    // Check for empty or null values in critical fields
    const hasValidData = results.some(item => {
      if (dataTypes.includes('risks') && item.level && item.status) return true;
      if (dataTypes.includes('controls') && (item.name || item.id)) return true;
      if (dataTypes.includes('vendors') && item.name) return true;
      if (dataTypes.includes('policies') && item.title) return true;
      return false;
    });

    if (!hasValidData) {
      return { isValid: false, reason: 'Data records are missing critical fields' };
    }

    return { isValid: true };
  }

  /**
   * Check for placeholder or misleading values in AI responses
   */
  private containsPlaceholderValues(response: string): boolean {
    const placeholderPatterns = [
      /\bnan\b/i,
      /\bNaN\b/,
      /\b0\/0\b/,
      /\b\d+%.*placeholder/i,
      /\bfake.*percent/i,
      /\bunknown.*%/i,
      /\btbd\b/i,
      /\btodo\b/i,
      /\[\[.*\]\]/,
      /\{\{.*\}\}/
    ];

    return placeholderPatterns.some(pattern => pattern.test(response));
  }

  /**
   * Generate validated dataset response without placeholders
   */
  private generateValidatedDatasetResponse(query: string, dataQuery: DatasetQuery, context: any): string {
    const stats = this.calculateDatasetStats(dataQuery.results, context);

    return `**Dataset Analysis Results:**

${stats}

**Query Response:**
Based on your actual dataset, I can provide factual information about the data shown above.

**Data Source:** ${dataQuery.source}
**Records Analyzed:** ${dataQuery.results.length}

For specific metrics or calculations not shown in the raw statistics above, please specify what analysis you need and I'll calculate it directly from your actual data.

**Note:** This response is based entirely on your actual dataset without any placeholder or estimated values.`;
  }

  /**
   * Validate knowledge-based responses for hallucinations and proper citations
   */
  private validateKnowledgeResponse(response: string, query: string): {
    isValid: boolean;
    reason?: string;
    detectedSources?: string[];
    confidence: number;
  } {
    // Check for valid GRC framework citations
    const validFrameworks = [
      'NIST', 'ISO 27001', 'ISO 27002', 'ISO 31000', 'COBIT', 'COSO',
      'PCI DSS', 'HIPAA', 'GDPR', 'SOX', 'CCPA', 'FedRAMP'
    ];

    const detectedSources: string[] = [];
    let hasValidCitations = false;

    // Extract citations from response
    for (const framework of validFrameworks) {
      if (response.toLowerCase().includes(framework.toLowerCase())) {
        detectedSources.push(framework);
        hasValidCitations = true;
      }
    }

    // Check for hallucination indicators
    const hallucinationPatterns = [
      /made.up.*standard/i,
      /fictional.*framework/i,
      /\b\d{1,3}\.\d{1,2}%\b/,  // Specific fake percentages
      /according to.*study.*\d{4}/i,  // Fake studies
      /research shows.*\d+%/i,
      /\b[A-Z]{2,5}-\d{4,6}\b/,  // Fake control numbers
      /proprietary.*method/i
    ];

    for (const pattern of hallucinationPatterns) {
      if (pattern.test(response)) {
        return {
          isValid: false,
          reason: `Potential hallucination detected: suspicious pattern found`,
          confidence: 0.2
        };
      }
    }

    // Check for minimum citation requirements
    if (!hasValidCitations && response.length > 100) {
      return {
        isValid: false,
        reason: 'No valid framework citations found in substantial response',
        confidence: 0.3
      };
    }

    // Check response quality
    if (response.length < 50) {
      return {
        isValid: false,
        reason: 'Response too short for validation',
        confidence: 0.4
      };
    }

    // Calculate confidence based on citation quality
    let confidence = 0.6;
    if (detectedSources.length >= 2) confidence += 0.1;
    if (response.includes('Source:')) confidence += 0.1;
    if (!this.containsPlaceholderValues(response)) confidence += 0.1;

    return {
      isValid: true,
      detectedSources,
      confidence: Math.min(confidence, 0.9)
    };
  }

  private generateDatasetFallback(query: string, stats: string): string {
    return `Based on your current dataset:

${stats}

This represents your actual GRC data. For more detailed analysis or specific metrics not shown above, please ensure all relevant data is properly loaded into the system.`;
  }

  private getFallbackKnowledgeResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Risk-related queries
    if (lowerQuery.includes('what is risk') || lowerQuery.includes('define risk')) {
      return `**Risk in GRC Terms:**

Risk is the potential for loss, damage, or destruction of assets or data as a result of a cyber threat.

**Risk Formula:** Risk = Threat × Vulnerability × Impact

**Key Components:**
- **Threat:** A potential danger that could exploit a vulnerability
- **Vulnerability:** A weakness that could be exploited
- **Impact:** The consequence if the risk materializes
- **Likelihood:** The probability of occurrence

**Risk Categories:** Critical, High, Medium, Low (based on likelihood × impact)

**Source:** Industry standard risk management frameworks (NIST, ISO 31000)`;
    }

    // Control types
    if (lowerQuery.includes('preventive') && lowerQuery.includes('detective')) {
      return `**Preventive vs Detective Controls:**

**Preventive Controls:**
- **Purpose:** Stop incidents before they occur
- **Examples:** Firewalls, access controls, encryption, security training
- **Timing:** Proactive - act before an event
- **Goal:** Prevent unauthorized access or actions

**Detective Controls:**
- **Purpose:** Identify incidents as they happen or after they occur
- **Examples:** IDS/IPS, SIEM, monitoring, auditing, log analysis
- **Timing:** Reactive - respond to events
- **Goal:** Detect and alert on unauthorized activities

**Note:** Both are essential for defense-in-depth strategy. Also includes **Corrective Controls** (respond to incidents) and **Compensating Controls** (alternative measures).

**Source:** NIST Cybersecurity Framework, ISO 27001`;
    }

    // ISO 27001 Annex A
    if (lowerQuery.includes('iso 27001') && lowerQuery.includes('annex a')) {
      return `**ISO 27001:2022 Annex A Controls (93 total):**

**A.5 Organizational Controls (37 controls)**
- Information security policies and procedures
- Human resource security (hiring, training, termination)
- Asset management and classification
- Supply chain relationships and vendor management

**A.6 People Controls (8 controls)**
- Terms and conditions of employment
- Remote working guidelines
- Information security awareness and training programs

**A.7 Physical Controls (14 controls)**
- Physical security perimeters and access controls
- Equipment protection and maintenance
- Secure disposal and reuse of equipment

**A.8 Technological Controls (34 controls)**
- Access management and authentication
- Cryptography and key management
- System security and configuration
- Network security controls
- Incident management procedures

**Source:** ISO/IEC 27001:2022 Information Security Management Standard`;
    }

    // NIST CSF
    if (lowerQuery.includes('nist') && (lowerQuery.includes('csf') || lowerQuery.includes('cybersecurity framework'))) {
      return `**NIST Cybersecurity Framework (CSF) 2.0:**

**Core Functions:**
1. **Govern (GV):** Organizational cybersecurity risk management strategy
2. **Identify (ID):** Asset management, risk assessment, governance
3. **Protect (PR):** Access control, awareness training, data security
4. **Detect (DE):** Anomaly detection, continuous monitoring
5. **Respond (RS):** Response planning, communications, analysis
6. **Recover (RC):** Recovery planning, improvements, communications

**Implementation Tiers:** Partial (1), Risk Informed (2), Repeatable (3), Adaptive (4)

**Source:** NIST Cybersecurity Framework 2.0 (2024)`;
    }

    // NIST AI RMF
    if (lowerQuery.includes('nist') && lowerQuery.includes('ai') && lowerQuery.includes('rmf')) {
      return `**NIST AI Risk Management Framework (AI RMF 1.0):**

**Core Functions:**
1. **GOVERN:** Foundational policies, procedures, and practices
2. **MAP:** Context, risk categorization, and characterization
3. **MEASURE:** Analysis, assessment, and monitoring of AI risks
4. **MANAGE:** Response, treatment, and ongoing monitoring

**Key Characteristics:**
- Trustworthy AI: Valid, reliable, safe, secure, resilient
- Human-AI configuration considerations
- Third-party AI system management
- AI system lifecycle integration

**Source:** NIST AI Risk Management Framework (AI RMF 1.0)`;
    }

    // Statement of Applicability
    if (lowerQuery.includes('statement of applicability') || lowerQuery.includes('soa')) {
      return `**Statement of Applicability (SoA) - ISO 27001:**

**Purpose:**
Documents which Annex A controls are applicable to your organization and provides justification for inclusion/exclusion decisions.

**Required Contents:**
- List of applicable controls and justification for inclusion
- List of excluded controls and justification for exclusion
- Current implementation status of each control
- Risk assessment results that drive control selection

**Key Requirements:**
- Must be approved by management
- Updated when risk assessment changes
- Reviewed during management reviews
- Controls cannot be excluded without proper justification

**Source:** ISO/IEC 27001:2022 Clause 6.1.3(d)`;
    }

    // RTO vs RPO
    if ((lowerQuery.includes('rto') && lowerQuery.includes('rpo')) || lowerQuery.includes('recovery')) {
      return `**RTO vs RPO in Business Continuity:**

**Recovery Time Objective (RTO):**
- Maximum acceptable time to restore services after disruption
- Measures downtime tolerance
- Example: "System must be restored within 4 hours"

**Recovery Point Objective (RPO):**
- Maximum acceptable data loss measured in time
- Measures data loss tolerance
- Example: "Can lose maximum 1 hour of data"

**Relationship:** RTO focuses on time to recover, RPO focuses on acceptable data loss. Both drive backup frequency and disaster recovery planning.

**Source:** ISO 22301, NIST SP 800-34 Contingency Planning`;
    }

    // Generic fallback with comprehensive knowledge base
    return `**GRC Knowledge Available:**

I can provide detailed information about:

**Risk Management:**
- Risk frameworks (NIST RMF, ISO 31000)
- Risk assessment methodologies
- Threat modeling approaches

**Compliance Frameworks:**
- ISO 27001/27002, NIST CSF, SOX, PCI DSS
- HIPAA, GDPR, CCPA compliance
- Industry-specific regulations

**Control Frameworks:**
- COBIT, COSO, NIST controls
- Control types and implementation
- Control testing and monitoring

**Governance:**
- Security governance models
- Policy development frameworks
- Board reporting and metrics

For specific technical implementations or organization-specific data, please ensure your dataset is properly loaded.

**Note:** This response uses built-in GRC domain knowledge. For dataset-specific queries about your controls, risks, or policies, please verify your data is available.`;
  }
}

export default GRCAIService;