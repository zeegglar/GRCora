import React, { useState, useEffect, useCallback } from 'react';
import type { Project, User, View, AssessmentItem, Control, Risk, Policy, Evidence, Vendor, ControlMapping } from '../../types';
import { mockApi } from '../../services/api';
import AssessmentTable from './assessments/AssessmentTable';
import EvidenceTable from './evidence/EvidenceTable';
import RiskTable from './risks/RiskTable';
import PolicyTable from './policies/PolicyTable';
import VendorTable from './vendors/VendorTable';
import ReportsView from './reports/ReportsView';
import NewPolicyModal from './policies/NewPolicyModal';
import { PolicyStatus } from '../../types';

interface ProjectViewProps {
  project: Project;
  user: User;
  tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'reports';
  setView: (view: View) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, user, tab, setView }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);
  const [controls, setControls] = useState<Map<string, Control>>(new Map());
  const [risks, setRisks] = useState<Risk[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [controlMappings, setControlMappings] = useState<ControlMapping[]>([]);

  // State for the centralized New Policy Modal
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
  const [initialPolicyContent, setInitialPolicyContent] = useState<string | undefined>(undefined);
  const [policyContextControl, setPolicyContextControl] = useState<Control | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [apiItems, apiControls, apiRisks, apiPolicies, apiEvidence, apiVendors, apiMappings] = await Promise.all([
      mockApi.getAssessmentItems(project.id),
      mockApi.getAllControls(),
      mockApi.getRisks(project.id),
      mockApi.getPolicies(project.id),
      mockApi.getEvidence(project.id),
      mockApi.getVendors(project.id),
      mockApi.getControlMappingsForProject(project.id),
    ]);
    setAssessmentItems(apiItems);
    setControls(new Map(apiControls.map(c => [c.id, c])));
    setRisks(apiRisks);
    setPolicies(apiPolicies);
    setEvidence(apiEvidence);
    setVendors(apiVendors);
    setControlMappings(apiMappings);
    setIsLoading(false);
  }, [project.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenNewPolicyModal = (content?: string, control?: Control) => {
    setInitialPolicyContent(content);
    setPolicyContextControl(control || null);
    setIsNewPolicyModalOpen(true);
  };
  
  const handleCloseNewPolicyModal = () => {
      setIsNewPolicyModalOpen(false);
      setInitialPolicyContent(undefined);
      setPolicyContextControl(null);
  }

  const handleUpdateAssessmentItem = async (itemId: string, updates: Partial<Pick<AssessmentItem, 'status' | 'notes' | 'remediationPlan'>>) => {
    const updatedItem = await mockApi.updateAssessmentItem(itemId, updates);
    setAssessmentItems(items => items.map(item => item.id === itemId ? updatedItem : item));
  };
  
  const handleCreateRisk = async (riskData: Omit<Risk, 'id'>) => {
    const newRisk = await mockApi.createRisk(riskData);
    setRisks(prev => [...prev, newRisk]);
  };
  
  const handleCreatePolicy = async (policyData: Omit<Policy, 'id' | 'history'>) => {
    const newPolicy = await mockApi.createPolicy(policyData);
    setPolicies(prev => [...prev, newPolicy]);
  };

  const handleUpdatePolicyStatus = async (policyId: string, status: PolicyStatus) => {
    const updatedPolicy = await mockApi.updatePolicyStatus(policyId, status, user.id);
    setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p));
  };

  const handleCreateVendor = async (vendorData: Omit<Vendor, 'id' | 'status'>) => {
    const newVendor = await mockApi.createVendor(vendorData);
    setVendors(prev => [...prev, newVendor]);
  };

  const handleCreateEvidence = async (evidenceData: Omit<Evidence, 'id'>) => {
     const newEvidence = await mockApi.createEvidence({ ...evidenceData, uploaderId: user.id });
     setEvidence(prev => [...prev, newEvidence]);
  };

  const handleCreateMapping = async (sourceControlId: string, targetControlId: string) => {
    const newMapping = await mockApi.createControlMapping({ sourceControlId, targetControlId, projectId: project.id });
    setControlMappings(prev => [...prev, newMapping]);
  };

  const handleDeleteMapping = async (mappingId: string) => {
    await mockApi.deleteControlMapping(mappingId);
    setControlMappings(prev => prev.filter(m => m.id !== mappingId));
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading project data...</div>;
    }

    switch (tab) {
      case 'assessments':
        return <AssessmentTable 
                  assessmentItems={assessmentItems} 
                  controls={controls} 
                  project={project} 
                  onUpdateItem={handleUpdateAssessmentItem}
                  controlMappings={controlMappings}
                  onCreateMapping={handleCreateMapping}
                  onDeleteMapping={handleDeleteMapping}
                  onOpenNewPolicyModal={handleOpenNewPolicyModal}
               />;
      case 'evidence':
        return <EvidenceTable evidence={evidence} controls={controls} projectId={project.id} onCreateEvidence={handleCreateEvidence} />;
      case 'risks':
        return <RiskTable risks={risks} controls={controls} onCreateRisk={handleCreateRisk} projectId={project.id} />;
      case 'policies':
        return <PolicyTable policies={policies} user={user} onOpenNewPolicyModal={() => handleOpenNewPolicyModal()} onUpdateStatus={handleUpdatePolicyStatus} />;
      case 'vendors':
        return <VendorTable vendors={vendors} setView={setView} projectId={project.id} onCreateVendor={handleCreateVendor} />;
      case 'reports':
        return <ReportsView project={project} assessmentItems={assessmentItems} risks={risks} controls={controls} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">{project.name}</h1>
          <p className="text-slate-400 mt-1">Frameworks: {project.frameworks.join(', ')}</p>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
      <NewPolicyModal
        isOpen={isNewPolicyModalOpen}
        onClose={handleCloseNewPolicyModal}
        onSave={handleCreatePolicy}
        user={user}
        projectId={project.id}
        initialContent={initialPolicyContent}
        contextControl={policyContextControl}
      />
    </>
  );
};

export default ProjectView;