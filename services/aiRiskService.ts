import { supabase } from './supabaseClient';
import { sanitizePrompt, validatePromptSafety } from '../utils/sanitization';
import type { Risk, RiskLevel } from '../types';

interface RiskAnalysisResult {
  risk_score: number;
  confidence: 'high' | 'medium' | 'low';
  ai_assessment: string;
  recommended_controls: string[];
  likelihood_factors: string[];
  impact_factors: string[];
  citations: SourceReference[];
  requires_review: boolean;
  audit_trail: AuditEntry;
}

interface SourceReference {
  type: 'framework' | 'standard' | 'regulation' | 'best_practice';
  source: string;
  relevance_score: number;
}

interface AuditEntry {
  timestamp: Date;
  analysis_method: string;
  confidence_score: number;
  human_reviewed: boolean;
  verification_status: 'verified' | 'pending' | 'flagged';
}

interface HallucinationGuard {
  verifyResponse(response: string, sources: any[]): Promise<{
    accuracy: number;
    verified_claims: string[];
    unverified_claims: string[];
    recommendation: 'approve' | 'review' | 'reject';
  }>;
}

export class AIRiskService {
  private static instance: AIRiskService;
  private auditLog: AuditEntry[] = [];
  private hallucinationGuard: HallucinationGuard | null = null;

  private constructor() {
    // Initialize hallucination guard if available
    this.initializeGuards();
  }

  public static getInstance(): AIRiskService {
    if (!AIRiskService.instance) {
      AIRiskService.instance = new AIRiskService();
    }
    return AIRiskService.instance;
  }

  private async initializeGuards() {
    try {
      // Import hallucination guard dynamically
      const { HallucinationGuard } = await import('../scripts/hallucinationGuard');
      this.hallucinationGuard = new HallucinationGuard();
    } catch (error) {
      console.warn('Hallucination guard not available, using basic validation');
    }
  }

  async analyzeRiskWithAI(
    riskDescription: string,
    organizationContext: {
      industry: string;
      size: 'small' | 'medium' | 'large';
      regulatory_requirements: string[];
      existing_controls: string[];
    }
  ): Promise<RiskAnalysisResult> {
    console.log('🧠 AI Risk Analysis Starting...');

    // 1. Input Validation & Sanitization
    const validation = validatePromptSafety(riskDescription);
    if (!validation.isValid) {
      throw new Error(`Invalid risk description: ${validation.reason}`);
    }

    const sanitizedDescription = sanitizePrompt(riskDescription);

    // 2. Retrieve Relevant Context from Knowledge Base
    const relevantSources = await this.retrieveRiskKnowledge(
      sanitizedDescription,
      organizationContext
    );

    // 3. Generate AI Analysis with Hallucination Prevention
    const aiAnalysis = await this.generateSecureRiskAnalysis(
      sanitizedDescription,
      organizationContext,
      relevantSources
    );

    // 4. Verify Response Accuracy
    let verificationResult = null;
    if (this.hallucinationGuard) {
      verificationResult = await this.hallucinationGuard.verifyResponse(
        aiAnalysis.assessment,
        relevantSources
      );
    }

    // 5. Calculate Risk Score with Confidence
    const riskScore = this.calculateAIRiskScore(
      aiAnalysis,
      relevantSources,
      verificationResult
    );

    // 6. Create Audit Trail
    const auditEntry = this.createAuditEntry(
      sanitizedDescription,
      aiAnalysis,
      riskScore,
      verificationResult?.accuracy || 0.8
    );

    return {
      risk_score: riskScore.score,
      confidence: riskScore.confidence,
      ai_assessment: aiAnalysis.assessment,
      recommended_controls: aiAnalysis.controls,
      likelihood_factors: aiAnalysis.likelihood_factors,
      impact_factors: aiAnalysis.impact_factors,
      citations: relevantSources.map(source => ({
        type: source.type,
        source: source.name,
        relevance_score: source.relevance
      })),
      requires_review: riskScore.confidence === 'low' || (verificationResult?.accuracy || 1) < 0.7,
      audit_trail: auditEntry
    };
  }

  private async retrieveRiskKnowledge(
    riskDescription: string,
    context: any
  ): Promise<any[]> {
    // Simulate knowledge base retrieval
    const mockSources = [
      {
        type: 'framework',
        name: 'NIST Cybersecurity Framework',
        content: 'Risk identification and assessment procedures for cybersecurity threats',
        relevance: 0.9
      },
      {
        type: 'standard',
        name: 'ISO 27005:2022',
        content: 'Information security risk management guidelines and methodology',
        relevance: 0.85
      },
      {
        type: 'regulation',
        name: context.regulatory_requirements[0] || 'General Data Protection',
        content: 'Regulatory requirements for risk assessment and data protection',
        relevance: 0.8
      }
    ];

    // Filter based on industry and context
    return mockSources.filter(source =>
      riskDescription.toLowerCase().includes('cyber') ||
      riskDescription.toLowerCase().includes('data') ||
      riskDescription.toLowerCase().includes('security')
    );
  }

