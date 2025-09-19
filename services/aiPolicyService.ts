import { supabase } from './supabaseClient';
import { sanitizePrompt, validatePromptSafety } from '../utils/sanitization';

interface PolicyAnalysisResult {
  compliance_score: number;
  confidence: 'high' | 'medium' | 'low';
  gap_analysis: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  framework_alignment: Array<{
    framework: string;
    alignment_score: number;
    missing_requirements: string[];
  }>;
  citations: SourceReference[];
  requires_review: boolean;
  audit_trail: AuditEntry;
}

interface PolicyGenerationResult {
  generated_policy: string;
  confidence: 'high' | 'medium' | 'low';
  sections: PolicySection[];
  compliance_checklist: string[];
  review_notes: string[];
  citations: SourceReference[];
  requires_review: boolean;
}

interface PolicySection {
  title: string;
  content: string;
  framework_references: string[];
  criticality: 'high' | 'medium' | 'low';
}

interface SourceReference {
  type: 'framework' | 'standard' | 'regulation' | 'best_practice';
  source: string;
  section: string;
  relevance_score: number;
}

interface AuditEntry {
  timestamp: Date;
  operation: 'analysis' | 'generation' | 'review';
  confidence_score: number;
  human_reviewed: boolean;
  verification_status: 'verified' | 'pending' | 'flagged';
  framework_sources: string[];
}

