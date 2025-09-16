import { supabase } from './supabaseClient';

export interface NISTControl {
  id: string;
  family: string;
  title: string;
  description: string;
  guidance: string;
  assessment_objectives: string[];
  assessment_methods: string[];
  parameters?: string[];
  related_controls: string[];
  framework: 'NIST_CSF' | 'NIST_800_53' | 'NIST_AI_RMF' | 'CIS_V8' | 'ISO_27001';
  category?: string;
  subcategory?: string;
  informative_references?: string[];
  embedding?: number[];
  content_hash: string;
}

export interface NISTQueryResult {
  controls: NISTControl[];
  relevanceScores: number[];
  suggestedImplementation: string;
  gapAnalysis?: string;
  estimatedEffort?: string;
}

export interface ComplianceGap {
  control_id: string;
  current_status: 'not_implemented' | 'partially_implemented' | 'implemented';
  gap_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort_estimate: string;
  suggested_actions: string[];
  dependencies: string[];
}

class NISTKnowledgeService {
  private readonly tableName = 'nist_controls';
  private readonly embeddingDimensions = 768; // Standard for many embedding models

  /**
   * Initialize NIST knowledge base from JSON/JSONL files
   */
  async initializeKnowledgeBase(
    nistCsfData: any[],
    nist80053Data: any[],
    nistAiData: any[]
  ): Promise<void> {
    console.log('Initializing NIST knowledge base...');

    try {
      // Process CSF data
      const csfControls = this.parseCSFData(nistCsfData);
      await this.storeControls(csfControls);

      // Process 800-53 data
      const sp80053Controls = this.parse80053Data(nist80053Data);
      await this.storeControls(sp80053Controls);

      // Process AI RMF data
      const aiControls = this.parseAIData(nistAiData);
      await this.storeControls(aiControls);

      console.log('NIST knowledge base initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NIST knowledge base:', error);
      throw error;
    }
  }

  /**
   * Parse NIST Cybersecurity Framework data
   */
  private parseCSFData(data: any[]): NISTControl[] {
    return data.map(item => ({
      id: `CSF_${item.Function}_${item.Category}_${item.Subcategory}`,
      family: item.Function,
      title: item.Subcategory || item.Category,
      description: item.Description || '',
      guidance: item['Implementation Guidance'] || item.Guidance || '',
      assessment_objectives: this.extractAssessmentObjectives(item),
      assessment_methods: ['Interview', 'Examine', 'Test'],
      related_controls: this.extractRelatedControls(item),
      framework: 'NIST_CSF' as const,
      category: item.Category,
      subcategory: item.Subcategory,
      informative_references: this.extractReferences(item),
      content_hash: this.generateContentHash(item)
    }));
  }

  /**
   * Parse NIST SP 800-53 data
   */
  private parse80053Data(data: any[]): NISTControl[] {
    return data.map(item => ({
      id: item.Control || item.ID || `SP800-53_${Math.random().toString(36).substr(2, 9)}`,
      family: item.Family || this.extractFamily(item.Control),
      title: item.Title || item['Control Title'] || '',
      description: item.Description || item['Control Description'] || '',
      guidance: item.Guidance || item['Implementation Guidance'] || '',
      assessment_objectives: this.extractAssessmentObjectives(item),
      assessment_methods: item['Assessment Methods'] || ['Examine', 'Interview', 'Test'],
      parameters: this.extractParameters(item),
      related_controls: this.extractRelatedControls(item),
      framework: 'NIST_800_53' as const,
      informative_references: this.extractReferences(item),
      content_hash: this.generateContentHash(item)
    }));
  }

  /**
   * Parse NIST AI Risk Management Framework data
   */
  private parseAIData(data: any[]): NISTControl[] {
    return data.map(item => ({
      id: `AI_RMF_${item.Function}_${item.Category}` || `AI_${Math.random().toString(36).substr(2, 9)}`,
      family: item.Function || 'AI_GOVERNANCE',
      title: item.Title || item.Category || '',
      description: item.Description || item.Outcome || '',
      guidance: item.Guidance || item['Implementation Notes'] || '',
      assessment_objectives: this.extractAssessmentObjectives(item),
      assessment_methods: ['Review', 'Assess', 'Monitor'],
      related_controls: this.extractRelatedControls(item),
      framework: 'NIST_AI_RMF' as const,
      category: item.Category,
      informative_references: this.extractReferences(item),
      content_hash: this.generateContentHash(item)
    }));
  }

