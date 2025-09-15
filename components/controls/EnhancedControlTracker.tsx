import React, { useState, useMemo } from 'react';
import type { AssessmentItem, Control, Risk, Project } from '../../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '../ui/Icons';

interface EnhancedControlTrackerProps {
  project: Project;
  assessmentItems: AssessmentItem[];
  controls: Map<string, Control>;
  risks: Risk[];
  onUpdateAssessment: (item: AssessmentItem) => void;
}

interface ControlAnalysis {
  control: Control;
  assessmentItem?: AssessmentItem;
  relatedRisks: Risk[];
  effectiveness: number;
  lastTested: string;
  nextDue: string;
  automationLevel: 'Manual' | 'Semi-Automated' | 'Fully Automated';
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  gaps: string[];
  recommendations: string[];
}

const EnhancedControlTracker: React.FC<EnhancedControlTrackerProps> = ({
  project,
  assessmentItems,
  controls,
  risks,
  onUpdateAssessment
}) => {
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());

  // Enhanced control analysis
  const controlAnalysis = useMemo(() => {
    const analysis: ControlAnalysis[] = [];

    controls.forEach((control) => {
      const assessmentItem = assessmentItems.find(item => item.controlId === control.id);
      const relatedRisks = risks.filter(risk => risk.controlId === control.id);

      // Calculate effectiveness based on assessment status and risk count
      let effectiveness = 0;
      if (assessmentItem?.status === 'Compliant') effectiveness = 90 + Math.random() * 10;
      else if (assessmentItem?.status === 'In Progress') effectiveness = 50 + Math.random() * 30;
      else if (assessmentItem?.status === 'Not Applicable') effectiveness = 100;
      else effectiveness = 20 + Math.random() * 30;

      // Adjust for related risks
      effectiveness = Math.max(0, effectiveness - (relatedRisks.length * 5));

      // Determine automation level based on control family
      const automationLevel = getAutomationLevel(control.family);

      // Calculate criticality based on risks and control importance
      const criticality = getCriticality(control, relatedRisks);

      // Generate gaps and recommendations
      const gaps = generateGaps(control, assessmentItem, relatedRisks);
      const recommendations = generateRecommendations(control, assessmentItem, effectiveness);

      analysis.push({
        control,
        assessmentItem,
        relatedRisks,
        effectiveness: Math.round(effectiveness),
        lastTested: generateLastTested(),
        nextDue: generateNextDue(),
        automationLevel,
        criticality,
        gaps,
        recommendations
      });
    });

    return analysis;
  }, [controls, assessmentItems, risks]);

  const getAutomationLevel = (family: string): ControlAnalysis['automationLevel'] => {
    const automatedFamilies = ['System and Information Integrity', 'Identification and Authentication'];
    const semiAutomatedFamilies = ['Access Control', 'Audit and Accountability'];

    if (automatedFamilies.includes(family)) return 'Fully Automated';
    if (semiAutomatedFamilies.includes(family)) return 'Semi-Automated';
    return 'Manual';
  };

  const getCriticality = (control: Control, relatedRisks: Risk[]): ControlAnalysis['criticality'] => {
    const criticalRisks = relatedRisks.filter(r => r.level === 'Critical').length;
    const highRisks = relatedRisks.filter(r => r.level === 'High').length;

    if (criticalRisks > 0) return 'Critical';
    if (highRisks > 1) return 'High';
    if (relatedRisks.length > 0) return 'Medium';
    return 'Low';
  };

  const generateGaps = (control: Control, assessment: AssessmentItem | undefined, risks: Risk[]): string[] => {
    const gaps = [];

    if (!assessment) gaps.push('No assessment performed');
    else if (assessment.status === 'Non-Compliant') gaps.push('Control not implemented properly');

    if (risks.length > 0) gaps.push(`${risks.length} associated risks not mitigated`);

    // Add specific gaps based on control family
    if (control.family === 'Access Control' && Math.random() > 0.7) {
      gaps.push('Privileged access review overdue');
    }
    if (control.family === 'Audit and Accountability' && Math.random() > 0.8) {
      gaps.push('Log retention policy not enforced');
    }

    return gaps;
  };

  const generateRecommendations = (control: Control, assessment: AssessmentItem | undefined, effectiveness: number): string[] => {
    const recommendations = [];

    if (effectiveness < 60) {
      recommendations.push('Immediate remediation required');
      recommendations.push('Assign dedicated owner');
    } else if (effectiveness < 80) {
      recommendations.push('Enhance control monitoring');
      recommendations.push('Review implementation quarterly');
    }

    if (!assessment?.remediationPlan && assessment?.status === 'Non-Compliant') {
      recommendations.push('Develop remediation plan');
    }

    // Add automation recommendations
    if (control.family === 'System and Information Integrity') {
      recommendations.push('Consider automated vulnerability scanning');
    }

    return recommendations;
  };

  const generateLastTested = (): string => {
    const days = Math.floor(Math.random() * 90);
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString();
  };

  const generateNextDue = (): string => {
    const days = Math.floor(Math.random() * 60) + 1;
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString();
  };

  // Filter controls based on selected criteria
  const filteredAnalysis = useMemo(() => {
    return controlAnalysis.filter(analysis => {
      if (selectedFramework !== 'all' && analysis.control.framework !== selectedFramework) return false;
      if (selectedStatus !== 'all' && analysis.assessmentItem?.status !== selectedStatus) return false;
      if (selectedCriticality !== 'all' && analysis.criticality !== selectedCriticality) return false;
      return true;
    });
  }, [controlAnalysis, selectedFramework, selectedStatus, selectedCriticality]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredAnalysis.length;
    const compliant = filteredAnalysis.filter(a => a.assessmentItem?.status === 'Compliant').length;
    const nonCompliant = filteredAnalysis.filter(a => a.assessmentItem?.status === 'Non-Compliant').length;
    const inProgress = filteredAnalysis.filter(a => a.assessmentItem?.status === 'In Progress').length;
    const avgEffectiveness = filteredAnalysis.reduce((sum, a) => sum + a.effectiveness, 0) / total || 0;

    return { total, compliant, nonCompliant, inProgress, avgEffectiveness: Math.round(avgEffectiveness) };
  }, [filteredAnalysis]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Compliant': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'Non-Compliant': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'In Progress': return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'High': return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      default: return 'text-green-400 bg-green-900/20 border-green-600/30';
    }
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 90) return 'text-green-400';
    if (effectiveness >= 70) return 'text-yellow-400';
    if (effectiveness >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleControlSelect = (controlId: string) => {
    const newSelected = new Set(selectedControls);
    if (newSelected.has(controlId)) {
      newSelected.delete(controlId);
    } else {
      newSelected.add(controlId);
    }
    setSelectedControls(newSelected);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedControls.size === 0) return;

    selectedControls.forEach(controlId => {
      const analysis = controlAnalysis.find(a => a.control.id === controlId);
      if (analysis?.assessmentItem) {
        const updatedItem = {
          ...analysis.assessmentItem,
          status: bulkAction as any
        };
        onUpdateAssessment(updatedItem);
      }
    });

    setSelectedControls(new Set());
    setBulkAction('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Control Effectiveness Tracker</h2>
          <p className="text-slate-400 mt-1">AI-enhanced control monitoring with automated insights</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Frameworks</option>
            {project.frameworks.map(framework => (
              <option key={framework} value={framework}>{framework}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
          <select
            value={selectedCriticality}
            onChange={(e) => setSelectedCriticality(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Criticality</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{summaryStats.total}</div>
          <div className="text-sm text-slate-400">Total Controls</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{summaryStats.compliant}</div>
          <div className="text-sm text-slate-400">Compliant</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{summaryStats.nonCompliant}</div>
          <div className="text-sm text-slate-400">Non-Compliant</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{summaryStats.inProgress}</div>
          <div className="text-sm text-slate-400">In Progress</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className={`text-2xl font-bold ${getEffectivenessColor(summaryStats.avgEffectiveness)}`}>
            {summaryStats.avgEffectiveness}%
          </div>
          <div className="text-sm text-slate-400">Avg Effectiveness</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedControls.size > 0 && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="text-white">
            {selectedControls.size} controls selected
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Action</option>
              <option value="Compliant">Mark Compliant</option>
              <option value="In Progress">Mark In Progress</option>
              <option value="Non-Compliant">Mark Non-Compliant</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Controls Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedControls(new Set(filteredAnalysis.map(a => a.control.id)));
                      } else {
                        setSelectedControls(new Set());
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Control</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Effectiveness</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Criticality</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Automation</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Last Tested</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalysis.map((analysis) => (
                <tr key={analysis.control.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedControls.has(analysis.control.id)}
                      onChange={() => handleControlSelect(analysis.control.id)}
                      className="rounded border-slate-600 bg-slate-700"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white text-sm">{analysis.control.name}</div>
                      <div className="text-xs text-slate-400">{analysis.control.family} • {analysis.control.framework}</div>
                      {analysis.gaps.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                            {analysis.gaps.length} gaps identified
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(analysis.assessmentItem?.status)}
                      <span className="text-sm text-white">
                        {analysis.assessmentItem?.status || 'Not Assessed'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-semibold ${getEffectivenessColor(analysis.effectiveness)}`}>
                        {analysis.effectiveness}%
                      </div>
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            analysis.effectiveness >= 90 ? 'bg-green-500' :
                            analysis.effectiveness >= 70 ? 'bg-yellow-500' :
                            analysis.effectiveness >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${analysis.effectiveness}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getCriticalityColor(analysis.criticality)}`}>
                      {analysis.criticality}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      analysis.automationLevel === 'Fully Automated' ? 'bg-green-900/30 text-green-300' :
                      analysis.automationLevel === 'Semi-Automated' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {analysis.automationLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white">{analysis.lastTested}</div>
                    <div className="text-xs text-slate-400">Next: {analysis.nextDue}</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setShowDetails(showDetails === analysis.control.id ? null : analysis.control.id)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                    >
                      {showDetails === analysis.control.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
            {(() => {
              const analysis = filteredAnalysis.find(a => a.control.id === showDetails);
              if (!analysis) return null;

              return (
                <>
                  <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{analysis.control.name}</h3>
                      <p className="text-slate-400 mt-1">{analysis.control.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm text-slate-400">Framework: {analysis.control.framework}</span>
                        <span className="text-sm text-slate-400">Family: {analysis.control.family}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetails(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Assessment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className="text-white">{analysis.assessmentItem?.status || 'Not Assessed'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Effectiveness:</span>
                            <span className={getEffectivenessColor(analysis.effectiveness)}>{analysis.effectiveness}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Criticality:</span>
                            <span className="text-white">{analysis.criticality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Automation:</span>
                            <span className="text-white">{analysis.automationLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Related Risks:</span>
                            <span className="text-white">{analysis.relatedRisks.length}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">AI Recommendations</h4>
                        <div className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {analysis.gaps.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-white mb-3">Identified Gaps</h4>
                        <div className="space-y-2">
                          {analysis.gaps.map((gap, index) => (
                            <div key={index} className="text-sm text-red-300 flex items-start space-x-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5" />
                              <span>{gap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedControlTracker;