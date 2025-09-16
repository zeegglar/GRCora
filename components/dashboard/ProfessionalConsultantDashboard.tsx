import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, Organization, Risk, Vendor } from '../../types';
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { RiskLevel, VendorCriticality } from '../../types';
import {
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircleIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  BrainIcon,
  TrendingIcon
} from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';
import { useNotifications } from '../context/NotificationContext';

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

interface BusinessMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  avgProjectValue: number;
  profitMargin: number;
  revenueGrowth: number;
  billableHours: number;
  utilizationRate: number;
  clientRetention: number;
}

interface ClientHealthMetrics {
  project: Project;
  client: Organization;
  healthScore: number;
  riskScore: number;
  complianceVelocity: number;
  lastEngagement: string;
  nextDeadline?: Date;
  revenue: number;
  profitability: number;
  satisfactionScore: number;
  churnRisk: 'low' | 'medium' | 'high';
  trendDirection: 'up' | 'down' | 'stable';
}

interface MarketIntelligence {
  industryBenchmarks: {
    avgComplianceTime: number;
    avgCostPerFramework: number;
    industryRiskTrend: 'increasing' | 'decreasing' | 'stable';
  };
  regulatoryAlerts: number;
  competitorActivity: string[];
  emergingThreats: string[];
}

const getHealthColor = (score: number) => {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-green-400';
  if (score >= 55) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getChurnRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'text-green-400 bg-green-900/30 border-green-600/40';
    case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600/40';
    case 'high': return 'text-red-400 bg-red-900/30 border-red-600/40';
    default: return 'text-slate-400';
  }
};

