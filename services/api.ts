import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Evidence, Vendor, ControlMapping } from '../types';
import { UserRole, AssessmentStatus, RiskLevel, PolicyStatus, VendorLifecycleStage } from '../types';

// Mock Data
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Marcus Aurelius', email: 'owner@aurelius.test', role: UserRole.CONSULTANT_OWNER, organizationId: 'org-1', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
  { id: 'user-2', name: 'Alia Atreides', email: 'admin@northwind.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-2', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
  { id: 'user-3', name: 'Bob Johnson', email: 'admin@contoso.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-3', avatarUrl: `https://i.pravatar.cc/150?u=user-3`},
  { id: 'user-4', name: 'Charlie Day', email: 'admin@litware.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-4', avatarUrl: `https://i.pravatar.cc/150?u=user-4`},
];

export const mockOrganizations: Organization[] = [
  { id: 'org-1', name: 'Aurelius Risk Partners' },
  { id: 'org-2', name: 'Northwind Traders' },
  { id: 'org-3', name: 'Contoso Ltd.' },
  { id: 'org-4', name: 'Litware Inc.' },
];

export const consultantClientLinks: Record<string, string[]> = {
    'org-1': ['org-2', 'org-3', 'org-4']
}

let mockProjects: Project[] = [
  { id: 'proj-1', name: 'Q3 2024 SOC 2 Audit', organizationId: 'org-2', frameworks: ['SOC 2', 'NIST CSF 2.0'] },
  { id: 'proj-2', name: 'ISO 27001 Certification', organizationId: 'org-3', frameworks: ['ISO 27001:2022'] },
  { id: 'proj-3', name: 'HIPAA Compliance Initiative', organizationId: 'org-4', frameworks: ['HIPAA'] },
];

let mockControls: Control[] = [
    { id: 'SOC2.CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity’s objectives.', family: 'Logical and Physical Access Controls', framework: 'SOC 2'},
    { id: 'ISO.A.5.15', name: 'Access Control', description: 'Access to information and other associated assets should be based on business and information security requirements and be limited to authorized users.', family: 'Access Control', framework: 'ISO 27001:2022'},
    { id: 'HIPAA.164.312.a.1', name: 'Access Control Standard', description: 'Implement policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights as specified in § 164.308(a)(4).', family: 'Technical Safeguards', framework: 'HIPAA'},
    { id: 'NIST.PR.AC-1', name: 'Access Control Policies and Procedures', description: 'Access control policies and procedures are established, and maintained.', family: 'Access Control', framework: 'NIST CSF 2.0'},
];

let mockAssessmentItems: AssessmentItem[] = [
    { id: 'item-1', projectId: 'proj-1', controlId: 'SOC2.CC6.1', status: AssessmentStatus.IN_PROGRESS, notes: 'Review of IAM policies is underway.', remediationPlan: '' },
    { id: 'item-2', projectId: 'proj-1', controlId: 'NIST.PR.AC-1', status: AssessmentStatus.NOT_STARTED, notes: '', remediationPlan: '' },
    { id: 'item-3', projectId: 'proj-2', controlId: 'ISO.A.5.15', status: AssessmentStatus.COMPLETED, notes: 'Access control policy is approved and published.', remediationPlan: '' },
    { id: 'item-4', projectId: 'proj-3', controlId: 'HIPAA.164.312.a.1', status: AssessmentStatus.IN_REVIEW, notes: 'Awaiting final sign-off from the security officer.', remediationPlan: '' },
];

let mockRisks: Risk[] = [
    { id: 'risk-1', projectId: 'proj-1', title: 'Over-privileged user accounts', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2.CC6.1' },
    { id: 'risk-2', projectId: 'proj-2', title: 'Lack of formal access review process', level: RiskLevel.MEDIUM, status: 'Open', controlId: 'ISO.A.5.15' },
];

let mockPolicies: Policy[] = [];
let mockPolicyVersions: PolicyVersion[] = [];
let mockEvidence: Evidence[] = [];
let mockVendors: Vendor[] = [];
let mockMappings: ControlMapping[] = [];


// Mock API
export const mockApi = {
  // Projects
  getProjectsForOrg: async (orgId: string): Promise<Project[]> => mockProjects.filter(p => p.organizationId === orgId),
  getProjectsForConsultant: async (clientOrgIds: string[]): Promise<Project[]> => mockProjects.filter(p => clientOrgIds.includes(p.organizationId)),
  createProject: async (name: string, organizationId: string, frameworks: string[]): Promise<Project> => {
      const newProject: Project = { id: `proj-${Date.now()}`, name, organizationId, frameworks };
      mockProjects.push(newProject);
      return newProject;
  },

  // Controls
  getAllControls: async (): Promise<Control[]> => [...mockControls],
  
  // Assessment
  getAssessmentItems: async (projectId: string): Promise<AssessmentItem[]> => mockAssessmentItems.filter(i => i.projectId === projectId),
  updateAssessmentItem: async (itemId: string, updates: Partial<AssessmentItem>): Promise<AssessmentItem> => {
      const item = mockAssessmentItems.find(i => i.id === itemId)!;
      Object.assign(item, updates);
      return { ...item };
  },

  // Risks
  getRisks: async (projectId: string): Promise<Risk[]> => mockRisks.filter(r => r.projectId === projectId),
  createRisk: async (riskData: Omit<Risk, 'id'>): Promise<Risk> => {
      const newRisk: Risk = { ...riskData, id: `risk-${Date.now()}` };
      mockRisks.push(newRisk);
      return newRisk;
  },

  // Policies
  getPolicies: async (projectId: string): Promise<Policy[]> => mockPolicies.filter(p => p.projectId === projectId),
  createPolicy: async (policyData: Omit<Policy, 'id' | 'history'>): Promise<Policy> => {
      const newPolicy: Policy = { ...policyData, id: `pol-${Date.now()}`, history: [] };
      mockPolicies.push(newPolicy);
      return newPolicy;
  },
  updatePolicyStatus: async (policyId: string, status: PolicyStatus, editorId: string): Promise<Policy> => {
      const policy = mockPolicies.find(p => p.id === policyId)!;
      const oldStatus = policy.status;
      policy.status = status;
      policy.lastUpdated = new Date().toISOString().split('T')[0];
      
      const newVersion: PolicyVersion = {
          version: policy.version,
          date: policy.lastUpdated,
          editorId,
          changes: `Status changed from ${oldStatus} to ${status}.`
      };
      policy.history.push(newVersion);
      mockPolicyVersions.push(newVersion);

      return { ...policy };
  },
  getPolicyVersions: async (policyId: string): Promise<PolicyVersion[]> => {
      const policy = mockPolicies.find(p => p.id === policyId);
      return policy?.history || [];
  },
  
  // Evidence
  getEvidence: async (projectId: string): Promise<Evidence[]> => mockEvidence.filter(e => e.projectId === projectId),
  createEvidence: async (evidenceData: Omit<Evidence, 'id'>): Promise<Evidence> => {
      const newEvidence: Evidence = { ...evidenceData, id: `ev-${Date.now()}`, uploadDate: new Date().toISOString().split('T')[0] };
      mockEvidence.push(newEvidence);
      return newEvidence;
  },
  
  // Vendors
  getVendors: async (projectId: string): Promise<Vendor[]> => mockVendors.filter(v => v.projectId === projectId),
  getVendorById: async (vendorId: string): Promise<Vendor | undefined> => mockVendors.find(v => v.id === vendorId),
  createVendor: async (vendorData: Omit<Vendor, 'id' | 'status'>): Promise<Vendor> => {
      const newVendor: Vendor = { ...vendorData, id: `ven-${Date.now()}`, status: VendorLifecycleStage.IDENTIFICATION };
      mockVendors.push(newVendor);
      return newVendor;
  },
  updateVendorLifecycleStage: async (vendorId: string, stage: VendorLifecycleStage): Promise<Vendor> => {
      const vendor = mockVendors.find(v => v.id === vendorId)!;
      vendor.status = stage;
      return {...vendor};
  },

  // Mappings
  getControlMappingsForProject: async (projectId: string): Promise<ControlMapping[]> => mockMappings.filter(m => m.projectId === projectId),
  createControlMapping: async (data: Omit<ControlMapping, 'id'>): Promise<ControlMapping> => {
      const newMapping: ControlMapping = { ...data, id: `map-${Date.now()}`};
      mockMappings.push(newMapping);
      return newMapping;
  },
  deleteControlMapping: async (mappingId: string): Promise<void> => {
      mockMappings = mockMappings.filter(m => m.id !== mappingId);
  },

  // Other
  getAvailableFrameworks: async (): Promise<string[]> => ['SOC 2', 'ISO 27001:2022', 'HIPAA', 'PCI DSS v4.0', 'NIST CSF 2.0'],
  createOrganization: async (name: string): Promise<Organization> => {
      const newOrg = { id: `org-${Date.now()}`, name };
      mockOrganizations.push(newOrg);
      return newOrg;
  }
};
