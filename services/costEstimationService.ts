// Cost Estimation Service - Provides realistic budget estimates for security implementations

interface CostEstimate {
  controlId: string;
  controlName: string;
  implementationCost: CostRange;
  annualCost: CostRange;
  oneTimeCosts: CostItem[];
  recurringCosts: CostItem[];
  organizationSizeMultiplier: number;
  industryMultiplier: number;
  difficultyFactor: number;
  totalEstimate: CostRange;
}

interface CostRange {
  min: number;
  max: number;
  typical: number;
  currency: string;
}

interface CostItem {
  category: 'Technology' | 'Consulting' | 'Training' | 'Licensing' | 'Maintenance';
  description: string;
  cost: CostRange;
  frequency: 'One-time' | 'Monthly' | 'Annual' | 'Quarterly';
  optional: boolean;
}

interface OrganizationProfile {
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  industry: string;
  employeeCount: number;
  currentSecurityMaturity: 'Basic' | 'Developing' | 'Defined' | 'Managed' | 'Optimized';
  budget: 'Limited' | 'Moderate' | 'Adequate' | 'Substantial';
}

export class CostEstimationService {
  private static readonly baseCosts: { [key: string]: CostEstimate } = {
    'ac-2': {
      controlId: 'ac-2',
      controlName: 'Account Management',
      implementationCost: { min: 500, max: 3000, typical: 1500, currency: 'USD' },
      annualCost: { min: 200, max: 1000, typical: 500, currency: 'USD' },
      oneTimeCosts: [
        {
          category: 'Consulting',
          description: 'Account setup and configuration',
          cost: { min: 500, max: 1500, typical: 1000, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        },
        {
          category: 'Training',
          description: 'Staff training on account management',
          cost: { min: 300, max: 800, typical: 500, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        }
      ],
      recurringCosts: [
        {
          category: 'Maintenance',
          description: 'Quarterly access reviews',
          cost: { min: 200, max: 600, typical: 400, currency: 'USD' },
          frequency: 'Quarterly',
          optional: false
        }
      ],
      organizationSizeMultiplier: 1.0,
      industryMultiplier: 1.0,
      difficultyFactor: 1.0,
      totalEstimate: { min: 0, max: 0, typical: 0, currency: 'USD' }
    },

    'ia-2': {
      controlId: 'ia-2',
      controlName: 'Multi-Factor Authentication',
      implementationCost: { min: 1500, max: 8000, typical: 4000, currency: 'USD' },
      annualCost: { min: 600, max: 3000, typical: 1500, currency: 'USD' },
      oneTimeCosts: [
        {
          category: 'Technology',
          description: 'MFA solution licensing and setup',
          cost: { min: 1000, max: 5000, typical: 2500, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        },
        {
          category: 'Consulting',
          description: 'Implementation and configuration',
          cost: { min: 500, max: 3000, typical: 1500, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        }
      ],
      recurringCosts: [
        {
          category: 'Licensing',
          description: 'Annual MFA service subscription',
          cost: { min: 600, max: 3000, typical: 1500, currency: 'USD' },
          frequency: 'Annual',
          optional: false
        }
      ],
      organizationSizeMultiplier: 1.2,
      industryMultiplier: 1.1,
      difficultyFactor: 1.0,
      totalEstimate: { min: 0, max: 0, typical: 0, currency: 'USD' }
    },

    'cp-9': {
      controlId: 'cp-9',
      controlName: 'Data Backup',
      implementationCost: { min: 1000, max: 5000, typical: 2500, currency: 'USD' },
      annualCost: { min: 1200, max: 6000, typical: 3000, currency: 'USD' },
      oneTimeCosts: [
        {
          category: 'Technology',
          description: 'Backup software and initial setup',
          cost: { min: 500, max: 2000, typical: 1000, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        },
        {
          category: 'Consulting',
          description: 'Backup strategy design and implementation',
          cost: { min: 500, max: 3000, typical: 1500, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        }
      ],
      recurringCosts: [
        {
          category: 'Technology',
          description: 'Cloud storage for backups',
          cost: { min: 100, max: 500, typical: 250, currency: 'USD' },
          frequency: 'Monthly',
          optional: false
        },
        {
          category: 'Maintenance',
          description: 'Backup monitoring and testing',
          cost: { min: 200, max: 1000, typical: 500, currency: 'USD' },
          frequency: 'Quarterly',
          optional: false
        }
      ],
      organizationSizeMultiplier: 1.5,
      industryMultiplier: 1.0,
      difficultyFactor: 0.8,
      totalEstimate: { min: 0, max: 0, typical: 0, currency: 'USD' }
    },

    'sc-8': {
      controlId: 'sc-8',
      controlName: 'Secure Communications',
      implementationCost: { min: 800, max: 4000, typical: 2000, currency: 'USD' },
      annualCost: { min: 500, max: 2500, typical: 1200, currency: 'USD' },
      oneTimeCosts: [
        {
          category: 'Technology',
          description: 'Encrypted email and file sharing setup',
          cost: { min: 300, max: 1500, typical: 800, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        },
        {
          category: 'Training',
          description: 'Staff training on secure communication',
          cost: { min: 500, max: 2500, typical: 1200, currency: 'USD' },
          frequency: 'One-time',
          optional: false
        }
      ],
      recurringCosts: [
        {
          category: 'Licensing',
          description: 'Encrypted communication services',
          cost: { min: 500, max: 2500, typical: 1200, currency: 'USD' },
          frequency: 'Annual',
          optional: false
        }
      ],
      organizationSizeMultiplier: 1.1,
      industryMultiplier: 1.2,
      difficultyFactor: 0.9,
      totalEstimate: { min: 0, max: 0, typical: 0, currency: 'USD' }
    }
  };

  static calculateControlCost(
    controlId: string,
    organizationProfile: OrganizationProfile
  ): CostEstimate | null {
    const baseCost = this.baseCosts[controlId];
    if (!baseCost) return null;

    const sizeMultiplier = this.getSizeMultiplier(organizationProfile.size);
    const industryMultiplier = this.getIndustryMultiplier(organizationProfile.industry);
    const maturityMultiplier = this.getMaturityMultiplier(organizationProfile.currentSecurityMaturity);

    const totalMultiplier = sizeMultiplier * industryMultiplier * maturityMultiplier;

    const adjustedCost: CostEstimate = {
      ...baseCost,
      implementationCost: this.applyCostMultiplier(baseCost.implementationCost, totalMultiplier),
      annualCost: this.applyCostMultiplier(baseCost.annualCost, totalMultiplier),
      oneTimeCosts: baseCost.oneTimeCosts.map(cost => ({
        ...cost,
        cost: this.applyCostMultiplier(cost.cost, totalMultiplier)
      })),
      recurringCosts: baseCost.recurringCosts.map(cost => ({
        ...cost,
        cost: this.applyCostMultiplier(cost.cost, totalMultiplier)
      }))
    };

    // Calculate total estimate
    const totalImplementation = adjustedCost.implementationCost.typical;
    const totalAnnual = adjustedCost.annualCost.typical;

    adjustedCost.totalEstimate = {
      min: totalImplementation + totalAnnual,
      max: totalImplementation + (totalAnnual * 3), // 3-year TCO
      typical: totalImplementation + (totalAnnual * 2), // 2-year TCO
      currency: 'USD'
    };

    return adjustedCost;
  }

  static calculateProjectCost(
    controlIds: string[],
    organizationProfile: OrganizationProfile
  ): {
    totalImplementationCost: CostRange;
    annualOperatingCost: CostRange;
    threeYearTCO: CostRange;
    breakdown: { [controlId: string]: CostEstimate };
  } {
    const breakdown: { [controlId: string]: CostEstimate } = {};
    let totalImpl = { min: 0, max: 0, typical: 0 };
    let totalAnnual = { min: 0, max: 0, typical: 0 };

    controlIds.forEach(controlId => {
      const estimate = this.calculateControlCost(controlId, organizationProfile);
      if (estimate) {
        breakdown[controlId] = estimate;
        totalImpl.min += estimate.implementationCost.min;
        totalImpl.max += estimate.implementationCost.max;
        totalImpl.typical += estimate.implementationCost.typical;

        totalAnnual.min += estimate.annualCost.min;
        totalAnnual.max += estimate.annualCost.max;
        totalAnnual.typical += estimate.annualCost.typical;
      }
    });

    return {
      totalImplementationCost: { ...totalImpl, currency: 'USD' },
      annualOperatingCost: { ...totalAnnual, currency: 'USD' },
      threeYearTCO: {
        min: totalImpl.min + (totalAnnual.min * 3),
        max: totalImpl.max + (totalAnnual.max * 3),
        typical: totalImpl.typical + (totalAnnual.typical * 3),
        currency: 'USD'
      },
      breakdown
    };
  }

  static generateBudgetRecommendations(
    totalCost: CostRange,
    organizationProfile: OrganizationProfile
  ): {
    phase1: { duration: string; cost: CostRange; priority: string };
    phase2: { duration: string; cost: CostRange; priority: string };
    phase3: { duration: string; cost: CostRange; priority: string };
    roi: string;
  } {
    const phase1Cost = Math.round(totalCost.typical * 0.4); // 40% for critical controls
    const phase2Cost = Math.round(totalCost.typical * 0.35); // 35% for important controls
    const phase3Cost = totalCost.typical - phase1Cost - phase2Cost; // Remaining for nice-to-have

    return {
      phase1: {
        duration: '0-3 months',
        cost: {
          min: Math.round(phase1Cost * 0.8),
          max: Math.round(phase1Cost * 1.2),
          typical: phase1Cost,
          currency: 'USD'
        },
        priority: 'Critical - Immediate risk reduction'
      },
      phase2: {
        duration: '3-6 months',
        cost: {
          min: Math.round(phase2Cost * 0.8),
          max: Math.round(phase2Cost * 1.2),
          typical: phase2Cost,
          currency: 'USD'
        },
        priority: 'High - Infrastructure hardening'
      },
      phase3: {
        duration: '6-12 months',
        cost: {
          min: Math.round(phase3Cost * 0.8),
          max: Math.round(phase3Cost * 1.2),
          typical: phase3Cost,
          currency: 'USD'
        },
        priority: 'Medium - Advanced capabilities'
      },
      roi: this.calculateROI(totalCost.typical, organizationProfile)
    };
  }

  private static getSizeMultiplier(size: string): number {
    switch (size) {
      case 'Small': return 0.8;
      case 'Medium': return 1.0;
      case 'Large': return 1.3;
      case 'Enterprise': return 1.8;
      default: return 1.0;
    }
  }

  private static getIndustryMultiplier(industry: string): number {
    const highRegulatedIndustries = ['Healthcare', 'Financial Services', 'Government'];
    const moderateIndustries = ['Education', 'Technology', 'Energy'];

    if (highRegulatedIndustries.includes(industry)) return 1.3;
    if (moderateIndustries.includes(industry)) return 1.1;
    return 1.0; // Nonprofit, retail, other
  }

  private static getMaturityMultiplier(maturity: string): number {
    switch (maturity) {
      case 'Basic': return 1.2; // More work needed
      case 'Developing': return 1.1;
      case 'Defined': return 1.0;
      case 'Managed': return 0.9;
      case 'Optimized': return 0.8;
      default: return 1.0;
    }
  }

  private static applyCostMultiplier(costRange: CostRange, multiplier: number): CostRange {
    return {
      min: Math.round(costRange.min * multiplier),
      max: Math.round(costRange.max * multiplier),
      typical: Math.round(costRange.typical * multiplier),
      currency: costRange.currency
    };
  }

  private static calculateROI(totalCost: number, organizationProfile: OrganizationProfile): string {
    // Average cost of data breach by organization size
    const breachCosts = {
      'Small': 120000,
      'Medium': 250000,
      'Large': 450000,
      'Enterprise': 1000000
    };

    const avgBreachCost = breachCosts[organizationProfile.size] || 250000;
    const riskReduction = 0.80; // 80% risk reduction
    const avoidedCost = Math.round(avgBreachCost * riskReduction);

    const roiRatio = Math.round((avoidedCost / totalCost) * 100);

    return `$${avoidedCost.toLocaleString()} in avoided breach costs (${roiRatio}% ROI)`;
  }

  static getQuickWinControls(): string[] {
    // Controls that provide high value for low cost
    return ['ac-2', 'cp-9', 'sc-8'];
  }

  static getCriticalControls(): string[] {
    // Must-have controls for any organization
    return ['ac-2', 'ia-2', 'cp-9'];
  }
}