import type { User, Organization, Project, Control, AssessmentItem, Risk, Policy, PolicyVersion, Vendor, Evidence, ControlMapping, VendorRiskAssessment, VendorDueDiligence, VendorContract, VendorPerformanceMetric, VendorIncident, VendorCertification } from '../types';
import { UserRole, RiskLevel, PolicyStatus, VendorLifecycleStage, VendorCriticality, VendorRiskCategory, DueDiligenceStatus, ContractStatus } from '../types';

// Mock Data - Realistic cybersecurity scenarios
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Sarah Mitchell', role: UserRole.CONSULTANT_OWNER, avatarUrl: '/avatars/avatar1.png', organizationId: 'org-consultancy' },
  { id: 'user-2', name: 'Dr. James Chen', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar2.png', organizationId: 'org-medical-center' },
  { id: 'user-3', name: 'Maria Rodriguez', role: UserRole.CLIENT_USER, avatarUrl: '/avatars/avatar3.png', organizationId: 'org-financial-trust' },
  { id: 'user-4', name: 'Alex Thompson', role: UserRole.CLIENT_USER, avatarUrl: '/avatars/avatar4.png', organizationId: 'org-techflow-mfg' },
  { id: 'user-5', name: 'Lisa Park', role: UserRole.CLIENT_ADMIN, avatarUrl: '/avatars/avatar5.png', organizationId: 'org-innovate-tech' },
  { id: 'user-6', name: 'Michael Davis', role: UserRole.CONSULTANT_ADMIN, avatarUrl: '/avatars/avatar6.png', organizationId: 'org-consultancy' },
];

export const mockOrganizations: Organization[] = [
  { id: 'org-consultancy', name: 'SecureGRC Consultants' },
  { id: 'org-medical-center', name: 'Regional Medical Center' },
  { id: 'org-financial-trust', name: 'Financial Trust Corp' },
  { id: 'org-techflow-mfg', name: 'TechFlow Manufacturing' },
  { id: 'org-innovate-tech', name: 'InnovateTech Startup' },
];

export const consultantClientLinks: Record<string, string[]> = {
    'org-consultancy': ['org-medical-center', 'org-financial-trust', 'org-techflow-mfg', 'org-innovate-tech']
}

let mockProjects: Project[] = [
  { id: 'proj-1', name: 'Post-Ransomware Recovery Assessment', organizationId: 'org-medical-center', frameworks: ['ISO 27001:2022', 'HIPAA'] },
  { id: 'proj-2', name: 'Cloud Migration Security Review', organizationId: 'org-financial-trust', frameworks: ['SOC 2', 'NIST CSF 2.0'] },
  { id: 'proj-3', name: 'Supply Chain Security Assessment', organizationId: 'org-techflow-mfg', frameworks: ['NIST CSF 2.0', 'ISO 27001:2022'] },
  { id: 'proj-4', name: 'Insider Threat Response & Controls', organizationId: 'org-innovate-tech', frameworks: ['SOC 2', 'NIST CSF 2.0'] },
];

let mockControls: Control[] = [
    // SOC 2 Controls
    { id: 'SOC2-CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security measures to protect against threats to information systems.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'SOC2-CC6.2', name: 'User Access Management', description: 'The entity restricts user access to information based on their assigned authority level.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'SOC2-CC6.3', name: 'Data Access Restrictions', description: 'The entity restricts access to data and system configurations based on user authorization.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
    { id: 'SOC2-CC7.1', name: 'System Boundary', description: 'The entity implements controls to protect the boundaries of its systems.', family: 'System Operations', framework: 'SOC 2' },
    { id: 'SOC2-CC8.1', name: 'Change Management', description: 'The entity implements controls related to changes to systems and software.', family: 'Change Management', framework: 'SOC 2' },

    // ISO 27001 Controls
    { id: 'ISO-A.5.15', name: 'Access Control', description: 'Access to information and other associated assets should be managed based on business and information security requirements.', family: 'Access Control', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.5.16', name: 'Identity Management', description: 'The full life cycle of identities should be managed.', family: 'Access Control', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.8.1', name: 'User Endpoint Devices', description: 'Information stored on, processed by or accessible via user endpoint devices should be protected.', family: 'Technology', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.8.23', name: 'Web Filtering', description: 'Access to external websites should be managed to reduce exposure to malicious content.', family: 'Technology', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.6.4', name: 'Incident Response', description: 'Information security incidents should be responded to in accordance with documented procedures.', family: 'Incident Management', framework: 'ISO 27001:2022' },

    // NIST CSF Controls
    { id: 'NIST-PR.AC-1', name: 'Access Control Policies and Procedures', description: 'Access control policies and procedures are defined and implemented.', family: 'Access Control', framework: 'NIST CSF 2.0' },
    { id: 'NIST-PR.AC-3', name: 'Remote Access Management', description: 'Remote access is managed and monitored.', family: 'Access Control', framework: 'NIST CSF 2.0' },
    { id: 'NIST-PR.DS-1', name: 'Data-at-rest Protection', description: 'Data-at-rest is protected using appropriate mechanisms.', family: 'Data Security', framework: 'NIST CSF 2.0' },
    { id: 'NIST-PR.DS-2', name: 'Data-in-transit Protection', description: 'Data-in-transit is protected using appropriate mechanisms.', family: 'Data Security', framework: 'NIST CSF 2.0' },
    { id: 'NIST-DE.CM-1', name: 'Network Monitoring', description: 'Networks and network communications are monitored to detect potential cybersecurity events.', family: 'Anomalies and Events', framework: 'NIST CSF 2.0' },
    { id: 'NIST-RS.RP-1', name: 'Response Plan Execution', description: 'Response plan is executed during or after an incident.', family: 'Response Planning', framework: 'NIST CSF 2.0' },
];

let mockAssessmentItems: AssessmentItem[] = [
    { id: 'asm-1', controlId: 'SOC2-CC6.1', projectId: 'proj-1', status: 'In Progress', notes: 'Reviewing user access lists for key systems.' },
    { id: 'asm-2', controlId: 'NIST-PR.AC-1', projectId: 'proj-1', status: 'Compliant', notes: 'Policy is documented and approved.' },
    { id: 'asm-3', controlId: 'ISO-A.5.15', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Quarterly access reviews are overdue.' },
    { id: 'asm-4', controlId: 'SOC2-CC6.2', projectId: 'proj-1', status: 'Compliant', notes: 'Multi-factor authentication implemented for all privileged accounts.' },
    { id: 'asm-5', controlId: 'SOC2-CC6.3', projectId: 'proj-1', status: 'In Progress', notes: 'Testing network access controls and segmentation.' },
    { id: 'asm-6', controlId: 'ISO-A.9.1.2', projectId: 'proj-1', status: 'Compliant', notes: 'Access to networks and network services documented and approved.' },
    { id: 'asm-7', controlId: 'ISO-A.12.1.2', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Malware protection procedures need updating.' },
    { id: 'asm-8', controlId: 'NIST-PR.DS-1', projectId: 'proj-1', status: 'Compliant', notes: 'Data-at-rest protection controls verified.' },
    { id: 'asm-9', controlId: 'NIST-PR.DS-2', projectId: 'proj-2', status: 'In Progress', notes: 'Data-in-transit protection assessment ongoing.' },
    { id: 'asm-10', controlId: 'NIST-DE.AE-1', projectId: 'proj-1', status: 'Compliant', notes: 'Baseline network traffic established and monitored.' },
    { id: 'asm-11', controlId: 'ISO-A.16.1.2', projectId: 'proj-2', status: 'In Progress', notes: 'Incident response procedures under review.' },
    { id: 'asm-12', controlId: 'NIST-RS.RP-1', projectId: 'proj-1', status: 'Compliant', notes: 'Response plan executed during tabletop exercise.' },
    { id: 'asm-13', controlId: 'SOC2-CC7.1', projectId: 'proj-2', status: 'Non-Compliant', notes: 'Change management approval process gaps identified.' },
    { id: 'asm-14', controlId: 'ISO-A.14.2.2', projectId: 'proj-1', status: 'Compliant', notes: 'System development lifecycle policy reviewed.' },
    { id: 'asm-15', controlId: 'NIST-PR.IP-1', projectId: 'proj-2', status: 'In Progress', notes: 'Information system inventory being updated.' },
    { id: 'asm-16', controlId: 'SOC2-CC8.1', projectId: 'proj-1', status: 'Compliant', notes: 'Change management controls tested and verified.' }
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
    { id: 'pol-1', title: 'Access Control Policy', content: 'Comprehensive policy governing user access to information systems and data assets.', version: '1.2', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-1', lastUpdated: '2023-10-15', controlId: 'SOC2-CC6.1' },
    { id: 'pol-2', title: 'Information Security Policy', content: 'Establishes the framework for protecting organizational information assets.', version: '2.1', status: PolicyStatus.APPROVED, ownerId: 'user-4', projectId: 'proj-1', lastUpdated: '2023-11-20', controlId: 'ISO-A.5.1.1' },
    { id: 'pol-3', title: 'Incident Response Policy', content: 'Defines procedures for detecting, responding to, and recovering from security incidents.', version: '1.0', status: PolicyStatus.IN_REVIEW, ownerId: 'user-3', projectId: 'proj-2', lastUpdated: '2023-12-01', controlId: 'ISO-A.16.1.2' },
    { id: 'pol-4', title: 'Data Protection Policy', content: 'Guidelines for protecting personal and sensitive data throughout its lifecycle.', version: '1.3', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-1', lastUpdated: '2023-09-15', controlId: 'NIST-PR.DS-1' },
    { id: 'pol-5', title: 'Change Management Policy', content: 'Procedures for managing changes to information systems and applications.', version: '1.1', status: PolicyStatus.DRAFT, ownerId: 'user-4', projectId: 'proj-2', lastUpdated: '2023-12-10', controlId: 'SOC2-CC8.1' },
    { id: 'pol-6', title: 'Network Security Policy', content: 'Standards for securing network infrastructure and communications.', version: '2.0', status: PolicyStatus.APPROVED, ownerId: 'user-3', projectId: 'proj-1', lastUpdated: '2023-08-30', controlId: 'ISO-A.9.1.2' },
    { id: 'pol-7', title: 'Business Continuity Policy', content: 'Framework for maintaining business operations during disruptions.', version: '1.4', status: PolicyStatus.APPROVED, ownerId: 'user-2', projectId: 'proj-2', lastUpdated: '2023-07-15', controlId: 'NIST-RC.RP-1' },
    { id: 'pol-8', title: 'Vendor Management Policy', content: 'Guidelines for managing third-party vendor relationships and risks.', version: '1.0', status: PolicyStatus.IN_REVIEW, ownerId: 'user-4', projectId: 'proj-1', lastUpdated: '2023-11-05', controlId: 'SOC2-CC9.1' }
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
    },
    {
        id: 'ven-4',
        name: 'Microsoft Corporation',
        description: 'Global technology company providing cloud computing, productivity software, and business applications',
        website: 'https://microsoft.com',
        industry: 'Software & Technology',
        headquarters: 'Redmond, WA, USA',
        foundedYear: 1975,
        employeeCount: '200,000+',
        annualRevenue: '$200B+',
        serviceCategory: 'Productivity & Collaboration',
        servicesProvided: ['Office 365', 'Azure Active Directory', 'Teams', 'SharePoint'],
        criticality: VendorCriticality.CRITICAL,
        tier: '1',
        overallRiskScore: 20,
        riskLevel: VendorCriticality.LOW,
        lastRiskAssessment: '2024-01-10',
        nextRiskAssessment: '2024-07-10',
        regulatoryRequirements: ['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA'],
        status: VendorLifecycleStage.ACTIVE,
        onboardingDate: '2022-03-01',
        nextReviewDate: '2024-03-01',
        businessOwner: 'CTO',
        technicalOwner: 'IT Director',
        procurementOwner: 'Chief Procurement Officer',
        contacts: [
            { name: 'Jennifer Park', role: 'Enterprise Account Manager', email: 'j.park@microsoft.com', phone: '+1-555-0100', isPrimary: true }
        ],
        dataTypes: ['Business Data', 'User Data', 'Communication Data'],
        accessLevel: 'Standard',
        hasSystemAccess: true,
        systemsAccessed: ['Email Systems', 'Collaboration Platforms', 'Identity Management'],
        annualSpend: 350000,
        currency: 'USD',
        paymentTerms: 'Net 30',
        certifications: [],
        complianceFrameworks: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
        projectId: 'proj-1'
    },
    {
        id: 'ven-5',
        name: 'Splunk Inc.',
        description: 'Security and observability platform for searching, monitoring, and analyzing machine data',
        website: 'https://splunk.com',
        industry: 'Security & Analytics',
        headquarters: 'San Francisco, CA, USA',
        foundedYear: 2003,
        employeeCount: '7,000-10,000',
        annualRevenue: '$3B+',
        serviceCategory: 'Security Monitoring',
        servicesProvided: ['SIEM', 'Log Analysis', 'Security Analytics', 'Incident Investigation'],
        criticality: VendorCriticality.HIGH,
        tier: '1',
        overallRiskScore: 30,
        riskLevel: VendorCriticality.LOW,
        lastRiskAssessment: '2024-02-15',
        nextRiskAssessment: '2024-08-15',
        regulatoryRequirements: ['SOC 2', 'ISO 27001'],
        status: VendorLifecycleStage.ACTIVE,
        onboardingDate: '2023-01-15',
        nextReviewDate: '2024-08-15',
        businessOwner: 'CISO',
        technicalOwner: 'Security Operations Manager',
        procurementOwner: 'IT Procurement',
        contacts: [
            { name: 'David Kumar', role: 'Technical Account Manager', email: 'd.kumar@splunk.com', phone: '+1-555-0200', isPrimary: true }
        ],
        dataTypes: ['Security Logs', 'System Logs', 'Application Logs'],
        accessLevel: 'Privileged',
        hasSystemAccess: true,
        systemsAccessed: ['SIEM Platform', 'Log Aggregation Systems'],
        annualSpend: 180000,
        currency: 'USD',
        paymentTerms: 'Net 45',
        certifications: [],
        complianceFrameworks: ['SOC 2 Type II', 'ISO 27001'],
        projectId: 'proj-2'
    },
    {
        id: 'ven-6',
        name: 'CloudFlare Inc.',
        description: 'Web infrastructure and security company providing CDN, DDoS protection, and security services',
        website: 'https://cloudflare.com',
        industry: 'Web Infrastructure',
        headquarters: 'San Francisco, CA, USA',
        foundedYear: 2009,
        employeeCount: '3,000-5,000',
        annualRevenue: '$1B+',
        serviceCategory: 'Web Security & Performance',
        servicesProvided: ['CDN', 'DDoS Protection', 'Web Application Firewall', 'DNS Services'],
        criticality: VendorCriticality.HIGH,
        tier: '2',
        overallRiskScore: 35,
        riskLevel: VendorCriticality.LOW,
        lastRiskAssessment: '2024-01-25',
        nextRiskAssessment: '2024-07-25',
        regulatoryRequirements: ['SOC 2', 'ISO 27001'],
        status: VendorLifecycleStage.ACTIVE,
        onboardingDate: '2023-05-01',
        nextReviewDate: '2024-05-01',
        businessOwner: 'Infrastructure Lead',
        technicalOwner: 'Network Operations',
        procurementOwner: 'IT Procurement',
        contacts: [
            { name: 'Sarah Johnson', role: 'Solutions Engineer', email: 's.johnson@cloudflare.com', phone: '+1-555-0300', isPrimary: true }
        ],
        dataTypes: ['Web Traffic Data', 'DNS Queries', 'Security Event Data'],
        accessLevel: 'Standard',
        hasSystemAccess: false,
        systemsAccessed: [],
        annualSpend: 95000,
        currency: 'USD',
        paymentTerms: 'Net 30',
        certifications: [],
        complianceFrameworks: ['SOC 2 Type II', 'ISO 27001'],
        projectId: 'proj-1'
    }
];

let mockEvidence: Evidence[] = [
    { id: 'ev-1', title: 'Q3 Access Review Spreadsheet.xlsx', fileUrl: '#', uploadDate: '2023-11-01', uploaderId: 'user-3', controlId: 'SOC2-CC6.1', projectId: 'proj-1' },
    { id: 'ev-2', title: 'MFA Implementation Screenshots.pdf', fileUrl: '#', uploadDate: '2023-11-15', uploaderId: 'user-4', controlId: 'SOC2-CC6.2', projectId: 'proj-1' },
    { id: 'ev-3', title: 'Network Segmentation Diagram.vsdx', fileUrl: '#', uploadDate: '2023-10-20', uploaderId: 'user-2', controlId: 'SOC2-CC6.3', projectId: 'proj-1' },
    { id: 'ev-4', title: 'Encryption Configuration Report.docx', fileUrl: '#', uploadDate: '2023-09-30', uploaderId: 'user-3', controlId: 'NIST-PR.DS-1', projectId: 'proj-1' },
    { id: 'ev-5', title: 'Incident Response Test Results.pdf', fileUrl: '#', uploadDate: '2023-12-05', uploaderId: 'user-2', controlId: 'ISO-A.16.1.2', projectId: 'proj-2' },
    { id: 'ev-6', title: 'Change Control Board Minutes.docx', fileUrl: '#', uploadDate: '2023-11-28', uploaderId: 'user-4', controlId: 'SOC2-CC8.1', projectId: 'proj-1' },
    { id: 'ev-7', title: 'Security Monitoring Dashboard.png', fileUrl: '#', uploadDate: '2023-10-15', uploaderId: 'user-3', controlId: 'NIST-DE.AE-1', projectId: 'proj-1' },
    { id: 'ev-8', title: 'Vulnerability Scan Report Q4.pdf', fileUrl: '#', uploadDate: '2023-12-01', uploaderId: 'user-2', controlId: 'ISO-A.12.6.1', projectId: 'proj-2' },
    { id: 'ev-9', title: 'Data Backup Verification Log.xlsx', fileUrl: '#', uploadDate: '2023-11-10', uploaderId: 'user-4', controlId: 'NIST-PR.IP-4', projectId: 'proj-1' },
    { id: 'ev-10', title: 'Asset Inventory Report.csv', fileUrl: '#', uploadDate: '2023-10-25', uploaderId: 'user-3', controlId: 'NIST-PR.IP-1', projectId: 'proj-2' },
    { id: 'ev-11', title: 'User Training Completion Records.xlsx', fileUrl: '#', uploadDate: '2023-09-15', uploaderId: 'user-2', controlId: 'ISO-A.7.2.2', projectId: 'proj-1' },
    { id: 'ev-12', title: 'Third-Party Security Assessment.pdf', fileUrl: '#', uploadDate: '2023-11-20', uploaderId: 'user-4', controlId: 'SOC2-CC9.1', projectId: 'proj-1' }
];

let mockMappings: ControlMapping[] = [
    { id: 'map-1', sourceControlId: 'SOC2-CC6.1', targetControlId: 'ISO-A.5.15' }
];

// TPRM Mock Data
let mockVendorRiskAssessments: VendorRiskAssessment[] = [
    {
        id: 'vra-1',
        vendorId: 'ven-1',
        assessmentDate: '2024-01-15',
        assessorId: 'user-4',
        overallRiskScore: 25,
        riskLevel: VendorCriticality.LOW,
        categories: {
            [VendorRiskCategory.OPERATIONAL]: { score: 20, notes: 'Excellent uptime and service reliability', lastUpdated: '2024-01-15' },
            [VendorRiskCategory.FINANCIAL]: { score: 15, notes: 'Strong financial position, publicly traded', lastUpdated: '2024-01-15' },
            [VendorRiskCategory.COMPLIANCE]: { score: 25, notes: 'Maintains multiple compliance certifications', lastUpdated: '2024-01-15' },
            [VendorRiskCategory.SECURITY]: { score: 30, notes: 'Industry-leading security practices', lastUpdated: '2024-01-15' },
            [VendorRiskCategory.REPUTATION]: { score: 20, notes: 'Market leader with strong reputation', lastUpdated: '2024-01-15' }
        },
        mitigationActions: [
            {
                id: 'vma-1',
                description: 'Review and update data encryption configurations',
                priority: 'Medium',
                status: 'In Progress',
                assignedTo: 'user-4',
                dueDate: '2024-03-15',
            }
        ],
        nextReviewDate: '2024-07-15'
    },
    {
        id: 'vra-2',
        vendorId: 'ven-2',
        assessmentDate: '2024-02-01',
        assessorId: 'user-4',
        overallRiskScore: 45,
        riskLevel: VendorCriticality.MEDIUM,
        categories: {
            [VendorRiskCategory.OPERATIONAL]: { score: 40, notes: 'Growing company with some operational scaling challenges', lastUpdated: '2024-02-01' },
            [VendorRiskCategory.FINANCIAL]: { score: 55, notes: 'Private company, limited financial transparency', lastUpdated: '2024-02-01' },
            [VendorRiskCategory.COMPLIANCE]: { score: 35, notes: 'Working towards additional certifications', lastUpdated: '2024-02-01' },
            [VendorRiskCategory.SECURITY]: { score: 30, notes: 'Strong security focus as core business', lastUpdated: '2024-02-01' },
            [VendorRiskCategory.REPUTATION]: { score: 45, notes: 'Good reputation in cybersecurity space', lastUpdated: '2024-02-01' }
        },
        mitigationActions: [
            {
                id: 'vma-2',
                description: 'Obtain additional financial references',
                priority: 'High',
                status: 'Open',
                assignedTo: 'user-2',
                dueDate: '2024-04-01',
            },
            {
                id: 'vma-3',
                description: 'Review service level agreements and penalties',
                priority: 'Medium',
                status: 'Completed',
                assignedTo: 'user-4',
                dueDate: '2024-02-15',
                completedDate: '2024-02-14'
            }
        ],
        nextReviewDate: '2024-08-01'
    }
];

let mockVendorContracts: VendorContract[] = [
    {
        id: 'vc-1',
        vendorId: 'ven-1',
        title: 'Cloud Services Master Agreement',
        type: 'MSA',
        status: ContractStatus.EXECUTED,
        startDate: '2023-06-15',
        endDate: '2025-06-14',
        renewalDate: '2025-04-15',
        annualValue: 250000,
        currency: 'USD',
        documentUrl: '/contracts/aws-msa-2023.pdf',
        keyTerms: ['Data residency requirements', 'SLA 99.9% uptime', 'Right to audit', 'GDPR compliance'],
        rightToAudit: true,
        dataProcessing: true,
        notifications: { renewal: 60, expiry: 30 }
    },
    {
        id: 'vc-2',
        vendorId: 'ven-1',
        title: 'Data Processing Agreement',
        type: 'DPA',
        status: ContractStatus.EXECUTED,
        startDate: '2023-06-15',
        endDate: '2025-06-14',
        annualValue: 0,
        currency: 'USD',
        keyTerms: ['GDPR Article 28 compliance', 'Data subject rights', 'Breach notification 24hrs'],
        rightToAudit: true,
        dataProcessing: true,
        notifications: { renewal: 90, expiry: 60 }
    },
    {
        id: 'vc-3',
        vendorId: 'ven-2',
        title: 'Security Services Agreement',
        type: 'MSA',
        status: ContractStatus.EXECUTED,
        startDate: '2023-09-01',
        endDate: '2024-08-31',
        renewalDate: '2024-06-01',
        annualValue: 120000,
        currency: 'USD',
        keyTerms: ['24/7 SOC monitoring', 'Incident response SLA 1hr', 'Monthly security reports'],
        rightToAudit: true,
        dataProcessing: false,
        notifications: { renewal: 90, expiry: 30 }
    }
];

let mockVendorDueDiligence: VendorDueDiligence[] = [
    {
        id: 'vdd-1',
        vendorId: 'ven-1',
        status: DueDiligenceStatus.COMPLETED,
        checklist: [
            {
                id: 'ddi-1',
                category: 'Financial',
                requirement: 'Audited financial statements for last 2 years',
                status: 'Approved',
                evidence: 'AWS 10-K SEC filings 2022-2023',
                reviewNotes: 'Strong financial position confirmed',
                dueDate: '2023-05-15',
                completedDate: '2023-05-10'
            },
            {
                id: 'ddi-2',
                category: 'Security',
                requirement: 'SOC 2 Type II certification',
                status: 'Approved',
                evidence: 'AWS SOC 2 Type II Report 2023',
                reviewNotes: 'Current certification verified',
                dueDate: '2023-05-15',
                completedDate: '2023-05-12'
            },
            {
                id: 'ddi-3',
                category: 'Insurance',
                requirement: 'Cyber liability insurance minimum $10M',
                status: 'Approved',
                evidence: 'Insurance certificate on file',
                reviewNotes: 'Coverage exceeds requirements',
                dueDate: '2023-05-15',
                completedDate: '2023-05-14'
            }
        ],
        startDate: '2023-05-01',
        completedDate: '2023-05-20',
        reviewedBy: 'user-4',
        approvedBy: 'user-1',
        notes: 'All requirements met. Vendor approved for critical services.'
    },
    {
        id: 'vdd-2',
        vendorId: 'ven-2',
        status: DueDiligenceStatus.COMPLETED,
        checklist: [
            {
                id: 'ddi-4',
                category: 'Financial',
                requirement: 'Financial references from 3 clients',
                status: 'Approved',
                evidence: 'Reference letters on file',
                reviewNotes: 'Positive references received',
                dueDate: '2023-08-15',
                completedDate: '2023-08-12'
            },
            {
                id: 'ddi-5',
                category: 'Security',
                requirement: 'ISO 27001 certification',
                status: 'Approved',
                evidence: 'ISO 27001 certificate 2023',
                reviewNotes: 'Valid certification confirmed',
                dueDate: '2023-08-15',
                completedDate: '2023-08-10'
            }
        ],
        startDate: '2023-08-01',
        completedDate: '2023-08-20',
        reviewedBy: 'user-4',
        approvedBy: 'user-1',
        notes: 'Satisfactory completion of due diligence requirements.'
    },
    {
        id: 'vdd-3',
        vendorId: 'ven-3',
        status: DueDiligenceStatus.IN_PROGRESS,
        checklist: [
            {
                id: 'ddi-6',
                category: 'Healthcare',
                requirement: 'HIPAA compliance documentation',
                status: 'Submitted',
                evidence: 'HIPAA compliance checklist submitted',
                reviewNotes: 'Under review by compliance team',
                dueDate: '2024-03-01'
            },
            {
                id: 'ddi-7',
                category: 'Security',
                requirement: 'Penetration testing report',
                status: 'Pending',
                dueDate: '2024-03-15'
            },
            {
                id: 'ddi-8',
                category: 'Financial',
                requirement: 'Proof of cyber insurance',
                status: 'Submitted',
                evidence: 'Insurance certificate provided',
                reviewNotes: 'Reviewing coverage limits',
                dueDate: '2024-02-28'
            }
        ],
        startDate: '2024-01-15',
        notes: 'Healthcare vendor onboarding in progress. HIPAA compliance is priority.'
    }
];

let mockVendorPerformanceMetrics: VendorPerformanceMetric[] = [
    {
        id: 'vpm-1',
        vendorId: 'ven-1',
        metricType: 'Availability',
        name: 'Service Uptime',
        target: 99.9,
        actual: 99.95,
        unit: '%',
        period: '2024-Q1',
        lastUpdated: '2024-03-31'
    },
    {
        id: 'vpm-2',
        vendorId: 'ven-1',
        metricType: 'Response Time',
        name: 'Support Response Time',
        target: 4,
        actual: 2.5,
        unit: 'hours',
        period: '2024-Q1',
        lastUpdated: '2024-03-31'
    },
    {
        id: 'vpm-3',
        vendorId: 'ven-2',
        metricType: 'SLA',
        name: 'Incident Response Time',
        target: 1,
        actual: 0.75,
        unit: 'hours',
        period: '2024-Q1',
        lastUpdated: '2024-03-31'
    },
    {
        id: 'vpm-4',
        vendorId: 'ven-2',
        metricType: 'Quality Score',
        name: 'Threat Detection Accuracy',
        target: 95,
        actual: 97.5,
        unit: '%',
        period: '2024-Q1',
        lastUpdated: '2024-03-31'
    }
];

let mockVendorIncidents: VendorIncident[] = [
    {
        id: 'vi-1',
        vendorId: 'ven-1',
        title: 'Regional Service Outage - US-East-1',
        description: 'Partial service degradation affecting compute instances in US-East-1 region',
        severity: 'Medium',
        status: 'Resolved',
        reportedDate: '2024-02-15T14:30:00Z',
        resolvedDate: '2024-02-15T16:45:00Z',
        impact: 'Some services experienced increased latency. No data loss occurred.',
        rootCause: 'Network configuration change caused routing issues',
        preventiveActions: 'Enhanced change management procedures implemented'
    },
    {
        id: 'vi-2',
        vendorId: 'ven-2',
        title: 'False Positive Alert Storm',
        description: 'SIEM system generated excessive false positive alerts due to signature update',
        severity: 'Low',
        status: 'Resolved',
        reportedDate: '2024-03-02T09:15:00Z',
        resolvedDate: '2024-03-02T11:30:00Z',
        impact: 'Temporary increase in alert volume, no security impact',
        rootCause: 'Signature update contained overly broad detection rules',
        preventiveActions: 'Enhanced testing procedures for signature updates'
    },
    {
        id: 'vi-3',
        vendorId: 'ven-3',
        title: 'Data Processing Delay',
        description: 'Analytics pipeline experiencing delays in processing patient data',
        severity: 'Medium',
        status: 'Investigating',
        reportedDate: '2024-03-10T08:00:00Z',
        impact: 'Reporting delays of 2-4 hours for some analytics dashboards'
    }
];

let mockVendorCertifications: VendorCertification[] = [
    {
        id: 'cert-1',
        name: 'SOC 2 Type II',
        issuer: 'AICPA',
        validFrom: '2023-01-01',
        validUntil: '2024-12-31',
        status: 'Valid',
        documentUrl: '/certifications/aws-soc2-2023.pdf'
    },
    {
        id: 'cert-2',
        name: 'ISO 27001:2013',
        issuer: 'BSI',
        validFrom: '2023-03-15',
        validUntil: '2026-03-14',
        status: 'Valid',
        documentUrl: '/certifications/aws-iso27001-2023.pdf'
    },
    {
        id: 'cert-3',
        name: 'PCI DSS Level 1',
        issuer: 'PCI Security Standards Council',
        validFrom: '2023-06-01',
        validUntil: '2024-05-31',
        status: 'Expiring Soon',
        documentUrl: '/certifications/aws-pcidss-2023.pdf'
    }
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
  },

  // TPRM API functions
  getVendorRiskAssessments: async (vendorId: string): Promise<VendorRiskAssessment[]> => {
    await delay(300);
    return mockVendorRiskAssessments.filter(vra => vra.vendorId === vendorId);
  },

  getVendorContracts: async (vendorId: string): Promise<VendorContract[]> => {
    await delay(300);
    return mockVendorContracts.filter(vc => vc.vendorId === vendorId);
  },

  getVendorDueDiligence: async (vendorId: string): Promise<VendorDueDiligence[]> => {
    await delay(300);
    return mockVendorDueDiligence.filter(vdd => vdd.vendorId === vendorId);
  },

  getVendorPerformanceMetrics: async (vendorId: string): Promise<VendorPerformanceMetric[]> => {
    await delay(300);
    return mockVendorPerformanceMetrics.filter(vpm => vpm.vendorId === vendorId);
  },

  getVendorIncidents: async (vendorId: string): Promise<VendorIncident[]> => {
    await delay(300);
    return mockVendorIncidents.filter(vi => vi.vendorId === vendorId);
  },

  getVendorCertifications: async (vendorId: string): Promise<VendorCertification[]> => {
    await delay(300);
    return mockVendorCertifications.filter(cert =>
      // For this mock, we'll associate certifications with specific vendors
      vendorId === 'ven-1' && ['cert-1', 'cert-2', 'cert-3'].includes(cert.id)
    );
  },

  createVendorRiskAssessment: async (assessmentData: Omit<VendorRiskAssessment, 'id'>): Promise<VendorRiskAssessment> => {
    await delay(500);
    const newAssessment: VendorRiskAssessment = {
      ...assessmentData,
      id: `vra-${Date.now()}`
    };
    mockVendorRiskAssessments.push(newAssessment);
    return newAssessment;
  },

  updateVendorRiskScore: async (vendorId: string, riskScore: number, riskLevel: VendorCriticality): Promise<Vendor> => {
    await delay(400);
    const vendor = mockVendors.find(v => v.id === vendorId);
    if (vendor) {
      vendor.overallRiskScore = riskScore;
      vendor.riskLevel = riskLevel;
      vendor.lastRiskAssessment = new Date().toISOString().split('T')[0];
    }
    return vendor!;
  },

  updateDueDiligenceStatus: async (dueDiligenceId: string, status: DueDiligenceStatus): Promise<VendorDueDiligence> => {
    await delay(400);
    const dueDiligence = mockVendorDueDiligence.find(dd => dd.id === dueDiligenceId);
    if (dueDiligence) {
      dueDiligence.status = status;
      if (status === DueDiligenceStatus.COMPLETED) {
        dueDiligence.completedDate = new Date().toISOString().split('T')[0];
      }
    }
    return dueDiligence!;
  },

  addVendorIncident: async (incidentData: Omit<VendorIncident, 'id'>): Promise<VendorIncident> => {
    await delay(400);
    const newIncident: VendorIncident = {
      ...incidentData,
      id: `vi-${Date.now()}`
    };
    mockVendorIncidents.push(newIncident);
    return newIncident;
  },

  resolveVendorIncident: async (incidentId: string, resolution: { rootCause?: string; preventiveActions?: string }): Promise<VendorIncident> => {
    await delay(400);
    const incident = mockVendorIncidents.find(i => i.id === incidentId);
    if (incident) {
      incident.status = 'Resolved';
      incident.resolvedDate = new Date().toISOString();
      if (resolution.rootCause) incident.rootCause = resolution.rootCause;
      if (resolution.preventiveActions) incident.preventiveActions = resolution.preventiveActions;
    }
    return incident!;
  }
};