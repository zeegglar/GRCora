import React, { useState, useEffect, useMemo } from 'react';
import type { User, Project, AssessmentItem, Risk } from '../../types';
import {
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  SparklesIcon,
  TrendingUpIcon,
  ArrowPathIcon
} from '../ui/Icons';
import { nistKnowledgeService } from '../../services/nistKnowledgeService';

interface ClientDashboardProps {
  user: User;
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  onNavigate?: (tab: string) => void;
}

interface ProjectFinancials {
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  currentMonthSpend: number;
  projectedTotal: number;
  costPerCompliance: number;
}

interface ConsultantActivity {
  consultantName: string;
  currentTask: string;
  hoursToday: number;
  hoursThisWeek: number;
  lastActivity: string;
  efficiency: number;
}

interface PendingApproval {
  id: string;
  type: 'document' | 'scope_change' | 'budget_change' | 'deliverable';
  title: string;
  description: string;
  requestedBy: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Milestone {
  id: string;
  name: string;
  targetDate: Date;
  completionPercentage: number;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string[];
}

interface ClientCommunication {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: Date;
  isRead: boolean;
  requiresResponse: boolean;
  type: 'message' | 'notification' | 'approval_request' | 'status_update';
}

const EnhancedClientCollaborationDashboard: React.FC<ClientDashboardProps> = ({
  user,
  project,
  assessmentItems,
  risks,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'communications' | 'approvals' | 'ai-assistant'>('overview');
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [consultantActivity, setConsultantActivity] = useState<ConsultantActivity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [communications, setCommunications] = useState<ClientCommunication[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [project.id]);

  const fetchDashboardData = async () => {
    // Mock data - in real implementation, fetch from Supabase
    setFinancials({
      totalBudget: 150000,
      spentAmount: 67500,
      remainingBudget: 82500,
      currentMonthSpend: 12500,
      projectedTotal: 145000,
      costPerCompliance: 1875 // Total spend / compliance percentage
    });

    setConsultantActivity([
      {
        consultantName: 'Sarah Chen, CISSP',
        currentTask: 'SOC 2 Control Implementation Review',
        hoursToday: 6.5,
        hoursThisWeek: 32,
        lastActivity: '15 minutes ago',
        efficiency: 95
      },
      {
        consultantName: 'Michael Torres, CISA',
        currentTask: 'Risk Assessment Documentation',
        hoursToday: 4.0,
        hoursThisWeek: 28,
        lastActivity: '2 hours ago',
        efficiency: 92
      }
    ]);

    setPendingApprovals([
      {
        id: '1',
        type: 'document',
        title: 'Information Security Policy v2.1',
        description: 'Updated policy reflecting new cloud security controls',
        requestedBy: 'Sarah Chen',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        id: '2',
        type: 'scope_change',
        title: 'Additional PCI DSS Assessment',
        description: 'Client requested adding PCI DSS to scope for payment processing',
        requestedBy: 'Michael Torres',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      }
    ]);

    setMilestones([
      {
        id: '1',
        name: 'Gap Analysis Complete',
        targetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completionPercentage: 100,
        status: 'completed',
        deliverables: ['Gap Analysis Report', 'Remediation Plan']
      },
      {
        id: '2',
        name: 'Policy Framework Implementation',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completionPercentage: 65,
        status: 'in_progress',
        deliverables: ['Security Policies', 'Procedure Documents', 'Training Materials']
      },
      {
        id: '3',
        name: 'Pre-Audit Assessment',
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        completionPercentage: 0,
        status: 'planned',
        deliverables: ['Readiness Assessment', 'Audit Preparation Guide']
      }
    ]);

    setCommunications([
      {
        id: '1',
        from: 'Sarah Chen',
        subject: 'Weekly Status Update - SOC 2 Progress',
        preview: 'Great progress this week! We\'ve completed 12 additional controls...',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        requiresResponse: false,
        type: 'status_update'
      },
      {
        id: '2',
        from: 'System Notification',
        subject: 'Document Approval Required',
        preview: 'Your approval is needed for the Information Security Policy...',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
        requiresResponse: true,
        type: 'approval_request'
      }
    ]);
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsQueryLoading(true);
    try {
      const result = await nistKnowledgeService.queryControls(aiQuery, ['NIST_CSF', 'NIST_800_53'], 5);
      setAiResponse(result.suggestedImplementation || 'No specific guidance found for this query.');
    } catch (error) {
      setAiResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const complianceProgress = useMemo(() => {
    const total = assessmentItems.length;
    if (total === 0) return 0;
    const compliant = assessmentItems.filter(i => i.status === 'Compliant').length;
    return Math.round((compliant / total) * 100);
  }, [assessmentItems]);

  const riskSummary = useMemo(() => {
    const openRisks = risks.filter(r => r.status === 'Open');
    return {
      total: openRisks.length,
      critical: openRisks.filter(r => r.level === 'CRITICAL').length,
      high: openRisks.filter(r => r.level === 'HIGH').length
    };
  }, [risks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in_progress': return 'text-blue-400 bg-blue-900/20';
      case 'delayed': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 border-red-500/50 bg-red-900/20';
      case 'high': return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
      default: return 'text-blue-400 border-blue-500/50 bg-blue-900/20';
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Compliance Journey</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, {user.name}. Here's your real-time project status and collaboration center.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{complianceProgress}%</div>
              <div className="text-sm text-slate-400">Complete</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'progress', name: 'Progress', icon: TrendingUpIcon },
            { id: 'communications', name: 'Messages', icon: ChatBubbleLeftRightIcon, badge: communications.filter(c => !c.isRead).length },
            { id: 'approvals', name: 'Approvals', icon: CheckCircleIcon, badge: pendingApprovals.length },
            { id: 'ai-assistant', name: 'AI Assistant', icon: SparklesIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Transparency */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <DollarSignIcon className="w-6 h-6 mr-2 text-green-400" />
                Project Investment & ROI
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${financials?.totalBudget.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">${financials?.spentAmount.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Invested</div>
                <div className="text-xs text-green-400">On track</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${financials?.remainingBudget.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">${financials?.costPerCompliance.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Cost per % Complete</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Budget Utilization</span>
                <span>{Math.round(((financials?.spentAmount || 0) / (financials?.totalBudget || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((financials?.spentAmount || 0) / (financials?.totalBudget || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Live Consultant Activity */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <UsersIcon className="w-6 h-6 mr-2 text-blue-400" />
                Your Consultant Team - Live Activity
              </h2>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                Live
              </div>
            </div>

            <div className="space-y-4">
              {consultantActivity.map((consultant, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {consultant.consultantName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{consultant.consultantName}</div>
                      <div className="text-sm text-slate-400">{consultant.currentTask}</div>
                      <div className="text-xs text-green-400">Active {consultant.lastActivity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{consultant.hoursToday}h today</div>
                    <div className="text-xs text-slate-400">{consultant.hoursThisWeek}h this week</div>
                    <div className="text-xs text-green-400">{consultant.efficiency}% efficiency</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{complianceProgress}%</div>
              <div className="text-slate-400">Compliance Complete</div>
              <div className="text-xs text-green-400 mt-1">↗ +12% this month</div>
            </div>

            <div className="glass-card p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{riskSummary.critical + riskSummary.high}</div>
              <div className="text-slate-400">Priority Risks</div>
              <div className="text-xs text-red-400 mt-1">{riskSummary.critical} critical</div>
            </div>

            <div className="glass-card p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
              </div>
              <div className="text-slate-400">Milestones</div>
              <div className="text-xs text-blue-400 mt-1">On schedule</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Project Milestones</h2>
            <div className="space-y-4">
              {milestones.map(milestone => (
                <div key={milestone.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{milestone.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                      {milestone.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{milestone.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-500'
                        }`}
                        style={{ width: `${milestone.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-slate-400 mb-1">Target: {milestone.targetDate.toLocaleDateString()}</div>
                    <div className="text-slate-400">Deliverables: {milestone.deliverables.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Communications</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                New Message
              </button>
            </div>

            <div className="space-y-3">
              {communications.map(comm => (
                <div key={comm.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  comm.isRead ? 'border-slate-700 bg-slate-800/50' : 'border-blue-500/50 bg-blue-900/10'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{comm.subject}</h3>
                      {!comm.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                      {comm.requiresResponse && <div className="px-2 py-1 bg-orange-600/20 text-orange-400 text-xs rounded">Response Required</div>}
                    </div>
                    <div className="text-xs text-slate-400">{comm.timestamp.toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-slate-400 mb-2">From: {comm.from}</div>
                  <div className="text-sm text-slate-300">{comm.preview}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Pending Your Approval</h2>

            <div className="space-y-4">
              {pendingApprovals.map(approval => (
                <div key={approval.id} className={`p-4 border rounded-lg ${getPriorityColor(approval.priority)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{approval.title}</h3>
                      <p className="text-sm text-slate-300">{approval.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-current/20 text-current text-xs rounded capitalize">
                      {approval.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      Requested by {approval.requestedBy} • Due {approval.deadline.toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30">
                        <ThumbsUpIcon className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                        <ThumbsDownIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/30">
                        <EyeIcon className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-6 h-6 mr-2 text-purple-400" />
              <h2 className="text-xl font-bold text-white">AI Compliance Assistant</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Ask questions about NIST frameworks, compliance requirements, or get implementation guidance.
            </p>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about compliance requirements, NIST controls, or implementation guidance..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                />
                <button
                  onClick={handleAiQuery}
                  disabled={isQueryLoading || !aiQuery.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isQueryLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <SparklesIcon className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="font-medium text-white">AI Assistant Response:</span>
                  </div>
                  <div className="text-slate-300 whitespace-pre-wrap">{aiResponse}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => setAiQuery('What are the key NIST CSF categories for cybersecurity?')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-white text-sm">NIST CSF Categories</div>
                  <div className="text-xs text-slate-400">Learn about cybersecurity framework structure</div>
                </button>

                <button
                  onClick={() => setAiQuery('How do I implement access controls for SOC 2 compliance?')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-white text-sm">SOC 2 Access Controls</div>
                  <div className="text-xs text-slate-400">Implementation guidance for access management</div>
                </button>

                <button
                  onClick={() => setAiQuery('What are the requirements for incident response planning?')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-white text-sm">Incident Response</div>
                  <div className="text-xs text-slate-400">Planning and implementation requirements</div>
                </button>

                <button
                  onClick={() => setAiQuery('How can AI governance frameworks help with compliance?')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-white text-sm">AI Governance</div>
                  <div className="text-xs text-slate-400">NIST AI RMF and compliance considerations</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedClientCollaborationDashboard;