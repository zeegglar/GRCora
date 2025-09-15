import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Vendor, Evidence, ControlMapping, VendorRiskAssessment, VendorDueDiligence, VendorContract, VendorPerformanceMetric, VendorIncident, VendorCertification } from '../types';
import { UserRole, RiskLevel, PolicyStatus, VendorLifecycleStage, VendorCriticality, VendorRiskCategory, DueDiligenceStatus, ContractStatus } from '../types';

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
    {
        id: 'ven-1',
        name: 'Amazon Web Services (AWS)',
        description: 'Leading cloud computing platform providing scalable infrastructure services',
        website: 'https://aws.amazon.com',
        industry: 'Cloud Computing',
        headquarters: 'Seattle, WA, USA',
        foundedYear: 2006,
        employeeCount: '100,000+',
        annualRevenue: '$80B+',
        serviceCategory: 'Infrastructure & Platform Services',
        servicesProvided: ['Cloud Computing', 'Data Storage', 'Content Delivery', 'Database Services'],
        criticality: VendorCriticality.CRITICAL,
        tier: '1',
        overallRiskScore: 25,
        riskLevel: VendorCriticality.LOW,
        lastRiskAssessment: '2024-01-15',
        nextRiskAssessment: '2024-07-15',
        regulatoryRequirements: ['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA'],
        status: VendorLifecycleStage.ACTIVE,
        onboardingDate: '2023-06-15',
        nextReviewDate: '2024-06-15',
        businessOwner: 'CTO',
        technicalOwner: 'Lead DevOps Engineer',
        procurementOwner: 'VP Finance',
        contacts: [
            { name: 'John Smith', role: 'Technical Account Manager', email: 'j.smith@aws.amazon.com', phone: '+1-555-0123', isPrimary: true },
            { name: 'Sarah Johnson', role: 'Security Specialist', email: 's.johnson@aws.amazon.com', isPrimary: false }
        ],
        dataTypes: ['Customer Data', 'Application Data', 'Logs'],
        accessLevel: 'Administrative',
        hasSystemAccess: true,
        systemsAccessed: ['Production Environment', 'Staging Environment', 'Backup Systems'],
        annualSpend: 250000,
        currency: 'USD',
        paymentTerms: 'Net 30',
        certifications: [],
        complianceFrameworks: ['SOC 2 Type II', 'ISO 27001', 'PCI DSS'],
        projectId: 'proj-1',
        subVendors: ['ven-2']
    },
    {
        id: 'ven-2',
        name: 'DataGuard Solutions',
        description: 'Specialized cybersecurity firm providing threat monitoring and incident response',
        website: 'https://dataguard.example.com',
        industry: 'Cybersecurity',
        headquarters: 'Austin, TX, USA',
        foundedYear: 2018,
        employeeCount: '50-100',
        annualRevenue: '$10M-25M',
        serviceCategory: 'Security Services',
        servicesProvided: ['SOC Services', 'Incident Response', 'Vulnerability Assessment'],
        criticality: VendorCriticality.HIGH,
        tier: '2',
        overallRiskScore: 45,
        riskLevel: VendorCriticality.MEDIUM,
        lastRiskAssessment: '2024-02-01',
        nextRiskAssessment: '2024-08-01',
        regulatoryRequirements: ['SOC 2', 'ISO 27001'],
        status: VendorLifecycleStage.ACTIVE,
        onboardingDate: '2023-09-01',
        nextReviewDate: '2024-09-01',
        businessOwner: 'CISO',
        technicalOwner: 'Security Manager',
        procurementOwner: 'Procurement Manager',
        contacts: [
            { name: 'Mike Chen', role: 'Account Manager', email: 'm.chen@dataguard.example.com', phone: '+1-555-0456', isPrimary: true }
        ],
        dataTypes: ['Security Logs', 'Incident Data'],
        accessLevel: 'Privileged',
        hasSystemAccess: true,
        systemsAccessed: ['SIEM Systems', 'Security Tools'],
        annualSpend: 120000,
        currency: 'USD',
        paymentTerms: 'Net 15',
        certifications: [],
        complianceFrameworks: ['SOC 2 Type II', 'ISO 27001'],
        projectId: 'proj-1',
        parentVendorId: 'ven-1'
    },
    {
        id: 'ven-3',
        name: 'HealthTech Analytics',
        description: 'Healthcare data analytics platform for patient outcomes analysis',
        website: 'https://healthtech-analytics.example.com',
        industry: 'Healthcare Technology',
        headquarters: 'Boston, MA, USA',
        foundedYear: 2020,
        employeeCount: '25-50',
        annualRevenue: '$5M-10M',
        serviceCategory: 'Data Analytics',
        servicesProvided: ['Patient Analytics', 'Reporting Dashboard', 'Data Integration'],
        criticality: VendorCriticality.HIGH,
        tier: '2',
        overallRiskScore: 55,
        riskLevel: VendorCriticality.MEDIUM,
        lastRiskAssessment: '2024-01-20',
        nextRiskAssessment: '2024-07-20',
        regulatoryRequirements: ['HIPAA', 'SOC 2'],
        status: VendorLifecycleStage.ONBOARDING,
        nextReviewDate: '2024-05-15',
        businessOwner: 'Chief Medical Officer',
        technicalOwner: 'Data Engineering Lead',
        procurementOwner: 'VP Operations',
        contacts: [
            { name: 'Dr. Lisa Williams', role: 'Clinical Solutions Lead', email: 'l.williams@healthtech.example.com', phone: '+1-555-0789', isPrimary: true },
            { name: 'Tom Rodriguez', role: 'Implementation Manager', email: 't.rodriguez@healthtech.example.com', isPrimary: false }
        ],
        dataTypes: ['PHI', 'Clinical Data', 'Analytics Data'],
        accessLevel: 'Standard',
        hasSystemAccess: true,
        systemsAccessed: ['Analytics Platform', 'Data Warehouse'],
        annualSpend: 85000,
        currency: 'USD',
        paymentTerms: 'Net 30',
        certifications: [],
        complianceFrameworks: ['HIPAA', 'SOC 2 Type I'],
        projectId: 'proj-2'
    }
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