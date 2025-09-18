import React, { useState } from 'react';
import type { Project, Risk, AssessmentItem } from '../../types';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowRightIcon } from '../ui/Icons';

interface ImprovementRoadmapWidgetProps {
  project: Project;
  risks: Risk[];
  assessmentItems: AssessmentItem[];
  onNavigate?: (tab: string) => void;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  phase: 'Now' | 'Next' | 'Later';
  framework: string;
  controlId: string;
  estimatedEffort: string;
  businessImpact: string;
  deadline?: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dependencies?: string[];
}

const ImprovementRoadmapWidget: React.FC<ImprovementRoadmapWidgetProps> = ({
  project,
  risks,
  assessmentItems,
  onNavigate
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'Now' | 'Next' | 'Later' | 'All'>('All');

  // Generate roadmap based on gap analysis
  const generateRoadmap = (): RoadmapItem[] => {
    const roadmapItems: RoadmapItem[] = [];

    // Critical gaps from assessments
    const criticalGaps = assessmentItems.filter(item =>
      item.status === 'Not Started' && item.criticality === 'Critical'
    );

    // High-priority risks
    const highRisks = risks.filter(risk =>
      risk.level === 'Critical' || risk.level === 'High'
    );

    // Phase 1 (Now): Critical security controls
    roadmapItems.push({
      id: 'access-control-impl',
      title: 'Implement Multi-Factor Authentication',
      description: 'Deploy MFA across all systems to address critical access control gaps',
      priority: 'Critical',
      phase: 'Now',
      framework: 'ISO 27001',
      controlId: 'A.9.4.2',
      estimatedEffort: '2-3 weeks',
      businessImpact: 'Reduces identity-related security incidents by 80%',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: criticalGaps.length > 0 ? 'Not Started' : 'In Progress'
    });

    roadmapItems.push({
      id: 'incident-response',
      title: 'Establish Incident Response Plan',
      description: 'Create and test comprehensive incident response procedures',
      priority: 'Critical',
      phase: 'Now',
      framework: 'NIST CSF',
      controlId: 'RS.RP-1',
      estimatedEffort: '3-4 weeks',
      businessImpact: 'Reduces incident response time by 60%',
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      status: 'Not Started'
    });

    roadmapItems.push({
      id: 'data-encryption',
      title: 'Implement Data Encryption at Rest',
      description: 'Encrypt sensitive data stored in databases and file systems',
      priority: 'High',
      phase: 'Now',
      framework: 'ISO 27001',
      controlId: 'A.10.1.1',
      estimatedEffort: '4-6 weeks',
      businessImpact: 'Protects against data breaches and meets compliance requirements',
      deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      status: 'Not Started'
    });

    // Phase 2 (Next): Enhanced controls and processes
    roadmapItems.push({
      id: 'vendor-assessment',
      title: 'Third-Party Risk Assessment Program',
      description: 'Implement comprehensive vendor security assessment process',
      priority: 'High',
      phase: 'Next',
      framework: 'SOC 2',
      controlId: 'CC6.7',
      estimatedEffort: '6-8 weeks',
      businessImpact: 'Reduces third-party risk exposure by 70%',
      deadline: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000),
      status: 'Not Started',
      dependencies: ['access-control-impl']
    });

    roadmapItems.push({
      id: 'security-monitoring',
      title: 'Deploy Security Information and Event Management (SIEM)',
      description: 'Implement continuous security monitoring and alerting',
      priority: 'High',
      phase: 'Next',
      framework: 'NIST CSF',
      controlId: 'DE.CM-1',
      estimatedEffort: '8-12 weeks',
      businessImpact: 'Enables real-time threat detection and response',
      deadline: new Date(Date.now() + 112 * 24 * 60 * 60 * 1000),
      status: 'Not Started',
      dependencies: ['incident-response']
    });

    roadmapItems.push({
      id: 'business-continuity',
      title: 'Business Continuity and Disaster Recovery',
      description: 'Develop and test comprehensive BC/DR procedures',
      priority: 'Medium',
      phase: 'Next',
      framework: 'ISO 27001',
      controlId: 'A.17.1.1',
      estimatedEffort: '6-10 weeks',
      businessImpact: 'Ensures business resilience and reduces downtime',
      deadline: new Date(Date.now() + 126 * 24 * 60 * 60 * 1000),
      status: 'Not Started'
    });

    // Phase 3 (Later): Advanced maturity and optimization
    roadmapItems.push({
      id: 'security-metrics',
      title: 'Security Metrics and KPI Dashboard',
      description: 'Implement comprehensive security performance measurement',
      priority: 'Medium',
      phase: 'Later',
      framework: 'NIST CSF',
      controlId: 'ID.GV-4',
      estimatedEffort: '4-6 weeks',
      businessImpact: 'Enables data-driven security decisions',
      deadline: new Date(Date.now() + 168 * 24 * 60 * 60 * 1000),
      status: 'Not Started',
      dependencies: ['security-monitoring']
    });

    roadmapItems.push({
      id: 'zero-trust',
      title: 'Zero Trust Architecture Implementation',
      description: 'Migrate to zero trust security model',
      priority: 'Medium',
      phase: 'Later',
      framework: 'NIST 800-207',
      controlId: 'ZT-1',
      estimatedEffort: '12-16 weeks',
      businessImpact: 'Reduces lateral movement and insider threats',
      deadline: new Date(Date.now() + 224 * 24 * 60 * 60 * 1000),
      status: 'Not Started',
      dependencies: ['security-monitoring', 'vendor-assessment']
    });

    roadmapItems.push({
      id: 'ai-security',
      title: 'AI/ML Security Framework',
      description: 'Implement security controls for AI and machine learning systems',
      priority: 'Low',
      phase: 'Later',
      framework: 'NIST AI RMF',
      controlId: 'AI.1.1',
      estimatedEffort: '8-10 weeks',
      businessImpact: 'Ensures responsible AI development and deployment',
      deadline: new Date(Date.now() + 252 * 24 * 60 * 60 * 1000),
      status: 'Not Started'
    });

    return roadmapItems;
  };

  const roadmapItems = generateRoadmap();
  const filteredItems = selectedPhase === 'All'
    ? roadmapItems
    : roadmapItems.filter(item => item.phase === selectedPhase);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'In Progress': return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  const getPhaseStats = () => {
    const now = roadmapItems.filter(item => item.phase === 'Now');
    const next = roadmapItems.filter(item => item.phase === 'Next');
    const later = roadmapItems.filter(item => item.phase === 'Later');

    return {
      now: { total: now.length, critical: now.filter(i => i.priority === 'Critical').length },
      next: { total: next.length, critical: next.filter(i => i.priority === 'Critical').length },
      later: { total: later.length, critical: later.filter(i => i.priority === 'Critical').length }
    };
  };

  const phaseStats = getPhaseStats();

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
            Security Improvement Roadmap
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Strategic plan based on gap analysis for {project.name}
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('assessments')}
          className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
        >
          View full assessment →
        </button>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-lg">
        {['All', 'Now', 'Next', 'Later'].map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPhase === phase
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {phase}
            {phase !== 'All' && (
              <span className="ml-2 text-xs bg-slate-600 px-2 py-1 rounded-full">
                {phaseStats[phase.toLowerCase() as keyof typeof phaseStats]?.total || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Roadmap Timeline */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-700/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      {item.phase}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>📋 {item.framework} {item.controlId}</span>
                      <span>⏱️ {item.estimatedEffort}</span>
                      {item.deadline && (
                        <span>📅 Due {item.deadline.toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="text-blue-300">💡 {item.businessImpact}</div>
                    {item.dependencies && (
                      <div className="text-yellow-300">
                        🔗 Depends on: {item.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-slate-400 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-slate-400">No items in this phase</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-red-400 font-bold text-lg">
              {phaseStats.now.critical}
            </div>
            <div className="text-slate-400">Critical (Now)</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">
              {phaseStats.next.total}
            </div>
            <div className="text-slate-400">Next Phase</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">
              {roadmapItems.length}
            </div>
            <div className="text-slate-400">Total Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementRoadmapWidget;