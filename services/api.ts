import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Vendor, Evidence, ControlMapping } from '../types';
import { UserRole, RiskLevel, PolicyStatus, VendorLifecycleStage } from '../types';
import { addGlobalNotification } from '../components/context/NotificationContext';

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
  { id: 'org-client-c', name: 'Global Retail Corp' },
];

export const consultantClientLinks: Record<string, string[]> = {
    'org-consultancy': ['org-client-a', 'org-client-b', 'org-client-c']
}

let mockProjects: Project[] = [
  { id: 'proj-1', name: 'Q3 2024 SOC 2 Audit', organizationId: 'org-client-a', frameworks: ['SOC 2', 'NIST CSF 2.0'] },
  { id: 'proj-2', name: 'ISO 27001 Certification Prep', organizationId: 'org-client-b', frameworks: ['ISO 27001:2022'] },
  { id: 'proj-3', name: 'PCI DSS Compliance Initiative', organizationId: 'org-client-c', frameworks: ['PCI DSS v4.0'] },
  { id: 'proj-4', name: 'HIPAA Security Assessment', organizationId: 'org-client-b', frameworks: ['HIPAA'] },
];

let mockControls: Control[] = [
    // SOC 2 Controls
    { id: 'SOC2-CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security measures to protect against threats to information systems.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'SOC2-CC6.3', name: 'Network Communications', description: 'The entity protects information transmitted through networks.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'SOC2-A1.1', name: 'System Availability', description: 'The entity maintains availability commitments and system requirements.', family: 'Availability', framework: 'SOC 2' },
    { id: 'SOC2-CC7.1', name: 'System Monitoring', description: 'The entity monitors the system to identify security threats and vulnerabilities.', family: 'System Operations', framework: 'SOC 2' },

    // ISO 27001:2022 Controls
    { id: 'ISO-A.5.15', name: 'Access Control', description: 'Access to information and other associated assets should be managed based on business and information security requirements.', family: 'Access Control', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.8.2', name: 'Information Classification', description: 'Information should be classified in terms of legal requirements, value, criticality and sensitivity.', family: 'Asset Management', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.12.6', name: 'Management of Technical Vulnerabilities', description: 'Information about technical vulnerabilities should be obtained in a timely fashion.', family: 'Operations Security', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.13.1', name: 'Network Security Management', description: 'Networks should be managed and controlled to protect information in systems and applications.', family: 'Communications Security', framework: 'ISO 27001:2022' },

    // NIST CSF 2.0 Controls
    { id: 'NIST-PR.AC-1', name: 'Access Control Policies and Procedures', description: 'Access control policies and procedures are defined and implemented.', family: 'Access Control', framework: 'NIST CSF 2.0' },
    { id: 'NIST-PR.DS-1', name: 'Data-at-rest Protection', description: 'Data-at-rest is protected through appropriate mechanisms.', family: 'Data Security', framework: 'NIST CSF 2.0' },

    // PCI DSS v4.0 Controls
    { id: 'PCI-3.2.1', name: 'Cardholder Data Encryption', description: 'Cardholder data is encrypted using strong cryptography during transmission.', family: 'Strong Cryptography', framework: 'PCI DSS v4.0' },
    { id: 'PCI-8.2.1', name: 'User Authentication', description: 'All users must be assigned a unique ID before being allowed access to system components.', family: 'Strong Access Control', framework: 'PCI DSS v4.0' },

    // HIPAA Controls
    { id: 'HIPAA-164.308', name: 'Administrative Safeguards', description: 'Assigned security responsibility, workforce training, and access management procedures.', family: 'Administrative Safeguards', framework: 'HIPAA' },
    { id: 'HIPAA-164.312', name: 'Technical Safeguards', description: 'Access control, audit controls, integrity, and transmission security.', family: 'Technical Safeguards', framework: 'HIPAA' },
];

let mockAssessmentItems: AssessmentItem[] = [
    // Project 1 (Fintech SOC 2 + NIST)
    { id: 'asm-1', controlId: 'SOC2-CC6.1', projectId: 'proj-1', status: 'In Progress', notes: 'Reviewing user access lists for key systems.' },
    { id: 'asm-2', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', status: 'Compliant', notes: 'Policy is documented and approved.' },
    { id: 'asm-3', controlId: 'SOC2-CC6.3', projectId: 'proj-1', status: 'Non-Compliant', notes: 'Network traffic encryption needs implementation.' },
    { id: 'asm-4', controlId: 'SOC2-CC7.1', projectId: 'proj-1', status: 'In Progress', notes: 'SIEM deployment in progress.' },
    { id: 'asm-5', controlId: 'NIST-PR.DS-1', projectId: 'proj-1', status: 'Compliant', notes: 'Database encryption enabled.' },

    // Project 2 (HealthPlus ISO 27001)
    { id: 'asm-6', controlId: 'ISO-A.5.15', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Quarterly access reviews are overdue.' },
    { id: 'asm-7', controlId: 'ISO-A.8.2', projectId: 'proj-2', status: 'Compliant', notes: 'Data classification scheme implemented.' },
    { id: 'asm-8', controlId: 'ISO-A.12.6', projectId: 'proj-2', status: 'In Progress', notes: 'Vulnerability management process being established.' },
    { id: 'asm-9', controlId: 'ISO-A.13.1', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Network segmentation requirements not met.' },

    // Project 3 (Global Retail PCI DSS)
    { id: 'asm-10', controlId: 'PCI-3.2.1', projectId: 'proj-3', status: 'In Progress', notes: 'Upgrading payment gateway encryption.' },
    { id: 'asm-11', controlId: 'PCI-8.2.1', projectId: 'proj-3', status: 'Compliant', notes: 'Unique user IDs assigned for all payment systems.' },

    // Project 4 (HealthPlus HIPAA)
    { id: 'asm-12', controlId: 'HIPAA-164.308', projectId: 'proj-4', status: 'Compliant', notes: 'Administrative safeguards documented and implemented.' },
    { id: 'asm-13', controlId: 'HIPAA-164.312', projectId: 'proj-4', status: 'In Progress', notes: 'Implementing enhanced audit logging for PHI access.' },

    // Additional mixed project assessments
    { id: 'asm-14', controlId: 'SOC2-A1.1', projectId: 'proj-1', status: 'Non-Compliant', notes: 'SLA targets not consistently met during peak hours.' },
    { id: 'asm-15', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', status: 'In Progress', notes: 'Updating access control procedures for new cloud services.' },
    { id: 'asm-16', controlId: 'ISO-A.8.2', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Classification labels missing on 30% of sensitive documents.' },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

let mockRisks: Risk[] = [
    // Project 1 risks (Fintech SOC 2 + NIST) - will result in 'up' trend
    { id: 'risk-1', title: 'Over-privileged user accounts in trading systems', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2-CC6.1', projectId: 'proj-1', creationDate: daysAgo(45) },
    { id: 'risk-4', title: 'Inadequate MFA on admin portals', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', creationDate: daysAgo(10) },
    { id: 'risk-5', title: 'Unencrypted customer financial data at rest', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2-CC6.1', projectId: 'proj-1', creationDate: daysAgo(5) },

    // Project 2 risks (HealthPlus ISO 27001) - will result in 'stable' trend
    { id: 'risk-2', title: 'Delayed patch management on PHI systems', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'ISO-A.12.6', projectId: 'proj-2', creationDate: daysAgo(90) },
    { id: 'risk-3', title: 'SSH keys without passphrase protection', level: RiskLevel.HIGH, status: 'Closed', controlId: 'ISO-A.5.15', projectId: 'proj-2', creationDate: daysAgo(60) },

    // Project 3 risks (Global Retail PCI DSS)
    { id: 'risk-6', title: 'Payment card data stored in plaintext logs', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'PCI-3.2.1', projectId: 'proj-3', creationDate: daysAgo(20) },
    { id: 'risk-7', title: 'Shared service accounts in cardholder environment', level: RiskLevel.HIGH, status: 'Open', controlId: 'PCI-8.2.1', projectId: 'proj-3', creationDate: daysAgo(35) },
];

let mockPolicies: Policy[] = [
    { id: 'pol-1', title: 'Access Control Policy', content: 'Comprehensive policy governing user access to systems and data...', version: '1.2', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-1', lastUpdated: '2023-10-15', controlId: 'SOC2-CC6.1' },
    { id: 'pol-2', title: 'Data Classification and Handling Policy', content: 'Guidelines for classifying and handling sensitive information...', version: '2.1', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-2', lastUpdated: '2023-09-22', controlId: 'ISO-A.8.2' },
    { id: 'pol-3', title: 'Incident Response Policy', content: 'Procedures for detecting, responding to, and recovering from security incidents...', version: '1.0', status: PolicyStatus.DRAFT, ownerId: 'user-1', projectId: 'proj-1', lastUpdated: '2023-11-01', controlId: 'SOC2-CC7.1' },
    { id: 'pol-4', title: 'PCI DSS Cardholder Data Protection Policy', content: 'Policy outlining protection requirements for payment card data...', version: '3.0', status: PolicyStatus.APPROVED, ownerId: 'user-1', projectId: 'proj-3', lastUpdated: '2023-08-15', controlId: 'PCI-3.2.1' },
    { id: 'pol-5', title: 'HIPAA Privacy and Security Policy', content: 'Comprehensive policy covering PHI protection and privacy requirements...', version: '1.5', status: PolicyStatus.IN_REVIEW, ownerId: 'user-2', projectId: 'proj-4', lastUpdated: '2023-10-30', controlId: 'HIPAA-164.308' },
];

let mockPolicyVersions: PolicyVersion[] = [
    { version: '1.2', date: '2023-10-15', editorId: 'user-2', changes: 'Updated to include remote access guidelines.'},
    { version: '1.1', date: '2023-08-01', editorId: 'user-2', changes: 'Clarified password complexity requirements.'},
]

let mockVendors: Vendor[] = [
    { id: 'ven-1', name: 'AWS', service: 'Cloud Hosting', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CTO', projectId: 'proj-1' },
    { id: 'ven-2', name: 'Okta', service: 'Identity Management', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CISO', projectId: 'proj-1' },
    { id: 'ven-3', name: 'Epic Systems', service: 'EHR Platform', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CTO', projectId: 'proj-2' },
    { id: 'ven-4', name: 'Stripe', service: 'Payment Processing', tier: '1', status: VendorLifecycleStage.ONBOARDING, owner: 'CFO', projectId: 'proj-3' },
    { id: 'ven-5', name: 'Salesforce', service: 'CRM Platform', tier: '2', status: VendorLifecycleStage.ACTIVE, owner: 'VP Sales', projectId: 'proj-3' },
    { id: 'ven-6', name: 'MongoDB Atlas', service: 'Database Hosting', tier: '2', status: VendorLifecycleStage.ACTIVE, owner: 'Lead Developer', projectId: 'proj-2' },
    { id: 'ven-7', name: 'Datadog', service: 'Infrastructure Monitoring', tier: '2', status: VendorLifecycleStage.IDENTIFICATION, owner: 'DevOps Lead', projectId: 'proj-1' },
];

let mockEvidence: Evidence[] = [
    { id: 'ev-1', title: 'Q3 Access Review Spreadsheet.xlsx', fileUrl: '#', uploadDate: '2023-11-01', uploaderId: 'user-3', controlId: 'SOC2-CC6.1', projectId: 'proj-1' },
    { id: 'ev-2', title: 'Network Encryption Configuration.pdf', fileUrl: '#', uploadDate: '2023-10-28', uploaderId: 'user-2', controlId: 'SOC2-CC6.3', projectId: 'proj-1' },
    { id: 'ev-3', title: 'SIEM Implementation Plan.docx', fileUrl: '#', uploadDate: '2023-10-25', uploaderId: 'user-1', controlId: 'SOC2-CC7.1', projectId: 'proj-1' },
    { id: 'ev-4', title: 'Data Classification Matrix.xlsx', fileUrl: '#', uploadDate: '2023-09-15', uploaderId: 'user-2', controlId: 'ISO-A.8.2', projectId: 'proj-2' },
    { id: 'ev-5', title: 'Vulnerability Scan Report - October.pdf', fileUrl: '#', uploadDate: '2023-10-31', uploaderId: 'user-4', controlId: 'ISO-A.12.6', projectId: 'proj-2' },
    { id: 'ev-6', title: 'Payment Gateway Security Assessment.pdf', fileUrl: '#', uploadDate: '2023-08-20', uploaderId: 'user-1', controlId: 'PCI-3.2.1', projectId: 'proj-3' },
    { id: 'ev-7', title: 'User Access Control Matrix.xlsx', fileUrl: '#', uploadDate: '2023-09-10', uploaderId: 'user-2', controlId: 'PCI-8.2.1', projectId: 'proj-3' },
    { id: 'ev-8', title: 'HIPAA Risk Assessment Report.docx', fileUrl: '#', uploadDate: '2023-10-15', uploaderId: 'user-2', controlId: 'HIPAA-164.308', projectId: 'proj-4' },
    { id: 'ev-9', title: 'PHI Access Audit Logs.csv', fileUrl: '#', uploadDate: '2023-11-05', uploaderId: 'user-3', controlId: 'HIPAA-164.312', projectId: 'proj-4' },
    { id: 'ev-10', title: 'Database Encryption Certificate.pdf', fileUrl: '#', uploadDate: '2023-09-28', uploaderId: 'user-4', controlId: 'NIST-PR.DS-1', projectId: 'proj-1' },
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
    const org = mockOrganizations.find(o => o.id === organizationId);
    addGlobalNotification(
      `New project "${name}" created for ${org?.name || 'client'}`,
      'success'
    );
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
      if (item) {
        const control = mockControls.find(c => c.id === item.controlId);
        const project = mockProjects.find(p => p.id === item.projectId);
        item.status = status;
        if (status === 'Compliant') {
          addGlobalNotification(
            `Control ${control?.id || 'Unknown'} is now compliant in ${project?.name || 'project'}`,
            'success'
          );
        } else if (status === 'Non-Compliant') {
          addGlobalNotification(
            `Control ${control?.id || 'Unknown'} marked as non-compliant in ${project?.name || 'project'}`,
            'warning'
          );
        }
      }
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
  },
  createRisk: async (title: string, level: RiskLevel, controlId: string, projectId: string): Promise<Risk> => {
    await delay(400);
    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      title,
      level,
      status: 'Open',
      controlId,
      projectId,
      creationDate: new Date().toISOString().split('T')[0]
    };
    mockRisks.push(newRisk);
    const project = mockProjects.find(p => p.id === projectId);
    addGlobalNotification(
      `New ${level.toLowerCase()} risk "${title}" added to ${project?.name || 'project'}`,
      level === RiskLevel.CRITICAL ? 'error' : 'warning'
    );
    return newRisk;
  },
  createEvidence: async (title: string, controlId: string, projectId: string, uploaderId: string): Promise<Evidence> => {
    await delay(300);
    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      title,
      fileUrl: '#',
      uploadDate: new Date().toISOString().split('T')[0],
      uploaderId,
      controlId,
      projectId
    };
    mockEvidence.push(newEvidence);
    const control = mockControls.find(c => c.id === controlId);
    addGlobalNotification(
      `Evidence "${title}" uploaded for control ${control?.id || 'Unknown'}`,
      'info'
    );
    return newEvidence;
  }
};