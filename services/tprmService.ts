import { supabase } from '../lib/supabase';
import type { VendorTier, VendorAssessment, TPRMScoring, RiskTreatment } from '../types/comprehensive';

interface IndustryRiskWeights {
  [industry: string]: {
    security: number;
    financial: number;
    operational: number;
    compliance: number;
    reputation: number;
  };
}

interface VendorRiskProfile {
  vendor_id: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  scores_breakdown: {
    security: number;
    financial: number;
    operational: number;
    compliance: number;
    reputation: number;
  };
  recommendations: string[];
  next_assessment_due: Date;
}

export class TPRMService {
  private static instance: TPRMService;

  private readonly INDUSTRY_RISK_WEIGHTS: IndustryRiskWeights = {
    healthcare: {
      security: 0.35,
      compliance: 0.25,
      operational: 0.20,
      financial: 0.15,
      reputation: 0.05
    },
    financial: {
      security: 0.30,
      compliance: 0.30,
      financial: 0.25,
      operational: 0.10,
      reputation: 0.05
    },
    technology: {
      security: 0.40,
      operational: 0.25,
      financial: 0.15,
      compliance: 0.15,
      reputation: 0.05
    },
    manufacturing: {
      operational: 0.35,
      security: 0.25,
      financial: 0.20,
      compliance: 0.15,
      reputation: 0.05
    },
    default: {
      security: 0.30,
      operational: 0.25,
      compliance: 0.20,
      financial: 0.20,
      reputation: 0.05
    }
  };

  private readonly TIER_THRESHOLDS = {
    tier1: { min: 85, max: 100 },  // Strategic/Critical
    tier2: { min: 70, max: 84 },   // Important
    tier3: { min: 55, max: 69 },   // Standard
    tier4: { min: 0, max: 54 }     // Basic/High Risk
  };

  public static getInstance(): TPRMService {
    if (!TPRMService.instance) {
      TPRMService.instance = new TPRMService();
    }
    return TPRMService.instance;
  }

