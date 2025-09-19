import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, Organization, Risk, AssessmentItem } from '../../types';
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { RiskLevel } from '../../types';
import {
  PlusCircleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

interface ClientMetrics {
  project: Project;
  client: Organization;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  complianceScore: number;
  assessmentProgress: number;
  totalAssessments: number;
  completedAssessments: number;
  daysUntilDeadline: number;
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
  nextDeliverable: string;
  contactPerson: string;
  frameworks: string[];
  recentActivity: string;
}

interface DashboardSummary {
  totalClients: number;
  totalCriticalRisks: number;
  totalHighRisks: number;
  averageHealthScore: number;
  urgentDeadlines: number;
  completedAssessmentsThisWeek: number;
}

const TrendIndicator: React.FC<{ trend?: 'up' | 'down' | 'stable'; size?: 'sm' | 'md' }> = ({ trend, size = 'md' }) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  if (trend === 'up') {
    return (
      <div className="flex items-center space-x-1 text-red-400">
        <ArrowUpRightIcon className={iconSize} />
        <span className="text-xs">Rising</span>
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center space-x-1 text-green-400">
        <ArrowDownRightIcon className={iconSize} />
        <span className="text-xs">Improving</span>
      </div>
    );
  }
  return <div className="text-slate-400 text-xs">Stable</div>;
};

const PriorityBadge: React.FC<{ priority: 'high' | 'medium' | 'low' }> = ({ priority }) => {
  const colors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-300 border-green-500/30'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
}> = ({ title, value, subtitle, icon: IconComponent, color }) => {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${color} mr-4`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm text-slate-400">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const ClientCard: React.FC<{
  metrics: ClientMetrics;
  setView: (view: View) => void;
}> = ({ metrics, setView }) => {
  const { project, client } = metrics;

  const priorityColors = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    low: 'border-l-green-500 bg-green-500/5'
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`glass-card p-6 rounded-xl cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all duration-200 border-l-4 ${priorityColors[metrics.priority]} mb-6`}
      onClick={() => setView({ type: 'project', projectId: project.id, tab: 'dashboard' })}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <PriorityBadge priority={metrics.priority} />
          </div>
          <p className="text-sm text-slate-300 mb-1">{client.name}</p>
          <p className="text-xs text-slate-500">Contact: {metrics.contactPerson}</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
            {metrics.healthScore}
          </div>
          <div className="text-xs text-slate-400">Health Score</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{metrics.criticalRisks}</div>
          <div className="text-xs text-slate-400">Critical Risks</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">
            {metrics.completedAssessments}/{metrics.totalAssessments}
          </div>
          <div className="text-xs text-slate-400">Assessments</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${
            metrics.daysUntilDeadline <= 7 ? 'text-red-400' :
            metrics.daysUntilDeadline <= 30 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {metrics.daysUntilDeadline}d
          </div>
          <div className="text-xs text-slate-400">Until Deadline</div>
        </div>
      </div>

      {/* Frameworks */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {metrics.frameworks.map((framework, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded border border-slate-600/50"
            >
              {framework}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-700/50 pt-3 mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setView({ type: 'project', projectId: project.id, tab: 'reports' });
            }}
            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
          >
            📊 Reports
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setView({ type: 'project', projectId: project.id, tab: 'assessments' });
            }}
            className="px-3 py-1 text-xs bg-emerald-600/20 text-emerald-300 rounded border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
          >
            🔍 Controls
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setView({ type: 'project', projectId: project.id, tab: 'risks' });
            }}
            className="px-3 py-1 text-xs bg-red-600/20 text-red-300 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors"
          >
            ⚠️ Risks
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <CalendarIcon className="h-3 w-3" />
            <span>Next: {metrics.nextDeliverable}</span>
          </div>
          <TrendIndicator trend={metrics.trend} size="sm" />
        </div>
        <p className="text-xs text-slate-500 mt-1">{metrics.recentActivity}</p>
      </div>
    </div>
  );
};

const CleanConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const linkedClientIds = consultantClientLinks[user.organizationId] || [];
    const allOrgs = mockOrganizations;
    const linkedClients = allOrgs.filter(org => linkedClientIds.includes(org.id));
    setClients(linkedClients);

    const consultantProjects = await mockApi.getProjectsForConsultant(linkedClientIds);
    setProjects(consultantProjects);

    const projectIds = consultantProjects.map(p => p.id);
    const [risks, assessments] = await Promise.all([
      mockApi.getAllRisksForProjects(projectIds),
      Promise.all(projectIds.map(id => mockApi.getAssessmentItems(id))).then(results => results.flat())
    ]);

    setAllRisks(risks);
    setAllAssessments(assessments);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const { clientMetrics, dashboardSummary } = useMemo(() => {
    const metrics: ClientMetrics[] = projects.map(project => {
      const client = clients.find(c => c.id === project.organizationId);
      if (!client) return null;

      const projectRisks = allRisks.filter(r => r.projectId === project.id && r.status === 'Open');
      const projectAssessments = allAssessments.filter(a => a.projectId === project.id);

      const criticalRisks = projectRisks.filter(r => r.level === RiskLevel.CRITICAL).length;
      const highRisks = projectRisks.filter(r => r.level === RiskLevel.HIGH).length;
      const mediumRisks = projectRisks.filter(r => r.level === RiskLevel.MEDIUM).length;

      const completedAssessments = projectAssessments.filter(a => a.status === 'Compliant').length;
      const totalAssessments = projectAssessments.length;
      const assessmentProgress = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

      // Calculate compliance score based on assessment status
      const complianceScore = Math.max(0, 100 - (criticalRisks * 25 + highRisks * 15 + mediumRisks * 5));

      // Calculate health score with explanation
      const riskPenalty = criticalRisks * 30 + highRisks * 15 + mediumRisks * 5;
      const healthScore = Math.max(0, Math.min(100, 100 - riskPenalty));

      // Mock realistic business data
      const daysUntilDeadline = Math.floor(Math.random() * 90) + 1;

      // Determine priority based on risk and deadlines
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (criticalRisks > 0 || daysUntilDeadline <= 7) priority = 'high';
      else if (highRisks > 2 || daysUntilDeadline <= 30) priority = 'medium';

      // Calculate trend based on recent risk creation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRisks = projectRisks.filter(
        r => r.creationDate && new Date(r.creationDate) > thirtyDaysAgo
      ).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentRisks >= 2) trend = 'up';
      else if (projectRisks.length === 0) trend = 'down';

      // Mock deliverables and contacts
      const deliverables = ['Risk Assessment Report', 'Compliance Audit', 'Security Review', 'Policy Update', 'Vendor Assessment'];
      const nextDeliverable = deliverables[Math.floor(Math.random() * deliverables.length)];

      const contacts = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Anderson', 'David Wilson'];
      const contactPerson = contacts[Math.floor(Math.random() * contacts.length)];

      // Recent activity based on actual assessment data
      const recentActivity = projectAssessments.length > 0 ?
        `${projectAssessments.filter(a => a.status === 'In Progress').length} assessments in progress` :
        'Awaiting assessment start';

      return {
        project,
        client,
        criticalRisks,
        highRisks,
        mediumRisks,
        complianceScore,
        assessmentProgress,
        totalAssessments,
        completedAssessments,
        daysUntilDeadline,
        healthScore,
        trend,
        priority,
        nextDeliverable,
        contactPerson,
        frameworks: project.frameworks,
        recentActivity
      };
    }).filter(Boolean) as ClientMetrics[];

    const summary: DashboardSummary = {
      totalClients: metrics.length,
      totalCriticalRisks: metrics.reduce((sum, m) => sum + m.criticalRisks, 0),
      totalHighRisks: metrics.reduce((sum, m) => sum + m.highRisks, 0),
      averageHealthScore: metrics.length > 0 ?
        Math.round(metrics.reduce((sum, m) => sum + m.healthScore, 0) / metrics.length) : 0,
      urgentDeadlines: metrics.filter(m => m.daysUntilDeadline <= 7).length,
      completedAssessmentsThisWeek: metrics.reduce((sum, m) => sum + m.completedAssessments, 0)
    };

    return { clientMetrics: metrics, dashboardSummary: summary };
  }, [projects, clients, allRisks, allAssessments]);

  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
    await mockApi.createProject(name, organizationId, frameworks);
    fetchData();
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your engagements...</p>
        </div>
      </div>
    );
  }

  // Sort clients by priority and health score
  const sortedMetrics = [...clientMetrics].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.healthScore - b.healthScore; // Lower health scores first
  });

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Consultant Dashboard</h1>
              <p className="text-slate-400">
                {dashboardSummary.totalClients} active engagements •
                {dashboardSummary.totalCriticalRisks} critical risks need attention
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>New Engagement</span>
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Active Clients"
            value={dashboardSummary.totalClients}
            icon={UsersIcon}
            color="bg-blue-600"
          />
          <SummaryCard
            title="Critical Risks"
            value={dashboardSummary.totalCriticalRisks}
            subtitle="Need immediate attention"
            icon={ExclamationTriangleIcon}
            color={dashboardSummary.totalCriticalRisks > 0 ? 'bg-red-600' : 'bg-green-600'}
          />
          <SummaryCard
            title="Average Health"
            value={`${dashboardSummary.averageHealthScore}/100`}
            subtitle="Portfolio health score"
            icon={ShieldCheckIcon}
            color={dashboardSummary.averageHealthScore >= 75 ? 'bg-green-600' :
                   dashboardSummary.averageHealthScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'}
          />
          <SummaryCard
            title="Urgent Deadlines"
            value={dashboardSummary.urgentDeadlines}
            subtitle="Next 7 days"
            icon={ClockIcon}
            color={dashboardSummary.urgentDeadlines > 0 ? 'bg-orange-600' : 'bg-slate-600'}
          />
        </div>

        {/* Client Engagements */}
        <main>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Client Engagements</h2>
            <div className="text-sm text-slate-400">
              Sorted by priority and health score
            </div>
          </div>

          {sortedMetrics.length > 0 ? (
            <div className="space-y-4">
              {sortedMetrics.map(metrics => (
                <ClientCard
                  key={metrics.project.id}
                  metrics={metrics}
                  setView={setView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-xl">
              <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No active engagements</h3>
              <p className="text-slate-400 mb-6">Start by creating your first client engagement.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Create Your First Engagement</span>
              </button>
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

export default CleanConsultantDashboard;