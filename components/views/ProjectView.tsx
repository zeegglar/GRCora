import React from 'react';
import type { View, User, Project, AssessmentItem, Risk, Policy, Vendor, Evidence, Control } from '../../types';

import AssessmentTable from './assessments/AssessmentTable';
import RiskTable from './risks/RiskTable';
import PolicyTable from './policies/PolicyTable';
import VendorTable from './vendors/VendorTable';
import EvidenceTable from './evidence/EvidenceTable';
import ReportsView from './reports/ReportsView';
import NewPolicyModal from './policies/NewPolicyModal';
import { PolicyStatus } from '../../types';

interface ProjectViewProps {
  user: User;
  view: { type: 'project'; projectId: string; tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'reports' };
  projectData: {
    project: Project;
    assessmentItems: AssessmentItem[];
    risks: Risk[];
    policies: Policy[];
    vendors: Vendor[];
    evidence: Evidence[];
    controls: Map<string, Control>;
  };
  setView: (view: View) => void;
  onUpdate: () => void; // A function to trigger data refresh
}

const ProjectView: React.FC<ProjectViewProps> = ({ user, view, projectData, setView, onUpdate }) => {
  const { project, assessmentItems, risks, policies, vendors, evidence, controls } = projectData;
  const { tab } = view;

  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);

  const handleCreateRisk = async (riskData: Omit<Risk, 'id'>) => {
    // In a real app, this would call mockApi.createRisk
    console.log('Creating risk', riskData);
    onUpdate();
  };

  const handleCreatePolicy = async (policyData: Omit<Policy, 'id' | 'history'>) => {
     // In a real app, this would call mockApi.createPolicy
    console.log('Creating policy', policyData);
    onUpdate();
  };

  const handleUpdatePolicyStatus = async (policyId: string, status: PolicyStatus) => {
    // In a real app, this would call mockApi.updatePolicy
    console.log('Updating policy', policyId, status);
    onUpdate();
  };
  
  const handleCreateVendor = async (vendorData: Omit<Vendor, 'id' | 'status'>) => {
    // In a real app, this would call mockApi.createVendor
    console.log('Creating vendor', vendorData);
    onUpdate();
  };

  const handleCreateEvidence = async (evidenceData: Omit<Evidence, 'id' | 'uploadDate'>) => {
     // In a real app, this would call mockApi.createEvidence
    console.log('Creating evidence', evidenceData);
    onUpdate();
  }


  const renderTabContent = () => {
    switch (tab) {
      case 'assessments':
        return <AssessmentTable assessmentItems={assessmentItems} controls={controls} onUpdate={onUpdate} user={user} />;
      case 'risks':
        return <RiskTable risks={risks} controls={controls} onCreateRisk={handleCreateRisk} projectId={project.id} />;
      case 'policies':
        return <PolicyTable policies={policies} user={user} onOpenNewPolicyModal={() => setIsNewPolicyModalOpen(true)} onUpdateStatus={handleUpdatePolicyStatus} />;
      case 'vendors':
        return <VendorTable vendors={vendors} setView={setView} projectId={project.id} onCreateVendor={handleCreateVendor} />;
      case 'evidence':
        return <EvidenceTable evidence={evidence} controls={controls} projectId={project.id} onCreateEvidence={handleCreateEvidence} />;
      case 'reports':
        return <ReportsView project={project} assessmentItems={assessmentItems} risks={risks} controls={controls} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  const tabs = [
    { id: 'assessments', label: 'Assessments' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'risks', label: 'Risks' },
    { id: 'policies', label: 'Policies' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-6">
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setView({ ...view, tab: t.id as any })}
                className={`${
                  tab === t.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {renderTabContent()}

      <NewPolicyModal
        isOpen={isNewPolicyModalOpen}
        onClose={() => setIsNewPolicyModalOpen(false)}
        onSave={handleCreatePolicy}
        user={user}
        projectId={project.id}
      />
    </div>
  );
};

export default ProjectView;
