import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ExclamationTriangleIcon, CalculatorIcon, ChartBarIcon, CurrencyDollarIcon } from '../ui/Icons';
import QuantitativeRiskService, { RiskScenario, MonteCarloResults, RiskPortfolioResults } from '../../services/quantitativeRiskService';
import type { ProjectEnhanced, RiskEnhanced } from '../../types/comprehensive';

interface QuantitativeRiskAssessmentProps {
  project: ProjectEnhanced;
  risks: RiskEnhanced[];
  onBack: () => void;
}

interface SimulationConfig {
  iterations: number;
  confidence_level: number;
  include_correlation: boolean;
  time_horizon: number; // years
}

const QuantitativeRiskAssessment: React.FC<QuantitativeRiskAssessmentProps> = ({
  project,
  risks,
  onBack
}) => {
  const [scenarios, setScenarios] = useState<RiskScenario[]>([]);
  const [simulationResults, setSimulationResults] = useState<MonteCarloResults[]>([]);
  const [portfolioResults, setPortfolioResults] = useState<RiskPortfolioResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [config, setConfig] = useState<SimulationConfig>({
    iterations: 100000,
    confidence_level: 95,
    include_correlation: true,
    time_horizon: 1
  });
  const [activeTab, setActiveTab] = useState<'scenarios' | 'individual' | 'portfolio' | 'reports'>('scenarios');

  const riskService = QuantitativeRiskService.getInstance();

  // Initialize scenarios from existing risks and industry templates
  useEffect(() => {
    const orgIndustry = 'technology'; // In real implementation, get from project.organization
    const orgSize = 'medium'; // In real implementation, get from project.organization

    // Generate industry-specific scenarios
    const industryScenarios = riskService.generateIndustryScenarios(orgIndustry, orgSize);

    // Convert existing qualitative risks to quantitative scenarios
    const qualitativeScenarios: RiskScenario[] = risks.map(risk => ({
      id: risk.id,
      name: risk.title,
      description: risk.description,
      threat_source: 'Multiple',
      vulnerability: 'Various control gaps',
      impact_categories: [{
        category: 'financial',
        min_impact: risk.inherent_impact * 50000,
        max_impact: risk.inherent_impact * 500000,
        most_likely_impact: risk.inherent_impact * 200000,
        currency: 'USD',
        time_horizon: 'immediate'
      }],
      frequency_data: {
        historical_incidents: 0,
        observation_period: 1,
        expert_judgment: {
          min_frequency: risk.inherent_likelihood * 0.1,
          max_frequency: risk.inherent_likelihood * 0.5,
          most_likely_frequency: risk.inherent_likelihood * 0.25
        }
      },
      confidence_level: 70
    }));

    setScenarios([...industryScenarios, ...qualitativeScenarios]);
  }, [risks, riskService]);

  const runSimulation = async () => {
    setLoading(true);
    try {

      // Run individual scenario simulations
      const individualResults: MonteCarloResults[] = [];
      for (const scenario of scenarios) {
        const result = await riskService.simulateRiskScenario(scenario, config.iterations);
        individualResults.push(result);
      }
      setSimulationResults(individualResults);

      // Run portfolio analysis if correlation is enabled
      if (config.include_correlation && scenarios.length > 1) {
        const portfolioResult = await riskService.analyzeRiskPortfolio(scenarios, undefined, config.iterations);
        setPortfolioResults(portfolioResult);
      }

    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Please check the configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Prepare chart data
  const aleChartData = useMemo(() => {
    return simulationResults.map(result => {
      const scenario = scenarios.find(s => s.id === result.scenario_id);
      return {
        name: scenario?.name.substring(0, 20) + '...' || result.scenario_id,
        ale_mean: result.annual_loss_expectancy.mean,
        ale_95th: result.annual_loss_expectancy.percentile_95,
        var_99: result.value_at_risk.var_99
      };
    }).sort((a, b) => b.ale_mean - a.ale_mean);
  }, [simulationResults, scenarios]);

  const riskDistributionData = useMemo(() => {
    if (!portfolioResults) return [];

    return portfolioResults.top_risk_contributors.map(contributor => ({
      name: scenarios.find(s => s.id === contributor.scenario_id)?.name || contributor.scenario_id,
      value: contributor.contribution_percentage,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [portfolioResults, scenarios]);

  const selectedScenarioData = useMemo(() => {
    if (!selectedScenario) return null;
    return simulationResults.find(r => r.scenario_id === selectedScenario);
  }, [selectedScenario, simulationResults]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <CalculatorIcon className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Quantitative Risk Assessment</h1>
              <p className="text-slate-400">{project.name} - Monte Carlo Risk Analysis</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={runSimulation}
            disabled={loading || scenarios.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <CalculatorIcon className="w-5 h-5" />
            <span>{loading ? 'Running Simulation...' : 'Run Monte Carlo'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Simulation Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Iterations</label>
            <select
              value={config.iterations}
              onChange={(e) => setConfig(prev => ({ ...prev, iterations: Number(e.target.value) }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10000}>10,000 (Fast)</option>
              <option value={50000}>50,000 (Balanced)</option>
              <option value={100000}>100,000 (Accurate)</option>
              <option value={500000}>500,000 (High Precision)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confidence Level</label>
            <select
              value={config.confidence_level}
              onChange={(e) => setConfig(prev => ({ ...prev, confidence_level: Number(e.target.value) }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time Horizon</label>
            <select
              value={config.time_horizon}
              onChange={(e) => setConfig(prev => ({ ...prev, time_horizon: Number(e.target.value) }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Year</option>
              <option value={3}>3 Years</option>
              <option value={5}>5 Years</option>
              <option value={10}>10 Years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Include Correlation</label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={config.include_correlation}
                onChange={(e) => setConfig(prev => ({ ...prev, include_correlation: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Model risk correlations</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-slate-700">
          <nav className="flex space-x-8 px-6 pt-4">
            {[
              { id: 'scenarios', label: 'Risk Scenarios', count: scenarios.length },
              { id: 'individual', label: 'Individual Results', count: simulationResults.length },
              { id: 'portfolio', label: 'Portfolio Analysis', count: portfolioResults ? 1 : 0 },
              { id: 'reports', label: 'Executive Reports', count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Risk Scenarios ({scenarios.length})</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                  Add Custom Scenario
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    className="border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{scenario.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{scenario.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Confidence: {scenario.confidence_level}%</span>
                          <span className="text-xs text-blue-400">{scenario.impact_categories.length} impacts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Results Tab */}
          {activeTab === 'individual' && (
            <div className="space-y-6">
              {simulationResults.length === 0 ? (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white">No Simulation Results</h3>
                  <p className="text-slate-400">Run a Monte Carlo simulation to see individual risk analysis results.</p>
                </div>
              ) : (
                <>
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(simulationResults.reduce((sum, r) => sum + r.annual_loss_expectancy.mean, 0))}
                      </div>
                      <div className="text-sm text-slate-400">Total Expected Loss</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {formatCurrency(Math.max(...simulationResults.map(r => r.value_at_risk.var_99)))}
                      </div>
                      <div className="text-sm text-slate-400">Worst Case (99% VaR)</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {simulationResults.filter(r => r.convergence_test.converged).length}
                      </div>
                      <div className="text-sm text-slate-400">Converged Simulations</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round(simulationResults.reduce((sum, r) => sum + r.confidence_interval, 0) / simulationResults.length)}%
                      </div>
                      <div className="text-sm text-slate-400">Avg Confidence</div>
                    </div>
                  </div>

                  {/* Annual Loss Expectancy Chart */}
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Annual Loss Expectancy by Risk</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aleChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) => formatCurrency(value).replace('$', '$').replace('.00', '')}
                          />
                          <Tooltip
                            formatter={(value, name) => [formatCurrency(value as number), name]}
                            labelStyle={{ color: '#fff' }}
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          />
                          <Bar dataKey="ale_mean" fill="#3B82F6" name="Expected Loss" />
                          <Bar dataKey="ale_95th" fill="#EF4444" name="95th Percentile" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detailed Results Table */}
                  <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Scenario</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Expected Loss</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">95% VaR</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">99% VaR</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Convergence</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simulationResults.map(result => {
                            const scenario = scenarios.find(s => s.id === result.scenario_id);
                            return (
                              <tr key={result.scenario_id} className="border-b border-slate-600 hover:bg-slate-700/50">
                                <td className="p-4">
                                  <div className="font-medium text-white text-sm">
                                    {scenario?.name || result.scenario_id}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {result.simulation_runs.toLocaleString()} iterations
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-white">
                                    {formatCurrency(result.annual_loss_expectancy.mean)}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    ±{formatCurrency(result.annual_loss_expectancy.standard_deviation)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-yellow-400">
                                    {formatCurrency(result.value_at_risk.var_95)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-red-400">
                                    {formatCurrency(result.value_at_risk.var_99)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    result.convergence_test.converged
                                      ? 'bg-green-900/30 text-green-300'
                                      : 'bg-yellow-900/30 text-yellow-300'
                                  }`}>
                                    {result.convergence_test.converged ? 'Converged' : 'Pending'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => setSelectedScenario(result.scenario_id)}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Portfolio Analysis Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {!portfolioResults ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white">No Portfolio Analysis</h3>
                  <p className="text-slate-400">Enable correlation modeling and run simulation to see portfolio risk analysis.</p>
                </div>
              ) : (
                <>
                  {/* Portfolio Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(portfolioResults.total_ale.mean)}
                      </div>
                      <div className="text-sm text-slate-400">Portfolio Expected Loss</div>
                      <div className="text-xs text-green-400 mt-1">
                        {(portfolioResults.diversification_benefit * 100).toFixed(1)}% diversification benefit
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {formatCurrency(portfolioResults.portfolio_var.var_99)}
                      </div>
                      <div className="text-sm text-slate-400">Portfolio 99% VaR</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {portfolioResults.top_risk_contributors.length}
                      </div>
                      <div className="text-sm text-slate-400">Risk Contributors</div>
                    </div>
                  </div>

                  {/* Risk Contribution Chart */}
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Risk Contribution to Portfolio</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {riskDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Contribution']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Contributors Table */}
                  <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <h4 className="text-lg font-semibold text-white">Top Risk Contributors</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Risk Scenario</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Contribution %</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Marginal VaR</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolioResults.top_risk_contributors.map((contributor, index) => {
                            const scenario = scenarios.find(s => s.id === contributor.scenario_id);
                            return (
                              <tr key={contributor.scenario_id} className="border-b border-slate-600">
                                <td className="p-4">
                                  <div className="font-medium text-white text-sm">
                                    {scenario?.name || contributor.scenario_id}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-white">
                                    {contributor.contribution_percentage.toFixed(1)}%
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-yellow-400">
                                    {formatCurrency(contributor.marginal_var)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                                    #{index + 1}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Executive Reports Tab */}
          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <ChartBarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">Executive Risk Reports</h3>
              <p className="text-slate-400 mb-6">Generate executive-level risk analysis reports for leadership review.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                Generate Executive Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Details Modal */}
      {selectedScenarioData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {scenarios.find(s => s.id === selectedScenarioData.scenario_id)?.name}
                </h3>
                <p className="text-slate-400 mt-1">Detailed Monte Carlo Analysis Results</p>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Loss Distribution Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mean ALE:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(selectedScenarioData.annual_loss_expectancy.mean)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Median:</span>
                      <span className="text-white">
                        {formatCurrency(selectedScenarioData.annual_loss_expectancy.median)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Standard Deviation:</span>
                      <span className="text-white">
                        {formatCurrency(selectedScenarioData.annual_loss_expectancy.standard_deviation)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">95th Percentile:</span>
                      <span className="text-yellow-400 font-semibold">
                        {formatCurrency(selectedScenarioData.annual_loss_expectancy.percentile_95)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">99th Percentile:</span>
                      <span className="text-red-400 font-semibold">
                        {formatCurrency(selectedScenarioData.annual_loss_expectancy.percentile_99)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Value at Risk (VaR)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">95% VaR:</span>
                      <span className="text-yellow-400 font-semibold">
                        {formatCurrency(selectedScenarioData.value_at_risk.var_95)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">99% VaR:</span>
                      <span className="text-red-400 font-semibold">
                        {formatCurrency(selectedScenarioData.value_at_risk.var_99)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">95% CVaR:</span>
                      <span className="text-yellow-400">
                        {formatCurrency(selectedScenarioData.value_at_risk.cvar_95)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">99% CVaR:</span>
                      <span className="text-red-400">
                        {formatCurrency(selectedScenarioData.value_at_risk.cvar_99)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-white mb-3">Simulation Quality</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      selectedScenarioData.convergence_test.converged ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {selectedScenarioData.convergence_test.converged ? 'Converged' : 'In Progress'}
                    </div>
                    <div className="text-slate-400">Convergence Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {selectedScenarioData.convergence_test.stable_at_iteration.toLocaleString()}
                    </div>
                    <div className="text-slate-400">Stable at Iteration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {selectedScenarioData.simulation_runs.toLocaleString()}
                    </div>
                    <div className="text-slate-400">Total Iterations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantitativeRiskAssessment;