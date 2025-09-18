import { supabase } from './supabaseClient';

interface ReportData {
  organizationName: string;
  assessmentDate: string;
  consultantName: string;
  frameworks: string[];
  risks: RiskItem[];
  controlCoverage: ControlCoverage;
  recommendations: Recommendation[];
  timeline: TimelineItem[];
  budgetEstimate: BudgetEstimate;
}

interface RiskItem {
  title: string;
  level: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  likelihood: string;
  businessImpact: string;
  recommendation: string;
  estimatedCost: string;
}

interface ControlCoverage {
  framework: string;
  totalControls: number;
  implementedControls: number;
  coveragePercentage: number;
  missingControls: string[];
}

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  estimatedCost: string;
  timeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface TimelineItem {
  phase: string;
  duration: string;
  budget: string;
  deliverables: string[];
}

interface BudgetEstimate {
  immediate: number;
  shortTerm: number;
  longTerm: number;
  total: number;
  roi: string;
}

export class ReportExportService {
  static async generateConsultantReport(projectId: string): Promise<string> {
    try {
      // Fetch project and organization data
      const { data: project } = await supabase
        .from('projects')
        .select(`
          *,
          organizations (*)
        `)
        .eq('id', projectId)
        .single();

      // Fetch risks
      const { data: risks } = await supabase
        .from('risks')
        .select('*')
        .eq('project_id', projectId);

      // Fetch assessment items for control coverage
      const { data: assessmentItems } = await supabase
        .from('assessment_items')
        .select('*')
        .eq('project_id', projectId);

      const reportData: ReportData = {
        organizationName: project.organizations.name,
        assessmentDate: new Date().toLocaleDateString(),
        consultantName: '[Consultant Name]',
        frameworks: project.frameworks || [],
        risks: this.formatRisks(risks || []),
        controlCoverage: this.calculateControlCoverage(assessmentItems || []),
        recommendations: this.generateRecommendations(risks || []),
        timeline: this.generateTimeline(),
        budgetEstimate: this.calculateBudget(risks || [])
      };

      return this.generateMarkdownReport(reportData);

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate consultant report');
    }
  }

  static generateMarkdownReport(data: ReportData): string {
    return `# GRC Assessment Report
## ${data.organizationName}
### Security Consulting Engagement

**Report Date**: ${data.assessmentDate}
**Consultant**: ${data.consultantName}
**Frameworks**: ${data.frameworks.join(', ')}

---

## Executive Summary

${data.organizationName} engaged our firm to conduct a comprehensive information security assessment and develop a compliance framework. This report summarizes our findings and provides actionable recommendations for strengthening the organization's security posture.

### Key Findings
- **Current Security Maturity**: Assessment in progress
- **Priority Risk Areas**: ${data.risks.length} risks identified
- **Compliance Coverage**: ${data.controlCoverage.coveragePercentage}% of controls implemented
- **Total Investment Required**: $${data.budgetEstimate.total.toLocaleString()}

### Investment Summary
- **Immediate (0-3 months)**: $${data.budgetEstimate.immediate.toLocaleString()}
- **Short-term (3-6 months)**: $${data.budgetEstimate.shortTerm.toLocaleString()}
- **Long-term (6-12 months)**: $${data.budgetEstimate.longTerm.toLocaleString()}

**Estimated ROI**: ${data.budgetEstimate.roi}

---

## Risk Assessment Summary

${data.risks.map(risk => `
### 🔴 ${risk.level} Risk: ${risk.title}
**Impact**: ${risk.impact}
**Likelihood**: ${risk.likelihood}
**Business Impact**: ${risk.businessImpact}
**Recommendation**: ${risk.recommendation}
**Estimated Cost**: ${risk.estimatedCost}
`).join('\n')}

---

## Control Coverage Analysis

### Framework Implementation Status

**${data.controlCoverage.framework}**
- **Total Controls**: ${data.controlCoverage.totalControls}
- **Implemented**: ${data.controlCoverage.implementedControls}
- **Coverage**: ${data.controlCoverage.coveragePercentage}%

### Missing Critical Controls
${data.controlCoverage.missingControls.map(control => `- ${control}`).join('\n')}

---

## Implementation Roadmap

${data.timeline.map(phase => `
### ${phase.phase}
**Duration**: ${phase.duration}
**Budget**: ${phase.budget}

**Deliverables**:
${phase.deliverables.map(item => `- ${item}`).join('\n')}
`).join('\n')}

---

## Recommendations

${data.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.difficulty})
${rec.description}

**Timeline**: ${rec.timeline}
**Estimated Cost**: ${rec.estimatedCost}
`).join('\n')}

---

## Next Steps

### Immediate Actions (Next 30 days)
1. Review and approve this assessment report
2. Secure funding for Phase 1 security improvements
3. Begin implementation of critical security controls
4. Schedule follow-up meeting to track progress

### Success Metrics
- Reduce critical risks by 80% within 6 months
- Achieve ${Math.min(data.controlCoverage.coveragePercentage + 30, 95)}% compliance coverage
- Complete security awareness training for all staff
- Establish ongoing security monitoring

---

**Report Prepared By**: ${data.consultantName}
**Date**: ${data.assessmentDate}
**Next Review**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
  }

  static async exportToPDF(content: string, filename: string): Promise<void> {
    // Create downloadable markdown file (PDF generation would require additional libraries)
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static formatRisks(risks: any[]): RiskItem[] {
    return risks.map(risk => ({
      title: risk.title,
      level: risk.level,
      impact: `Impact Score: ${risk.impact_score}/5`,
      likelihood: `Likelihood Score: ${risk.likelihood_score}/5`,
      businessImpact: risk.description || 'Business impact analysis needed',
      recommendation: risk.mitigation_plan || 'Mitigation plan to be developed',
      estimatedCost: '$5,000 - $15,000' // Would be calculated based on risk type
    }));
  }

  static calculateControlCoverage(assessmentItems: any[]): ControlCoverage {
    const implemented = assessmentItems.filter(item =>
      item.status === 'Compliant' || item.implementation_status === 'Implemented'
    ).length;

    return {
      framework: 'NIST Cybersecurity Framework',
      totalControls: assessmentItems.length || 100,
      implementedControls: implemented,
      coveragePercentage: assessmentItems.length ? Math.round((implemented / assessmentItems.length) * 100) : 0,
      missingControls: [
        'Access Control Management',
        'Incident Response Procedures',
        'Data Backup and Recovery',
        'Security Awareness Training'
      ]
    };
  }

  static generateRecommendations(risks: any[]): Recommendation[] {
    return [
      {
        priority: 1,
        title: 'Implement Multi-Factor Authentication',
        description: 'Deploy MFA on all critical systems to prevent unauthorized access',
        estimatedCost: '$3,000 - $5,000',
        timeline: '2-4 weeks',
        difficulty: 'Medium'
      },
      {
        priority: 2,
        title: 'Establish Data Backup Procedures',
        description: 'Implement automated daily backups with offsite storage',
        estimatedCost: '$1,000 - $3,000',
        timeline: '1-2 weeks',
        difficulty: 'Easy'
      },
      {
        priority: 3,
        title: 'Develop Incident Response Plan',
        description: 'Create documented procedures for security incident handling',
        estimatedCost: '$5,000 - $8,000',
        timeline: '4-6 weeks',
        difficulty: 'Medium'
      }
    ];
  }

  static generateTimeline(): TimelineItem[] {
    return [
      {
        phase: 'Phase 1: Critical Security Controls (0-3 months)',
        duration: '3 months',
        budget: '$15,000',
        deliverables: [
          'Multi-factor authentication deployment',
          'Data backup implementation',
          'Security awareness training',
          'Basic incident response procedures'
        ]
      },
      {
        phase: 'Phase 2: Infrastructure Hardening (3-6 months)',
        duration: '3 months',
        budget: '$25,000',
        deliverables: [
          'Network security improvements',
          'Advanced threat monitoring',
          'Vendor risk assessments',
          'Policy framework completion'
        ]
      },
      {
        phase: 'Phase 3: Advanced Security Operations (6-12 months)',
        duration: '6 months',
        budget: '$10,000',
        deliverables: [
          'Security operations center setup',
          'Annual penetration testing',
          'Compliance certification preparation',
          'Continuous monitoring implementation'
        ]
      }
    ];
  }

  static calculateBudget(risks: any[]): BudgetEstimate {
    const immediate = 15000;
    const shortTerm = 25000;
    const longTerm = 10000;
    const total = immediate + shortTerm + longTerm;

    return {
      immediate,
      shortTerm,
      longTerm,
      total,
      roi: '$180,000 in avoided breach costs and regulatory penalties'
    };
  }

  static async generatePolicyDocument(organizationId: string): Promise<string> {
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    const orgName = organization?.name || 'Your Organization';
    const industryType = organization?.industry || 'Business';

    return `# Information Security Policy
## ${orgName}

**Document Control**
- Version: 1.0
- Effective Date: ${new Date().toLocaleDateString()}
- Review Date: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Owner: ${orgName} Leadership

---

## 1. Purpose

${orgName} is committed to protecting the confidentiality, integrity, and availability of information assets while supporting our ${industryType.toLowerCase()} operations. This Information Security Policy establishes the framework for managing information security risks and ensuring compliance with applicable regulations.

## 2. Scope

This policy applies to:
- All ${orgName} employees, contractors, and authorized users
- All information systems, applications, and data owned or operated by ${orgName}
- Third-party services and cloud platforms used by the organization
- Physical and digital assets used for organizational activities

## 3. Roles and Responsibilities

### 3.1 Executive Leadership
- Ultimate accountability for information security program
- Approval of security policies and significant security investments
- Incident escalation point for security breaches

### 3.2 IT Security Coordinator
- Day-to-day management of information security controls
- Security awareness training coordination
- Incident response coordination
- Vendor security assessments

### 3.3 All Staff
- Compliance with security policies and procedures
- Immediate reporting of suspected security incidents
- Completion of required security training
- Secure handling of organizational information

## 4. Information Security Requirements

### 4.1 Access Control
- Individual user accounts required for all systems
- Role-based access permissions aligned with job responsibilities
- Multi-factor authentication required for critical systems
- Regular access reviews and immediate removal upon termination

### 4.2 Data Protection
- Sensitive data classified and handled according to protection requirements
- Encryption required for data transmission and storage of sensitive information
- Data retention policies aligned with legal and business requirements
- Privacy controls implemented for personal and customer information

### 4.3 Incident Response
- Documented incident response procedures
- Immediate reporting of suspected security incidents
- Regular testing and updates of response procedures
- Communication plans for stakeholders and regulators

### 4.4 Security Awareness
- Annual security training for all personnel
- Regular security communications and updates
- Phishing simulation exercises
- Security incident lessons learned sharing

## 5. Compliance

This policy supports compliance with:
- Industry-specific regulations applicable to ${industryType}
- Data protection and privacy laws
- NIST Cybersecurity Framework
- ISO 27001 Information Security Management

## 6. Policy Violations

Non-compliance with this policy may result in disciplinary action, including termination of employment or contract, and may also result in civil or criminal liability.

## 7. Review and Updates

This policy will be reviewed annually and updated as necessary to reflect changes in the threat landscape, business operations, and regulatory requirements.

---

**Approved By:**
Executive Leadership: _________________ Date: _________
IT Security Coordinator: _________________ Date: _________`;
  }
}