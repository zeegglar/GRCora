import type { AssessmentItem, Risk, Control, Project, Vendor, Policy } from '../types';
import { RiskLevel, PolicyStatus, VendorCriticality } from '../types';

export interface ComplianceMetrics {
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  inProgressControls: number;
  notApplicableControls: number;
  compliancePercentage: number;
  compliancePosture: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface RiskMetrics {
  totalRisks: number;
  openRisks: number;
  closedRisks: number;
  risksByLevel: {
    [RiskLevel.CRITICAL]: number;
    [RiskLevel.HIGH]: number;
    [RiskLevel.MEDIUM]: number;
    [RiskLevel.LOW]: number;
  };
  riskScore: number;
  riskTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface VendorMetrics {
  totalVendors: number;
  activeVendors: number;
  criticalVendors: number;
  highRiskVendors: number;
  averageRiskScore: number;
  vendorsByTier: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };
}

export interface PolicyMetrics {
  totalPolicies: number;
  approvedPolicies: number;
  draftPolicies: number;
  inReviewPolicies: number;
  rejectedPolicies: number;
  archivedPolicies: number;
  policyCoverage: number;
}

export interface FrameworkCoverage {
  framework: string;
  totalControls: number;
  coveredControls: number;
  coveragePercentage: number;
  gapCount: number;
}

export interface ProjectAnalytics {
  compliance: ComplianceMetrics;
  risks: RiskMetrics;
  vendors: VendorMetrics;
  policies: PolicyMetrics;
  frameworkCoverage: FrameworkCoverage[];
  maturityScore: number;
  maturityLevel: 'Initial' | 'Developing' | 'Defined' | 'Managed' | 'Optimized';
  recommendations: string[];
}

export interface TrendData {
  date: string;
  complianceScore: number;
  riskScore: number;
  vendorScore: number;
}

// Calculate compliance metrics
export const calculateComplianceMetrics = (
  assessmentItems: AssessmentItem[],
  controls: Map<string, Control>
): ComplianceMetrics => {
  const totalControls = assessmentItems.length;
  const statusCounts = assessmentItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const compliantControls = statusCounts['Compliant'] || 0;
  const nonCompliantControls = statusCounts['Non-Compliant'] || 0;
  const inProgressControls = statusCounts['In Progress'] || 0;
  const notApplicableControls = statusCounts['Not Applicable'] || 0;

  const effectiveTotal = totalControls - notApplicableControls;
  const compliancePercentage = effectiveTotal > 0 ? (compliantControls / effectiveTotal) * 100 : 0;

  let compliancePosture: ComplianceMetrics['compliancePosture'];
  if (compliancePercentage >= 90) compliancePosture = 'Excellent';
  else if (compliancePercentage >= 75) compliancePosture = 'Good';
  else if (compliancePercentage >= 50) compliancePosture = 'Fair';
  else if (compliancePercentage >= 25) compliancePosture = 'Poor';
  else compliancePosture = 'Critical';

  return {
    totalControls,
    compliantControls,
    nonCompliantControls,
    inProgressControls,
    notApplicableControls,
    compliancePercentage,
    compliancePosture
  };
};

// Calculate risk metrics
export const calculateRiskMetrics = (risks: Risk[]): RiskMetrics => {
  const totalRisks = risks.length;
  const openRisks = risks.filter(r => r.status === 'Open').length;
  const closedRisks = risks.filter(r => r.status === 'Closed').length;

  const risksByLevel = {
    [RiskLevel.CRITICAL]: risks.filter(r => r.level === RiskLevel.CRITICAL && r.status === 'Open').length,
    [RiskLevel.HIGH]: risks.filter(r => r.level === RiskLevel.HIGH && r.status === 'Open').length,
    [RiskLevel.MEDIUM]: risks.filter(r => r.level === RiskLevel.MEDIUM && r.status === 'Open').length,
    [RiskLevel.LOW]: risks.filter(r => r.level === RiskLevel.LOW && r.status === 'Open').length,
  };

  // Calculate risk score (weighted)
  const weights = {
    [RiskLevel.CRITICAL]: 10,
    [RiskLevel.HIGH]: 7,
    [RiskLevel.MEDIUM]: 4,
    [RiskLevel.LOW]: 1
  };

  const riskScore = Object.entries(risksByLevel).reduce((score, [level, count]) => {
    return score + (count * weights[level as RiskLevel]);
  }, 0);

  // Simple trend calculation (would need historical data in real implementation)
  const riskTrend: RiskMetrics['riskTrend'] = 'stable';

  return {
    totalRisks,
    openRisks,
    closedRisks,
    risksByLevel,
    riskScore,
    riskTrend
  };
};

// Calculate vendor metrics
export const calculateVendorMetrics = (vendors: Vendor[]): VendorMetrics => {
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const criticalVendors = vendors.filter(v => v.criticality === VendorCriticality.CRITICAL).length;
  const highRiskVendors = vendors.filter(v =>
    v.criticality === VendorCriticality.CRITICAL || v.criticality === VendorCriticality.HIGH
  ).length;

  const averageRiskScore = vendors.length > 0
    ? vendors.reduce((sum, v) => sum + v.overallRiskScore, 0) / vendors.length
    : 0;

  const vendorsByTier = {
    tier1: vendors.filter(v => v.tier === '1').length,
    tier2: vendors.filter(v => v.tier === '2').length,
    tier3: vendors.filter(v => v.tier === '3').length,
    tier4: vendors.filter(v => v.tier === '4').length,
  };

  return {
    totalVendors,
    activeVendors,
    criticalVendors,
    highRiskVendors,
    averageRiskScore,
    vendorsByTier
  };
};

// Calculate policy metrics
export const calculatePolicyMetrics = (policies: Policy[]): PolicyMetrics => {
  const totalPolicies = policies.length;
  const statusCounts = policies.reduce((acc, policy) => {
    acc[policy.status] = (acc[policy.status] || 0) + 1;
    return acc;
  }, {} as Record<PolicyStatus, number>);

  const approvedPolicies = statusCounts[PolicyStatus.APPROVED] || 0;
  const draftPolicies = statusCounts[PolicyStatus.DRAFT] || 0;
  const inReviewPolicies = statusCounts[PolicyStatus.IN_REVIEW] || 0;
  const rejectedPolicies = statusCounts[PolicyStatus.REJECTED] || 0;
  const archivedPolicies = statusCounts[PolicyStatus.ARCHIVED] || 0;

  const policyCoverage = totalPolicies > 0 ? (approvedPolicies / totalPolicies) * 100 : 0;

  return {
    totalPolicies,
    approvedPolicies,
    draftPolicies,
    inReviewPolicies,
    rejectedPolicies,
    archivedPolicies,
    policyCoverage
  };
};

// Calculate framework coverage
export const calculateFrameworkCoverage = (
  project: Project,
  assessmentItems: AssessmentItem[],
  controls: Map<string, Control>
): FrameworkCoverage[] => {
  return project.frameworks.map(framework => {
    const frameworkControls = Array.from(controls.values()).filter(c => c.framework === framework);
    const totalControls = frameworkControls.length;

    const assessedControlIds = new Set(assessmentItems.map(item => item.controlId));
    const coveredControls = frameworkControls.filter(c => assessedControlIds.has(c.id)).length;

    const coveragePercentage = totalControls > 0 ? (coveredControls / totalControls) * 100 : 0;
    const gapCount = totalControls - coveredControls;

    return {
      framework,
      totalControls,
      coveredControls,
      coveragePercentage,
      gapCount
    };
  });
};

// Calculate maturity score and level
export const calculateMaturityScore = (
  compliance: ComplianceMetrics,
  risks: RiskMetrics,
  policies: PolicyMetrics
): { score: number; level: ProjectAnalytics['maturityLevel'] } => {
  // Weighted scoring
  const complianceWeight = 0.4;
  const riskWeight = 0.3;
  const policyWeight = 0.3;

  // Normalize risk score (inverse - lower risk is better)
  const normalizedRiskScore = Math.max(0, 100 - (risks.riskScore * 2));

  const score = (
    (compliance.compliancePercentage * complianceWeight) +
    (normalizedRiskScore * riskWeight) +
    (policies.policyCoverage * policyWeight)
  );

  let level: ProjectAnalytics['maturityLevel'];
  if (score >= 85) level = 'Optimized';
  else if (score >= 70) level = 'Managed';
  else if (score >= 55) level = 'Defined';
  else if (score >= 40) level = 'Developing';
  else level = 'Initial';

  return { score, level };
};

// Generate recommendations
export const generateRecommendations = (
  compliance: ComplianceMetrics,
  risks: RiskMetrics,
  vendors: VendorMetrics,
  policies: PolicyMetrics
): string[] => {
  const recommendations: string[] = [];

  // Compliance recommendations
  if (compliance.compliancePercentage < 70) {
    recommendations.push(`Improve compliance posture - currently at ${compliance.compliancePercentage.toFixed(1)}%`);
  }
  if (compliance.nonCompliantControls > 0) {
    recommendations.push(`Address ${compliance.nonCompliantControls} non-compliant controls`);
  }

  // Risk recommendations
  if (risks.risksByLevel[RiskLevel.CRITICAL] > 0) {
    recommendations.push(`Immediately address ${risks.risksByLevel[RiskLevel.CRITICAL]} critical risks`);
  }
  if (risks.risksByLevel[RiskLevel.HIGH] > 3) {
    recommendations.push(`Prioritize remediation of ${risks.risksByLevel[RiskLevel.HIGH]} high-risk items`);
  }

  // Vendor recommendations
  if (vendors.criticalVendors > 0 && vendors.averageRiskScore > 50) {
    recommendations.push(`Review and improve ${vendors.criticalVendors} critical vendor relationships`);
  }

  // Policy recommendations
  if (policies.policyCoverage < 80) {
    recommendations.push(`Improve policy coverage - currently at ${policies.policyCoverage.toFixed(1)}%`);
  }
  if (policies.draftPolicies > 5) {
    recommendations.push(`Complete review and approval of ${policies.draftPolicies} draft policies`);
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};

// Main analytics calculation function
export const calculateProjectAnalytics = (
  project: Project,
  assessmentItems: AssessmentItem[],
  risks: Risk[],
  vendors: Vendor[],
  policies: Policy[],
  controls: Map<string, Control>
): ProjectAnalytics => {
  const compliance = calculateComplianceMetrics(assessmentItems, controls);
  const riskMetrics = calculateRiskMetrics(risks);
  const vendorMetrics = calculateVendorMetrics(vendors);
  const policyMetrics = calculatePolicyMetrics(policies);
  const frameworkCoverage = calculateFrameworkCoverage(project, assessmentItems, controls);
  const { score: maturityScore, level: maturityLevel } = calculateMaturityScore(compliance, riskMetrics, policyMetrics);
  const recommendations = generateRecommendations(compliance, riskMetrics, vendorMetrics, policyMetrics);

  return {
    compliance,
    risks: riskMetrics,
    vendors: vendorMetrics,
    policies: policyMetrics,
    frameworkCoverage,
    maturityScore,
    maturityLevel,
    recommendations
  };
};

// Generate mock trend data for charts
export const generateTrendData = (days: number = 30): TrendData[] => {
  const data: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic trending data
    const baseCompliance = 65;
    const baseRisk = 35;
    const baseVendor = 70;

    // Add some realistic variation
    const variation = Math.sin(i / 7) * 5 + Math.random() * 3;

    data.push({
      date: date.toISOString().split('T')[0],
      complianceScore: Math.max(0, Math.min(100, baseCompliance + variation + (i * 0.5))),
      riskScore: Math.max(0, Math.min(100, baseRisk - variation + Math.random() * 2)),
      vendorScore: Math.max(0, Math.min(100, baseVendor + Math.sin(i / 14) * 3))
    });
  }

  return data;
};