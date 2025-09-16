import React, { useMemo, useState, useEffect } from 'react';
import type { User, Project, AssessmentItem, Risk, Vendor, VendorIncident, VendorContract } from '../../types';
import { RiskLevel, VendorCriticality, ContractStatus } from '../../types';
import { mockApi } from '../../services/api';
import { useNotifications } from '../context/NotificationContext';
import RiskHeatmap from './RiskHeatmap';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon
} from '../ui/Icons';

interface ClientDashboardProps {
  user: User;
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  onNavigate?: (tab: string) => void;
}

interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

const EnhancedClientDashboard: React.FC<ClientDashboardProps> = ({ user, project, assessmentItems, risks, onNavigate }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [incidents, setIncidents] = useState<VendorIncident[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [vendorData, incidentData, contractData] = await Promise.all([
          mockApi.getVendors(project.id),
          Promise.all([]).then(() => []), // Mock empty incidents for now
          Promise.all([]).then(() => [])  // Mock empty contracts for now
        ]);

        setVendors(vendorData);

        // Fetch incidents and contracts for all vendors
        const allIncidents: VendorIncident[] = [];
        const allContracts: VendorContract[] = [];

        for (const vendor of vendorData) {
          const [vendorIncidents, vendorContracts] = await Promise.all([
            mockApi.getVendorIncidents(vendor.id),
            mockApi.getVendorContracts(vendor.id)
          ]);
          allIncidents.push(...vendorIncidents);
          allContracts.push(...vendorContracts);
        }

        setIncidents(allIncidents);
        setContracts(allContracts);
      } catch (error) {
        addNotification('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [project.id, addNotification]);

  const complianceSummary = useMemo(() => {
    const total = assessmentItems.length;
    if (total === 0) return { compliant: 0, nonCompliant: 0, inProgress: 0, notApplicable: 0, percentage: 0 };

    const compliant = assessmentItems.filter(i => i.status === 'Compliant').length;
    const nonCompliant = assessmentItems.filter(i => i.status === 'Non-Compliant').length;
    const inProgress = assessmentItems.filter(i => i.status === 'In Progress').length;
    const notApplicable = assessmentItems.filter(i => i.status === 'Not Applicable').length;

    const percentage = Math.round((compliant / (total - notApplicable)) * 100) || 0;

    return { compliant, nonCompliant, inProgress, notApplicable, percentage };
  }, [assessmentItems]);

  const riskAnalysis = useMemo(() => {
    const openRisks = risks.filter(r => r.status === 'Open');
    const closedRisks = risks.filter(r => r.status === 'Closed');

    const riskCounts = {
      critical: openRisks.filter(r => r.level === RiskLevel.CRITICAL).length,
      high: openRisks.filter(r => r.level === RiskLevel.HIGH).length,
      medium: openRisks.filter(r => r.level === RiskLevel.MEDIUM).length,
      low: openRisks.filter(r => r.level === RiskLevel.LOW).length,
    };

    // Calculate trend based on risk creation dates
    const daysAgo = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentRisks = openRisks.filter(r =>
      r.creationDate && new Date(r.creationDate) > cutoffDate
    ).length;

    const riskTrend = recentRisks > 2 ? 'up' : recentRisks === 0 ? 'down' : 'stable';
    const riskScore = Math.max(0, 100 - (riskCounts.critical * 25 + riskCounts.high * 15 + riskCounts.medium * 5 + riskCounts.low * 1));

    return {
      openRisks: openRisks.length,
      closedRisks: closedRisks.length,
      riskCounts,
      riskTrend,
      riskScore,
      recentRisks
    };
  }, [risks, selectedTimeframe]);

  const vendorAnalysis = useMemo(() => {
    const highRiskVendors = vendors.filter(v =>
      v.riskLevel === VendorCriticality.HIGH || v.riskLevel === VendorCriticality.CRITICAL
    ).length;

    const activeIncidents = incidents.filter(i =>
      i.status === 'Open' || i.status === 'Investigating'
    ).length;

    const expiringContracts = contracts.filter(c => {
      const endDate = new Date(c.endDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    }).length;

    const totalSpend = vendors.reduce((sum, vendor) => sum + vendor.annualSpend, 0);

    return {
      totalVendors: vendors.length,
      highRiskVendors,
      activeIncidents,
      expiringContracts,
      totalSpend
    };
  }, [vendors, incidents, contracts]);

  const dashboardAlerts = useMemo((): DashboardAlert[] => {
    const alerts: DashboardAlert[] = [];

    // Critical risk alerts
    if (riskAnalysis.riskCounts.critical > 0) {
      alerts.push({
        id: 'critical-risks',
        type: 'critical',
        title: 'Critical Risks Detected',
        message: `${riskAnalysis.riskCounts.critical} critical risk(s) require immediate attention`,
      });
    }

    // Compliance alerts
    if (complianceSummary.percentage < 80) {
      alerts.push({
        id: 'compliance-low',
        type: 'warning',
        title: 'Compliance Below Target',
        message: `Current compliance is ${complianceSummary.percentage}%. Target is 80%+`,
      });
    }

    // Vendor alerts
    if (vendorAnalysis.activeIncidents > 0) {
      alerts.push({
        id: 'vendor-incidents',
        type: 'warning',
        title: 'Active Vendor Incidents',
        message: `${vendorAnalysis.activeIncidents} vendor incident(s) in progress`,
      });
    }

    if (vendorAnalysis.expiringContracts > 0) {
      alerts.push({
        id: 'expiring-contracts',
        type: 'info',
        title: 'Contracts Expiring Soon',
        message: `${vendorAnalysis.expiringContracts} contract(s) expire within 90 days`,
      });
    }

    return alerts;
  }, [riskAnalysis, complianceSummary, vendorAnalysis]);

  const getAlertColor = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-600/40 bg-red-900/20 text-red-200';
      case 'warning': return 'border-yellow-600/40 bg-yellow-900/20 text-yellow-200';
      case 'info': return 'border-blue-600/40 bg-blue-900/20 text-blue-200';
    }
  };

  const getAlertIcon = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'info': return <BellIcon className="w-5 h-5 text-blue-400" />;
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
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Security & Compliance Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, {user.name}. Here's the current status of your "{project.name}" program.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div
            onClick={() => onNavigate?.('assessments')}
            className="glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-slate-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Compliance Score</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-400">{complianceSummary.percentage}%</span>
                  {complianceSummary.percentage >= 80 ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
              <ShieldCheckIcon className="w-12 h-12 text-green-400" />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${complianceSummary.percentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center opacity-75">Click to view assessments</div>
          </div>

          <div
            onClick={() => onNavigate?.('risks')}
            className="glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-slate-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Risk Score</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-3xl font-bold ${riskAnalysis.riskScore >= 80 ? 'text-green-400' : riskAnalysis.riskScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {riskAnalysis.riskScore}
                  </span>
                  {riskAnalysis.riskTrend === 'up' ? (
                    <TrendingUpIcon className="w-6 h-6 text-red-400" />
                  ) : riskAnalysis.riskTrend === 'down' ? (
                    <TrendingDownIcon className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 bg-slate-600 rounded-full"></div>
                  )}
                </div>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
            </div>
            <div className="text-sm text-slate-400">
              {riskAnalysis.openRisks} open risk(s), {riskAnalysis.recentRisks} recent
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center opacity-75">Click to view risks</div>
          </div>

          <div
            onClick={() => onNavigate?.('vendors')}
            className="glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-slate-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Vendor Portfolio</h3>
                <span className="text-3xl font-bold text-white">{vendorAnalysis.totalVendors}</span>
              </div>
              <UsersIcon className="w-12 h-12 text-blue-400" />
            </div>
            <div className="text-sm">
              <span className="text-red-400">{vendorAnalysis.highRiskVendors} high risk</span>
              <span className="text-slate-400"> • </span>
              <span className="text-white">${(vendorAnalysis.totalSpend / 1000000).toFixed(1)}M spend</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center opacity-75">Click to view vendors</div>
          </div>

          <div
            onClick={() => onNavigate?.('risks')}
            className="glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-slate-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Active Issues</h3>
                <span className="text-3xl font-bold text-orange-400">
                  {riskAnalysis.riskCounts.critical + riskAnalysis.riskCounts.high + vendorAnalysis.activeIncidents}
                </span>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-400" />
            </div>
            <div className="text-sm text-slate-400">
              Requires immediate attention
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center opacity-75">Click to prioritize issues</div>
          </div>
        </div>

        {/* Alerts */}
        {dashboardAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Priority Alerts</h3>
            <div className="space-y-3">
              {dashboardAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    {alert.action && (
                      <button
                        onClick={alert.action}
                        className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
                      >
                        {alert.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Compliance Details */}
          <div
            onClick={() => onNavigate?.('assessments')}
            className="glass-card p-6 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-slate-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Compliance Status</h2>
              <DocumentTextIcon className="w-6 h-6 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Compliant</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(complianceSummary.compliant / assessmentItems.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white w-8">{complianceSummary.compliant}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Non-Compliant</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(complianceSummary.nonCompliant / assessmentItems.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white w-8">{complianceSummary.nonCompliant}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">In Progress</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(complianceSummary.inProgress / assessmentItems.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white w-8">{complianceSummary.inProgress}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Frameworks: {project.frameworks.join(', ')}
              </p>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Risk Breakdown</h2>
              <ChartBarIcon className="w-6 h-6 text-slate-400" />
            </div>

            <div className="space-y-4">
              {(['critical', 'high', 'medium', 'low'] as const).map(level => {
                const count = riskAnalysis.riskCounts[level];
                const color = {
                  critical: 'bg-red-500 text-red-400',
                  high: 'bg-orange-500 text-orange-400',
                  medium: 'bg-yellow-500 text-yellow-400',
                  low: 'bg-blue-500 text-blue-400'
                }[level];

                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`}></div>
                      <span className="text-sm text-slate-400 capitalize">{level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className={`${color.split(' ')[0]} h-2 rounded-full`}
                          style={{ width: `${count > 0 ? Math.max(20, (count / Math.max(...Object.values(riskAnalysis.riskCounts))) * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-white w-6">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Open:</span>
                <span className="text-white font-medium">{riskAnalysis.openRisks}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">Resolved:</span>
                <span className="text-green-400 font-medium">{riskAnalysis.closedRisks}</span>
              </div>
            </div>
          </div>

          {/* Vendor Summary */}
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Vendor Overview</h2>
              <UsersIcon className="w-6 h-6 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Total Vendors</span>
                <span className="text-sm font-medium text-white">{vendorAnalysis.totalVendors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">High Risk</span>
                <span className="text-sm font-medium text-red-400">{vendorAnalysis.highRiskVendors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Active Incidents</span>
                <span className="text-sm font-medium text-orange-400">{vendorAnalysis.activeIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Contracts Expiring</span>
                <span className="text-sm font-medium text-yellow-400">{vendorAnalysis.expiringContracts}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Annual Spend</span>
                <span className="text-sm font-medium text-white">
                  ${(vendorAnalysis.totalSpend / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="mb-6">
          <RiskHeatmap risks={risks} />
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate?.('assessments')}
              className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 hover:scale-105 transition-all duration-300 text-left transform hover:shadow-lg"
            >
              <DocumentTextIcon className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-medium text-white">Review Assessments</h3>
              <p className="text-sm text-slate-400">Update compliance status</p>
            </button>

            <button
              onClick={() => onNavigate?.('risks')}
              className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg hover:bg-red-600/30 hover:scale-105 transition-all duration-300 text-left transform hover:shadow-lg"
            >
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mb-2" />
              <h3 className="font-medium text-white">Address Risks</h3>
              <p className="text-sm text-slate-400">Manage open risks</p>
            </button>

            <button
              onClick={() => onNavigate?.('vendors')}
              className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 hover:scale-105 transition-all duration-300 text-left transform hover:shadow-lg"
            >
              <UsersIcon className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-medium text-white">Vendor Management</h3>
              <p className="text-sm text-slate-400">Review vendor risks</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedClientDashboard;