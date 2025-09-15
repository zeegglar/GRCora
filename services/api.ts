import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Vendor, Evidence, ControlMapping } from '../types';
import { UserRole, RiskLevel, PolicyStatus, VendorLifecycleStage } from '../types';

// Mock Data
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Martin', role: UserRole.CONSULTANT_OWNER, avatarUrl: '/avatars/avatar1.png', organizationId: 'org-consultancy' },
  { id: 'user-2', name: 'Bob Chen', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar2.png', organizationId: 'org-client-a' },
  { id: 'user-3', name: 'Charlie Davis', role: UserRole.CLIENT_USER, avatarUrl: '/avatars/avatar3.png', organizationId: 'org-client-a' },
  { id: 'user-4', name: 'Diana Prince', role: UserRole.CONSULTANT_ADMIN, avatarUrl: '/avatars/avatar4.png', organizationId: 'org-consultancy' },
];

export const mockOrganizations: Organization[] = [
  { id: 'org-consultancy', name: 'SecureGRC Consultants' },
  { id: 'org-client-a', name: 'Fintech Innovations Inc.' },
  { id: 'org-client-b', name: 'HealthPlus Solutions' },
];

export const consultantClientLinks: Record<string, string[]> = {
    'org-consultancy': ['org-client-a', 'org-client-b']
}

let mockProjects: Project[] = [
  { id: 'proj-1', name: 'Q3 2024 SOC 2 Audit', organizationId: 'org-client-a', frameworks: ['SOC 2', 'NIST CSF 2.0'] },
  { id: 'proj-2', name: 'ISO 27001 Certification Prep', organizationId: 'org-client-b', frameworks: ['ISO 27001:2022'] },
];

