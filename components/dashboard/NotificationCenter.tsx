import React, { useState, useMemo } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
  XMarkIcon,
  CogIcon,
  PlayIcon,
  PauseIcon
} from '../ui/Icons';

interface Notification {
  id: string;
  type: 'milestone' | 'deadline' | 'weekly_update' | 'assessment_due' | 'risk_alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  clientName?: string;
  projectName?: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'paused';
  recipients: string[];
  automatedRule?: string;
  lastSent?: Date;
}

interface AutomatedRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  template: string;
  isActive: boolean;
  clients: string[];
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  lastTriggered?: Date;
  successRate: number;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data - in a real app, this would come from your backend
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'SOC 2 Phase 2 Approaching',
    message: 'Gap Analysis phase completion is due in 3 days.',
    priority: 'high',
    clientName: 'TechCorp Inc',
    projectName: 'SOC 2 Compliance Project',
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
    recipients: ['john@techcorp.com', 'jane@techcorp.com'],
    automatedRule: 'Milestone Reminder - 3 days before'
  },
  {
    id: '2',
    type: 'weekly_update',
    title: 'Weekly Progress Report',
    message: 'Automated weekly update for all active projects.',
    priority: 'medium',
    scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    status: 'pending',
    recipients: ['multiple'],
    automatedRule: 'Weekly Updates - Every Monday'
  },
  {
    id: '3',
    type: 'risk_alert',
    title: 'Critical Risk Identified',
    message: 'New critical risk detected in MedTech ISO 27001 assessment.',
    priority: 'critical',
    clientName: 'MedTech Solutions',
    projectName: 'ISO 27001 Implementation',
    scheduledFor: new Date(),
    status: 'sent',
    recipients: ['security@medtech.com'],
    lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
];

const mockAutomatedRules: AutomatedRule[] = [
  {
    id: '1',
    name: 'Milestone Reminders',
    description: 'Send reminders 7 days before major milestones',
    trigger: 'milestone_approaching',
    template: 'Your {milestone} is scheduled for {date}. Please prepare accordingly.',
    isActive: true,
    clients: ['all'],
    frequency: 'once',
    lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    successRate: 95
  },
  {
    id: '2',
    name: 'Weekly Progress Reports',
    description: 'Automated weekly progress updates to all clients',
    trigger: 'weekly_schedule',
    template: 'Here\'s your weekly progress update for {project}...',
    isActive: true,
    clients: ['all'],
    frequency: 'weekly',
    lastTriggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    successRate: 98
  },
  {
    id: '3',
    name: 'Risk Alerts',
    description: 'Immediate alerts for critical and high risks',
    trigger: 'risk_level_critical',
    template: 'ALERT: Critical risk identified - {risk_title}. Immediate action required.',
    isActive: true,
    clients: ['all'],
    frequency: 'once',
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    successRate: 100
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-400 bg-red-900/20';
    case 'high': return 'text-orange-400 bg-orange-900/20';
    case 'medium': return 'text-yellow-400 bg-yellow-900/20';
    case 'low': return 'text-blue-400 bg-blue-900/20';
    default: return 'text-slate-400 bg-slate-900/20';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'failed': return 'text-red-400';
    case 'paused': return 'text-slate-400';
    default: return 'text-slate-400';
  }
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'automation'>('notifications');
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [automatedRules, setAutomatedRules] = useState(mockAutomatedRules);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => filter === 'all' || n.status === filter);
  }, [notifications, filter]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      pending: notifications.filter(n => n.status === 'pending').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      critical: notifications.filter(n => n.priority === 'critical').length
    };
  }, [notifications]);

  const toggleRule = (ruleId: string) => {
    setAutomatedRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BellIcon className="w-6 h-6 mr-3 text-blue-400" />
              Notification Center
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage automated client communications and alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 transition-colors ${
              activeTab === 'notifications'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Notifications ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`px-6 py-3 transition-colors ${
              activeTab === 'automation'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Automation Rules ({automatedRules.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {activeTab === 'notifications' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-slate-400">Total</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.sent}</div>
                  <div className="text-xs text-slate-400">Sent</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                  <div className="text-xs text-slate-400">Failed</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  {['all', 'pending', 'sent', 'failed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilter(status as any)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        filter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <div key={notification.id} className="glass-card p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className={`text-xs ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                        {notification.clientName && (
                          <div className="text-xs text-slate-400">
                            Client: {notification.clientName} • Project: {notification.projectName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {notification.scheduledFor.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {notification.recipients.length} recipients
                        </div>
                      </div>
                      {notification.automatedRule && (
                        <div className="text-xs text-blue-400">
                          {notification.automatedRule}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Automated Rules</h3>
                <p className="text-slate-400 text-sm">
                  Configure automated notifications to keep your clients informed throughout their compliance journey.
                </p>
              </div>

              <div className="space-y-4">
                {automatedRules.map(rule => (
                  <div key={rule.id} className="glass-card p-6 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white">{rule.name}</h3>
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              rule.isActive
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-slate-600/20 text-slate-400'
                            }`}
                          >
                            {rule.isActive ? (
                              <PlayIcon className="w-3 h-3" />
                            ) : (
                              <PauseIcon className="w-3 h-3" />
                            )}
                            <span>{rule.isActive ? 'Active' : 'Paused'}</span>
                          </button>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{rule.description}</p>
                        <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded font-mono">
                          {rule.template}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="font-semibold text-white">{rule.frequency}</div>
                        <div className="text-xs text-slate-400">Frequency</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-400">{rule.successRate}%</div>
                        <div className="text-xs text-slate-400">Success Rate</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-400">{rule.clients.length}</div>
                        <div className="text-xs text-slate-400">Clients</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-300">
                          {rule.lastTriggered ? rule.lastTriggered.toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-slate-400">Last Triggered</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;