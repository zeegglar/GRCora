import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, Organization, Risk } from '../../types';
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { RiskLevel } from '../../types';
import {
  PlusCircleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon
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
  daysUntilDeadline: number;
  lastActivity: string;
  engagementValue: number;
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
  nextDeliverable: string;
  contactPerson: string;
}

interface KPIMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

const TrendIndicator: React.FC<{ trend?: 'up' | 'down' | 'stable'; size?: 'sm' | 'md' }> = ({ trend, size = 'md' }) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  if (trend === 'up') {
    return (
      <div className="flex items-center space-x-1 text-red-400">
        <ArrowUpRightIcon className={iconSize} />
        <span className="text-xs">Increasing</span>
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
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
};

const KPICard: React.FC<{ metric: KPIMetric }> = ({ metric }) => {
  const IconComponent = metric.icon;

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${metric.color}`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-400">{metric.title}</p>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${
            metric.trend === 'up' ? 'text-green-400' :
            metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {metric.change}
          </p>
          <TrendIndicator trend={metric.trend} size="sm" />
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

  const priorityColor = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500'
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`glass-card p-6 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all border-l-4 ${priorityColor[metrics.priority]}`}
      onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <PriorityBadge priority={metrics.priority} />
          </div>
          <p className="text-sm text-slate-400 mb-1">{client.name}</p>
          <p className="text-xs text-slate-500">Contact: {metrics.contactPerson}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Health Score</span>
            <span className={`text-sm font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
              {metrics.healthScore}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Compliance</span>
            <span className="text-sm font-medium text-blue-400">{metrics.complianceScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Value</span>
            <span className="text-sm font-medium text-emerald-400">
              ${metrics.engagementValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Critical Risks</span>
            <span className="text-sm font-bold text-red-400">{metrics.criticalRisks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">High Risks</span>
            <span className="text-sm font-bold text-orange-400">{metrics.highRisks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Days to Deadline</span>
            <span className={`text-sm font-medium ${
              metrics.daysUntilDeadline <= 7 ? 'text-red-400' :
              metrics.daysUntilDeadline <= 30 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {metrics.daysUntilDeadline}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/50 pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <CalendarIcon className="h-3 w-3" />
            <span>Next: {metrics.nextDeliverable}</span>
          </div>
          <TrendIndicator trend={metrics.trend} size="sm" />
        </div>
        <p className="text-xs text-slate-500 mt-1">{metrics.lastActivity}</p>
      </div>
    </div>
  );
};

const ImprovedConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
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
    const risks = await mockApi.getAllRisksForProjects(projectIds);
    setAllRisks(risks);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const clientMetrics: ClientMetrics[] = useMemo(() => {
    return projects.map(project => {
      const client = clients.find(c => c.id === project.organizationId);
      if (!client) return null;

      const projectRisks = allRisks.filter(r => r.projectId === project.id && r.status === 'Open');
      const criticalRisks = projectRisks.filter(r => r.level === RiskLevel.CRITICAL).length;
      const highRisks = projectRisks.filter(r => r.level === RiskLevel.HIGH).length;
      const mediumRisks = projectRisks.filter(r => r.level === RiskLevel.MEDIUM).length;

      // Calculate compliance score
      const complianceScore = Math.max(0, 100 - (criticalRisks * 20 + highRisks * 10 + mediumRisks * 5));

      // Calculate health score with business context
      const riskPenalty = criticalRisks * 30 + highRisks * 15 + mediumRisks * 5;
      const healthScore = Math.max(0, Math.min(100, 100 - riskPenalty));

      // Mock business metrics
      const daysUntilDeadline = Math.floor(Math.random() * 90) + 1;
      const engagementValue = Math.floor(Math.random() * 500000) + 50000;
      const lastActivity = `Updated ${Math.floor(Math.random() * 7) + 1} days ago`;

      // Determine priority based on multiple factors
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (criticalRisks > 0 || daysUntilDeadline <= 7) priority = 'high';
      else if (highRisks > 2 || daysUntilDeadline <= 30) priority = 'medium';

      // Calculate trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRisks = projectRisks.filter(
        r => r.creationDate && new Date(r.creationDate) > thirtyDaysAgo
      ).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentRisks >= 2) trend = 'up';
      else if (projectRisks.length === 0) trend = 'down';

      const deliverables = ['Risk Assessment Report', 'Compliance Audit', 'Security Review', 'Policy Update', 'Vendor Assessment'];
      const nextDeliverable = deliverables[Math.floor(Math.random() * deliverables.length)];

      const contacts = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Anderson', 'David Wilson'];
      const contactPerson = contacts[Math.floor(Math.random() * contacts.length)];

      return {
        project,
        client,
        criticalRisks,
        highRisks,
        mediumRisks,
        complianceScore,
        daysUntilDeadline,
        lastActivity,
        engagementValue,
        healthScore,
        trend,
        priority,
        nextDeliverable,
        contactPerson
      };
    }).filter(Boolean) as ClientMetrics[];
  }, [projects, clients, allRisks]);

  const kpiMetrics: KPIMetric[] = useMemo(() => {
    const totalClients = clientMetrics.length;
    const totalValue = clientMetrics.reduce((sum, m) => sum + m.engagementValue, 0);
    const avgHealthScore = totalClients > 0 ?
      Math.round(clientMetrics.reduce((sum, m) => sum + m.healthScore, 0) / totalClients) : 0;
    const criticalIssues = clientMetrics.reduce((sum, m) => sum + m.criticalRisks, 0);
    const urgentDeadlines = clientMetrics.filter(m => m.daysUntilDeadline <= 7).length;

    return [
      {
        title: 'Active Engagements',
        value: totalClients.toString(),
        change: '+2 this month',
        trend: 'up' as const,
        icon: UsersIcon,
        color: 'bg-blue-600'
      },
      {
        title: 'Portfolio Value',
        value: `$${(totalValue / 1000000).toFixed(1)}M`,
        change: '+15% vs last quarter',
        trend: 'up' as const,
        icon: CurrencyDollarIcon,
        color: 'bg-emerald-600'
      },
      {
        title: 'Avg Client Health',
        value: `${avgHealthScore}/100`,
        change: avgHealthScore >= 75 ? '+5 pts' : '-3 pts',
        trend: avgHealthScore >= 75 ? 'up' as const : 'down' as const,
        icon: ShieldCheckIcon,
        color: avgHealthScore >= 75 ? 'bg-green-600' : 'bg-yellow-600'
      },
      {
        title: 'Critical Issues',
        value: criticalIssues.toString(),
        change: criticalIssues > 5 ? 'Needs attention' : 'Under control',
        trend: criticalIssues > 5 ? 'up' as const : 'down' as const,
        icon: ExclamationTriangleIcon,
        color: criticalIssues > 5 ? 'bg-red-600' : 'bg-green-600'
      },
      {
        title: 'Urgent Deadlines',
        value: urgentDeadlines.toString(),
        change: 'Next 7 days',
        trend: urgentDeadlines > 0 ? 'up' as const : 'stable' as const,
        icon: ClockIcon,
        color: urgentDeadlines > 0 ? 'bg-orange-600' : 'bg-slate-600'
      }
    ];
  }, [clientMetrics]);

  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
    await mockApi.createProject(name, organizationId, frameworks);
    fetchData();
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  // Sort clients by priority
  const sortedMetrics = [...clientMetrics].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Consultant Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Managing {clientMetrics.length} active engagements •
              ${(kpiMetrics[1]?.value || '0').replace('$', '').replace('M', '')}M portfolio value
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Engagement</span>
          </button>
        </header>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {kpiMetrics.map((metric, index) => (
            <KPICard key={index} metric={metric} />
          ))}
        </div>

        {/* Client Engagements */}
        <main>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Client Engagements</h2>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low Priority</span>
              </div>
            </div>
          </div>

          {sortedMetrics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedMetrics.map(metrics => (
                <ClientCard
                  key={metrics.project.id}
                  metrics={metrics}
                  setView={setView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-lg">
              <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">No active engagements</h3>
              <p className="text-slate-400 mt-2 mb-6">Click "New Engagement" to get started with your first client project.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
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

export default ImprovedConsultantDashboard;