  /**
   * Store controls in Supabase with embeddings
   */
  private async storeControls(controls: NISTControl[]): Promise<void> {
    for (const control of controls) {
      // Generate embedding for the control content
      const content = `${control.title} ${control.description} ${control.guidance}`;
      const embedding = await this.generateEmbedding(content);

      const controlWithEmbedding = {
        ...control,
        embedding,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if control already exists
      const { data: existing } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('content_hash', control.content_hash)
        .single();

      if (existing) {
        // Update existing control
        await supabase
          .from(this.tableName)
          .update(controlWithEmbedding)
          .eq('content_hash', control.content_hash);
      } else {
        // Insert new control
        await supabase
          .from(this.tableName)
          .insert(controlWithEmbedding);
      }
    }
  }

  /**
   * Query NIST controls using natural language and RAG
   */
  async queryControls(
    query: string,
    frameworks: ('NIST_CSF' | 'NIST_800_53' | 'NIST_AI_RMF' | 'CIS_V8' | 'ISO_27001')[] = ['NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF', 'CIS_V8', 'ISO_27001'],
    limit: number = 10
  ): Promise<NISTQueryResult> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Perform vector similarity search
      const { data: controls, error } = await supabase
        .rpc('match_nist_controls', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: limit,
          frameworks: frameworks
        });

      if (error) throw error;

      // Calculate relevance scores and generate implementation guidance
      const relevanceScores = controls?.map((c: any) => c.similarity) || [];
      const suggestedImplementation = await this.generateImplementationGuidance(query, controls || []);

      return {
        controls: controls || [],
        relevanceScores,
        suggestedImplementation,
        gapAnalysis: await this.generateGapAnalysis(query, controls || []),
        estimatedEffort: this.estimateImplementationEffort(controls || [])
      };
    } catch (error) {
      console.error('Error querying NIST controls:', error);
      throw error;
    }
  }

  /**
   * Perform automated gap analysis for client
   */
  async performGapAnalysis(
    projectId: string,
    targetFrameworks: string[]
  ): Promise<ComplianceGap[]> {
    const gaps: ComplianceGap[] = [];

    // Get current implementation status from project
    const { data: currentImplementations } = await supabase
      .from('project_controls')
      .select('*')
      .eq('project_id', projectId);

    // Get required controls for target frameworks
    const { data: requiredControls } = await supabase
      .from(this.tableName)
      .select('*')
      .in('framework', targetFrameworks);

    for (const control of requiredControls || []) {
      const implementation = currentImplementations?.find(impl => impl.control_id === control.id);

      if (!implementation || implementation.status !== 'implemented') {
        gaps.push({
          control_id: control.id,
          current_status: implementation?.status || 'not_implemented',
          gap_description: await this.generateGapDescription(control, implementation),
          priority: this.calculatePriority(control),
          effort_estimate: this.estimateEffort(control),
          suggested_actions: await this.generateActionItems(control),
          dependencies: control.related_controls || []
        });
      }
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate contextual compliance advice
   */
  async getComplianceAdvice(
    scenario: string,
    industry: string,
    organizationSize: 'startup' | 'smb' | 'enterprise'
  ): Promise<{
    recommendations: string[];
    prioritizedControls: NISTControl[];
    implementation_roadmap: Array<{
      phase: number;
      duration: string;
      controls: string[];
      deliverables: string[];
    }>;
  }> {
    const contextQuery = `${scenario} for ${industry} ${organizationSize} organization`;
    const queryResult = await this.queryControls(contextQuery);

    const recommendations = await this.generateContextualRecommendations(
      scenario, industry, organizationSize, queryResult.controls
    );

    const roadmap = this.generateImplementationRoadmap(queryResult.controls, organizationSize);

    return {
      recommendations,
      prioritizedControls: queryResult.controls,
      implementation_roadmap: roadmap
    };
  }

  // Helper methods
  private extractAssessmentObjectives(item: any): string[] {
    const objectives = item['Assessment Objectives'] || item.Objectives || [];
    return Array.isArray(objectives) ? objectives : [objectives].filter(Boolean);
  }

  private extractRelatedControls(item: any): string[] {
    const related = item['Related Controls'] || item.Related || item.References || [];
    return Array.isArray(related) ? related : [related].filter(Boolean);
  }

  private extractReferences(item: any): string[] {
    const refs = item.References || item['Informative References'] || [];
    return Array.isArray(refs) ? refs : [refs].filter(Boolean);
  }

  private extractParameters(item: any): string[] {
    const params = item.Parameters || item['Assignment/Selection'] || [];
    return Array.isArray(params) ? params : [params].filter(Boolean);
  }

  private extractFamily(controlId: string): string {
    const familyMap: Record<string, string> = {
      'AC': 'Access Control',
      'AU': 'Audit and Accountability',
      'CA': 'Security Assessment and Authorization',
      'CM': 'Configuration Management',
      'CP': 'Contingency Planning',
      'IA': 'Identification and Authentication',
      'IR': 'Incident Response',
      'MA': 'Maintenance',
      'MP': 'Media Protection',
      'PE': 'Physical and Environmental Protection',
      'PL': 'Planning',
      'PS': 'Personnel Security',
      'RA': 'Risk Assessment',
      'SA': 'System and Services Acquisition',
      'SC': 'System and Communications Protection',
      'SI': 'System and Information Integrity',
      'SR': 'Supply Chain Risk Management'
    };

    const prefix = controlId?.split('-')[0];
    return familyMap[prefix] || 'General';
  }

  private generateContentHash(item: any): string {
    const content = JSON.stringify(item, Object.keys(item).sort());
    return btoa(content).substring(0, 32);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Mock embedding generation - in production, use OpenAI, Cohere, or local model
    return Array.from({ length: this.embeddingDimensions }, () => Math.random() - 0.5);
  }

  private async generateImplementationGuidance(query: string, controls: NISTControl[]): Promise<string> {
    return `Based on your query "${query}", here are the recommended implementation steps:\n\n` +
           controls.slice(0, 3).map((control, index) =>
             `${index + 1}. ${control.title}: ${control.guidance}`
           ).join('\n\n');
  }

  private async generateGapAnalysis(query: string, controls: NISTControl[]): Promise<string> {
    return `Gap Analysis for "${query}":\n\n` +
           `Key areas requiring attention:\n` +
           controls.slice(0, 3).map(control => `• ${control.family}: ${control.title}`).join('\n');
  }

  private estimateImplementationEffort(controls: NISTControl[]): string {
    const totalControls = controls.length;
    const weeks = Math.ceil(totalControls * 2); // Estimate 2 weeks per control
    return `Estimated ${weeks} weeks for ${totalControls} controls`;
  }

  private async generateGapDescription(control: NISTControl, implementation: any): Promise<string> {
    if (!implementation) {
      return `${control.title} is not currently implemented. This control is required for compliance.`;
    }
    return `${control.title} is partially implemented. Additional work needed to meet full compliance requirements.`;
  }

  private calculatePriority(control: NISTControl): 'low' | 'medium' | 'high' | 'critical' {
    // Mock priority calculation - could be based on control family, risk rating, etc.
    const highPriorityFamilies = ['Access Control', 'Audit and Accountability', 'Incident Response'];
    const criticalKeywords = ['security', 'breach', 'critical', 'authentication'];

    if (criticalKeywords.some(keyword =>
      control.description.toLowerCase().includes(keyword) ||
      control.title.toLowerCase().includes(keyword)
    )) {
      return 'critical';
    }

    if (highPriorityFamilies.includes(control.family)) {
      return 'high';
    }

    return 'medium';
  }

  private estimateEffort(control: NISTControl): string {
    const efforts = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months'];
    return efforts[Math.floor(Math.random() * efforts.length)];
  }

  private async generateActionItems(control: NISTControl): Promise<string[]> {
    return [
      `Review current implementation of ${control.title}`,
      `Develop implementation plan for ${control.family}`,
      `Assign responsible personnel for ${control.id}`,
      `Schedule assessment of ${control.title} effectiveness`
    ];
  }

  private async generateContextualRecommendations(
    scenario: string,
    industry: string,
    size: string,
    controls: NISTControl[]
  ): Promise<string[]> {
    return [
      `For ${industry} organizations, prioritize ${controls[0]?.family} controls`,
      `${size} companies should focus on ${controls.slice(0, 3).map(c => c.title).join(', ')}`,
      `Consider industry-specific requirements for ${scenario}`,
      `Implement controls in phases to manage costs and complexity`
    ];
  }

  private generateImplementationRoadmap(
    controls: NISTControl[],
    size: string
  ): Array<{ phase: number; duration: string; controls: string[]; deliverables: string[] }> {
    const phases = Math.ceil(controls.length / 5);
    return Array.from({ length: phases }, (_, index) => ({
      phase: index + 1,
      duration: size === 'startup' ? '4-6 weeks' : size === 'smb' ? '6-8 weeks' : '8-12 weeks',
      controls: controls.slice(index * 5, (index + 1) * 5).map(c => c.id),
      deliverables: [
        'Implementation plan',
        'Policy documentation',
        'Assessment report',
        'Training materials'
      ]
    }));
  }
}

export const nistKnowledgeService = new NISTKnowledgeService();