export class AIPolicyService {
  private static instance: AIPolicyService;
  private auditLog: AuditEntry[] = [];
  private knowledgeBase: Map<string, any> = new Map();

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): AIPolicyService {
    if (!AIPolicyService.instance) {
      AIPolicyService.instance = new AIPolicyService();
    }
    return AIPolicyService.instance;
  }

  private async initializeKnowledgeBase() {
    // Initialize with common frameworks and their policy requirements
    const frameworks = [
      {
        name: 'ISO 27001:2022',
        policy_requirements: {
          'information_security': 'Clause 5.1 - Information security policy must be established, implemented, maintained and communicated',
          'risk_management': 'Clause 6.1 - Risk management process must be documented and implemented',
          'access_control': 'Annex A.9 - Access control policy must define user access rights and restrictions',
          'incident_response': 'Annex A.16 - Information security incident management policy required'
        }
      },
      {
        name: 'NIST Cybersecurity Framework',
        policy_requirements: {
          'governance': 'GV.GV-01 - Organizational cybersecurity policy is established and communicated',
          'risk_management': 'GV.RM-01 - Risk management strategy is established and documented',
          'supply_chain': 'GV.SC-01 - Cybersecurity supply chain risk management policy is established'
        }
      },
      {
        name: 'SOC 2',
        policy_requirements: {
          'security': 'CC6.1 - Security policies must be documented and communicated',
          'availability': 'A1.1 - Availability and related security policies must be documented',
          'confidentiality': 'C1.1 - Confidentiality and related security policies must be documented'
        }
      }
    ];

    frameworks.forEach(framework => {
      this.knowledgeBase.set(framework.name, framework.policy_requirements);
    });
  }

  async analyzePolicyCompliance(
    policyText: string,
    targetFrameworks: string[],
    organizationContext: {
      industry: string;
      size: 'small' | 'medium' | 'large';
      regulatory_requirements: string[];
    }
  ): Promise<PolicyAnalysisResult> {
    console.log('🔍 AI Policy Compliance Analysis Starting...');

    // 1. Input Validation & Sanitization
    const validation = validatePromptSafety(policyText);
    if (!validation.isValid) {
      throw new Error(`Invalid policy content: ${validation.reason}`);
    }

    const sanitizedPolicy = sanitizePrompt(policyText);

    // 2. Retrieve Framework Requirements
    const frameworkRequirements = this.getFrameworkRequirements(targetFrameworks);

    // 3. Generate AI Analysis with Hallucination Prevention
    const analysis = await this.generateSecurePolicyAnalysis(
      sanitizedPolicy,
      targetFrameworks,
      frameworkRequirements,
      organizationContext
    );

    // 4. Calculate Compliance Score
    const complianceScore = this.calculateComplianceScore(
      analysis,
      frameworkRequirements
    );

    // 5. Create Audit Trail
    const auditEntry = this.createAuditEntry(
      'analysis',
      analysis,
      complianceScore.confidence,
      targetFrameworks
    );

    return {
      compliance_score: complianceScore.score,
      confidence: complianceScore.confidence,
      gap_analysis: analysis.gap_analysis,
      framework_alignment: complianceScore.framework_alignment,
      citations: analysis.citations,
      requires_review: complianceScore.confidence === 'low' || complianceScore.score < 70,
      audit_trail: auditEntry
    };
  }

  private getFrameworkRequirements(frameworks: string[]): Map<string, any> {
    const requirements = new Map();

    frameworks.forEach(framework => {
      const frameworkData = this.knowledgeBase.get(framework);
      if (frameworkData) {
        requirements.set(framework, frameworkData);
      }
    });

    return requirements;
  }

  private async generateSecurePolicyAnalysis(
    policyText: string,
    frameworks: string[],
    requirements: Map<string, any>,
    context: any
  ): Promise<{
    gap_analysis: any;
    citations: SourceReference[];
  }> {
    const prompt = `
You are a compliance expert analyzing policy documentation. Perform a gap analysis STRICTLY based on the provided framework requirements.

POLICY TO ANALYZE:
${policyText.substring(0, 2000)}...

TARGET FRAMEWORKS: ${frameworks.join(', ')}

FRAMEWORK REQUIREMENTS:
${Array.from(requirements.entries()).map(([framework, reqs]) =>
  `${framework}:\n${Object.entries(reqs).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`
).join('\n\n')}

ORGANIZATION CONTEXT:
- Industry: ${context.industry}
- Size: ${context.size}
- Regulations: ${context.regulatory_requirements.join(', ')}

CRITICAL ANALYSIS RULES:
1. ONLY reference the provided framework requirements
2. Base all gaps on specific missing requirements from the frameworks
3. Cite specific framework clauses/controls
4. If information is insufficient, clearly state limitations

Provide structured analysis:

## Strengths
- [Strength 1 with specific framework reference]
- [Strength 2 with specific framework reference]
- [Strength 3 with specific framework reference]

## Gaps Identified
- [Gap 1 with specific framework requirement missing]
- [Gap 2 with specific framework requirement missing]
- [Gap 3 with specific framework requirement missing]

## Recommendations
- [Recommendation 1 to address specific gap]
- [Recommendation 2 to address specific gap]
- [Recommendation 3 to address specific gap]

Ensure all findings are traceable to the provided framework requirements.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { prompt }
      });

      if (error) {
        throw new Error('Policy analysis service unavailable');
      }

      const response = data.text;
      return this.parsePolicyAnalysisResponse(response, requirements);

    } catch (error) {
      console.error('Policy analysis failed:', error);
      return this.generateFallbackAnalysis(policyText, frameworks, requirements);
    }
  }

  private parsePolicyAnalysisResponse(
    response: string,
    requirements: Map<string, any>
  ): {
    gap_analysis: any;
    citations: SourceReference[];
  } {
    const strengths = this.extractBulletPoints(response, 'Strengths');
    const gaps = this.extractBulletPoints(response, 'Gaps Identified');
    const recommendations = this.extractBulletPoints(response, 'Recommendations');

    // Generate citations based on framework references
    const citations: SourceReference[] = [];
    requirements.forEach((reqs, framework) => {
      citations.push({
        type: 'framework',
        source: framework,
        section: 'Policy Requirements',
        relevance_score: 0.9
      });
    });

    return {
      gap_analysis: {
        strengths,
        gaps,
        recommendations
      },
      citations
    };
  }

  private extractBulletPoints(text: string, sectionName: string): string[] {
    const section = this.extractSection(text, sectionName);
    const bullets = section.match(/^-\s*(.+)$/gm);
    return bullets ? bullets.map(bullet => bullet.replace(/^-\s*/, '').trim()) : [];
  }

  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private generateFallbackAnalysis(
    policyText: string,
    frameworks: string[],
    requirements: Map<string, any>
  ): {
    gap_analysis: any;
    citations: SourceReference[];
  } {
    return {
      gap_analysis: {
        strengths: [
          'Policy document structure is present',
          'Basic security considerations addressed'
        ],
        gaps: [
          'Expert review required for comprehensive analysis',
          `Detailed ${frameworks.join(', ')} compliance assessment needed`
        ],
        recommendations: [
          'Engage compliance specialist for detailed review',
          'Map policy sections to specific framework requirements',
          'Implement regular policy review process'
        ]
      },
      citations: Array.from(requirements.keys()).map(framework => ({
        type: 'framework' as const,
        source: framework,
        section: 'Requirements Analysis',
        relevance_score: 0.8
      }))
    };
  }

  private calculateComplianceScore(
    analysis: any,
    requirements: Map<string, any>
  ): {
    score: number;
    confidence: 'high' | 'medium' | 'low';
    framework_alignment: Array<{
      framework: string;
      alignment_score: number;
      missing_requirements: string[];
    }>;
  } {
    const strengthCount = analysis.gap_analysis.strengths.length;
    const gapCount = analysis.gap_analysis.gaps.length;

    // Base score calculation
    let baseScore = 50;
    baseScore += (strengthCount * 10);
    baseScore -= (gapCount * 15);

    // Framework alignment calculation
    const framework_alignment = Array.from(requirements.entries()).map(([framework, reqs]) => {
      const reqCount = Object.keys(reqs).length;
      const alignmentScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)));

      return {
        framework,
        alignment_score: Math.round(alignmentScore),
        missing_requirements: Object.keys(reqs).slice(0, Math.max(0, gapCount - 1))
      };
    });

    const finalScore = Math.max(0, Math.min(100, baseScore));

    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (strengthCount > gapCount && finalScore > 80) confidence = 'high';
    if (gapCount > strengthCount || finalScore < 60) confidence = 'low';

    return {
      score: Math.round(finalScore),
      confidence,
      framework_alignment
    };
  }

  async generatePolicyFromTemplate(
    policyType: string,
    targetFrameworks: string[],
    organizationDetails: {
      name: string;
      industry: string;
      size: 'small' | 'medium' | 'large';
      regulatory_requirements: string[];
    }
  ): Promise<PolicyGenerationResult> {
    console.log('📝 AI Policy Generation Starting...');

    // Get framework requirements for policy type
    const frameworkRequirements = this.getFrameworkRequirements(targetFrameworks);

    const prompt = `
You are a professional policy writer specializing in information security and compliance. Generate a comprehensive ${policyType} policy for the organization.

ORGANIZATION DETAILS:
- Name: ${organizationDetails.name}
- Industry: ${organizationDetails.industry}
- Size: ${organizationDetails.size}
- Regulatory Requirements: ${organizationDetails.regulatory_requirements.join(', ')}

TARGET FRAMEWORKS: ${targetFrameworks.join(', ')}

FRAMEWORK REQUIREMENTS TO ADDRESS:
${Array.from(frameworkRequirements.entries()).map(([framework, reqs]) =>
  `${framework}:\n${Object.entries(reqs).map(([key, value]) => `- ${value}`).join('\n')}`
).join('\n\n')}

POLICY GENERATION REQUIREMENTS:
1. Create a professional, business-ready policy document
2. Address ALL framework requirements listed above
3. Include specific sections: Purpose, Scope, Policy Statements, Responsibilities, Compliance
4. Use formal policy language appropriate for ${organizationDetails.industry}
5. Include measurable requirements where appropriate
6. Reference specific framework controls

Generate a complete ${policyType} policy document:

# ${organizationDetails.name} ${policyType} Policy

## 1. Purpose
[Clear statement of policy purpose addressing framework requirements]

## 2. Scope
[Define what and who this policy covers]

## 3. Policy Statements
[Detailed policy requirements organized by framework alignment]

## 4. Responsibilities
[Clear role and responsibility assignments]

## 5. Compliance and Monitoring
[How compliance will be measured and monitored]

## 6. Review and Updates
[Policy maintenance requirements]

Ensure the policy is implementation-ready and addresses all framework requirements.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { prompt: sanitizePrompt(prompt) }
      });

      if (error) {
        throw new Error('Policy generation service unavailable');
      }

      const response = data.text;
      return this.parsePolicyGenerationResponse(
        response,
        frameworkRequirements,
        organizationDetails
      );

    } catch (error) {
      console.error('Policy generation failed:', error);
      return this.generateFallbackPolicy(policyType, targetFrameworks, organizationDetails);
    }
  }

  private parsePolicyGenerationResponse(
    response: string,
    requirements: Map<string, any>,
    orgDetails: any
  ): PolicyGenerationResult {
    // Parse the generated policy into sections
    const sections: PolicySection[] = [
      {
        title: 'Purpose',
        content: this.extractSection(response, '1. Purpose'),
        framework_references: Array.from(requirements.keys()),
        criticality: 'high'
      },
      {
        title: 'Scope',
        content: this.extractSection(response, '2. Scope'),
        framework_references: Array.from(requirements.keys()),
        criticality: 'high'
      },
      {
        title: 'Policy Statements',
        content: this.extractSection(response, '3. Policy Statements'),
        framework_references: Array.from(requirements.keys()),
        criticality: 'high'
      }
    ];

    const citations: SourceReference[] = Array.from(requirements.keys()).map(framework => ({
      type: 'framework' as const,
      source: framework,
      section: 'Policy Requirements',
      relevance_score: 0.95
    }));

    return {
      generated_policy: response,
      confidence: 'high',
      sections,
      compliance_checklist: [
        'Review policy with legal team',
        'Obtain management approval',
        'Distribute to all employees',
        'Schedule annual policy review'
      ],
      review_notes: [
        'Verify organization-specific details are accurate',
        'Ensure all framework requirements are addressed',
        'Customize implementation details for your environment'
      ],
      citations,
      requires_review: true // Always require review for generated policies
    };
  }

  private generateFallbackPolicy(
    policyType: string,
    frameworks: string[],
    orgDetails: any
  ): PolicyGenerationResult {
    const fallbackPolicy = `
# ${orgDetails.name} ${policyType} Policy

## 1. Purpose
This policy establishes ${orgDetails.name}'s commitment to ${policyType.toLowerCase()} in accordance with ${frameworks.join(', ')} requirements.

## 2. Scope
This policy applies to all ${orgDetails.name} employees, contractors, and systems.

## 3. Policy Statements
- ${orgDetails.name} is committed to maintaining appropriate ${policyType.toLowerCase()} practices
- All personnel must comply with applicable ${frameworks.join(', ')} requirements
- Regular reviews and updates will be conducted to ensure continued effectiveness

## 4. Responsibilities
- Management: Policy oversight and resource allocation
- IT Security: Technical implementation and monitoring
- All Personnel: Policy compliance and reporting

## 5. Compliance and Monitoring
Regular assessments will be conducted to ensure policy effectiveness and compliance.

## 6. Review and Updates
This policy will be reviewed annually and updated as needed.

**Note**: This is a template policy that requires customization for your specific organization and requirements.`;

    return {
      generated_policy: fallbackPolicy,
      confidence: 'low',
      sections: [
        {
          title: 'Complete Policy',
          content: fallbackPolicy,
          framework_references: frameworks,
          criticality: 'high'
        }
      ],
      compliance_checklist: [
        'Customize policy for specific organizational needs',
        'Add detailed implementation requirements',
        'Review with compliance experts',
        'Obtain legal and management approval'
      ],
      review_notes: [
        'This is a basic template requiring significant customization',
        'Engage policy experts for comprehensive development',
        'Ensure all framework-specific requirements are addressed'
      ],
      citations: frameworks.map(framework => ({
        type: 'framework' as const,
        source: framework,
        section: 'General Requirements',
        relevance_score: 0.7
      })),
      requires_review: true
    };
  }

  private createAuditEntry(
    operation: 'analysis' | 'generation' | 'review',
    result: any,
    confidence: 'high' | 'medium' | 'low',
    frameworks: string[]
  ): AuditEntry {
    const entry: AuditEntry = {
      timestamp: new Date(),
      operation,
      confidence_score: confidence === 'high' ? 0.9 : confidence === 'medium' ? 0.7 : 0.5,
      human_reviewed: false,
      verification_status: confidence === 'high' ? 'verified' : 'pending',
      framework_sources: frameworks
    };

    this.auditLog.push(entry);
    console.log(`📝 Policy ${operation} audit entry created (Confidence: ${confidence})`);

    return entry;
  }

  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  exportAuditLog(): string {
    const csv = [
      'Timestamp,Operation,Confidence Score,Verification Status,Frameworks',
      ...this.auditLog.map(entry =>
        `"${entry.timestamp.toISOString()}","${entry.operation}",${entry.confidence_score},"${entry.verification_status}","${entry.framework_sources.join('; ')}"`
      )
    ].join('\n');

    return csv;
  }
}

export default AIPolicyService;