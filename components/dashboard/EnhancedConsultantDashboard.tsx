import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, Organization, Risk, Vendor } from '../../types';
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { RiskLevel, VendorCriticality } from '../../types';
import { PlusCircleIcon, ArrowUpRightIcon, ArrowDownRightIcon, ChartBarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';
import InteractiveDashboard from './InteractiveDashboard';
import { useNotifications } from '../context/NotificationContext';

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

interface ProjectMetrics {
  project: Project;
  client: Organization;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    trend: 'up' | 'down' | 'stable';
  };
  complianceScore: number;
  vendorCount: number;
  daysUntilDeadline?: number;
  lastActivity: string;
  healthScore: number; // 0-100
}

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getHealthBg = (score: number) => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-600';
  if (score >= 40) return 'bg-orange-600';
  return 'bg-red-600';
};

const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center space-x-1 text-red-400">
        <ArrowUpRightIcon className="h-4 w-4" />
        <span>Rising</span>
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center space-x-1 text-green-400">
        <ArrowDownRightIcon className="h-4 w-4" />
        <span>Improving</span>
      </div>
    );
  }
  return <div className="text-slate-400">Stable</div>;
};

const ProjectCard: React.FC<{
  metrics: ProjectMetrics;
  setView: (view: View) => void;
}> = ({ metrics, setView }) => {
  const { project, client, riskSummary, complianceScore, vendorCount, daysUntilDeadline, lastActivity, healthScore } = metrics;

  return (
    <div className="glass-card p-6 rounded-lg hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              {project.name}
            </h3>
            <div className={`w-2 h-2 rounded-full ${getHealthBg(healthScore)}`}></div>
          </div>
          <p className="text-sm text-slate-400">{client.name}</p>
          <p className="text-xs text-slate-500 mt-1">Frameworks: {project.frameworks.join(', ')}</p>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>{healthScore}</div>
          <div className="text-xs text-slate-400">Health Score</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{complianceScore}%</div>
          <div className="text-xs text-slate-400">Compliant</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{vendorCount}</div>
          <div className="text-xs text-slate-400">Vendors</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{riskSummary.critical + riskSummary.high}</div>
          <div className="text-xs text-slate-400">High+ Risks</div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Open Risks</span>
          <TrendIndicator trend={riskSummary.trend} />
        </div>
        <div className="flex space-x-2">
          {riskSummary.critical > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-red-400">{riskSummary.critical}</span>
            </div>
          )}
          {riskSummary.high > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-sm text-orange-400">{riskSummary.high}</span>
            </div>
          )}
          {riskSummary.medium > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-yellow-400">{riskSummary.medium}</span>
            </div>
          )}
          {(riskSummary.critical + riskSummary.high + riskSummary.medium) === 0 && (
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">All risks resolved</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <ClockIcon className="w-3 h-3" />
          <span>{lastActivity}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setView({ type: 'tprmDashboard', projectId: project.id });
            }}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            TPRM
          </button>
          <button
            onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            View Project
          </button>
        </div>
      </div>

      {/* Urgent Alerts */}
      {daysUntilDeadline && daysUntilDeadline <= 7 && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-600/40 rounded text-red-200 text-xs">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Deadline in {daysUntilDeadline} days
        </div>
      )}
    </div>
  );
};

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'health' | 'risk' | 'compliance' | 'activity'>('health');
  const [filterBy, setFilterBy] = useState<'all' | 'urgent' | 'healthy' | 'at-risk'>('all');
  const { addNotification } = useNotifications();

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

      // Fetch all vendors for all projects
      const allProjectVendors: Vendor[] = [];
      for (const project of consultantProjects) {
        const vendors = await mockApi.getVendors(project.id);
        allProjectVendors.push(...vendors);
      }
      setAllVendors(allProjectVendors);

    } catch (error) {
      addNotification('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const projectMetrics = useMemo((): ProjectMetrics[] => {
    return projects.map(project => {
      const client = clients.find(c => c.id === project.organizationId)!;
      const projectRisks = allRisks.filter(r => r.projectId === project.id && r.status === 'Open');
      const projectVendors = allVendors.filter(v => v.projectId === project.id);

      // Calculate risk summary
      const riskSummary = {
        critical: projectRisks.filter(r => r.level === RiskLevel.CRITICAL).length,
        high: projectRisks.filter(r => r.level === RiskLevel.HIGH).length,
        medium: projectRisks.filter(r => r.level === RiskLevel.MEDIUM).length,
        low: projectRisks.filter(r => r.level === RiskLevel.LOW).length,
        trend: project.trend || 'stable' as 'up' | 'down' | 'stable'
      };

      // Calculate compliance score (mock)
      const complianceScore = Math.max(0, 100 - (riskSummary.critical * 20 + riskSummary.high * 10 + riskSummary.medium * 5));

      // Calculate health score
      const riskPenalty = riskSummary.critical * 30 + riskSummary.high * 15 + riskSummary.medium * 5;
      const vendorRiskPenalty = projectVendors.filter(v => v.riskLevel === VendorCriticality.CRITICAL).length * 10;
      const healthScore = Math.max(0, Math.min(100, 100 - riskPenalty - vendorRiskPenalty));

      // Mock last activity
      const lastActivity = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

      return {
        project,
        client,
        riskSummary,
        complianceScore,
        vendorCount: projectVendors.length,
        lastActivity: `Updated ${lastActivity}`,
        healthScore,
        daysUntilDeadline: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 1 : undefined
      };
    });
  }, [projects, clients, allRisks, allVendors]);

  const filteredAndSortedMetrics = useMemo(() => {
    let filtered = projectMetrics;

    // Apply filters
    switch (filterBy) {
      case 'urgent':
        filtered = filtered.filter(m => m.healthScore < 60 || (m.daysUntilDeadline && m.daysUntilDeadline <= 7));
        break;
      case 'healthy':
        filtered = filtered.filter(m => m.healthScore >= 80);
        break;
      case 'at-risk':
        filtered = filtered.filter(m => m.healthScore < 60);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'health':
        filtered.sort((a, b) => a.healthScore - b.healthScore);
        break;
      case 'risk':
        filtered.sort((a, b) => (b.riskSummary.critical + b.riskSummary.high) - (a.riskSummary.critical + a.riskSummary.high));
        break;
      case 'compliance':
        filtered.sort((a, b) => a.complianceScore - b.complianceScore);
        break;
      case 'activity':
        filtered.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
    }

    return filtered;
  }, [projectMetrics, sortBy, filterBy]);

  // Portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalProjects = projectMetrics.length;
    const avgHealthScore = Math.round(projectMetrics.reduce((sum, m) => sum + m.healthScore, 0) / totalProjects);
    const totalRisks = allRisks.filter(r => r.status === 'Open').length;
    const criticalRisks = allRisks.filter(r => r.status === 'Open' && r.level === RiskLevel.CRITICAL).length;
    const urgentProjects = projectMetrics.filter(m => m.healthScore < 60 || (m.daysUntilDeadline && m.daysUntilDeadline <= 7)).length;
    const avgCompliance = Math.round(projectMetrics.reduce((sum, m) => sum + m.complianceScore, 0) / totalProjects);

    return {
      totalProjects,
      avgHealthScore,
      totalRisks,
      criticalRisks,
      urgentProjects,
      avgCompliance,
      totalVendors: allVendors.length,
      highRiskVendors: allVendors.filter(v => v.riskLevel === VendorCriticality.HIGH || v.riskLevel === VendorCriticality.CRITICAL).length
    };
  }, [projectMetrics, allRisks, allVendors]);

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
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Consultant Portal</h1>
              <p className="text-slate-400 mt-1">Welcome back, {user.name}. Here's your client portfolio overview.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>New Engagement</span>
            </button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{portfolioSummary.totalProjects}</div>
                  <div className="text-sm text-slate-400">Active Projects</div>
                </div>
                <ChartBarIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getHealthColor(portfolioSummary.avgHealthScore)}`}>
                    {portfolioSummary.avgHealthScore}
                  </div>
                  <div className="text-sm text-slate-400">Avg Health Score</div>
                </div>
                <div className={`w-8 h-8 rounded-full ${getHealthBg(portfolioSummary.avgHealthScore)}`}></div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-400">{portfolioSummary.criticalRisks}</div>
                  <div className="text-sm text-slate-400">Critical Risks</div>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-400">{portfolioSummary.urgentProjects}</div>
                  <div className="text-sm text-slate-400">Needs Attention</div>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm text-slate-400 mr-2">Filter:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
              >
                <option value="all">All Projects</option>
                <option value="urgent">Needs Attention</option>
                <option value="healthy">Healthy</option>
                <option value="at-risk">At Risk</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
              >
                <option value="health">Health Score</option>
                <option value="risk">Risk Level</option>
                <option value="compliance">Compliance</option>
                <option value="activity">Recent Activity</option>
              </select>
            </div>

            <div className="text-sm text-slate-400">
              Showing {filteredAndSortedMetrics.length} of {projectMetrics.length} projects
            </div>
          </div>
        </header>

        {/* Projects Grid */}
        <main>
          {filteredAndSortedMetrics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedMetrics.map(metrics => (
                <ProjectCard
                  key={metrics.project.id}
                  metrics={metrics}
                  setView={setView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-lg">
              <h3 className="text-xl font-semibold text-white">
                {filterBy === 'all' ? 'No active engagements' : 'No projects match your filter'}
              </h3>
              <p className="text-slate-400 mt-2">
                {filterBy === 'all'
                  ? 'Click "New Engagement" to get started with your first client project.'
                  : 'Try adjusting your filter to see more projects.'}
              </p>
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

export default ConsultantDashboard;