const BusinessIntelligenceCard: React.FC<{ metrics: BusinessMetrics }> = ({ metrics }) => (
  <div className="glass-card p-6 rounded-xl">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white">Business Intelligence</h2>
      <DollarSignIcon className="w-8 h-8 text-emerald-400" />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <div className="text-2xl font-bold text-emerald-400">${(metrics.totalRevenue / 1000).toFixed(0)}K</div>
        <div className="text-sm text-slate-400">Total Revenue</div>
        <div className="flex items-center text-xs">
          {metrics.revenueGrowth > 0 ? (
            <ArrowUpIcon className="w-3 h-3 text-green-400 mr-1" />
          ) : (
            <ArrowDownIcon className="w-3 h-3 text-red-400 mr-1" />
          )}
          <span className={metrics.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'}>
            {Math.abs(metrics.revenueGrowth)}% MoM
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-blue-400">${(metrics.monthlyRecurring / 1000).toFixed(0)}K</div>
        <div className="text-sm text-slate-400">Monthly Recurring</div>
        <div className="text-xs text-slate-500">ARR: ${(metrics.monthlyRecurring * 12 / 1000).toFixed(0)}K</div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-purple-400">{metrics.utilizationRate}%</div>
        <div className="text-sm text-slate-400">Utilization Rate</div>
        <div className="text-xs text-slate-500">{metrics.billableHours}h billable</div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-orange-400">{metrics.clientRetention}%</div>
        <div className="text-sm text-slate-400">Client Retention</div>
        <div className="text-xs text-slate-500">{metrics.profitMargin}% profit margin</div>
      </div>
    </div>
  </div>
);

const ClientHealthCard: React.FC<{
  metrics: ClientHealthMetrics;
  setView: (view: View) => void;
}> = ({ metrics, setView }) => {
  const { project, client, healthScore, churnRisk, trendDirection, revenue, satisfactionScore } = metrics;

  return (
    <div
      className="glass-card p-5 rounded-xl hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer group"
      onClick={() => setView({ type: 'project', projectId: project.id, tab: 'dashboard' })}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors truncate">
              {client.name}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs border ${getChurnRiskColor(churnRisk)}`}>
              {churnRisk} risk
            </div>
          </div>
          <p className="text-sm text-slate-400 truncate">{project.name}</p>
          <p className="text-xs text-slate-500">{project.frameworks.join(', ')}</p>
        </div>

        <div className="text-right ml-4">
          <div className={`text-xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}
          </div>
          <div className="text-xs text-slate-400">Health</div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-center">
        <div>
          <div className="text-sm font-bold text-emerald-400">${(revenue / 1000).toFixed(0)}K</div>
          <div className="text-xs text-slate-500">Revenue</div>
        </div>
        <div>
          <div className="text-sm font-bold text-blue-400">{satisfactionScore}/10</div>
          <div className="text-xs text-slate-500">CSAT</div>
        </div>
        <div>
          <div className="text-sm font-bold text-purple-400">{metrics.complianceVelocity}%</div>
          <div className="text-xs text-slate-500">Velocity</div>
        </div>
        <div>
          <div className="text-sm font-bold text-orange-400">{metrics.riskScore}</div>
          <div className="text-xs text-slate-500">Risk Score</div>
        </div>
      </div>

      {/* Trend & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center text-xs text-slate-500">
          {trendDirection === 'up' ? (
            <TrendingUpIcon className="w-3 h-3 text-green-400 mr-1" />
          ) : trendDirection === 'down' ? (
            <TrendingDownIcon className="w-3 h-3 text-red-400 mr-1" />
          ) : (
            <div className="w-3 h-3 bg-slate-600 rounded-full mr-1"></div>
          )}
          {metrics.lastEngagement}
        </div>

        <div className="flex space-x-1">
          {metrics.nextDeadline && (
            <div className="px-2 py-1 text-xs bg-orange-600/20 text-orange-300 rounded border border-orange-600/40">
              {Math.ceil((metrics.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setView({ type: 'tprmDashboard', projectId: project.id });
            }}
            className="px-2 py-1 text-xs bg-purple-600/20 text-purple-300 rounded border border-purple-600/40 hover:bg-purple-600/30"
          >
            TPRM
          </button>
        </div>
      </div>
    </div>
  );
};

const MarketIntelligenceCard: React.FC<{ intelligence: MarketIntelligence }> = ({ intelligence }) => (
  <div className="glass-card p-6 rounded-xl">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white">Market Intelligence</h2>
      <BrainIcon className="w-8 h-8 text-cyan-400" />
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-white">{intelligence.industryBenchmarks.avgComplianceTime}d</div>
          <div className="text-xs text-slate-400">Avg Compliance Time</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">${intelligence.industryBenchmarks.avgCostPerFramework}K</div>
          <div className="text-xs text-slate-400">Cost per Framework</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-400">{intelligence.regulatoryAlerts}</div>
          <div className="text-xs text-slate-400">Regulatory Alerts</div>
        </div>
      </div>

      {intelligence.emergingThreats.length > 0 && (
        <div className="border-t border-slate-700/50 pt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Emerging Threats</h4>
          <div className="space-y-1">
            {intelligence.emergingThreats.slice(0, 2).map((threat, idx) => (
              <div key={idx} className="text-xs text-orange-300 flex items-center">
                <AlertTriangleIcon className="w-3 h-3 mr-1" />
                {threat}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const ProfessionalConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'portfolio' | 'analytics' | 'pipeline'>('portfolio');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const { addNotification } = useNotifications();

  const businessMetrics: BusinessMetrics = useMemo(() => ({
    totalRevenue: 850000,
    monthlyRecurring: 120000,
    avgProjectValue: 85000,
    profitMargin: 65,
    revenueGrowth: 12.5,
    billableHours: 1240,
    utilizationRate: 78,
    clientRetention: 92
  }), []);

  const marketIntelligence: MarketIntelligence = useMemo(() => ({
    industryBenchmarks: {
      avgComplianceTime: 180,
      avgCostPerFramework: 45,
      industryRiskTrend: 'increasing' as const
    },
    regulatoryAlerts: 3,
    competitorActivity: ['New NIST framework updates', 'ISO 27001:2025 draft released'],
    emergingThreats: ['Supply chain vulnerabilities in SaaS', 'AI governance requirements']
  }), []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const linkedClientIds = consultantClientLinks[user.organizationId] || [];
      const allOrgs = mockOrganizations;
      const linkedClients = allOrgs.filter(org => linkedClientIds.includes(org.id));
      setClients(linkedClients);

      const consultantProjects = await mockApi.getProjectsForConsultant(linkedClientIds);
      setProjects(consultantProjects);

      const projectIds = consultantProjects.map(p => p.id);
      const risks = await mockApi.getAllRisksForProjects(projectIds);
      setAllRisks(risks);

    } catch (error) {
      addNotification('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const clientHealthMetrics = useMemo((): ClientHealthMetrics[] => {
    return projects.map(project => {
      const client = clients.find(c => c.id === project.organizationId)!;
      const projectRisks = allRisks.filter(r => r.projectId === project.id && r.status === 'Open');

      // Advanced calculations for consultant metrics
      const baseHealth = Math.max(20, 100 - (projectRisks.length * 5));
      const riskPenalty = projectRisks.filter(r => r.level === RiskLevel.CRITICAL).length * 15;
      const healthScore = Math.max(0, Math.min(100, baseHealth - riskPenalty));

      const riskScore = projectRisks.filter(r =>
        r.level === RiskLevel.CRITICAL || r.level === RiskLevel.HIGH
      ).length;

      // Mock sophisticated metrics that consultants care about
      const revenue = Math.floor(Math.random() * 200000) + 50000;
      const complianceVelocity = Math.floor(Math.random() * 40) + 60;
      const satisfactionScore = Math.floor(Math.random() * 3) + 7; // 7-10 range
      const profitability = Math.floor(Math.random() * 30) + 40;

      let churnRisk: 'low' | 'medium' | 'high' = 'low';
      if (healthScore < 50 || satisfactionScore < 7) churnRisk = 'high';
      else if (healthScore < 70 || satisfactionScore < 8) churnRisk = 'medium';

      const trendDirection = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';

      return {
        project,
        client,
        healthScore,
        riskScore,
        complianceVelocity,
        lastEngagement: `${Math.floor(Math.random() * 7) + 1} days ago`,
        nextDeadline: Math.random() > 0.6 ? new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000) : undefined,
        revenue,
        profitability,
        satisfactionScore,
        churnRisk,
        trendDirection: trendDirection as 'up' | 'down' | 'stable'
      };
    });
  }, [projects, clients, allRisks]);

  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
    try {
      await mockApi.createProject(name, organizationId, frameworks);
      fetchData();
      setIsModalOpen(false);
      addNotification(`New engagement "${name}" created successfully`, 'success');
    } catch (error) {
      addNotification('Failed to create engagement', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Executive Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">GRC Practice Dashboard</h1>
              <p className="text-slate-400 mt-1">
                Professional consulting intelligence for {user.name} • {clientHealthMetrics.length} active engagements
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('portfolio')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'portfolio' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'pipeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pipeline
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors font-semibold text-white text-sm"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>New Engagement</span>
              </button>
            </div>
          </div>

          {/* Business Intelligence Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BusinessIntelligenceCard metrics={businessMetrics} />
            <MarketIntelligenceCard intelligence={marketIntelligence} />
          </div>
        </header>

        {/* Main Content */}
        <main>
          {viewMode === 'portfolio' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Client Portfolio</h2>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                    <FilterIcon className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {clientHealthMetrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {clientHealthMetrics
                    .sort((a, b) => {
                      // Prioritize by churn risk, then health score
                      const riskOrder = { high: 0, medium: 1, low: 2 };
                      if (a.churnRisk !== b.churnRisk) {
                        return riskOrder[a.churnRisk] - riskOrder[b.churnRisk];
                      }
                      return a.healthScore - b.healthScore;
                    })
                    .map(metrics => (
                      <ClientHealthCard
                        key={metrics.project.id}
                        metrics={metrics}
                        setView={setView}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-card rounded-xl">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Engagements</h3>
                  <p className="text-slate-400 mb-6">Start your first client engagement to begin tracking performance metrics.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Create New Engagement
                  </button>
                </div>
              )}
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Revenue Analytics</h3>
                <div className="space-y-4">
                  <div className="text-center p-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-2">${(businessMetrics.totalRevenue / 1000).toFixed(0)}K</div>
                    <div className="text-emerald-400">YTD Revenue</div>
                    <div className="text-sm text-slate-400 mt-2">+{businessMetrics.revenueGrowth}% vs last period</div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Risk Portfolio Analysis</h3>
                <div className="space-y-4">
                  <div className="text-center p-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-2">{allRisks.filter(r => r.status === 'Open').length}</div>
                    <div className="text-red-400">Total Open Risks</div>
                    <div className="text-sm text-slate-400 mt-2">Across all clients</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'pipeline' && (
            <div className="glass-card p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pipeline View Coming Soon</h3>
              <p className="text-slate-400">Track your sales pipeline and forecast future revenue.</p>
            </div>
          )}
        </main>
      </div>

      <NewEngagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        onCreate={handleCreateEngagement}
        onClientCreated={fetchData}
      />
    </>
  );
};

export default ProfessionalConsultantDashboard;