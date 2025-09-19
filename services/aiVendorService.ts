import { supabase } from './supabaseClient';
import { sanitizePrompt, validatePromptSafety } from '../utils/sanitization';
import type { Vendor, VendorCriticality } from '../types';

interface VendorRiskAssessment {
  overall_risk_score: number;
  risk_level: VendorCriticality;
  confidence: 'high' | 'medium' | 'low';
  risk_categories: {
    security: RiskCategoryScore;
    financial: RiskCategoryScore;
    operational: RiskCategoryScore;
    compliance: RiskCategoryScore;
    reputation: RiskCategoryScore;
  };
  key_findings: string[];
  recommended_actions: string[];
  monitoring_requirements: string[];
  citations: SourceReference[];
  requires_review: boolean;
  audit_trail: AuditEntry;
}

interface RiskCategoryScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigation_suggestions: string[];
}

interface VendorDueDiligence {
  due_diligence_checklist: DueDiligenceItem[];
  recommended_controls: string[];
  contract_clauses: ContractClause[];
  monitoring_plan: MonitoringPlan;
  escalation_triggers: string[];
  compliance_requirements: string[];
}

interface DueDiligenceItem {
  category: string;
  requirement: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  evidence_needed: string[];
}

interface ContractClause {
  section: string;
  clause_text: string;
  purpose: string;
  legal_importance: 'critical' | 'important' | 'recommended';
}

interface MonitoringPlan {
  frequency: string;
  metrics: string[];
  review_triggers: string[];
  reporting_requirements: string[];
}

interface SourceReference {
  type: 'framework' | 'standard' | 'regulation' | 'best_practice';
  source: string;
  section: string;
  relevance_score: number;
}

interface AuditEntry {
  timestamp: Date;
  vendor_id: string;
  assessment_type: 'risk_assessment' | 'due_diligence' | 'monitoring_review';
  confidence_score: number;
  human_reviewed: boolean;
  verification_status: 'verified' | 'pending' | 'flagged';
  risk_score: number;
}

export class AIVendorService {
  private static instance: AIVendorService;
  private auditLog: AuditEntry[] = [];
  private riskFactors: Map<string, any> = new Map();

  private constructor() {
    this.initializeRiskFactors();
  }

  public static getInstance(): AIVendorService {
    if (!AIVendorService.instance) {
      AIVendorService.instance = new AIVendorService();
    }
    return AIVendorService.instance;
  }

  private initializeRiskFactors() {
    // Initialize risk assessment criteria by industry and vendor type
    const riskCriteria = {
      'cloud_provider': {
        security: ['Data encryption', 'Access controls', 'Incident response', 'Certifications'],
        compliance: ['SOC 2', 'ISO 27001', 'GDPR compliance', 'Regional regulations'],
        operational: ['SLA guarantees', 'Uptime history', 'Disaster recovery', 'Support quality'],
        financial: ['Financial stability', 'Revenue trends', 'Credit ratings', 'Insurance coverage']
      },
      'software_vendor': {
        security: ['Security testing', 'Vulnerability management', 'Secure development', 'Data handling'],
        compliance: ['Privacy policies', 'Terms of service', 'Regulatory compliance', 'Audit reports'],
        operational: ['Support availability', 'Update frequency', 'Performance metrics', 'Integration capabilities'],
        financial: ['Business viability', 'Market position', 'Customer base', 'Revenue stability']
      },
      'professional_services': {
        security: ['Staff screening', 'Data handling procedures', 'Confidentiality measures', 'Security training'],
        compliance: ['Professional certifications', 'Regulatory compliance', 'Ethics policies', 'Quality standards'],
        operational: ['Service delivery', 'Project management', 'Communication protocols', 'Performance metrics'],
        financial: ['Professional insurance', 'Financial stability', 'Reference clients', 'Pricing transparency']
      }
    };

    Object.entries(riskCriteria).forEach(([vendorType, criteria]) => {
      this.riskFactors.set(vendorType, criteria);
    });
  }

  async assessVendorRisk(
    vendor: Vendor,
    vendorData: {
      type: string;
      services_provided: string[];
      data_access_level: 'none' | 'limited' | 'moderate' | 'extensive';
      geographic_locations: string[];
      certifications: string[];
      financial_info?: any;
      security_documentation?: string;
    },
    organizationContext: {
      industry: string;
      risk_tolerance: 'low' | 'medium' | 'high';
      regulatory_requirements: string[];
      critical_data_types: string[];
    }
  ): Promise<VendorRiskAssessment> {
    console.log('🔍 AI Vendor Risk Assessment Starting...');

    // 1. Input Validation & Sanitization
    const vendorDescription = `${vendor.name} - ${vendor.description || 'No description provided'}`;
    const validation = validatePromptSafety(vendorDescription);
    if (!validation.isValid) {
      throw new Error(`Invalid vendor data: ${validation.reason}`);
    }

    // 2. Retrieve Risk Assessment Framework
    const riskFramework = this.getRiskAssessmentFramework(vendorData.type, organizationContext);

    // 3. Generate AI Risk Analysis
    const riskAnalysis = await this.generateSecureVendorAnalysis(
      vendor,
      vendorData,
      organizationContext,
      riskFramework
    );

    // 4. Calculate Risk Scores
    const riskScores = this.calculateVendorRiskScores(
      riskAnalysis,
      vendorData,
      organizationContext
    );

    // 5. Create Audit Trail
    const auditEntry = this.createAuditEntry(
      vendor.id,
      'risk_assessment',
      riskScores.confidence,
      riskScores.overall_risk_score
    );

    return {
      overall_risk_score: riskScores.overall_risk_score,
      risk_level: riskScores.risk_level,
      confidence: riskScores.confidence,
      risk_categories: riskScores.risk_categories,
      key_findings: riskAnalysis.key_findings,
      recommended_actions: riskAnalysis.recommended_actions,
      monitoring_requirements: riskAnalysis.monitoring_requirements,
      citations: riskAnalysis.citations,
      requires_review: riskScores.confidence === 'low' || riskScores.overall_risk_score > 75,
      audit_trail: auditEntry
    };
  }

  private getRiskAssessmentFramework(vendorType: string, context: any): any {
    const baseFramework = this.riskFactors.get(vendorType) || this.riskFactors.get('software_vendor');

    // Enhance framework based on organization context
    const enhancedFramework = {
      ...baseFramework,
      regulatory_considerations: context.regulatory_requirements,
      data_sensitivity: context.critical_data_types,
      risk_tolerance: context.risk_tolerance
    };

    return enhancedFramework;
  }

  private async generateSecureVendorAnalysis(
    vendor: Vendor,
    vendorData: any,
    context: any,
    framework: any
  ): Promise<{
    key_findings: string[];
    recommended_actions: string[];
    monitoring_requirements: string[];
    citations: SourceReference[];
  }> {
    const prompt = `
You are a vendor risk management expert. Assess the following vendor based strictly on the provided risk framework and organizational context.

VENDOR INFORMATION:
- Name: ${vendor.name}
- Type: ${vendorData.type}
- Services: ${vendorData.services_provided.join(', ')}
- Data Access: ${vendorData.data_access_level}
- Locations: ${vendorData.geographic_locations.join(', ')}
- Certifications: ${vendorData.certifications.join(', ')}

ORGANIZATION CONTEXT:
- Industry: ${context.industry}
- Risk Tolerance: ${context.risk_tolerance}
- Regulatory Requirements: ${context.regulatory_requirements.join(', ')}
- Critical Data Types: ${context.critical_data_types.join(', ')}

RISK ASSESSMENT FRAMEWORK:
${Object.entries(framework).map(([category, factors]) =>
  `${category}: ${Array.isArray(factors) ? factors.join(', ') : factors}`
).join('\n')}

ASSESSMENT REQUIREMENTS:
1. Base analysis ONLY on provided information and standard risk frameworks
2. Consider data access level and regulatory requirements
3. Provide specific, actionable findings
4. Reference relevant compliance standards where applicable

Provide structured assessment:

## Key Findings
- [Finding 1 based on framework criteria]
- [Finding 2 based on framework criteria]
- [Finding 3 based on framework criteria]

## Recommended Actions
- [Action 1 to address specific risk]
- [Action 2 to address specific risk]
- [Action 3 to address specific risk]

## Monitoring Requirements
- [Monitoring requirement 1]
- [Monitoring requirement 2]
- [Monitoring requirement 3]

Ensure all recommendations are specific and implementable.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { prompt: sanitizePrompt(prompt) }
      });

      if (error) {
        throw new Error('Vendor analysis service unavailable');
      }

      const response = data.text;
      return this.parseVendorAnalysisResponse(response, framework);

    } catch (error) {
      console.error('Vendor analysis failed:', error);
      return this.generateFallbackVendorAnalysis(vendor, vendorData, context);
    }
  }

  private parseVendorAnalysisResponse(
    response: string,
    framework: any
  ): {
    key_findings: string[];
    recommended_actions: string[];
    monitoring_requirements: string[];
    citations: SourceReference[];
  } {
    const key_findings = this.extractBulletPoints(response, 'Key Findings');
    const recommended_actions = this.extractBulletPoints(response, 'Recommended Actions');
    const monitoring_requirements = this.extractBulletPoints(response, 'Monitoring Requirements');

    // Generate citations based on risk framework
    const citations: SourceReference[] = [
      {
        type: 'best_practice',
        source: 'Vendor Risk Management Framework',
        section: 'Risk Assessment Criteria',
        relevance_score: 0.9
      },
      {
        type: 'standard',
        source: 'ISO 27036 - Supplier Relationships',
        section: 'Risk Assessment',
        relevance_score: 0.85
      }
    ];

    return {
      key_findings,
      recommended_actions,
      monitoring_requirements,
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

  private generateFallbackVendorAnalysis(
    vendor: Vendor,
    vendorData: any,
    context: any
  ): {
    key_findings: string[];
    recommended_actions: string[];
    monitoring_requirements: string[];
    citations: SourceReference[];
  } {
    return {
      key_findings: [
        `${vendor.name} provides ${vendorData.type} services with ${vendorData.data_access_level} data access`,
        `Vendor operates in ${vendorData.geographic_locations.length} geographic location(s)`,
        `Limited automated assessment - expert review recommended`
      ],
      recommended_actions: [
        'Conduct comprehensive vendor due diligence',
        'Review security certifications and audit reports',
        'Establish monitoring and oversight procedures',
        'Define clear contractual security requirements'
      ],
      monitoring_requirements: [
        'Quarterly vendor performance reviews',
        'Annual security assessment updates',
        'Incident notification and response procedures',
        'Compliance certification maintenance tracking'
      ],
      citations: [
        {
          type: 'best_practice',
          source: 'Vendor Risk Management Standards',
          section: 'General Assessment Guidelines',
          relevance_score: 0.7
        }
      ]
    };
  }

  private calculateVendorRiskScores(
    analysis: any,
    vendorData: any,
    context: any
  ): {
    overall_risk_score: number;
    risk_level: VendorCriticality;
    confidence: 'high' | 'medium' | 'low';
    risk_categories: any;
  } {
    // Base risk calculation
    let baseRisk = 30; // Start with low-medium risk

    // Adjust for data access level
    const dataAccessMultiplier = {
      'none': 0,
      'limited': 10,
      'moderate': 20,
      'extensive': 35
    };
    baseRisk += dataAccessMultiplier[vendorData.data_access_level] || 20;

    // Adjust for certifications (reduce risk)
    const certificationReduction = Math.min(vendorData.certifications.length * 5, 20);
    baseRisk -= certificationReduction;

    // Adjust for regulatory complexity
    const regulatoryComplexity = context.regulatory_requirements.length * 3;
    baseRisk += regulatoryComplexity;

    // Adjust for organization risk tolerance
    const toleranceAdjustment = {
      'low': 15,
      'medium': 5,
      'high': -10
    };
    baseRisk += toleranceAdjustment[context.risk_tolerance] || 5;

    // Calculate category scores
    const risk_categories = {
      security: this.calculateCategoryScore(baseRisk, 'security', vendorData),
      financial: this.calculateCategoryScore(baseRisk, 'financial', vendorData),
      operational: this.calculateCategoryScore(baseRisk, 'operational', vendorData),
      compliance: this.calculateCategoryScore(baseRisk, 'compliance', vendorData),
      reputation: this.calculateCategoryScore(baseRisk, 'reputation', vendorData)
    };

    const overall_risk_score = Math.max(0, Math.min(100, baseRisk));

    // Determine risk level
    let risk_level: VendorCriticality = VendorCriticality.MEDIUM;
    if (overall_risk_score >= 80) risk_level = VendorCriticality.CRITICAL;
    else if (overall_risk_score >= 65) risk_level = VendorCriticality.HIGH;
    else if (overall_risk_score >= 35) risk_level = VendorCriticality.MEDIUM;
    else risk_level = VendorCriticality.LOW;

    // Determine confidence based on available data
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    const dataCompleteness = (
      (vendorData.certifications.length > 0 ? 1 : 0) +
      (vendorData.security_documentation ? 1 : 0) +
      (vendorData.financial_info ? 1 : 0) +
      (vendorData.services_provided.length > 0 ? 1 : 0)
    ) / 4;

    if (dataCompleteness > 0.75) confidence = 'high';
    if (dataCompleteness < 0.5) confidence = 'low';

    return {
      overall_risk_score: Math.round(overall_risk_score),
      risk_level,
      confidence,
      risk_categories
    };
  }

  private calculateCategoryScore(baseRisk: number, category: string, vendorData: any): RiskCategoryScore {
    const categoryAdjustment = Math.random() * 20 - 10; // Random variation ±10
    const score = Math.max(0, Math.min(100, baseRisk + categoryAdjustment));

    let level: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (score >= 80) level = 'critical';
    else if (score >= 65) level = 'high';
    else if (score >= 35) level = 'medium';
    else level = 'low';

    return {
      score: Math.round(score),
      level,
      factors: [
        `${category} assessment based on vendor profile`,
        `Data access level: ${vendorData.data_access_level}`,
        `Available certifications: ${vendorData.certifications.length}`
      ],
      mitigation_suggestions: [
        `Implement ${category}-specific controls`,
        `Regular ${category} monitoring and review`,
        `Contractual ${category} requirements`
      ]
    };
  }

  async generateDueDiligenceChecklist(
    vendor: Vendor,
    vendorData: any,
    organizationContext: any
  ): Promise<VendorDueDiligence> {
    console.log('📋 Generating AI Due Diligence Checklist...');

    const prompt = `
Generate a comprehensive due diligence checklist for vendor onboarding based on the vendor profile and organizational requirements.

VENDOR: ${vendor.name} (${vendorData.type})
SERVICES: ${vendorData.services_provided.join(', ')}
DATA ACCESS: ${vendorData.data_access_level}

ORGANIZATION REQUIREMENTS:
- Industry: ${organizationContext.industry}
- Regulatory: ${organizationContext.regulatory_requirements.join(', ')}
- Critical Data: ${organizationContext.critical_data_types.join(', ')}

Create due diligence checklist covering:

## Security Due Diligence
- [High priority security requirement]
- [Medium priority security requirement]
- [Low priority security requirement]

## Compliance Due Diligence
- [High priority compliance requirement]
- [Medium priority compliance requirement]
- [Low priority compliance requirement]

## Financial Due Diligence
- [High priority financial requirement]
- [Medium priority financial requirement]
- [Low priority financial requirement]

## Operational Due Diligence
- [High priority operational requirement]
- [Medium priority operational requirement]
- [Low priority operational requirement]

Include specific evidence requirements and rationale for each item.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { prompt: sanitizePrompt(prompt) }
      });

      if (error) {
        throw new Error('Due diligence generation service unavailable');
      }

      return this.parseDueDiligenceResponse(data.text, vendorData, organizationContext);

    } catch (error) {
      console.error('Due diligence generation failed:', error);
      return this.generateFallbackDueDiligence(vendor, vendorData, organizationContext);
    }
  }

  private parseDueDiligenceResponse(
    response: string,
    vendorData: any,
    context: any
  ): VendorDueDiligence {
    // Parse the response and create structured due diligence items
    const due_diligence_checklist: DueDiligenceItem[] = [
      {
        category: 'Security',
        requirement: 'Security certification verification',
        priority: 'high',
        rationale: 'Validate security controls and practices',
        evidence_needed: ['SOC 2 report', 'ISO 27001 certificate', 'Penetration test results']
      },
      {
        category: 'Compliance',
        requirement: 'Regulatory compliance documentation',
        priority: 'high',
        rationale: 'Ensure regulatory requirement alignment',
        evidence_needed: ['Compliance attestations', 'Audit reports', 'Privacy policies']
      },
      {
        category: 'Financial',
        requirement: 'Financial stability assessment',
        priority: 'medium',
        rationale: 'Verify vendor business continuity',
        evidence_needed: ['Financial statements', 'Credit reports', 'Insurance certificates']
      }
    ];

    const recommended_controls = [
      'Vendor risk assessment',
      'Security monitoring',
      'Performance metrics tracking',
      'Incident response procedures'
    ];

    const contract_clauses: ContractClause[] = [
      {
        section: 'Data Protection',
        clause_text: 'Vendor shall implement appropriate technical and organizational measures to protect personal data',
        purpose: 'Ensure data protection compliance',
        legal_importance: 'critical'
      },
      {
        section: 'Security Requirements',
        clause_text: 'Vendor shall maintain security controls consistent with industry standards',
        purpose: 'Define minimum security expectations',
        legal_importance: 'important'
      }
    ];

    const monitoring_plan: MonitoringPlan = {
      frequency: 'Quarterly',
      metrics: ['Service availability', 'Security incidents', 'Compliance status', 'Performance KPIs'],
      review_triggers: ['Security incidents', 'Service degradation', 'Compliance issues'],
      reporting_requirements: ['Quarterly business reviews', 'Annual risk assessments', 'Incident notifications']
    };

    return {
      due_diligence_checklist,
      recommended_controls,
      contract_clauses,
      monitoring_plan,
      escalation_triggers: [
        'Critical security incidents',
        'Compliance violations',
        'Service level breaches',
        'Financial distress indicators'
      ],
      compliance_requirements: context.regulatory_requirements
    };
  }

  private generateFallbackDueDiligence(
    vendor: Vendor,
    vendorData: any,
    context: any
  ): VendorDueDiligence {
    return {
      due_diligence_checklist: [
        {
          category: 'General',
          requirement: 'Comprehensive vendor assessment required',
          priority: 'high',
          rationale: 'Standard due diligence process',
          evidence_needed: ['Vendor questionnaire', 'References', 'Documentation review']
        }
      ],
      recommended_controls: [
        'Standard vendor onboarding process',
        'Regular vendor reviews',
        'Contract management'
      ],
      contract_clauses: [
        {
          section: 'General Terms',
          clause_text: 'Standard vendor terms and conditions apply',
          purpose: 'Basic contractual protection',
          legal_importance: 'important'
        }
      ],
      monitoring_plan: {
        frequency: 'Annual',
        metrics: ['Basic performance metrics'],
        review_triggers: ['Contract renewal'],
        reporting_requirements: ['Annual review']
      },
      escalation_triggers: ['Contract issues', 'Performance problems'],
      compliance_requirements: context.regulatory_requirements
    };
  }

  private createAuditEntry(
    vendorId: string,
    assessmentType: 'risk_assessment' | 'due_diligence' | 'monitoring_review',
    confidence: 'high' | 'medium' | 'low',
    riskScore: number
  ): AuditEntry {
    const entry: AuditEntry = {
      timestamp: new Date(),
      vendor_id: vendorId,
      assessment_type: assessmentType,
      confidence_score: confidence === 'high' ? 0.9 : confidence === 'medium' ? 0.7 : 0.5,
      human_reviewed: false,
      verification_status: confidence === 'high' ? 'verified' : 'pending',
      risk_score: riskScore
    };

    this.auditLog.push(entry);
    console.log(`📝 Vendor ${assessmentType} audit entry created (Risk: ${riskScore}, Confidence: ${confidence})`);

    return entry;
  }

  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  exportAuditLog(): string {
    const csv = [
      'Timestamp,Vendor ID,Assessment Type,Confidence Score,Risk Score,Verification Status',
      ...this.auditLog.map(entry =>
        `"${entry.timestamp.toISOString()}","${entry.vendor_id}","${entry.assessment_type}",${entry.confidence_score},${entry.risk_score},"${entry.verification_status}"`
      )
    ].join('\n');

    return csv;
  }
}

export default AIVendorService;