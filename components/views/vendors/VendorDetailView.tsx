
import React, { useState, useEffect } from 'react';
import type { Vendor, View, VendorRiskAssessment, VendorDueDiligence, VendorContract, VendorPerformanceMetric, VendorIncident, VendorCertification } from '../../../types';
import { VendorLifecycleStage, VendorCriticality, DueDiligenceStatus } from '../../../types';
import { mockApi } from '../../../services/api';
import { CheckCircleIcon } from '../../ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface VendorDetailViewProps {
  vendorId: string;
  projectId: string;
  setView: (view: View) => void;
}

const lifecycleStages = [
    VendorLifecycleStage.IDENTIFICATION,
    VendorLifecycleStage.ONBOARDING,
    VendorLifecycleStage.ACTIVE,
    VendorLifecycleStage.OFFBOARDING,
];

const lifecycleDescriptions: Record<VendorLifecycleStage, string> = {
    [VendorLifecycleStage.IDENTIFICATION]: "Initial identification and business case for the vendor relationship.",
    [VendorLifecycleStage.ONBOARDING]: "Due diligence, risk assessment, and contract negotiation.",
    [VendorLifecycleStage.ACTIVE]: "Ongoing monitoring, performance reviews, and continuous risk assessment.",
    [VendorLifecycleStage.OFFBOARDING]: "Secure termination of access, data return/destruction, and final contract review.",
}

const VendorDetailView: React.FC<VendorDetailViewProps> = ({ vendorId, projectId, setView }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'contracts' | 'performance' | 'incidents' | 'due-diligence'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [riskAssessments, setRiskAssessments] = useState<VendorRiskAssessment[]>([]);
  const [dueDiligence, setDueDiligence] = useState<VendorDueDiligence[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<VendorPerformanceMetric[]>([]);
  const [incidents, setIncidents] = useState<VendorIncident[]>([]);
  const [certifications, setCertifications] = useState<VendorCertification[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchVendorData = async () => {
      setIsLoading(true);
      try {
        const [vendorData, riskData, dueDiligenceData, contractData, performanceData, incidentData, certData] = await Promise.all([
          mockApi.getVendorById(vendorId),
          mockApi.getVendorRiskAssessments(vendorId),
          mockApi.getVendorDueDiligence(vendorId),
          mockApi.getVendorContracts(vendorId),
          mockApi.getVendorPerformanceMetrics(vendorId),
          mockApi.getVendorIncidents(vendorId),
          mockApi.getVendorCertifications(vendorId)
        ]);

        setVendor(vendorData || null);
        setRiskAssessments(riskData);
        setDueDiligence(dueDiligenceData);
        setContracts(contractData);
        setPerformanceMetrics(performanceData);
        setIncidents(incidentData);
        setCertifications(certData);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        addNotification('Failed to load vendor data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendorData();
  }, [vendorId, addNotification]);

  const handleAdvanceStage = async () => {
      if (!vendor) return;
      try {
        const currentIndex = lifecycleStages.indexOf(vendor.status);
        if (currentIndex < lifecycleStages.length - 1) {
            const nextStage = lifecycleStages[currentIndex + 1];
            const updatedVendor = await mockApi.updateVendorLifecycleStage(vendor.id, nextStage);
            setVendor(updatedVendor);
            addNotification(`Vendor ${vendor.name} advanced to ${nextStage} stage`, 'success');
        }
      } catch (error) {
        console.error('Error advancing vendor stage:', error);
        addNotification('Failed to advance vendor stage', 'error');
      }
  }

  const getRiskLevelColor = (level: VendorCriticality) => {
    switch (level) {
      case VendorCriticality.LOW: return 'text-green-400';
      case VendorCriticality.MEDIUM: return 'text-yellow-400';
      case VendorCriticality.HIGH: return 'text-orange-400';
      case VendorCriticality.CRITICAL: return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-red-400';
      case 'resolved': case 'completed': case 'approved': return 'text-green-400';
      case 'in progress': case 'investigating': return 'text-yellow-400';
      case 'closed': return 'text-slate-400';
      default: return 'text-blue-400';
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading vendor details...</div>;
  }

  if (!vendor) {
    return <div className="p-8">Vendor not found.</div>;
  }
  
  const currentStageIndex = lifecycleStages.indexOf(vendor.status);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
            <button onClick={() => setView({ type: 'project', projectId, tab: 'vendors' })} className="text-sm text-blue-400 hover:underline mb-2">
            &larr; Back to Vendors
            </button>
            <h1 className="text-4xl font-bold text-white">{vendor.name}</h1>
            <p className="text-slate-400 mt-1">{vendor.serviceCategory}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(vendor.riskLevel)} bg-slate-800`}>
                {vendor.riskLevel} Risk
              </span>
              <span className="text-slate-400 text-sm">Tier {vendor.tier}</span>
              <span className="text-slate-400 text-sm">Score: {vendor.overallRiskScore}/100</span>
            </div>
        </div>
         {currentStageIndex < lifecycleStages.length - 1 && (
            <button 
                onClick={handleAdvanceStage}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
            >
                Advance to {lifecycleStages[currentStageIndex + 1]}
            </button>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="mb-6">
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'risk', label: 'Risk Assessment' },
            { id: 'due-diligence', label: 'Due Diligence' },
            { id: 'contracts', label: 'Contracts' },
            { id: 'performance', label: 'Performance' },
            { id: 'incidents', label: 'Incidents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {activeTab === 'overview' && (
          <>
            {/* Lifecycle Stepper */}
            <div className="mb-8">
              <ol className="relative grid grid-cols-4 text-sm font-medium text-gray-500">
                {lifecycleStages.map((stage, index) => (
                  <li key={stage} className="relative flex items-start justify-start">
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center">
                        {index > 0 && <div className={`flex-1 h-0.5 ${index <= currentStageIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full ring-4 ${index <= currentStageIndex ? 'bg-blue-700 text-blue-200 ring-blue-900/50' : 'bg-slate-700 text-slate-400 ring-slate-800'}`}>
                          {index < currentStageIndex ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
                        </span>
                        {index < lifecycleStages.length - 1 && <div className={`flex-1 h-0.5 ${index < currentStageIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className={`font-semibold ${index <= currentStageIndex ? 'text-white' : 'text-slate-400'}`}>{stage}</h3>
                        <p className="text-xs text-slate-500 mt-1">{lifecycleDescriptions[stage]}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Vendor Information */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Vendor Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-slate-400">Industry</p><p className="font-semibold text-white">{vendor.industry}</p></div>
                    <div><p className="text-slate-400">Founded</p><p className="font-semibold text-white">{vendor.foundedYear}</p></div>
                    <div><p className="text-slate-400">Headquarters</p><p className="font-semibold text-white">{vendor.headquarters}</p></div>
                    <div><p className="text-slate-400">Employees</p><p className="font-semibold text-white">{vendor.employeeCount}</p></div>
                    <div><p className="text-slate-400">Revenue</p><p className="font-semibold text-white">{vendor.annualRevenue}</p></div>
                    <div><p className="text-slate-400">Website</p><a href={vendor.website} className="font-semibold text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{vendor.website}</a></div>
                  </div>
                </div>

                {/* Services & Data */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Services & Data Access</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Services Provided</p>
                      <div className="flex flex-wrap gap-2">
                        {vendor.servicesProvided.map(service => (
                          <span key={service} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">{service}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Data Types Accessed</p>
                      <div className="flex flex-wrap gap-2">
                        {vendor.dataTypes.map(dataType => (
                          <span key={dataType} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">{dataType}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-slate-400">Access Level</p><p className="font-semibold text-white">{vendor.accessLevel}</p></div>
                      <div><p className="text-slate-400">System Access</p><p className="font-semibold text-white">{vendor.hasSystemAccess ? 'Yes' : 'No'}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Key Details */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Key Details</h2>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-slate-400">Current Stage</p><p className="font-semibold text-blue-300">{vendor.status}</p></div>
                    <div><p className="text-slate-400">Criticality</p><p className={`font-semibold ${getRiskLevelColor(vendor.criticality)}`}>{vendor.criticality}</p></div>
                    <div><p className="text-slate-400">Tier</p><p className="font-semibold text-white">Tier {vendor.tier}</p></div>
                    <div><p className="text-slate-400">Risk Score</p><p className={`font-semibold ${getRiskLevelColor(vendor.riskLevel)}`}>{vendor.overallRiskScore}/100</p></div>
                    <div><p className="text-slate-400">Annual Spend</p><p className="font-semibold text-white">${vendor.annualSpend.toLocaleString()} {vendor.currency}</p></div>
                  </div>
                </div>

                {/* Ownership */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Ownership</h2>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-slate-400">Business Owner</p><p className="font-semibold text-white">{vendor.businessOwner}</p></div>
                    {vendor.technicalOwner && <div><p className="text-slate-400">Technical Owner</p><p className="font-semibold text-white">{vendor.technicalOwner}</p></div>}
                    {vendor.procurementOwner && <div><p className="text-slate-400">Procurement Owner</p><p className="font-semibold text-white">{vendor.procurementOwner}</p></div>}
                  </div>
                </div>

                {/* Contacts */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Contacts</h2>
                  <div className="space-y-3">
                    {vendor.contacts.map((contact, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{contact.name}</p>
                          {contact.isPrimary && <span className="px-1 py-0.5 bg-blue-600 text-blue-100 text-xs rounded">Primary</span>}
                        </div>
                        <p className="text-slate-400">{contact.role}</p>
                        <p className="text-blue-400">{contact.email}</p>
                        {contact.phone && <p className="text-slate-400">{contact.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            {riskAssessments.length > 0 ? (
              riskAssessments.map(assessment => (
                <div key={assessment.id} className="glass-card rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Risk Assessment</h2>
                      <p className="text-slate-400 text-sm">Assessed on {assessment.assessmentDate} by {assessment.assessorId}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getRiskLevelColor(assessment.riskLevel)}`}>{assessment.overallRiskScore}/100</div>
                      <div className={`text-sm ${getRiskLevelColor(assessment.riskLevel)}`}>{assessment.riskLevel} Risk</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(assessment.categories).map(([category, data]) => (
                      <div key={category} className="bg-slate-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-white mb-2">{category}</h3>
                        <div className={`text-lg font-bold mb-1 ${getRiskLevelColor(
                          data.score <= 25 ? VendorCriticality.LOW :
                          data.score <= 50 ? VendorCriticality.MEDIUM :
                          data.score <= 75 ? VendorCriticality.HIGH : VendorCriticality.CRITICAL
                        )}`}>{data.score}/100</div>
                        <p className="text-slate-400 text-sm">{data.notes}</p>
                        <p className="text-slate-500 text-xs mt-2">Updated: {data.lastUpdated}</p>
                      </div>
                    ))}
                  </div>

                  {assessment.mitigationActions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-3">Mitigation Actions</h3>
                      <div className="space-y-2">
                        {assessment.mitigationActions.map(action => (
                          <div key={action.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                            <div className="flex-1">
                              <p className="text-white font-medium">{action.description}</p>
                              <p className="text-slate-400 text-sm">Assigned to: {action.assignedTo} | Due: {action.dueDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                action.priority === 'Critical' ? 'bg-red-600 text-red-100' :
                                action.priority === 'High' ? 'bg-orange-600 text-orange-100' :
                                action.priority === 'Medium' ? 'bg-yellow-600 text-yellow-100' :
                                'bg-slate-600 text-slate-100'
                              }`}>{action.priority}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(action.status)} bg-slate-800`}>
                                {action.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Risk Assessment</h2>
                <p className="text-slate-500 text-center py-8">No risk assessments available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'due-diligence' && (
          <div className="space-y-6">
            {dueDiligence.length > 0 ? (
              dueDiligence.map(dd => (
                <div key={dd.id} className="glass-card rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Due Diligence</h2>
                      <p className="text-slate-400 text-sm">Started: {dd.startDate}</p>
                      {dd.completedDate && <p className="text-slate-400 text-sm">Completed: {dd.completedDate}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dd.status)} bg-slate-800`}>
                      {dd.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dd.checklist.map(item => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-slate-800/50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{item.requirement}</h3>
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">{item.category}</span>
                          </div>
                          {item.evidence && <p className="text-slate-400 text-sm mb-1">Evidence: {item.evidence}</p>}
                          {item.reviewNotes && <p className="text-slate-400 text-sm mb-1">Notes: {item.reviewNotes}</p>}
                          <div className="flex gap-4 text-xs text-slate-500">
                            {item.dueDate && <span>Due: {item.dueDate}</span>}
                            {item.completedDate && <span>Completed: {item.completedDate}</span>}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)} bg-slate-800 ml-4`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {dd.notes && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded">
                      <h3 className="font-semibold text-white mb-2">Notes</h3>
                      <p className="text-slate-400 text-sm">{dd.notes}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Due Diligence</h2>
                <p className="text-slate-500 text-center py-8">No due diligence records available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {contracts.length > 0 ? (
              contracts.map(contract => (
                <div key={contract.id} className="glass-card rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{contract.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{contract.type}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(contract.status)} bg-slate-800`}>
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${contract.annualValue.toLocaleString()} {contract.currency}</div>
                      <div className="text-sm text-slate-400">Annual Value</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div><p className="text-slate-400">Start Date</p><p className="font-semibold text-white">{contract.startDate}</p></div>
                    <div><p className="text-slate-400">End Date</p><p className="font-semibold text-white">{contract.endDate}</p></div>
                    {contract.renewalDate && <div><p className="text-slate-400">Renewal Date</p><p className="font-semibold text-white">{contract.renewalDate}</p></div>}
                    <div><p className="text-slate-400">Right to Audit</p><p className="font-semibold text-white">{contract.rightToAudit ? 'Yes' : 'No'}</p></div>
                  </div>

                  {contract.keyTerms.length > 0 && (
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm mb-2">Key Terms</p>
                      <div className="flex flex-wrap gap-2">
                        {contract.keyTerms.map(term => (
                          <span key={term} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">{term}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-slate-400">Renewal Notice</p><p className="font-semibold text-white">{contract.notifications.renewal} days</p></div>
                    <div><p className="text-slate-400">Expiry Notice</p><p className="font-semibold text-white">{contract.notifications.expiry} days</p></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Contracts</h2>
                <p className="text-slate-500 text-center py-8">No contracts available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Performance Metrics</h2>
              {performanceMetrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performanceMetrics.map(metric => (
                    <div key={metric.id} className="bg-slate-800/50 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-2">{metric.name}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Target: {metric.target} {metric.unit}</span>
                        <span className={`font-bold ${metric.actual >= metric.target ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.actual} {metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${metric.actual >= metric.target ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((metric.actual / metric.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{metric.period}</span>
                        <span>Updated: {metric.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No performance metrics available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {incidents.length > 0 ? (
              incidents.map(incident => (
                <div key={incident.id} className="glass-card rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{incident.title}</h2>
                      <p className="text-slate-400 text-sm">{incident.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        incident.severity === 'Critical' ? 'bg-red-600 text-red-100' :
                        incident.severity === 'High' ? 'bg-orange-600 text-orange-100' :
                        incident.severity === 'Medium' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-slate-600 text-slate-100'
                      }`}>{incident.severity}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)} bg-slate-800`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div><p className="text-slate-400">Reported</p><p className="font-semibold text-white">{new Date(incident.reportedDate).toLocaleDateString()}</p></div>
                    {incident.resolvedDate && <div><p className="text-slate-400">Resolved</p><p className="font-semibold text-white">{new Date(incident.resolvedDate).toLocaleDateString()}</p></div>}
                    <div><p className="text-slate-400">Impact</p><p className="font-semibold text-white">{incident.impact}</p></div>
                  </div>

                  {incident.rootCause && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded">
                      <h3 className="font-semibold text-white mb-2">Root Cause</h3>
                      <p className="text-slate-400 text-sm">{incident.rootCause}</p>
                    </div>
                  )}

                  {incident.preventiveActions && (
                    <div className="p-3 bg-slate-800/50 rounded">
                      <h3 className="font-semibold text-white mb-2">Preventive Actions</h3>
                      <p className="text-slate-400 text-sm">{incident.preventiveActions}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Incidents</h2>
                <p className="text-slate-500 text-center py-8">No incidents reported.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDetailView;
