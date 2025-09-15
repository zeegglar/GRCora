import React, { useState, useEffect } from 'react';
import type { Vendor, VendorRiskAssessment, VendorMitigationAction, View } from '../../../types';
import { VendorCriticality } from '../../../types';
import { mockApi } from '../../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface RemediationTrackerProps {
  projectId: string;
  setView: (view: View) => void;
}

interface RemediationItem {
  id: string;
  vendorId: string;
  vendorName: string;
  action: VendorMitigationAction;
  riskLevel: VendorCriticality;
  category: string;
}

const RemediationTracker: React.FC<RemediationTrackerProps> = ({ projectId, setView }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<VendorRiskAssessment[]>([]);
  const [remediationItems, setRemediationItems] = useState<RemediationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchRemediationData = async () => {
      setIsLoading(true);
      try {
        const vendorData = await mockApi.getVendors(projectId);
        setVendors(vendorData);

        const allRiskAssessments: VendorRiskAssessment[] = [];
        const allRemediationItems: RemediationItem[] = [];

        for (const vendor of vendorData) {
          const riskData = await mockApi.getVendorRiskAssessments(vendor.id);
          allRiskAssessments.push(...riskData);

          riskData.forEach(assessment => {
            assessment.mitigationActions.forEach(action => {
              // Find the highest risk category for context
              const highestRiskCategory = Object.entries(assessment.categories)
                .sort(([,a], [,b]) => b.score - a.score)[0];

              allRemediationItems.push({
                id: `${assessment.id}-${action.id}`,
                vendorId: vendor.id,
                vendorName: vendor.name,
                action,
                riskLevel: vendor.riskLevel,
                category: highestRiskCategory?.[0] || 'General'
              });
            });
          });
        }

        setRiskAssessments(allRiskAssessments);
        setRemediationItems(allRemediationItems);
      } catch (error) {
        console.error('Error fetching remediation data:', error);
        addNotification('Failed to load remediation tracking data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemediationData();
  }, [projectId, addNotification]);

  const updateActionStatus = async (actionId: string, newStatus: VendorMitigationAction['status']) => {
    try {
      // In a real implementation, this would call an API endpoint
      setRemediationItems(prev =>
        prev.map(item =>
          item.action.id === actionId
            ? { ...item, action: { ...item.action, status: newStatus, completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined } }
            : item
        )
      );

      const actionItem = remediationItems.find(item => item.action.id === actionId);
      if (actionItem) {
        addNotification(`Updated ${actionItem.vendorName} remediation action to ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Error updating action status:', error);
      addNotification('Failed to update action status', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading remediation tracker...</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-600/20 border-red-600/30';
      case 'high': return 'text-orange-400 bg-orange-600/20 border-orange-600/30';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20 border-yellow-600/30';
      case 'low': return 'text-blue-400 bg-blue-600/20 border-blue-600/30';
      default: return 'text-slate-400 bg-slate-600/20 border-slate-600/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-red-400';
      case 'in progress': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'closed': return 'text-slate-400';
      default: return 'text-blue-400';
    }
  };

  const getRiskLevelColor = (level: VendorCriticality) => {
    switch (level) {
      case VendorCriticality.LOW: return 'text-green-400';
      case VendorCriticality.MEDIUM: return 'text-yellow-400';
      case VendorCriticality.HIGH: return 'text-orange-400';
      case VendorCriticality.CRITICAL: return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const filteredItems = remediationItems.filter(item => {
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'open' && item.action.status === 'Open') ||
      (filterStatus === 'in-progress' && item.action.status === 'In Progress') ||
      (filterStatus === 'completed' && (item.action.status === 'Completed' || item.action.status === 'Closed'));

    const priorityMatch = filterPriority === 'all' ||
      item.action.priority.toLowerCase() === filterPriority;

    return statusMatch && priorityMatch;
  });

  const sortedItems = filteredItems.sort((a, b) => {
    // Sort by priority (Critical > High > Medium > Low), then by due date
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = (priorityOrder[b.action.priority as keyof typeof priorityOrder] || 0) -
                        (priorityOrder[a.action.priority as keyof typeof priorityOrder] || 0);

    if (priorityDiff !== 0) return priorityDiff;

    return new Date(a.action.dueDate).getTime() - new Date(b.action.dueDate).getTime();
  });

  // Calculate statistics
  const totalActions = remediationItems.length;
  const openActions = remediationItems.filter(item => item.action.status === 'Open').length;
  const inProgressActions = remediationItems.filter(item => item.action.status === 'In Progress').length;
  const completedActions = remediationItems.filter(item => item.action.status === 'Completed' || item.action.status === 'Closed').length;
  const overDueActions = remediationItems.filter(item =>
    (item.action.status === 'Open' || item.action.status === 'In Progress') &&
    new Date(item.action.dueDate) < new Date()
  ).length;

  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => setView({ type: 'tprmDashboard', projectId })}
              className="text-sm text-blue-400 hover:underline mb-2"
            >
              ← Back to TPRM Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white">Remediation Tracker</h1>
            <p className="text-slate-400 mt-1">Track and manage vendor risk mitigation actions</p>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Actions</h3>
          <div className="text-3xl font-bold text-white">{totalActions}</div>
          <div className="text-sm text-slate-400 mt-1">All remediation items</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Open</h3>
          <div className="text-3xl font-bold text-red-400">{openActions}</div>
          <div className="text-sm text-slate-400 mt-1">Awaiting action</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">In Progress</h3>
          <div className="text-3xl font-bold text-yellow-400">{inProgressActions}</div>
          <div className="text-sm text-slate-400 mt-1">Being worked on</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Completed</h3>
          <div className="text-3xl font-bold text-green-400">{completedActions}</div>
          <div className="text-sm text-slate-400 mt-1">{completionRate}% completion rate</div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Overdue</h3>
          <div className="text-3xl font-bold text-red-400">{overDueActions}</div>
          <div className="text-sm text-slate-400 mt-1">Past due date</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-slate-400 text-sm font-medium mr-2">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm font-medium mr-2">Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="text-sm text-slate-400">
            Showing {sortedItems.length} of {totalActions} actions
          </div>
        </div>
      </div>

      {/* Remediation Actions List */}
      <div className="glass-card rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Remediation Actions</h2>

        {sortedItems.length > 0 ? (
          <div className="space-y-4">
            {sortedItems.map(item => {
              const isOverdue = (item.action.status === 'Open' || item.action.status === 'In Progress') &&
                              new Date(item.action.dueDate) < new Date();
              const daysUntilDue = Math.ceil((new Date(item.action.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div key={item.id} className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-900/20 border-red-600/30' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{item.action.description}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.action.priority)}`}>
                          {item.action.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.action.status)} bg-slate-800`}>
                          {item.action.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-400 mb-2">
                        <span>Vendor: <strong className="text-white">{item.vendorName}</strong></span>
                        <span>Risk Level: <strong className={getRiskLevelColor(item.riskLevel)}>{item.riskLevel}</strong></span>
                        <span>Category: <strong className="text-white">{item.category}</strong></span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span>Assigned to: <strong className="text-white">{item.action.assignedTo}</strong></span>
                        <span>Due: <strong className={isOverdue ? 'text-red-400' : daysUntilDue <= 7 ? 'text-yellow-400' : 'text-white'}>
                          {item.action.dueDate}
                          {isOverdue && ' (Overdue)'}
                          {!isOverdue && daysUntilDue >= 0 && ` (${daysUntilDue} days)`}
                        </strong></span>
                        {item.action.completedDate && (
                          <span>Completed: <strong className="text-green-400">{item.action.completedDate}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {item.action.status === 'Open' && (
                        <button
                          onClick={() => updateActionStatus(item.action.id, 'In Progress')}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded font-medium"
                        >
                          Start Work
                        </button>
                      )}

                      {item.action.status === 'In Progress' && (
                        <button
                          onClick={() => updateActionStatus(item.action.id, 'Completed')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium"
                        >
                          Mark Complete
                        </button>
                      )}

                      {(item.action.status === 'Open' || item.action.status === 'In Progress') && (
                        <button
                          onClick={() => updateActionStatus(item.action.id, 'Closed')}
                          className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded font-medium"
                        >
                          Close
                        </button>
                      )}

                      <button
                        onClick={() => setView({ type: 'vendorDetail', projectId, vendorId: item.vendorId, tab: 'risk' })}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium"
                      >
                        View Vendor
                      </button>
                    </div>
                  </div>

                  {isOverdue && (
                    <div className="mt-3 p-2 bg-red-900/30 border border-red-600/40 rounded text-red-200 text-sm">
                      ⚠️ This action is overdue and requires immediate attention
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-500 text-lg mb-2">No remediation actions found</div>
            <div className="text-slate-400 text-sm">
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'All vendors are currently compliant with no outstanding remediation actions required'}
            </div>
          </div>
        )}
      </div>

      {/* Action Summary by Vendor */}
      {vendors.length > 0 && (
        <div className="glass-card rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-6">Actions by Vendor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(vendor => {
              const vendorActions = remediationItems.filter(item => item.vendorId === vendor.id);
              const openCount = vendorActions.filter(item => item.action.status === 'Open').length;
              const inProgressCount = vendorActions.filter(item => item.action.status === 'In Progress').length;
              const completedCount = vendorActions.filter(item => item.action.status === 'Completed' || item.action.status === 'Closed').length;

              if (vendorActions.length === 0) return null;

              return (
                <div key={vendor.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{vendor.name}</h3>
                      <div className={`text-sm ${getRiskLevelColor(vendor.riskLevel)}`}>{vendor.riskLevel} Risk</div>
                    </div>
                    <button
                      onClick={() => setView({ type: 'vendorDetail', projectId, vendorId: vendor.id, tab: 'risk' })}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View →
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Open:</span>
                      <span className="text-red-400 font-medium">{openCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">In Progress:</span>
                      <span className="text-yellow-400 font-medium">{inProgressCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed:</span>
                      <span className="text-green-400 font-medium">{completedCount}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                      <span className="text-slate-400">Total:</span>
                      <span className="text-white font-medium">{vendorActions.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemediationTracker;