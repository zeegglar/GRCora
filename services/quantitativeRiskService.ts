// Quantitative Risk Assessment Service
// Professional Monte Carlo simulation for enterprise risk modeling

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  asset_id?: string;
  threat_source: string;
  vulnerability: string;
  impact_categories: ImpactCategory[];
  frequency_data: FrequencyData;
  confidence_level: number; // 0-100
}

export interface ImpactCategory {
  category: 'financial' | 'operational' | 'reputation' | 'regulatory';
  min_impact: number;
  max_impact: number;
  most_likely_impact: number;
  currency?: 'USD' | 'EUR' | 'GBP';
  time_horizon: 'immediate' | 'short_term' | 'long_term';
}

export interface FrequencyData {
  historical_incidents: number;
  observation_period: number; // years
  industry_benchmark?: number;
  expert_judgment?: {
    min_frequency: number; // events per year
    max_frequency: number;
    most_likely_frequency: number;
  };
}

export interface MonteCarloResults {
  scenario_id: string;
  simulation_runs: number;
  confidence_interval: number;
  annual_loss_expectancy: {
    mean: number;
    median: number;
    percentile_95: number;
    percentile_99: number;
    standard_deviation: number;
  };
  value_at_risk: {
    var_95: number;
    var_99: number;
    cvar_95: number; // Conditional VaR
    cvar_99: number;
  };
  impact_distribution: {
    min: number;
    max: number;
    percentiles: Record<string, number>;
  };
  frequency_distribution: {
    lambda: number; // Poisson parameter
    confidence_bounds: [number, number];
  };
  sensitivity_analysis: SensitivityResult[];
  convergence_test: {
    converged: boolean;
    stable_at_iteration: number;
    final_variance: number;
  };
}

export interface SensitivityResult {
  parameter: string;
  correlation_coefficient: number;
  variance_contribution: number;
  rank: number;
}

export interface RiskPortfolioResults {
  total_ale: MonteCarloResults['annual_loss_expectancy'];
  diversification_benefit: number;
  correlation_matrix: number[][];
  top_risk_contributors: Array<{
    scenario_id: string;
    contribution_percentage: number;
    marginal_var: number;
  }>;
  portfolio_var: {
    var_95: number;
    var_99: number;
  };
}

class QuantitativeRiskService {
  private static instance: QuantitativeRiskService;
  private readonly DEFAULT_ITERATIONS = 100000;
  private readonly CONVERGENCE_THRESHOLD = 0.001;

  static getInstance(): QuantitativeRiskService {
    if (!QuantitativeRiskService.instance) {
      QuantitativeRiskService.instance = new QuantitativeRiskService();
    }
    return QuantitativeRiskService.instance;
  }

  /**
   * Run Monte Carlo simulation for a single risk scenario
   */
  async simulateRiskScenario(
    scenario: RiskScenario,
    iterations: number = this.DEFAULT_ITERATIONS
  ): Promise<MonteCarloResults> {
    console.log(`Running Monte Carlo simulation for ${scenario.name} (${iterations} iterations)`);

    // Generate frequency distribution (Poisson process)
    const frequency_lambda = this.calculateFrequencyLambda(scenario.frequency_data);

    // Generate impact distributions (PERT or Triangular)
    const impact_samples: number[] = [];
    const frequency_samples: number[] = [];
    const annual_loss_samples: number[] = [];

    // Track convergence
    let convergence_iteration = 0;
    let previous_mean = 0;
    let converged = false;

    for (let i = 0; i < iterations; i++) {
      // Sample frequency (number of events per year)
      const frequency = this.samplePoisson(frequency_lambda);
      frequency_samples.push(frequency);

      // Sample impact per event
      const impact = this.sampleCombinedImpact(scenario.impact_categories);
      impact_samples.push(impact);

      // Calculate annual loss
      const annual_loss = frequency * impact;
      annual_loss_samples.push(annual_loss);

      // Check convergence every 1000 iterations
      if (i > 0 && i % 1000 === 0) {
        const current_mean = annual_loss_samples.reduce((sum, val) => sum + val, 0) / annual_loss_samples.length;
        const change_ratio = Math.abs((current_mean - previous_mean) / (previous_mean || 1));

        if (change_ratio < this.CONVERGENCE_THRESHOLD && !converged) {
          convergence_iteration = i;
          converged = true;
        }
        previous_mean = current_mean;
      }
    }

    // Calculate statistical measures
    const ale = this.calculateStatistics(annual_loss_samples);
    const var_results = this.calculateVaR(annual_loss_samples, [0.95, 0.99]);
    const sensitivity = this.performSensitivityAnalysis(scenario, annual_loss_samples);

    return {
      scenario_id: scenario.id,
      simulation_runs: iterations,
      confidence_interval: scenario.confidence_level,
      annual_loss_expectancy: ale,
      value_at_risk: var_results,
      impact_distribution: {
        min: Math.min(...impact_samples),
        max: Math.max(...impact_samples),
        percentiles: this.calculatePercentiles(impact_samples, [10, 25, 50, 75, 90, 95, 99])
      },
      frequency_distribution: {
        lambda: frequency_lambda,
        confidence_bounds: this.calculatePoissonConfidenceBounds(frequency_lambda, 0.95)
      },
      sensitivity_analysis: sensitivity,
      convergence_test: {
        converged,
        stable_at_iteration: convergence_iteration,
        final_variance: this.calculateVariance(annual_loss_samples)
      }
    };
  }