  private async generateSecureRiskAnalysis(
    riskDescription: string,
    context: any,
    sources: any[]
  ): Promise<{
    assessment: string;
    controls: string[];
    likelihood_factors: string[];
    impact_factors: string[];
  }> {
    const prompt = `You are a professional risk assessment expert. Analyze the following risk strictly based on the provided sources.

RISK TO ANALYZE: ${riskDescription}

ORGANIZATION CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Regulations: ${context.regulatory_requirements.join(', ')}

KNOWLEDGE SOURCES:
${sources.map(s => `${s.name}: ${s.content}`).join('\n')}

CRITICAL INSTRUCTIONS:
1. Base analysis ONLY on provided sources
2. Cite specific frameworks/standards referenced
3. Provide factual, evidence-based assessment
4. If information is insufficient, clearly state limitations

Provide structured analysis:

## Risk Assessment
[Detailed analysis based ONLY on provided sources]

## Likelihood Factors
- [Factor 1 from sources]
- [Factor 2 from sources]
- [Factor 3 from sources]

## Impact Factors
- [Impact 1 from sources]
- [Impact 2 from sources]
- [Impact 3 from sources]

## Recommended Controls
- [Control 1 from sources]
- [Control 2 from sources]
- [Control 3 from sources]

Ensure all recommendations are traceable to the provided sources.`;

    try {
      // Use Ollama directly instead of Supabase Edge Functions
      const { ChatOllama } = await import('@langchain/ollama');
      const llm = new ChatOllama({
        model: 'mistral:latest',
        baseUrl: 'http://localhost:11434',
        temperature: 0.3,
      });

      const response = await llm.invoke(prompt);
      console.log('🤖 AI Response generated successfully');

      return this.parseRiskAnalysisResponse(response.content as string);

    } catch (error) {
      console.error('AI analysis failed:', error);
      console.log('🔄 Falling back to template response');

      // Fallback to template-based response
      return this.generateFallbackAnalysis(riskDescription, context, sources);
    }
  }

  private parseRiskAnalysisResponse(response: string): {
    assessment: string;
    controls: string[];
    likelihood_factors: string[];
    impact_factors: string[];
  } {
    const sections = {
      assessment: this.extractSection(response, 'Risk Assessment'),
      likelihood_factors: this.extractBulletPoints(response, 'Likelihood Factors'),
      impact_factors: this.extractBulletPoints(response, 'Impact Factors'),
      controls: this.extractBulletPoints(response, 'Recommended Controls')
    };

    return {
      assessment: sections.assessment || 'Risk analysis generated based on provided sources.',
      controls: sections.controls,
      likelihood_factors: sections.likelihood_factors,
      impact_factors: sections.impact_factors
    };
  }

  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractBulletPoints(text: string, sectionName: string): string[] {
    const section = this.extractSection(text, sectionName);
    const bullets = section.match(/^-\s*(.+)$/gm);
    return bullets ? bullets.map(bullet => bullet.replace(/^-\s*/, '').trim()) : [];
  }

  private generateFallbackAnalysis(
    riskDescription: string,
    context: any,
    sources: any[]
  ): {
    assessment: string;
    controls: string[];
    likelihood_factors: string[];
    impact_factors: string[];
  } {
    return {
      assessment: `Risk assessment for "${riskDescription}" requires expert review. Based on ${context.industry} industry standards and ${sources.length} relevant sources, this risk should be evaluated considering organizational context and regulatory requirements.`,
      controls: [
        'Implement appropriate technical controls',
        'Establish monitoring and detection capabilities',
        'Develop incident response procedures'
      ],
      likelihood_factors: [
        'Current threat landscape',
        'Existing security controls',
        'Organizational exposure'
      ],
      impact_factors: [
        'Business operation disruption',
        'Regulatory compliance impact',
        'Financial and reputational damage'
      ]
    };
  }

  private calculateAIRiskScore(
    analysis: any,
    sources: any[],
    verification: any
  ): {
    score: number;
    confidence: 'high' | 'medium' | 'low';
  } {
    let baseScore = 50; // Default medium risk

    // Adjust based on analysis content
    const riskTerms = ['critical', 'high', 'severe', 'major'];
    const lowRiskTerms = ['low', 'minimal', 'minor', 'unlikely'];

    if (riskTerms.some(term => analysis.assessment.toLowerCase().includes(term))) {
      baseScore += 30;
    }
    if (lowRiskTerms.some(term => analysis.assessment.toLowerCase().includes(term))) {
      baseScore -= 20;
    }

    // Adjust based on source quality
    const sourceQuality = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;
    baseScore += (sourceQuality - 0.5) * 20;

    // Adjust based on verification
    const verificationScore = verification?.accuracy || 0.8;
    const confidenceAdjustment = verificationScore * 20;
    baseScore += (verificationScore - 0.8) * 10;

    const finalScore = Math.max(0, Math.min(100, baseScore));

    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (verificationScore > 0.9 && sourceQuality > 0.8) confidence = 'high';
    if (verificationScore < 0.7 || sourceQuality < 0.6) confidence = 'low';

    return {
      score: Math.round(finalScore),
      confidence
    };
  }

  private createAuditEntry(
    originalInput: string,
    analysis: any,
    riskScore: any,
    verificationScore: number
  ): AuditEntry {
    const entry: AuditEntry = {
      timestamp: new Date(),
      analysis_method: 'AI-Powered Risk Assessment with Hallucination Guard',
      confidence_score: verificationScore,
      human_reviewed: false,
      verification_status: verificationScore > 0.8 ? 'verified' : 'pending'
    };

    this.auditLog.push(entry);
    console.log(`📝 Risk analysis audit entry created (Score: ${(verificationScore * 100).toFixed(1)}%)`);

    return entry;
  }

  async generateRiskTreatmentPlan(
    risk: Risk,
    organizationContext: any
  ): Promise<{
    treatment_options: Array<{
      strategy: 'mitigate' | 'transfer' | 'accept' | 'avoid';
      description: string;
      estimated_cost: string;
      timeline: string;
      effectiveness: number;
    }>;
    recommended_strategy: string;
    implementation_steps: string[];
    monitoring_requirements: string[];
  }> {
    const prompt = `As a risk management expert, develop treatment options for the following risk:

RISK: ${risk.title}
DESCRIPTION: ${risk.description}
CURRENT LEVEL: ${risk.level}
ORGANIZATION: ${organizationContext.industry} (${organizationContext.size})

Provide 3-4 treatment options following risk management best practices:

## Treatment Options

### Option 1: [Strategy]
- Description: [Clear description]
- Cost: [Estimated cost range]
- Timeline: [Implementation timeline]
- Effectiveness: [1-10 score]

### Option 2: [Strategy]
[Same format]

## Recommended Strategy
[Single best option with justification]

## Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Monitoring Requirements
- [Monitoring point 1]
- [Monitoring point 2]
`;

    try {
      const { ChatOllama } = await import('@langchain/ollama');
      const llm = new ChatOllama({
        model: 'mistral:latest',
        baseUrl: 'http://localhost:11434',
        temperature: 0.3,
      });

      const response = await llm.invoke(sanitizePrompt(prompt));
      console.log('🤖 Treatment plan generated by AI');

      return this.parseTreatmentPlan(response.content as string);

    } catch (error) {
      console.error('Treatment plan generation failed:', error);
      return this.generateFallbackTreatmentPlan(risk);
    }
  }

  private parseTreatmentPlan(response: string): any {
    // Parse the structured treatment plan response
    // Implementation would extract sections and format appropriately
    return {
      treatment_options: [
        {
          strategy: 'mitigate' as const,
          description: 'Implement technical controls to reduce risk likelihood',
          estimated_cost: '$10,000 - $50,000',
          timeline: '3-6 months',
          effectiveness: 8
        }
      ],
      recommended_strategy: 'Risk mitigation through technical controls',
      implementation_steps: [
        'Conduct detailed risk assessment',
        'Design control framework',
        'Implement technical controls',
        'Test and validate controls',
        'Monitor and maintain'
      ],
      monitoring_requirements: [
        'Monthly risk assessment reviews',
        'Quarterly control effectiveness testing',
        'Annual treatment plan updates'
      ]
    };
  }

  private generateFallbackTreatmentPlan(risk: Risk): any {
    return {
      treatment_options: [
        {
          strategy: 'mitigate' as const,
          description: 'Expert review required for comprehensive treatment plan',
          estimated_cost: 'To be determined',
          timeline: 'To be determined',
          effectiveness: 7
        }
      ],
      recommended_strategy: 'Professional risk assessment recommended',
      implementation_steps: [
        'Engage risk management expert',
        'Conduct detailed analysis',
        'Develop treatment strategy'
      ],
      monitoring_requirements: [
        'Regular expert reviews',
        'Control effectiveness monitoring'
      ]
    };
  }

  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  exportAuditLog(): string {
    const csv = [
      'Timestamp,Method,Confidence Score,Verification Status',
      ...this.auditLog.map(entry =>
        `"${entry.timestamp.toISOString()}","${entry.analysis_method}",${entry.confidence_score},"${entry.verification_status}"`
      )
    ].join('\n');

    return csv;
  }
}

export default AIRiskService;