let mockControls: Control[] = [
    // ... Sample Controls
    { id: 'SOC2-CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security measures to protect against threats to information systems.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'ISO-A.5.15', name: 'Access Control', description: 'Access to information and other associated assets should be managed based on business and information security requirements.', family: 'Access Control', framework: 'ISO 27001:2022' },
    { id: 'NIST-PR.AC-1', name: 'Access Control Policies and Procedures', description: 'Access control policies and procedures are defined and implemented.', family: 'Access Control', framework: 'NIST CSF 2.0' },
];

let mockAssessmentItems: AssessmentItem[] = [
    { id: 'asm-1', controlId: 'SOC2-CC6.1', projectId: 'proj-1', status: 'In Progress', notes: 'Reviewing user access lists for key systems.' },
    { id: 'asm-2', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', status: 'Compliant', notes: 'Policy is documented and approved.' },
    { id: 'asm-3', controlId: 'ISO-A.5.15', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Quarterly access reviews are overdue.' },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

let mockRisks: Risk[] = [
    // Project 1 risks - will result in 'up' trend
    { id: 'risk-1', title: 'Over-privileged user accounts', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2-CC6.1', projectId: 'proj-1', creationDate: daysAgo(45) },
    { id: 'risk-4', title: 'Inadequate MFA on admin portals', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', creationDate: daysAgo(10) },
    { id: 'risk-5', title: 'Unencrypted data at rest in legacy DB', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2-CC6.1', projectId: 'proj-1', creationDate: daysAgo(5) },
    
    // Project 2 risks - will result in 'stable' trend
    { id: 'risk-2', title: 'Delayed patch management', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'ISO-A.5.15', projectId: 'proj-2', creationDate: daysAgo(90) },
    { id: 'risk-3', title: 'SSH keys without passphrase', level: RiskLevel.HIGH, status: 'Closed', controlId: 'ISO-A.5.15', projectId: 'proj-2', creationDate: daysAgo(60) },
];

let mockPolicies: Policy[] = [
    { id: 'pol-1', title: 'Access Control Policy', content: '...', version: '1.2', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-1', lastUpdated: '2023-10-15', controlId: 'SOC2-CC6.1' },
];

let mockPolicyVersions: PolicyVersion[] = [
    { version: '1.2', date: '2023-10-15', editorId: 'user-2', changes: 'Updated to include remote access guidelines.'},
    { version: '1.1', date: '2023-08-01', editorId: 'user-2', changes: 'Clarified password complexity requirements.'},
]

let mockVendors: Vendor[] = [
    { id: 'ven-1', name: 'AWS', service: 'Cloud Hosting', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CTO', projectId: 'proj-1' },
];

let mockEvidence: Evidence[] = [
    { id: 'ev-1', title: 'Q3 Access Review Spreadsheet.xlsx', fileUrl: '#', uploadDate: '2023-11-01', uploaderId: 'user-3', controlId: 'SOC2-CC6.1', projectId: 'proj-1' },
];

let mockMappings: ControlMapping[] = [
    { id: 'map-1', sourceControlId: 'SOC2-CC6.1', targetControlId: 'ISO-A.5.15' }
];

// Mock API functions
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  getProjectsForConsultant: async (clientOrgIds: string[]): Promise<Project[]> => {
    await delay(500);
    return mockProjects.filter(p => clientOrgIds.includes(p.organizationId));
  },
  getProjectForClient: async (orgId: string): Promise<Project | undefined> => {
    await delay(300);
    return mockProjects.find(p => p.organizationId === orgId);
  },
  getProjectById: async (projectId: string): Promise<Project | undefined> => {
    await delay(200);
    return mockProjects.find(p => p.id === projectId);
  },
  getAllRisksForProjects: async (projectIds: string[]): Promise<Risk[]> => {
    await delay(500);
    return mockRisks.filter(r => projectIds.includes(r.projectId));
  },
  createProject: async (name: string, organizationId: string, frameworks: string[]): Promise<Project> => {
    await delay(500);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      organizationId,
      frameworks,
      trend: 'stable'
    };
    mockProjects.push(newProject);
    return newProject;
  },
  getControls: async (frameworks: string[]): Promise<Control[]> => {
    await delay(200);
    return mockControls.filter(c => frameworks.includes(c.framework));
  },
  getAssessmentItems: async (projectId: string): Promise<AssessmentItem[]> => {
    await delay(300);
    return mockAssessmentItems.filter(i => i.projectId === projectId);
  },
  getRisks: async (projectId: string): Promise<Risk[]> => {
    await delay(300);
    return mockRisks.filter(r => r.projectId === projectId);
  },
  getPolicies: async (projectId: string): Promise<Policy[]> => {
    await delay(300);
    return mockPolicies.filter(p => p.projectId === projectId);
  },
  getVendors: async (projectId: string): Promise<Vendor[]> => {
    await delay(300);
    return mockVendors.filter(v => v.projectId === projectId);
  },
  getEvidence: async (projectId: string): Promise<Evidence[]> => {
    await delay(300);
    return mockEvidence.filter(e => e.projectId === projectId);
  },
  getVendorById: async (vendorId: string): Promise<Vendor | undefined> => {
      await delay(400);
      return mockVendors.find(v => v.id === vendorId);
  },
  updateVendorLifecycleStage: async (vendorId: string, stage: VendorLifecycleStage): Promise<Vendor> => {
      await delay(500);
      const vendor = mockVendors.find(v => v.id === vendorId);
      if (vendor) vendor.status = stage;
      return vendor!;
  },
  getPolicyVersions: async (policyId: string): Promise<PolicyVersion[]> => {
      await delay(300);
      if (policyId === 'pol-1') return mockPolicyVersions;
      return [];
  },
  getAvailableFrameworks: async (): Promise<string[]> => {
      await delay(100);
      return ['SOC 2', 'ISO 27001:2022', 'HIPAA', 'PCI DSS v4.0', 'NIST CSF 2.0'];
  },
  createOrganization: async (name: string): Promise<Organization> => {
      await delay(400);
      const newOrg = { id: `org-${Date.now()}`, name };
      mockOrganizations.push(newOrg);
      return newOrg;
  },
  updateAssessmentItemStatus: async (itemId: string, status: AssessmentItem['status']): Promise<void> => {
      const item = mockAssessmentItems.find(i => i.id === itemId);
      if (item) item.status = status;
  },
  updateAssessmentItemNotes: async (itemId: string, notes: string): Promise<void> => {
      const item = mockAssessmentItems.find(i => i.id === itemId);
      if (item) item.notes = notes;
  },
  getMappingsForControl: async (controlId: string): Promise<ControlMapping[]> => {
    await delay(200);
    return mockMappings.filter(m => m.sourceControlId === controlId || m.targetControlId === controlId);
  },
  createMapping: async (sourceControlId: string, targetControlId: string): Promise<ControlMapping> => {
    await delay(300);
    const newMapping = { id: `map-${Date.now()}`, sourceControlId, targetControlId };
    mockMappings.push(newMapping);
    return newMapping;
  },
  deleteMapping: async (mappingId: string): Promise<void> => {
    await delay(300);
    mockMappings = mockMappings.filter(m => m.id !== mappingId);
  }
};