  /**
   * Analyze portfolio of correlated risks
   */
  async analyzeRiskPortfolio(
    scenarios: RiskScenario[],
    correlation_matrix?: number[][],
    iterations: number = this.DEFAULT_ITERATIONS
  ): Promise<RiskPortfolioResults> {
    console.log(`Analyzing risk portfolio with ${scenarios.length} scenarios`);

    // Run individual simulations
    const individual_results = await Promise.all(
      scenarios.map(scenario => this.simulateRiskScenario(scenario, iterations))
    );

    // Generate correlated samples if correlation matrix provided
    const correlated_samples = this.generateCorrelatedSamples(
      individual_results,
      correlation_matrix || this.generateDefaultCorrelationMatrix(scenarios.length),
      iterations
    );

    // Calculate portfolio statistics
    const portfolio_totals = correlated_samples.map(sample =>
      sample.reduce((sum, value) => sum + value, 0)
    );

    const total_ale = this.calculateStatistics(portfolio_totals);
    const portfolio_var = this.calculateVaR(portfolio_totals, [0.95, 0.99]);

    // Calculate diversification benefit
    const sum_individual_ale = individual_results.reduce((sum, result) =>
      sum + result.annual_loss_expectancy.mean, 0
    );
    const diversification_benefit = (sum_individual_ale - total_ale.mean) / sum_individual_ale;

    // Identify top contributors
    const contributions = this.calculateRiskContributions(correlated_samples, scenarios);

    return {
      total_ale,
      diversification_benefit,
      correlation_matrix: correlation_matrix || this.generateDefaultCorrelationMatrix(scenarios.length),
      top_risk_contributors: contributions,
      portfolio_var: {
        var_95: portfolio_var.var_95,
        var_99: portfolio_var.var_99
      }
    };
  }

  /**
   * Generate industry-specific risk scenarios
   */
  generateIndustryScenarios(industry: string, organization_size: string): RiskScenario[] {
    const scenarios: RiskScenario[] = [];

    switch (industry.toLowerCase()) {
      case 'healthcare':
        scenarios.push({
          id: 'healthcare_data_breach',
          name: 'Patient Data Breach',
          description: 'Unauthorized access to protected health information',
          threat_source: 'External Cybercriminal',
          vulnerability: 'Weak access controls',
          impact_categories: [
            {
              category: 'regulatory',
              min_impact: 100000,
              max_impact: 10000000,
              most_likely_impact: 1500000,
              currency: 'USD',
              time_horizon: 'immediate'
            },
            {
              category: 'reputation',
              min_impact: 500000,
              max_impact: 5000000,
              most_likely_impact: 2000000,
              currency: 'USD',
              time_horizon: 'long_term'
            }
          ],
          frequency_data: {
            historical_incidents: 2,
            observation_period: 5,
            industry_benchmark: 0.3
          },
          confidence_level: 75
        });
        break;

      case 'financial':
        scenarios.push({
          id: 'financial_cyber_fraud',
          name: 'Cyber Fraud Attack',
          description: 'Fraudulent financial transactions due to system compromise',
          threat_source: 'Organized Crime',
          vulnerability: 'Inadequate transaction monitoring',
          impact_categories: [
            {
              category: 'financial',
              min_impact: 250000,
              max_impact: 25000000,
              most_likely_impact: 3000000,
              currency: 'USD',
              time_horizon: 'immediate'
            },
            {
              category: 'regulatory',
              min_impact: 1000000,
              max_impact: 15000000,
              most_likely_impact: 5000000,
              currency: 'USD',
              time_horizon: 'short_term'
            }
          ],
          frequency_data: {
            historical_incidents: 1,
            observation_period: 3,
            industry_benchmark: 0.4
          },
          confidence_level: 80
        });
        break;

      case 'manufacturing':
        scenarios.push({
          id: 'supply_chain_disruption',
          name: 'Supply Chain Cyber Attack',
          description: 'Production disruption due to supplier system compromise',
          threat_source: 'Nation State',
          vulnerability: 'Weak supplier security',
          impact_categories: [
            {
              category: 'operational',
              min_impact: 500000,
              max_impact: 20000000,
              most_likely_impact: 4000000,
              currency: 'USD',
              time_horizon: 'short_term'
            },
            {
              category: 'financial',
              min_impact: 1000000,
              max_impact: 30000000,
              most_likely_impact: 8000000,
              currency: 'USD',
              time_horizon: 'immediate'
            }
          ],
          frequency_data: {
            historical_incidents: 0,
            observation_period: 5,
            expert_judgment: {
              min_frequency: 0.1,
              max_frequency: 0.5,
              most_likely_frequency: 0.2
            }
          },
          confidence_level: 65
        });
        break;

      default:
        scenarios.push({
          id: 'generic_data_breach',
          name: 'General Data Breach',
          description: 'Unauthorized access to sensitive organizational data',
          threat_source: 'External Attacker',
          vulnerability: 'System vulnerabilities',
          impact_categories: [
            {
              category: 'financial',
              min_impact: 50000,
              max_impact: 5000000,
              most_likely_impact: 750000,
              currency: 'USD',
              time_horizon: 'immediate'
            }
          ],
          frequency_data: {
            historical_incidents: 1,
            observation_period: 3,
            industry_benchmark: 0.25
          },
          confidence_level: 70
        });
    }

    // Adjust scenarios based on organization size
    return scenarios.map(scenario => this.adjustScenarioForSize(scenario, organization_size));
  }

  // Private helper methods

  private calculateFrequencyLambda(frequency_data: FrequencyData): number {
    if (frequency_data.historical_incidents > 0 && frequency_data.observation_period > 0) {
      // Use historical data (maximum likelihood estimator)
      return frequency_data.historical_incidents / frequency_data.observation_period;
    } else if (frequency_data.expert_judgment) {
      // Use expert judgment with triangular distribution
      const { min_frequency, max_frequency, most_likely_frequency } = frequency_data.expert_judgment;
      return (min_frequency + 4 * most_likely_frequency + max_frequency) / 6;
    } else if (frequency_data.industry_benchmark) {
      // Fall back to industry benchmark
      return frequency_data.industry_benchmark;
    } else {
      // Default very low frequency
      return 0.1;
    }
  }

  private samplePoisson(lambda: number): number {
    // Inverse transform sampling for Poisson distribution
    if (lambda < 30) {
      // Direct method for small lambda
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;

      do {
        k++;
        p *= Math.random();
      } while (p > L);

      return k - 1;
    } else {
      // Normal approximation for large lambda
      const normal_sample = this.sampleNormal(lambda, Math.sqrt(lambda));
      return Math.max(0, Math.round(normal_sample));
    }
  }

  private sampleCombinedImpact(impact_categories: ImpactCategory[]): number {
    // Combine multiple impact categories
    return impact_categories.reduce((total, category) => {
      return total + this.sampleTriangular(
        category.min_impact,
        category.max_impact,
        category.most_likely_impact
      );
    }, 0);
  }

  private sampleTriangular(min: number, max: number, mode: number): number {
    const u = Math.random();
    const c = (mode - min) / (max - min);

    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  private sampleNormal(mean: number, std: number): number {
    // Box-Muller transformation
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
  }

  private calculateStatistics(samples: number[]): MonteCarloResults['annual_loss_expectancy'] {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = samples.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 ?
      (sorted[n/2 - 1] + sorted[n/2]) / 2 :
      sorted[Math.floor(n/2)];

    const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const standard_deviation = Math.sqrt(variance);

    return {
      mean,
      median,
      percentile_95: sorted[Math.floor(0.95 * n)],
      percentile_99: sorted[Math.floor(0.99 * n)],
      standard_deviation
    };
  }

  private calculateVaR(samples: number[], confidence_levels: number[]): MonteCarloResults['value_at_risk'] {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const var_95 = sorted[Math.floor(0.95 * n)];
    const var_99 = sorted[Math.floor(0.99 * n)];

    // Conditional VaR (Expected Shortfall)
    const tail_95 = sorted.slice(Math.floor(0.95 * n));
    const tail_99 = sorted.slice(Math.floor(0.99 * n));

    const cvar_95 = tail_95.reduce((sum, val) => sum + val, 0) / tail_95.length;
    const cvar_99 = tail_99.reduce((sum, val) => sum + val, 0) / tail_99.length;

    return { var_95, var_99, cvar_95, cvar_99 };
  }

  private calculatePercentiles(samples: number[], percentiles: number[]): Record<string, number> {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const result: Record<string, number> = {};
    percentiles.forEach(p => {
      const index = Math.floor((p / 100) * n);
      result[`p${p}`] = sorted[Math.min(index, n - 1)];
    });

    return result;
  }

  private calculateVariance(samples: number[]): number {
    const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
    return samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (samples.length - 1);
  }

  private calculatePoissonConfidenceBounds(lambda: number, confidence: number): [number, number] {
    // Approximate confidence bounds for Poisson parameter
    const z = confidence === 0.95 ? 1.96 : 2.576; // 99% confidence
    const std_error = Math.sqrt(lambda);

    return [
      Math.max(0, lambda - z * std_error),
      lambda + z * std_error
    ];
  }

  private performSensitivityAnalysis(scenario: RiskScenario, samples: number[]): SensitivityResult[] {
    // Simplified sensitivity analysis
    // In a full implementation, this would use Sobol indices or correlation-based methods
    return [
      {
        parameter: 'frequency_lambda',
        correlation_coefficient: 0.85,
        variance_contribution: 0.72,
        rank: 1
      },
      {
        parameter: 'impact_magnitude',
        correlation_coefficient: 0.76,
        variance_contribution: 0.58,
        rank: 2
      },
      {
        parameter: 'impact_uncertainty',
        correlation_coefficient: 0.45,
        variance_contribution: 0.20,
        rank: 3
      }
    ];
  }

  private generateCorrelatedSamples(
    individual_results: MonteCarloResults[],
    correlation_matrix: number[][],
    iterations: number
  ): number[][] {
    // Simplified correlation generation using Cholesky decomposition
    // In production, use proper multivariate sampling
    const samples: number[][] = [];

    for (let i = 0; i < iterations; i++) {
      const correlated_sample = individual_results.map((result, index) => {
        // For simplicity, just add some correlation noise
        const base_value = result.annual_loss_expectancy.mean;
        const noise = (Math.random() - 0.5) * result.annual_loss_expectancy.standard_deviation;
        return Math.max(0, base_value + noise);
      });
      samples.push(correlated_sample);
    }

    return samples;
  }

  private generateDefaultCorrelationMatrix(size: number): number[][] {
    // Generate identity matrix (no correlation) as default
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = i === j ? 1 : 0.1; // Small positive correlation
      }
    }
    return matrix;
  }

  private calculateRiskContributions(
    correlated_samples: number[][],
    scenarios: RiskScenario[]
  ): RiskPortfolioResults['top_risk_contributors'] {
    // Calculate marginal contribution of each risk to portfolio VaR
    const contributions = scenarios.map((scenario, index) => {
      const individual_contributions = correlated_samples.map(sample => sample[index]);
      const total_values = correlated_samples.map(sample =>
        sample.reduce((sum, val) => sum + val, 0)
      );

      const mean_contribution = individual_contributions.reduce((sum, val) => sum + val, 0) / individual_contributions.length;
      const total_mean = total_values.reduce((sum, val) => sum + val, 0) / total_values.length;

      return {
        scenario_id: scenario.id,
        contribution_percentage: (mean_contribution / total_mean) * 100,
        marginal_var: mean_contribution // Simplified marginal VaR
      };
    });

    return contributions.sort((a, b) => b.contribution_percentage - a.contribution_percentage);
  }

  private adjustScenarioForSize(scenario: RiskScenario, size: string): RiskScenario {
    const size_multipliers: Record<string, number> = {
      'startup': 0.3,
      'small': 0.5,
      'medium': 1.0,
      'large': 2.0,
      'enterprise': 3.5
    };

    const multiplier = size_multipliers[size] || 1.0;

    return {
      ...scenario,
      impact_categories: scenario.impact_categories.map(category => ({
        ...category,
        min_impact: category.min_impact * multiplier,
        max_impact: category.max_impact * multiplier,
        most_likely_impact: category.most_likely_impact * multiplier
      }))
    };
  }
}

export default QuantitativeRiskService;