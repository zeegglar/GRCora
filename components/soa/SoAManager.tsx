import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, DocumentTextIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '../ui/Icons';
import type { SoAEntry, Control, ProjectEnhanced } from '../../types/comprehensive';

interface SoAManagerProps {
  project: ProjectEnhanced;
  onBack: () => void;
}

interface SoAWorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  controls_count?: number;
}

const SoAManager: React.FC<SoAManagerProps> = ({ project, onBack }) => {
  const [soaEntries, setSoaEntries] = useState<SoAEntry[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('control_selection');
  const [selectedFramework, setSelectedFramework] = useState<string>(project.frameworks[0] || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // SoA workflow steps
  const workflowSteps: SoAWorkflowStep[] = [
    {
      id: 'control_selection',
      title: 'Control Selection',
      description: 'Determine applicability for each control',
      status: soaEntries.length === 0 ? 'pending' : 'completed',
      controls_count: controls.length
    },
    {
      id: 'justification',
      title: 'Justification & Implementation',
      description: 'Provide justifications and implementation statements',
      status: soaEntries.filter(e => !e.justification).length === 0 ? 'completed' : 'in_progress'
    },
    {
      id: 'review',
      title: 'Review & Approval',
      description: 'Management review and approval workflow',
      status: soaEntries.filter(e => e.status === 'approved').length === soaEntries.length ? 'completed' : 'pending'
    },
    {
      id: 'export',
      title: 'Document Generation',
      description: 'Generate ISO 27001 compliant SoA document',
      status: 'pending'
    }
  ];

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const mockControls: Control[] = [
      { id: 'ISO-A.5.1', name: 'Policies for information security', description: 'Management direction and support for information security', family: 'Organizational', framework: 'ISO 27001:2022' },
      { id: 'ISO-A.5.2', name: 'Information security roles and responsibilities', description: 'Information security roles and responsibilities are defined and allocated', family: 'Organizational', framework: 'ISO 27001:2022' },
      { id: 'ISO-A.5.15', name: 'Access control', description: 'Access to information and other associated assets should be managed', family: 'Access Control', framework: 'ISO 27001:2022' },
      { id: 'ISO-A.5.16', name: 'Identity management', description: 'The full life cycle of identities should be managed', family: 'Access Control', framework: 'ISO 27001:2022' },
      { id: 'ISO-A.8.1', name: 'User endpoint devices', description: 'Information stored on, processed by or accessible via user endpoint devices should be protected', family: 'Technology', framework: 'ISO 27001:2022' },
    ];

    const mockSoAEntries: SoAEntry[] = [
      {
        id: 'soa-1',
        project_id: project.id,
        control_id: 'ISO-A.5.1',
        applicability: 'applicable',
        inclusion: 'included',
        justification: 'Organization processes sensitive data requiring comprehensive information security policies per regulatory requirements.',
        implementation_statement: 'Information security policy established and approved by executive management. Policy covers all organizational processes and is reviewed annually.',
        evidence_references: ['policy_doc_001', 'board_approval_001'],
        status: 'approved',
        version: '1.0',
        approved_by: 'user-ciso-001',
        approved_at: new Date('2024-03-15'),
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-15')
      },
      {
        id: 'soa-2',
        project_id: project.id,
        control_id: 'ISO-A.5.15',
        applicability: 'applicable',
        inclusion: 'included',
        justification: 'Access control is fundamental to protecting sensitive organizational data and systems.',
        implementation_statement: 'Role-based access control implemented through Active Directory. Quarterly access reviews conducted by department managers.',
        evidence_references: ['access_policy_001', 'review_results_q1'],
        status: 'review',
        version: '1.0',
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-10')
      },
      {
        id: 'soa-3',
        project_id: project.id,
        control_id: 'ISO-A.8.1',
        applicability: 'not_applicable',
        inclusion: 'excluded',
        justification: 'Organization operates entirely in cloud environment with no user endpoint devices under organizational control. All access is through managed cloud services.',
        status: 'draft',
        version: '1.0',
        created_at: new Date('2024-03-01'),
        updated_at: new Date('2024-03-01')
      }
    ];

    setControls(mockControls);
    setSoaEntries(mockSoAEntries);
  }, [project.id]);

  // Filter controls based on selected framework
  const filteredControls = useMemo(() => {
    let filtered = controls;
    if (selectedFramework !== 'all') {
      filtered = filtered.filter(c => c.framework === selectedFramework);
    }
    return filtered;
  }, [controls, selectedFramework]);

  // Filter SoA entries based on status
  const filteredSoAEntries = useMemo(() => {
    let filtered = soaEntries;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }
    return filtered;
  }, [soaEntries, filterStatus]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = soaEntries.length;
    const applicable = soaEntries.filter(e => e.applicability === 'applicable').length;
    const included = soaEntries.filter(e => e.inclusion === 'included').length;
    const approved = soaEntries.filter(e => e.status === 'approved').length;
    const pending_review = soaEntries.filter(e => e.status === 'review').length;

    return { total, applicable, included, approved, pending_review };
  }, [soaEntries]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'review': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'draft': return <DocumentTextIcon className="w-5 h-5 text-slate-400" />;
      default: return <XCircleIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const getApplicabilityBadge = (applicability: string, inclusion: string) => {
    if (applicability === 'applicable' && inclusion === 'included') {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-900/30 text-green-300 border border-green-600/30 rounded">Included</span>;
    } else if (applicability === 'applicable' && inclusion === 'excluded') {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-900/30 text-yellow-300 border border-yellow-600/30 rounded">Applicable - Excluded</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600 rounded">Not Applicable</span>;
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedControls.size === 0) return;

    // In real implementation, this would call API
    console.log(`Applying ${bulkAction} to ${selectedControls.size} controls`);
    setSelectedControls(new Set());
    setBulkAction('');
  };

  const handleApproveEntry = (entryId: string) => {
    setSoaEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, status: 'approved' as const, approved_at: new Date(), approved_by: 'current-user-id' }
        : entry
    ));
  };

  const handleExportSoA = () => {
    setLoading(true);
    // In real implementation, generate ISO 27001 compliant SoA document
    setTimeout(() => {
      setLoading(false);
      alert('SoA document generated successfully!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Statement of Applicability</h1>
              <p className="text-slate-400">{project.name} - ISO 27001 SoA Management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportSoA}
            disabled={loading || summaryStats.approved < summaryStats.total}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>{loading ? 'Generating...' : 'Export SoA'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">SoA Development Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                currentStep === step.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : step.status === 'completed'
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-slate-600 bg-slate-800/50'
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-600 text-white' :
                  step.status === 'in_progress' ? 'bg-yellow-600 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{step.title}</div>
                  <div className="text-xs text-slate-400">{step.description}</div>
                  {step.controls_count && (
                    <div className="text-xs text-blue-400 mt-1">{step.controls_count} controls</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{summaryStats.total}</div>
          <div className="text-sm text-slate-400">Total Controls</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{summaryStats.applicable}</div>
          <div className="text-sm text-slate-400">Applicable</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{summaryStats.included}</div>
          <div className="text-sm text-slate-400">Included</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{summaryStats.approved}</div>
          <div className="text-sm text-slate-400">Approved</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{summaryStats.pending_review}</div>
          <div className="text-sm text-slate-400">Pending Review</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {selectedControls.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm">{selectedControls.size} selected</span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Action</option>
                <option value="applicable">Mark Applicable</option>
                <option value="not_applicable">Mark Not Applicable</option>
                <option value="included">Include in SoA</option>
                <option value="excluded">Exclude from SoA</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SoA Entries Table */}
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
                        setSelectedControls(new Set(filteredSoAEntries.map(e => e.control_id)));
                      } else {
                        setSelectedControls(new Set());
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Control</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Applicability</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Justification</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSoAEntries.map((entry) => {
                const control = controls.find(c => c.id === entry.control_id);
                return (
                  <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedControls.has(entry.control_id)}
                        onChange={() => {
                          const newSelected = new Set(selectedControls);
                          if (newSelected.has(entry.control_id)) {
                            newSelected.delete(entry.control_id);
                          } else {
                            newSelected.add(entry.control_id);
                          }
                          setSelectedControls(newSelected);
                        }}
                        className="rounded border-slate-600 bg-slate-700"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white text-sm">{control?.name || entry.control_id}</div>
                        <div className="text-xs text-slate-400">{entry.control_id} • {control?.family}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getApplicabilityBadge(entry.applicability, entry.inclusion)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(entry.status)}
                        <span className="text-sm text-white capitalize">{entry.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-300 max-w-md truncate">
                        {entry.justification || 'No justification provided'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDetails(showDetails === entry.id ? null : entry.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                        >
                          {showDetails === entry.id ? 'Hide' : 'Details'}
                        </button>
                        {entry.status === 'review' && (
                          <button
                            onClick={() => handleApproveEntry(entry.id)}
                            className="text-green-400 hover:text-green-300 text-xs font-semibold"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
            {(() => {
              const entry = soaEntries.find(e => e.id === showDetails);
              const control = controls.find(c => c.id === entry?.control_id);
              if (!entry || !control) return null;

              return (
                <>
                  <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{control.name}</h3>
                      <p className="text-slate-400 mt-1">{control.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm text-slate-400">Control: {entry.control_id}</span>
                        <span className="text-sm text-slate-400">Family: {control.family}</span>
                        <span className="text-sm text-slate-400">Version: {entry.version}</span>
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
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Applicability Decision</h4>
                        <div className="flex items-center space-x-4">
                          {getApplicabilityBadge(entry.applicability, entry.inclusion)}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Justification</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {entry.justification}
                        </p>
                      </div>

                      {entry.implementation_statement && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Implementation Statement</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {entry.implementation_statement}
                          </p>
                        </div>
                      )}

                      {entry.planned_implementation && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Planned Implementation</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {entry.planned_implementation}
                          </p>
                        </div>
                      )}

                      {entry.evidence_references.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Evidence References</h4>
                          <div className="space-y-1">
                            {entry.evidence_references.map((ref, index) => (
                              <div key={index} className="text-sm text-blue-400">
                                • {ref}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-white mb-2">Approval Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className="text-white capitalize">{entry.status}</span>
                          </div>
                          {entry.approved_by && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Approved By:</span>
                              <span className="text-white">{entry.approved_by}</span>
                            </div>
                          )}
                          {entry.approved_at && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Approved Date:</span>
                              <span className="text-white">{entry.approved_at.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

export default SoAManager;