import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Vendor, Evidence, ControlMapping } from '../types';
import { UserRole, RiskLevel, PolicyStatus, VendorLifecycleStage } from '../types';
import { addGlobalNotification } from '../components/context/NotificationContext';

// Mock Data
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Martin', role: UserRole.CONSULTANT_OWNER, avatarUrl: '/avatars/avatar1.png', organizationId: 'org-consultancy' },
  { id: 'user-2', name: 'Bob Chen', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar2.png', organizationId: 'org-client-a' },
  { id: 'user-3', name: 'Charlie Davis', role: UserRole.CLIENT_USER, avatarUrl: '/avatars/avatar3.png', organizationId: 'org-client-a' },
  { id: 'user-4', name: 'Diana Prince', role: UserRole.CONSULTANT_ADMIN, avatarUrl: '/avatars/avatar4.png', organizationId: 'org-consultancy' },
  { id: 'user-5', name: 'Emma Wilson', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar5.png', organizationId: 'org-client-b' },
  { id: 'user-6', name: 'Frank Miller', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar6.png', organizationId: 'org-client-c' },
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
  { id: 'proj-1', name: 'Q3 2024 SOC 2 Audit', organizationId: 'org-client-a', frameworks: ['SOC 2', 'NIST CSF 2.0'], trend: 'up' },
  { id: 'proj-2', name: 'ISO 27001 Certification Prep', organizationId: 'org-client-b', frameworks: ['ISO 27001:2022'], trend: 'down' },
  { id: 'proj-3', name: 'PCI DSS Compliance Initiative', organizationId: 'org-client-c', frameworks: ['PCI DSS v4.0', 'SOC 2'], trend: 'stable' },
];

let mockControls: Control[] = [
  // SOC 2 Controls
  { id: 'SOC2-CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security measures to protect against threats to information systems.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
  { id: 'SOC2-CC6.2', name: 'Multi-Factor Authentication', description: 'The entity implements multi-factor authentication for users who have access to the systems.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
  { id: 'SOC2-CC6.3', name: 'Network Security Management', description: 'The entity implements network security measures to protect against unauthorized access.', family: 'Network Security', framework: 'SOC 2' },
  { id: 'SOC2-CC7.1', name: 'System Operations', description: 'The entity implements controls over system operations to prevent unauthorized access or modifications.', family: 'System Operations', framework: 'SOC 2' },
  { id: 'SOC2-CC8.1', name: 'Change Management', description: 'The entity implements controls over changes to the system.', family: 'Change Management', framework: 'SOC 2' },

  // ISO 27001 Controls
  { id: 'ISO-A.5.15', name: 'Access Control', description: 'Access to information and other associated assets should be managed based on business and information security requirements.', family: 'Access Control', framework: 'ISO 27001:2022' },
  { id: 'ISO-A.8.2', name: 'Information Classification', description: 'Information should be classified in terms of legal requirements, value, criticality and sensitivity.', family: 'Information Security', framework: 'ISO 27001:2022' },
  { id: 'ISO-A.12.1', name: 'Operational Procedures', description: 'Operating procedures should be documented and made available to all users who need them.', family: 'Operations Security', framework: 'ISO 27001:2022' },
  { id: 'ISO-A.16.1', name: 'Information Security Incident Management', description: 'Information security incidents should be reported through appropriate management channels.', family: 'Incident Management', framework: 'ISO 27001:2022' },

  // NIST CSF 2.0 Controls
  { id: 'NIST-PR.AC-1', name: 'Access Control Policies and Procedures', description: 'Access control policies and procedures are defined and implemented.', family: 'Access Control', framework: 'NIST CSF 2.0' },
  { id: 'NIST-PR.DS-1', name: 'Data Security', description: 'Data-at-rest is protected by access controls and encryption.', family: 'Data Security', framework: 'NIST CSF 2.0' },
  { id: 'NIST-DE.CM-1', name: 'Network Monitoring', description: 'The network is monitored to detect potential cybersecurity events.', family: 'Detection and Response', framework: 'NIST CSF 2.0' },

  // PCI DSS Controls
  { id: 'PCI-3.4', name: 'Cardholder Data Protection', description: 'Render PAN unreadable anywhere it is stored through strong cryptography.', family: 'Data Protection', framework: 'PCI DSS v4.0' },
  { id: 'PCI-8.2', name: 'User Authentication', description: 'Assign a unique ID to each person with computer access.', family: 'Access Control', framework: 'PCI DSS v4.0' },
  { id: 'PCI-11.1', name: 'Network Security Testing', description: 'Implement processes to test for the presence of wireless access points.', family: 'Network Security', framework: 'PCI DSS v4.0' },
];

let mockAssessmentItems: AssessmentItem[] = [
  // Project 1 (Fintech Innovations Inc. - SOC 2)
  { id: 'asm-1', controlId: 'SOC2-CC6.1', projectId: 'proj-1', status: 'In Progress', notes: 'Reviewing user access lists for key systems. Need to verify privileged access.' },
  { id: 'asm-2', controlId: 'SOC2-CC6.2', projectId: 'proj-1', status: 'Compliant', notes: 'MFA implemented across all systems. Using Okta for identity management.' },
  { id: 'asm-3', controlId: 'SOC2-CC6.3', projectId: 'proj-1', status: 'Non-Compliant', notes: 'Network segmentation incomplete. DMZ configuration needs review.' },
  { id: 'asm-4', controlId: 'SOC2-CC7.1', projectId: 'proj-1', status: 'Compliant', notes: 'System operations documented and monitored via CloudWatch.' },
  { id: 'asm-5', controlId: 'SOC2-CC8.1', projectId: 'proj-1', status: 'In Progress', notes: 'Change management process exists but needs formal approval workflow.' },
  { id: 'asm-6', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', status: 'Compliant', notes: 'Access control policies reviewed and updated Q3 2024.' },
  { id: 'asm-7', controlId: 'NIST-PR.DS-1', projectId: 'proj-1', status: 'Non-Compliant', notes: 'Database encryption enabled but key rotation policy missing.' },
  { id: 'asm-8', controlId: 'NIST-DE.CM-1', projectId: 'proj-1', status: 'In Progress', notes: 'SIEM deployment 80% complete. Tuning detection rules.' },

  // Project 2 (HealthPlus Solutions - ISO 27001)
  { id: 'asm-9', controlId: 'ISO-A.5.15', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Quarterly access reviews are overdue. Last review was 6 months ago.' },
  { id: 'asm-10', controlId: 'ISO-A.8.2', projectId: 'proj-2', status: 'Compliant', notes: 'Data classification scheme implemented with clear labeling standards.' },
  { id: 'asm-11', controlId: 'ISO-A.12.1', projectId: 'proj-2', status: 'In Progress', notes: 'Operational procedures documented but training not yet completed.' },
  { id: 'asm-12', controlId: 'ISO-A.16.1', projectId: 'proj-2', status: 'Compliant', notes: 'Incident response team established with 24/7 escalation procedures.' },

  // Project 3 (Global Retail Corp - PCI DSS)
  { id: 'asm-13', controlId: 'PCI-3.4', projectId: 'proj-3', status: 'Compliant', notes: 'All cardholder data encrypted using AES-256. Key management via HSM.' },
  { id: 'asm-14', controlId: 'PCI-8.2', projectId: 'proj-3', status: 'In Progress', notes: 'User ID assignment process being standardized across all locations.' },
  { id: 'asm-15', controlId: 'PCI-11.1', projectId: 'proj-3', status: 'Non-Compliant', notes: 'Wireless access point scanning not performed quarterly as required.' },
  { id: 'asm-16', controlId: 'SOC2-CC6.1', projectId: 'proj-3', status: 'Compliant', notes: 'Logical access controls implemented for payment processing systems.' },
];

let mockRisks: Risk[] = [
  // Project 1 Risks
  { id: 'risk-1', title: 'Over-privileged user accounts', level: RiskLevel.HIGH, status: 'Open', controlId: 'SOC2-CC6.1', projectId: 'proj-1' },
  { id: 'risk-2', title: 'Incomplete network segmentation', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'SOC2-CC6.3', projectId: 'proj-1' },
  { id: 'risk-3', title: 'Missing database encryption key rotation', level: RiskLevel.MEDIUM, status: 'Open', controlId: 'NIST-PR.DS-1', projectId: 'proj-1' },

  // Project 2 Risks
  { id: 'risk-4', title: 'Delayed patch management', level: RiskLevel.CRITICAL, status: 'Open', controlId: 'ISO-A.5.15', projectId: 'proj-2' },
  { id: 'risk-5', title: 'Insufficient staff training on procedures', level: RiskLevel.MEDIUM, status: 'Open', controlId: 'ISO-A.12.1', projectId: 'proj-2' },

  // Project 3 Risks
  { id: 'risk-6', title: 'Inconsistent user ID management across locations', level: RiskLevel.HIGH, status: 'Open', controlId: 'PCI-8.2', projectId: 'proj-3' },
  { id: 'risk-7', title: 'Missing wireless security assessments', level: RiskLevel.HIGH, status: 'Open', controlId: 'PCI-11.1', projectId: 'proj-3' },
];

let mockPolicies: Policy[] = [
  // Project 1 Policies
  { id: 'pol-1', title: 'Access Control Policy', content: 'This policy establishes guidelines for managing user access to information systems...', version: '1.2', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-1', lastUpdated: '2024-10-15', controlId: 'SOC2-CC6.1' },
  { id: 'pol-2', title: 'Change Management Policy', content: 'This policy defines the process for managing changes to production systems...', version: '2.1', status: PolicyStatus.IN_REVIEW, ownerId: 'user-1', projectId: 'proj-1', lastUpdated: '2024-11-01', controlId: 'SOC2-CC8.1' },

  // Project 2 Policies
  { id: 'pol-3', title: 'Information Classification Policy', content: 'This policy establishes a framework for classifying information assets...', version: '1.0', status: PolicyStatus.APPROVED, ownerId: 'user-5', projectId: 'proj-2', lastUpdated: '2024-09-20', controlId: 'ISO-A.8.2' },
  { id: 'pol-4', title: 'Incident Response Policy', content: 'This policy defines procedures for identifying and responding to security incidents...', version: '3.0', status: PolicyStatus.APPROVED, ownerId: 'user-5', projectId: 'proj-2', lastUpdated: '2024-08-15', controlId: 'ISO-A.16.1' },

  // Project 3 Policies
  { id: 'pol-5', title: 'Cardholder Data Protection Policy', content: 'This policy establishes requirements for protecting cardholder data...', version: '1.1', status: PolicyStatus.DRAFT, ownerId: 'user-6', projectId: 'proj-3', lastUpdated: '2024-11-10', controlId: 'PCI-3.4' },
];

let mockPolicyVersions: PolicyVersion[] = [
  { version: '1.2', date: '2024-10-15', editorId: 'user-2', changes: 'Updated to include remote access guidelines.' },
  { version: '1.1', date: '2024-08-01', editorId: 'user-2', changes: 'Clarified password complexity requirements.' },
  { version: '1.0', date: '2024-06-15', editorId: 'user-2', changes: 'Initial policy creation.' },
];

let mockVendors: Vendor[] = [
  // Project 1 Vendors
  { id: 'ven-1', name: 'AWS', service: 'Cloud Infrastructure', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CTO', projectId: 'proj-1' },
  { id: 'ven-2', name: 'Okta', service: 'Identity Management', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CISO', projectId: 'proj-1' },
  { id: 'ven-3', name: 'Splunk', service: 'SIEM Platform', tier: '2', status: VendorLifecycleStage.ONBOARDING, owner: 'Security Team', projectId: 'proj-1' },

  // Project 2 Vendors
  { id: 'ven-4', name: 'Microsoft Azure', service: 'Cloud Platform', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'IT Director', projectId: 'proj-2' },
  { id: 'ven-5', name: 'CrowdStrike', service: 'Endpoint Protection', tier: '2', status: VendorLifecycleStage.ACTIVE, owner: 'SOC Manager', projectId: 'proj-2' },

  // Project 3 Vendors
  { id: 'ven-6', name: 'Stripe', service: 'Payment Processing', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'Finance Director', projectId: 'proj-3' },
  { id: 'ven-7', name: 'Qualys', service: 'Vulnerability Management', tier: '2', status: VendorLifecycleStage.IDENTIFICATION, owner: 'IT Security', projectId: 'proj-3' },
];

let mockEvidence: Evidence[] = [
  // Project 1 Evidence
  { id: 'ev-1', title: 'Q3 2024 Access Review Spreadsheet.xlsx', fileUrl: '#', uploadDate: '2024-11-01', uploaderId: 'user-3', controlId: 'SOC2-CC6.1', projectId: 'proj-1' },
  { id: 'ev-2', title: 'MFA Configuration Screenshots.pdf', fileUrl: '#', uploadDate: '2024-10-28', uploaderId: 'user-2', controlId: 'SOC2-CC6.2', projectId: 'proj-1' },
  { id: 'ev-3', title: 'Network Architecture Diagram.png', fileUrl: '#', uploadDate: '2024-10-25', uploaderId: 'user-2', controlId: 'SOC2-CC6.3', projectId: 'proj-1' },
  { id: 'ev-4', title: 'Change Control Process Documentation.docx', fileUrl: '#', uploadDate: '2024-11-05', uploaderId: 'user-1', controlId: 'SOC2-CC8.1', projectId: 'proj-1' },
  { id: 'ev-5', title: 'CloudWatch Monitoring Setup.pdf', fileUrl: '#', uploadDate: '2024-10-20', uploaderId: 'user-2', controlId: 'SOC2-CC7.1', projectId: 'proj-1' },

  // Project 2 Evidence
  { id: 'ev-6', title: 'Access Review Tracking Sheet.xlsx', fileUrl: '#', uploadDate: '2024-09-15', uploaderId: 'user-5', controlId: 'ISO-A.5.15', projectId: 'proj-2' },
  { id: 'ev-7', title: 'Data Classification Labels Guide.pdf', fileUrl: '#', uploadDate: '2024-10-10', uploaderId: 'user-5', controlId: 'ISO-A.8.2', projectId: 'proj-2' },
  { id: 'ev-8', title: 'Incident Response Team Roster.docx', fileUrl: '#', uploadDate: '2024-08-20', uploaderId: 'user-5', controlId: 'ISO-A.16.1', projectId: 'proj-2' },

  // Project 3 Evidence
  { id: 'ev-9', title: 'PCI DSS Encryption Standards.pdf', fileUrl: '#', uploadDate: '2024-11-12', uploaderId: 'user-6', controlId: 'PCI-3.4', projectId: 'proj-3' },
  { id: 'ev-10', title: 'User ID Assignment Matrix.xlsx', fileUrl: '#', uploadDate: '2024-11-08', uploaderId: 'user-6', controlId: 'PCI-8.2', projectId: 'proj-3' },
];

let mockMappings: ControlMapping[] = [
  { id: 'map-1', sourceControlId: 'SOC2-CC6.1', targetControlId: 'ISO-A.5.15' },
  { id: 'map-2', sourceControlId: 'SOC2-CC6.2', targetControlId: 'PCI-8.2' },
  { id: 'map-3', sourceControlId: 'NIST-PR.AC-1', targetControlId: 'ISO-A.5.15' },
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

    // Find organization name for notification
    const org = mockOrganizations.find(o => o.id === organizationId);
    addGlobalNotification(
      `New engagement "${name}" created for ${org?.name || 'Unknown Client'}`,
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
      if (vendor) {
        vendor.status = stage;
        addGlobalNotification(
          `Vendor "${vendor.name}" advanced to ${stage} stage`,
          'info'
        );
      }
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

      // Also add to consultant links
      consultantClientLinks['org-consultancy'].push(newOrg.id);

      addGlobalNotification(
        `New client organization "${name}" has been added`,
        'success'
      );

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
      if (item) {
        item.notes = notes;
        // Don't notify for notes updates as they happen frequently
      }
  },
  createRisk: async (riskData: Omit<Risk, 'id'>): Promise<Risk> => {
    await delay(300);
    const newRisk: Risk = {
      ...riskData,
      id: `risk-${Date.now()}`
    };
    mockRisks.push(newRisk);

    const project = mockProjects.find(p => p.id === riskData.projectId);
    addGlobalNotification(
      `New ${riskData.level.toLowerCase()} risk "${riskData.title}" added to ${project?.name || 'project'}`,
      riskData.level === RiskLevel.CRITICAL ? 'error' : 'warning'
    );

    return newRisk;
  },
  createEvidence: async (evidenceData: Omit<Evidence, 'id' | 'uploadDate'>): Promise<Evidence> => {
    await delay(300);
    const newEvidence: Evidence = {
      ...evidenceData,
      id: `ev-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    mockEvidence.push(newEvidence);

    const control = mockControls.find(c => c.id === evidenceData.controlId);
    addGlobalNotification(
      `New evidence "${evidenceData.title}" uploaded for control ${control?.id || 'Unknown'}`,
      'info'
    );

    return newEvidence;
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