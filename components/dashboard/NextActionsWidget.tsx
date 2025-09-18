import React from 'react';
import type { Project, AssessmentItem, Risk } from '../../types';
import { ClockIcon, ExclamationTriangleIcon, DocumentTextIcon, CheckCircleIcon } from '../ui/Icons';

interface NextActionsWidgetProps {
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
  onNavigate?: (tab: string) => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'evidence' | 'policy' | 'risk' | 'assessment';
  dueDate?: Date;
  estimatedTime: string;
  onClick: () => void;
}

const NextActionsWidget: React.FC<NextActionsWidgetProps> = ({
  project,
  assessmentItems,
  risks,
  onNavigate
}) => {
  // Generate smart action items based on current state
  const generateActionItems = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    // High priority overdue items
    const overdueAssessments = assessmentItems.filter(item =>
      item.status === 'Not Started' || item.status === 'In Progress'
    ).slice(0, 2);

    overdueAssessments.forEach((item, index) => {
      actions.push({
        id: `assessment-${item.id}`,
        title: `Complete ${item.controlId} Assessment`,
        description: `Review and implement access control requirements for your organization`,
        priority: 'high',
        category: 'assessment',
        dueDate: new Date(Date.now() + (7 - index) * 24 * 60 * 60 * 1000),
        estimatedTime: '30 minutes',
        onClick: () => onNavigate?.('assessments')
      });
    });

    // High priority risks
    const criticalRisks = risks.filter(risk =>
      risk.level === 'Critical' || risk.level === 'High'
    ).slice(0, 1);

    criticalRisks.forEach(risk => {
      actions.push({
        id: `risk-${risk.id}`,
        title: `Address Critical Security Risk`,
        description: `Take action on "${risk.title}" - this requires immediate attention`,
        priority: 'high',
        category: 'risk',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedTime: '2 hours',
        onClick: () => onNavigate?.('risks')
      });
    });

    // Evidence upload reminders
    if (actions.length < 3) {
      actions.push({
        id: 'evidence-upload',
        title: 'Upload Security Documentation',
        description: 'Provide evidence of your current security controls and policies',
        priority: 'medium',
        category: 'evidence',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedTime: '15 minutes',
        onClick: () => onNavigate?.('evidence')
      });
    }

    // Policy review
    if (actions.length < 3) {
      actions.push({
        id: 'policy-review',
        title: 'Review Draft Security Policy',
        description: 'Your consultant has prepared a custom security policy for review',
        priority: 'medium',
        category: 'policy',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        estimatedTime: '45 minutes',
        onClick: () => onNavigate?.('policies')
      });
    }

    return actions.slice(0, 3);
  };

  const actionItems = generateActionItems();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'evidence': return <DocumentTextIcon className="h-5 w-5" />;
      case 'policy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'risk': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'assessment': return <CheckCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Your Next 3 Actions</h3>
          <p className="text-slate-400 text-sm mt-1">Priority tasks to keep your compliance on track</p>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-slate-300">Updated just now</span>
        </div>
      </div>

      <div className="space-y-4">
        {actionItems.map((action, index) => (
          <div
            key={action.id}
            onClick={action.onClick}
            className="group cursor-pointer p-4 rounded-lg border bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                action.onClick();
              }
            }}
            aria-label={`Action ${index + 1}: ${action.title}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getPriorityColor(action.priority)}`}>
                  {getCategoryIcon(action.category)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {action.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(action.priority)}`}>
                    {action.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  {action.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{action.estimatedTime}</span>
                    </span>
                    {action.dueDate && (
                      <span className={`font-medium ${
                        action.dueDate < new Date() ? 'text-red-400' :
                        action.dueDate.getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 ? 'text-yellow-400' :
                        'text-slate-400'
                      }`}>
                        {formatDueDate(action.dueDate)}
                      </span>
                    )}
                  </div>

                  <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                    Click to start →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {actionItems.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">All caught up!</h4>
          <p className="text-slate-400 text-sm">
            Great work! No immediate actions required. Check back later for updates.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Your compliance progress is on track
          </span>
          <button
            onClick={() => onNavigate?.('assessments')}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View all tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextActionsWidget;