import React, { useState, useEffect } from 'react';
import type { User, AssessmentItem, Risk, Vendor, View } from '../../types';
import { RiskLevel, VendorCriticality } from '../../types';
import { useNotifications } from '../context/NotificationContext';
import { mockApi } from '../../services/api';

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'assessment' | 'risk' | 'vendor' | 'policy' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  automatable: boolean;
  estimatedTime: number; // in minutes
  dependencies?: string[];
  metadata?: any;
}

interface WorkflowEngineProps {
  user: User;
  projectId: string;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  vendors: Vendor[];
  setView: (view: View) => void;
}

const WorkflowEngine: React.FC<WorkflowEngineProps> = ({
  user,
  projectId,
  assessmentItems,
  risks,
  vendors,
  setView
}) => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'critical'>('all');
  const { addNotification } = useNotifications();

  useEffect(() => {
    generateWorkflowTasks();
  }, [assessmentItems, risks, vendors]);

  const generateWorkflowTasks = () => {
    const newTasks: WorkflowTask[] = [];

    // Assessment workflow tasks
    const nonCompliantAssessments = assessmentItems.filter(item => item.status === 'Non-Compliant');
    nonCompliantAssessments.forEach(item => {
      newTasks.push({
        id: `assessment-${item.id}`,
        title: `Remediate Non-Compliant Control`,
        description: `Address non-compliance for ${item.controlId}`,
        type: 'assessment',
        priority: 'high',
        assignee: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: false,
        estimatedTime: 120,
        metadata: { assessmentItemId: item.id, controlId: item.controlId }
      });
    });

    // Risk workflow tasks
    const criticalRisks = risks.filter(risk => risk.level === RiskLevel.CRITICAL && risk.status === 'Open');
    criticalRisks.forEach(risk => {
      newTasks.push({
        id: `risk-${risk.id}`,
        title: `Address Critical Risk`,
        description: risk.title,
        type: 'risk',
        priority: 'critical',
        assignee: user.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: false,
        estimatedTime: 180,
        metadata: { riskId: risk.id }
      });
    });

    const highRisks = risks.filter(risk => risk.level === RiskLevel.HIGH && risk.status === 'Open');
    highRisks.forEach(risk => {
      newTasks.push({
        id: `risk-${risk.id}`,
        title: `Mitigate High Risk`,
        description: risk.title,
        type: 'risk',
        priority: 'high',
        assignee: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: false,
        estimatedTime: 90,
        metadata: { riskId: risk.id }
      });
    });

    // Vendor workflow tasks
    const highRiskVendors = vendors.filter(vendor =>
      vendor.riskLevel === VendorCriticality.HIGH || vendor.riskLevel === VendorCriticality.CRITICAL
    );
    highRiskVendors.forEach(vendor => {
      newTasks.push({
        id: `vendor-${vendor.id}`,
        title: `Review High-Risk Vendor`,
        description: `Conduct risk assessment for ${vendor.name}`,
        type: 'vendor',
        priority: vendor.riskLevel === VendorCriticality.CRITICAL ? 'critical' : 'high',
        assignee: user.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: true,
        estimatedTime: 60,
        metadata: { vendorId: vendor.id }
      });
    });

    // Automated compliance checks
    if (automationEnabled) {
      newTasks.push({
        id: 'auto-compliance-check',
        title: 'Automated Compliance Scan',
        description: 'Run automated compliance checks across all controls',
        type: 'compliance',
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: true,
        estimatedTime: 15,
        metadata: { automated: true }
      });
    }

    // Risk trending analysis
    const recentRisks = risks.filter(risk => {
      const creationDate = risk.creationDate ? new Date(risk.creationDate) : new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return creationDate > thirtyDaysAgo;
    });

    if (recentRisks.length > 3) {
      newTasks.push({
        id: 'risk-trend-analysis',
        title: 'Risk Trend Analysis',
        description: `Analyze ${recentRisks.length} new risks identified in the last 30 days`,
        type: 'risk',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        automatable: true,
        estimatedTime: 45,
        metadata: { riskCount: recentRisks.length }
      });
    }

    // Mark overdue tasks
    const updatedTasks = newTasks.map(task => ({
      ...task,
      status: new Date(task.dueDate) < new Date() ? 'overdue' as const : task.status
    }));

    setTasks(updatedTasks);
  };

  const executeAutomatedTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.automatable) return;

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'in_progress' } : t
    ));

    // Simulate automated task execution
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      ));

      addNotification(`Automated task "${task.title}" completed successfully`, 'success');

      // Trigger follow-up actions based on task type
      if (task.type === 'compliance') {
        addNotification('Compliance scan complete. 3 new issues identified.', 'info');
      } else if (task.type === 'vendor') {
        addNotification(`Vendor risk assessment updated for ${task.metadata?.vendorId}`, 'info');
      }
    }, 3000); // Simulate 3-second execution
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete' | 'automate') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    switch (action) {
      case 'start':
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'in_progress' } : t
        ));
        addNotification(`Started working on "${task.title}"`, 'info');
        break;

      case 'complete':
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        ));
        addNotification(`Completed "${task.title}"`, 'success');
        break;

      case 'automate':
        executeAutomatedTask(taskId);
        break;
    }
  };

  const navigateToRelatedView = (task: WorkflowTask) => {
    switch (task.type) {
      case 'assessment':
        setView({ type: 'project', projectId, tab: 'assessments' });
        break;
      case 'risk':
        setView({ type: 'project', projectId, tab: 'risks' });
        break;
      case 'vendor':
        if (task.metadata?.vendorId) {
          setView({ type: 'vendorDetail', projectId, vendorId: task.metadata.vendorId });
        } else {
          setView({ type: 'project', projectId, tab: 'vendors' });
        }
        break;
      case 'policy':
        setView({ type: 'project', projectId, tab: 'policies' });
        break;
      default:
        setView({ type: 'project', projectId, tab: 'assessments' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-600/30 bg-red-900/20';
      case 'high': return 'text-orange-400 border-orange-600/30 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 border-yellow-600/30 bg-yellow-900/20';
      case 'low': return 'text-blue-400 border-blue-600/30 bg-blue-900/20';
      default: return 'text-slate-400 border-slate-600/30 bg-slate-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority === 'all') return true;
    return task.priority === filterPriority;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    automatable: tasks.filter(t => t.automatable && t.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Workflow Engine</h2>
          <p className="text-slate-400">Automated task management and process optimization</p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={automationEnabled}
              onChange={(e) => setAutomationEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-300">Enable Automation</span>
          </label>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{taskStats.total}</div>
          <div className="text-xs text-slate-400">Total Tasks</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{taskStats.pending}</div>
          <div className="text-xs text-slate-400">Pending</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</div>
          <div className="text-xs text-slate-400">In Progress</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
          <div className="text-xs text-slate-400">Completed</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">{taskStats.overdue}</div>
          <div className="text-xs text-slate-400">Overdue</div>
        </div>
        <div className="glass-card p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">{taskStats.automatable}</div>
          <div className="text-xs text-slate-400">Automatable</div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.map(task => (
          <div
            key={task.id}
            className={`glass-card p-4 rounded-lg border ${getPriorityColor(task.priority)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.automatable && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-600 text-purple-100">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-2">{task.description}</p>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>Est: {task.estimatedTime}min</span>
                  {task.assignee && <span>Assigned: {task.assignee}</span>}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => navigateToRelatedView(task)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View Details →
              </button>

              <div className="flex space-x-2">
                {task.status === 'pending' && (
                  <>
                    {task.automatable && automationEnabled && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'automate')}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        Auto Execute
                      </button>
                    )}
                    <button
                      onClick={() => handleTaskAction(task.id, 'start')}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Start
                    </button>
                  </>
                )}

                {task.status === 'in_progress' && (
                  <button
                    onClick={() => handleTaskAction(task.id, 'complete')}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="text-center py-8 glass-card rounded-lg">
            <h3 className="text-lg font-semibold text-white">No workflow tasks</h3>
            <p className="text-slate-400 mt-1">
              {filterPriority === 'all'
                ? 'All tasks are completed or no issues detected.'
                : `No ${filterPriority} priority tasks found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowEngine;