import React, { useState, useMemo } from 'react';
import type { User, Project, Risk, AssessmentItem, Vendor, Control } from '../../types';
import { RiskLevel, VendorCriticality } from '../../types';
import EnhancedRiskHeatmap from './EnhancedRiskHeatmap';
import GRCAssistant from '../ai/GRCAssistant';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  BellIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '../ui/Icons';

interface InteractiveDashboardProps {
  user: User;
  project: Project;
  risks: Risk[];
  assessmentItems: AssessmentItem[];
  vendors: Vendor[];
  controls: Map<string, Control>;
  onNavigate: (view: any) => void;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'heatmap' | 'trend';
  size: 'small' | 'medium' | 'large';
  priority: 'high' | 'medium' | 'low';
  data: any;
}

const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  user,
  project,
  risks,
  assessmentItems,
  vendors,
  controls,
  onNavigate
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const openRisks = risks.filter(r => r.status === 'Open');
    const criticalRisks = openRisks.filter(r => r.level === RiskLevel.CRITICAL);
    const highRisks = openRisks.filter(r => r.level === RiskLevel.HIGH);

    const compliantItems = assessmentItems.filter(item => item.status === 'Compliant');
    const nonCompliantItems = assessmentItems.filter(item => item.status === 'Non-Compliant');
    const inProgressItems = assessmentItems.filter(item => item.status === 'In Progress');

    const complianceRate = assessmentItems.length > 0 ?
      (compliantItems.length / assessmentItems.length) * 100 : 0;

    const highRiskVendors = vendors.filter(v =>
      v.riskLevel === VendorCriticality.HIGH || v.riskLevel === VendorCriticality.CRITICAL
    );

    const riskTrend = calculateRiskTrend(risks);
    const complianceTrend = calculateComplianceTrend(assessmentItems);

    return {
      totalRisks: openRisks.length,
      criticalRisks: criticalRisks.length,
      highRisks: highRisks.length,
      complianceRate: complianceRate.toFixed(1),
      compliantItems: compliantItems.length,
      nonCompliantItems: nonCompliantItems.length,
      inProgressItems: inProgressItems.length,
      totalVendors: vendors.length,
      highRiskVendors: highRiskVendors.length,
      totalControls: controls.size,
      riskTrend,
      complianceTrend
    };
  }, [risks, assessmentItems, vendors, controls]);

  const calculateRiskTrend = (risks: Risk[]): 'up' | 'down' | 'stable' => {
    // Simulate trend calculation based on creation dates
    const recent = risks.filter(r => {
      const creationDate = new Date(r.creationDate || Date.now());
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return creationDate > thirtyDaysAgo;
    });

    if (recent.length > risks.length * 0.3) return 'up';
    if (recent.length < risks.length * 0.1) return 'down';
    return 'stable';
  };

  const calculateComplianceTrend = (items: AssessmentItem[]): 'up' | 'down' | 'stable' => {
    // Simulate compliance trend
    const compliantRate = items.filter(i => i.status === 'Compliant').length / items.length;
    if (compliantRate > 0.8) return 'up';
    if (compliantRate < 0.6) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-green-400" />;
      default: return <span className="w-4 h-4 text-slate-400">→</span>;
    }
  };

  const getComplianceTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-red-400" />;
      default: return <span className="w-4 h-4 text-slate-400">→</span>;
    }
  };

  const getActionableInsights = () => {
    const insights = [];

    if (metrics.criticalRisks > 0) {
      insights.push({
        type: 'critical',
        message: `${metrics.criticalRisks} critical risks require immediate attention`,
        action: 'Review Risks',
        onClick: () => onNavigate({ type: 'project', projectId: project.id, tab: 'risks' })
      });
    }

    if (parseFloat(metrics.complianceRate) < 80) {
      insights.push({
        type: 'warning',
        message: `Compliance rate at ${metrics.complianceRate}% - below target`,
        action: 'Review Controls',
        onClick: () => onNavigate({ type: 'project', projectId: project.id, tab: 'assessments' })
      });
    }

    if (metrics.highRiskVendors > 0) {
      insights.push({
        type: 'info',
        message: `${metrics.highRiskVendors} vendors require enhanced monitoring`,
        action: 'Review Vendors',
        onClick: () => onNavigate({ type: 'project', projectId: project.id, tab: 'vendors' })
      });
    }

    return insights;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  };

  const actionableInsights = getActionableInsights();

  return (
    <div className="space-y-8">
      {/* Header with AI Assistant */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading text-3xl font-bold">GRC Dashboard</h1>
            <p className="text-muted mt-2 text-lg">{project.name}</p>
            <div className="flex items-center space-x-3 mt-3">
              {project.frameworks.map((framework, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  {framework}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary"
            >
              <div className={`w-4 h-4 ${refreshing ? 'loading-spinner' : ''}`}>
                {!refreshing && (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="btn-primary"
            >
              <span className="text-lg">🤖</span>
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      {actionableInsights.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <BellIcon className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Actionable Insights</h3>
          </div>
          <div className="space-y-2">
            {actionableInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex justify-between items-center ${
                  insight.type === 'critical' ? 'bg-red-900/20 border-red-600/30' :
                  insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-600/30' :
                  'bg-blue-900/20 border-blue-600/30'
                }`}
              >
                <span className="text-white text-sm">{insight.message}</span>
                <button
                  onClick={insight.onClick}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-semibold transition-colors"
                >
                  {insight.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Risk Metrics */}
        <div className="metric-card group" onClick={() => onNavigate({ type: 'project', projectId: project.id, tab: 'risks' })}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-xl border border-red-500/20">
              <ExclamationTriangleIcon className="w-7 h-7 icon-error" />
            </div>
            <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
              {getTrendIcon(metrics.riskTrend)}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted">Active Risks</h3>
            <div className="text-3xl font-bold text-heading">{metrics.totalRisks}</div>
            <div className="text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                {metrics.criticalRisks} Critical
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                {metrics.highRisks} High
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="metric-card group" onClick={() => onNavigate({ type: 'project', projectId: project.id, tab: 'assessments' })}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl border border-emerald-500/20">
              <CheckCircleIcon className="w-7 h-7 icon-success" />
            </div>
            <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
              {getComplianceTrendIcon(metrics.complianceTrend)}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted">Compliance Rate</h3>
            <div className="text-3xl font-bold text-heading">{metrics.complianceRate}%</div>
            <div className="text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                {metrics.compliantItems} Compliant
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                {metrics.nonCompliantItems} Gaps
              </span>
            </div>
          </div>
        </div>

        {/* Vendor Metrics */}
        <div className="metric-card group" onClick={() => onNavigate({ type: 'project', projectId: project.id, tab: 'vendors' })}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl border border-blue-500/20">
              <UsersIcon className="w-7 h-7 icon-primary" />
            </div>
            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-muted">Portfolio</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted">Vendor Portfolio</h3>
            <div className="text-3xl font-bold text-heading">{metrics.totalVendors}</div>
            <div className="text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                {metrics.highRiskVendors} High Risk
              </span>
            </div>
          </div>
        </div>

        {/* Control Metrics */}
        <div className="metric-card group" onClick={() => onNavigate({ type: 'project', projectId: project.id, tab: 'assessments' })}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl border border-purple-500/20">
              <ShieldCheckIcon className="w-7 h-7 text-purple-400" />
            </div>
            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-muted">Active</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted">Active Controls</h3>
            <div className="text-3xl font-bold text-heading">{metrics.totalControls}</div>
            <div className="text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                {metrics.inProgressItems} In Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Heat Map */}
        <div className="lg:col-span-2">
          <EnhancedRiskHeatmap
            risks={risks}
            vendors={vendors}
            controls={controls}
            onRiskClick={(risk) => onNavigate({ type: 'project', projectId: project.id, tab: 'risks' })}
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { icon: '🔴', type: 'Risk', message: 'Critical risk identified in authentication system', time: '2h ago' },
              { icon: '✅', type: 'Control', message: 'Access control review completed', time: '4h ago' },
              { icon: '🏢', type: 'Vendor', message: 'AWS security assessment updated', time: '6h ago' },
              { icon: '📊', type: 'Assessment', message: 'SOC 2 compliance review in progress', time: '1d ago' },
              { icon: '🔒', type: 'Policy', message: 'Data retention policy approved', time: '2d ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-blue-400">{activity.type}</span>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-white mt-1">{activity.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Progress */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Framework Compliance</h3>
          <div className="space-y-4">
            {project.frameworks.map((framework, index) => {
              const frameworkProgress = 75 + Math.random() * 20; // Simulate progress
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">{framework}</span>
                    <span className="text-sm text-slate-400">{frameworkProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${frameworkProgress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: '🔍', label: 'Risk Assessment', action: () => onNavigate({ type: 'project', projectId: project.id, tab: 'risks' }) },
            { icon: '📊', label: 'Generate Report', action: () => onNavigate({ type: 'project', projectId: project.id, tab: 'reports' }) },
            { icon: '🏢', label: 'Vendor Review', action: () => onNavigate({ type: 'tprmDashboard', projectId: project.id }) },
            { icon: '✅', label: 'Control Testing', action: () => onNavigate({ type: 'project', projectId: project.id, tab: 'assessments' }) },
            { icon: '📋', label: 'Policy Review', action: () => onNavigate({ type: 'project', projectId: project.id, tab: 'policies' }) },
            { icon: '🤖', label: 'AI Insights', action: () => setShowAIAssistant(true) }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all text-center border border-slate-600 hover:border-slate-500"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm text-white font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant */}
      <GRCAssistant
        project={project}
        risks={risks}
        assessmentItems={assessmentItems}
        controls={controls}
        vendors={vendors}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
};

export default InteractiveDashboard;