  async assessVendor(
    vendorId: string,
    organizationId: string,
    industry: string = 'default'
  ): Promise<VendorRiskProfile> {
    try {
      // Get vendor assessment data
      const { data: assessments, error } = await supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_responses (
            question_id,
            answer,
            score,
            evidence_url
          )
        `)
        .eq('vendor_id', vendorId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!assessments?.length) {
        throw new Error('No assessment data found for vendor');
      }

      const assessment = assessments[0];
      const responses = assessment.vendor_responses || [];

      // Calculate risk scores by category
      const scores = await this.calculateCategoryScores(responses);

      // Apply industry-specific weights
      const weights = this.INDUSTRY_RISK_WEIGHTS[industry] || this.INDUSTRY_RISK_WEIGHTS.default;

      const overallScore = Math.round(
        scores.security * weights.security +
        scores.financial * weights.financial +
        scores.operational * weights.operational +
        scores.compliance * weights.compliance +
        scores.reputation * weights.reputation
      );

      // Determine risk level and tier
      const riskLevel = this.calculateRiskLevel(overallScore);
      const tier = this.calculateVendorTier(overallScore);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(scores, riskLevel, industry);

      // Calculate next assessment date
      const nextAssessmentDue = this.calculateNextAssessmentDate(tier, riskLevel);

      // Update vendor tier in database
      await this.updateVendorTier(vendorId, organizationId, tier, overallScore, riskLevel);

      return {
        vendor_id: vendorId,
        risk_score: overallScore,
        risk_level: riskLevel,
        scores_breakdown: scores,
        recommendations,
        next_assessment_due: nextAssessmentDue
      };

    } catch (error) {
      console.error('Error assessing vendor:', error);
      throw error;
    }
  }

  private async calculateCategoryScores(responses: any[]): Promise<{
    security: number;
    financial: number;
    operational: number;
    compliance: number;
    reputation: number;
  }> {
    const categories = {
      security: [],
      financial: [],
      operational: [],
      compliance: [],
      reputation: []
    };

    // Get question categories from database
    const { data: questions } = await supabase
      .from('tprm_questions')
      .select('id, category, weight');

    const questionMap = new Map(questions?.map(q => [q.id, q]) || []);

    // Categorize responses
    responses.forEach(response => {
      const question = questionMap.get(response.question_id);
      if (question && categories[question.category]) {
        categories[question.category].push({
          score: response.score || 0,
          weight: question.weight || 1
        });
      }
    });

    // Calculate weighted averages for each category
    const scores = {};
    Object.keys(categories).forEach(category => {
      const categoryResponses = categories[category];
      if (categoryResponses.length === 0) {
        scores[category] = 0;
        return;
      }

      const totalWeightedScore = categoryResponses.reduce((sum, r) => sum + (r.score * r.weight), 0);
      const totalWeight = categoryResponses.reduce((sum, r) => sum + r.weight, 0);
      scores[category] = Math.round((totalWeightedScore / totalWeight) * 100) / 100;
    });

    return scores as any;
  }

  private calculateRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score >= 85) return 'Low';
    if (score >= 70) return 'Medium';
    if (score >= 55) return 'High';
    return 'Critical';
  }

  private calculateVendorTier(score: number): 'tier1' | 'tier2' | 'tier3' | 'tier4' {
    if (score >= this.TIER_THRESHOLDS.tier1.min) return 'tier1';
    if (score >= this.TIER_THRESHOLDS.tier2.min) return 'tier2';
    if (score >= this.TIER_THRESHOLDS.tier3.min) return 'tier3';
    return 'tier4';
  }

  private async generateRecommendations(
    scores: any,
    riskLevel: string,
    industry: string
  ): Promise<string[]> {
    const recommendations = [];

    // Security recommendations
    if (scores.security < 70) {
      recommendations.push('Implement comprehensive security assessment and penetration testing');
      recommendations.push('Require SOC 2 Type II certification within 6 months');
      if (industry === 'healthcare') {
        recommendations.push('Ensure HIPAA compliance documentation and BAA execution');
      }
    }

    // Financial recommendations
    if (scores.financial < 60) {
      recommendations.push('Request audited financial statements and D&B rating');
      recommendations.push('Establish financial monitoring with quarterly reviews');
      if (riskLevel === 'Critical') {
        recommendations.push('Consider escrow arrangements or payment protection');
      }
    }

    // Operational recommendations
    if (scores.operational < 65) {
      recommendations.push('Require detailed business continuity and disaster recovery plans');
      recommendations.push('Establish SLA monitoring with penalty clauses');
    }

    // Compliance recommendations
    if (scores.compliance < 70) {
      recommendations.push('Conduct compliance gap analysis and remediation planning');
      if (industry === 'financial') {
        recommendations.push('Verify SOX compliance for financial data handling');
      }
    }

    // Risk level specific recommendations
    if (riskLevel === 'Critical') {
      recommendations.push('Recommend quarterly on-site assessments');
      recommendations.push('Implement continuous monitoring with real-time alerts');
      recommendations.push('Consider vendor replacement or significant risk mitigation');
    } else if (riskLevel === 'High') {
      recommendations.push('Schedule bi-annual comprehensive reviews');
      recommendations.push('Implement enhanced contract terms with exit clauses');
    }

    return recommendations;
  }

  private calculateNextAssessmentDate(tier: string, riskLevel: string): Date {
    const now = new Date();
    let monthsToAdd = 12; // Default annual

    // Tier-based frequency
    switch (tier) {
      case 'tier1':
        monthsToAdd = riskLevel === 'Critical' ? 3 : 6;
        break;
      case 'tier2':
        monthsToAdd = riskLevel === 'Critical' ? 6 : 12;
        break;
      case 'tier3':
        monthsToAdd = 12;
        break;
      case 'tier4':
        monthsToAdd = riskLevel === 'Critical' ? 6 : 18;
        break;
    }

    return new Date(now.setMonth(now.getMonth() + monthsToAdd));
  }

  private async updateVendorTier(
    vendorId: string,
    organizationId: string,
    tier: string,
    score: number,
    riskLevel: string
  ): Promise<void> {
    const { error } = await supabase
      .from('vendor_tiers')
      .upsert({
        vendor_id: vendorId,
        organization_id: organizationId,
        tier,
        risk_score: score,
        risk_level: riskLevel,
        last_assessment: new Date().toISOString(),
        next_assessment: this.calculateNextAssessmentDate(tier, riskLevel).toISOString()
      });

    if (error) throw error;
  }

  async generateTPRMReport(organizationId: string): Promise<{
    summary: {
      total_vendors: number;
      by_tier: { [key: string]: number };
      by_risk_level: { [key: string]: number };
      overdue_assessments: number;
    };
    high_risk_vendors: VendorRiskProfile[];
    recommendations: string[];
  }> {
    try {
      // Get vendor summary
      const { data: vendors, error } = await supabase
        .from('vendor_tiers')
        .select(`
          *,
          vendors (
            id,
            name,
            contact_email,
            industry
          )
        `)
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Calculate summary statistics
      const summary = {
        total_vendors: vendors?.length || 0,
        by_tier: {
          tier1: vendors?.filter(v => v.tier === 'tier1').length || 0,
          tier2: vendors?.filter(v => v.tier === 'tier2').length || 0,
          tier3: vendors?.filter(v => v.tier === 'tier3').length || 0,
          tier4: vendors?.filter(v => v.tier === 'tier4').length || 0
        },
        by_risk_level: {
          Low: vendors?.filter(v => v.risk_level === 'Low').length || 0,
          Medium: vendors?.filter(v => v.risk_level === 'Medium').length || 0,
          High: vendors?.filter(v => v.risk_level === 'High').length || 0,
          Critical: vendors?.filter(v => v.risk_level === 'Critical').length || 0
        },
        overdue_assessments: vendors?.filter(v =>
          new Date(v.next_assessment) < new Date()
        ).length || 0
      };

      // Get high-risk vendors (High and Critical)
      const highRiskVendors = vendors?.filter(v =>
        ['High', 'Critical'].includes(v.risk_level)
      ) || [];

      // Generate portfolio recommendations
      const recommendations = this.generatePortfolioRecommendations(summary, highRiskVendors);

      return {
        summary,
        high_risk_vendors: highRiskVendors.map(v => ({
          vendor_id: v.vendor_id,
          risk_score: v.risk_score,
          risk_level: v.risk_level,
          scores_breakdown: {
            security: 0, // These would come from detailed assessment
            financial: 0,
            operational: 0,
            compliance: 0,
            reputation: 0
          },
          recommendations: [],
          next_assessment_due: new Date(v.next_assessment)
        })),
        recommendations
      };

    } catch (error) {
      console.error('Error generating TPRM report:', error);
      throw error;
    }
  }

  private generatePortfolioRecommendations(summary: any, highRiskVendors: any[]): string[] {
    const recommendations = [];

    // Portfolio concentration risk
    const tier1Percentage = (summary.by_tier.tier1 / summary.total_vendors) * 100;
    if (tier1Percentage > 60) {
      recommendations.push('Consider diversifying vendor portfolio to reduce concentration risk');
    }

    // High-risk vendor management
    if (summary.by_risk_level.Critical > 0) {
      recommendations.push(`${summary.by_risk_level.Critical} critical risk vendors require immediate attention`);
      recommendations.push('Implement emergency contingency plans for critical risk vendors');
    }

    if (summary.by_risk_level.High > 5) {
      recommendations.push('High number of high-risk vendors indicates need for enhanced due diligence processes');
    }

    // Assessment management
    if (summary.overdue_assessments > 0) {
      recommendations.push(`${summary.overdue_assessments} vendor assessments are overdue - schedule immediately`);
    }

    // Risk treatment recommendations
    if (highRiskVendors.length > summary.total_vendors * 0.3) {
      recommendations.push('Consider implementing vendor risk treatment program to reduce overall portfolio risk');
    }

    return recommendations;
  }

  async createRiskTreatment(
    vendorId: string,
    organizationId: string,
    treatment: {
      type: 'mitigate' | 'transfer' | 'accept' | 'avoid';
      description: string;
      owner: string;
      timeline: string;
      cost_estimate?: number;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('risk_treatments')
      .insert({
        vendor_id: vendorId,
        organization_id: organizationId,
        treatment_type: treatment.type,
        description: treatment.description,
        owner: treatment.owner,
        target_completion: treatment.timeline,
        estimated_cost: treatment.cost_estimate,
        status: 'planned',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}

export default TPRMService;