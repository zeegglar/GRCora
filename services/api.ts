import { User, UserRole, Organization, Project, Control, AssessmentItem, AssessmentStatus, Risk, RiskLevel, Policy, PolicyStatus, PolicyHistory, PolicyVersion, Evidence, Vendor, ControlMapping, VendorLifecycleStage } from '../types';

// Mock Data
export const mockUsers: User[] = [
    { id: 'user-1', name: 'Alex Chen', email: 'owner@aurelius.test', role: UserRole.CONSULTANT_OWNER, organizationId: 'org-aurelius', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
    { id: 'user-2', name: 'Samira Khan', email: 'admin@northwind.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-northwind', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
    { id: 'user-3', name: 'Brian Smith', email: 'admin@contoso.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-contoso', avatarUrl: `https://i.pravatar.cc/150?u=user-3` },
    { id: 'user-4', name: 'Chen Li', email: 'admin@litware.test', role: UserRole.CLIENT_ADMIN, organizationId: 'org-litware', avatarUrl: `https://i.pravatar.cc/150?u=user-4` },
    { id: 'user-5', name: 'Dana Scully', email: 'contrib@northwind.test', role: UserRole.CLIENT_CONTRIBUTOR, organizationId: 'org-northwind', avatarUrl: `https://i.pravatar.cc/150?u=user-5` },
];

export const mockOrganizations: Organization[] = [
    { id: 'org-aurelius', name: 'Aurelius Risk Partners' },
    { id: 'org-northwind', name: 'Northwind Health' },
    { id: 'org-contoso', name: 'Contoso Manufacturing' },
    { id: 'org-litware', name: 'Litware Finance' },
];

const mockProjects: Project[] = [
    { id: 'proj-1', name: 'Northwind Health - ISO 27001 Readiness', organizationId: 'org-northwind', frameworks: ['ISO 27001:2022'] },
    { id: 'proj-2', name: 'Contoso Manufacturing - NIST CSF 2.0 Assessment', organizationId: 'org-contoso', frameworks: ['NIST CSF 2.0'] },
    { id: 'proj-3', name: 'Litware Finance - SOC 2 Type I', organizationId: 'org-litware', frameworks: ['SOC 2'] },
];

const mockControls: Control[] = [
    // ISO 27001:2022
    { id: 'ISO-A.5.1', name: 'Policies for information security', description: 'A set of policies for information security should be defined, approved by management, published and communicated.', family: 'Organizational Controls', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.6.3', name: 'Information security awareness, education and training', description: 'Information security awareness, education and training should be provided to all relevant personnel.', family: 'People Controls', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.7.2', name: 'Physical entry', description: 'Secure areas should be protected by appropriate entry controls.', family: 'Physical Controls', framework: 'ISO 27001:2022' },
    { id: 'ISO-A.8.12', name: 'Data leakage prevention', description: 'Data leakage prevention measures should be applied to systems, networks and any other devices that process, store or transmit sensitive information.', family: 'Technological Controls', framework: 'ISO 27001:2022' },
    
    // NIST CSF 2.0
    { id: 'NIST-GV.OC-1', name: 'Organizational Context', description: 'The organizational context that is relevant to cybersecurity risk management is understood.', family: 'Govern', framework: 'NIST CSF 2.0'},
    { id: 'NIST-ID.AM-1', name: 'Asset Management', description: 'Assets (e.g., data, hardware, software, systems, services, people, facilities) that enable the organization to achieve business purposes are identified and managed.', family: 'Identify', framework: 'NIST CSF 2.0'},
    { id: 'NIST-PR.AC-1', name: 'Access Control', description: 'Access to assets is managed, incorporating the principles of least privilege and separation of duties.', family: 'Protect', framework: 'NIST CSF 2.0'},
    { id: 'NIST-DE.CM-1', name: 'Continuous Monitoring', description: 'The information system and assets are monitored to identify cybersecurity events and verify the effectiveness of protective measures.', family: 'Detect', framework: 'NIST CSF 2.0'},
    { id: 'NIST-RS.RP-1', name: 'Response Planning', description: 'Response processes and procedures are executed and maintained, to ensure timely response to detected cybersecurity events.', family: 'Respond', framework: 'NIST CSF 2.0'},
    { id: 'NIST-RC.RP-1', name: 'Recovery Planning', description: 'Recovery processes and procedures are executed and maintained to ensure timely restoration of systems or assets affected by cybersecurity events.', family: 'Recover', framework: 'NIST CSF 2.0'},

    // SOC 2
    { id: 'SOC2-CC6.1', name: 'Logical Access Security', description: 'The entity implements logical access security measures to protect information assets.', family: 'Logical and Physical Access Controls', framework: 'SOC 2' },
];

const mockAssessmentItems: AssessmentItem[] = [
    { id: 'item-1', controlId: 'ISO-A.5.1', projectId: 'proj-1', status: AssessmentStatus.IN_REVIEW, notes: 'Initial draft of ISMS policy suite is complete. Awaiting review from management.', remediationPlan: '', assignedTo: 'user-2' },
    { id: 'item-2', controlId: 'ISO-A.8.12', projectId: 'proj-1', status: AssessmentStatus.IN_PROGRESS, notes: 'Evaluating DLP solutions from vendors A and B.', remediationPlan: '1. Finalize DLP vendor selection.\n2. Implement DLP solution on endpoints.\n3. Test and validate DLP rules.', assignedTo: 'user-5' },
    { id: 'item-3', controlId: 'NIST-PR.AC-1', projectId: 'proj-2', status: AssessmentStatus.COMPLETED, notes: 'Quarterly access review completed and signed off by department heads.', remediationPlan: '', assignedTo: 'user-3' },
    { id: 'item-4', controlId: 'NIST-DE.CM-1', projectId: 'proj-2', status: AssessmentStatus.NOT_STARTED, notes: 'SIEM solution needs to be configured for critical asset logs.', remediationPlan: '', assignedTo: 'user-3' },
    { id: 'item-5', controlId: 'SOC2-CC6.1', projectId: 'proj-3', status: AssessmentStatus.IN_PROGRESS, notes: 'Reviewing AD group policies for excessive permissions.', remediationPlan: '', assignedTo: 'user-4' },
];

const mockRisks: Risk[] = [
    { id: 'risk-1', title: 'Excessive user permissions in production DB', level: RiskLevel.HIGH, status: 'Open', controlId: 'ISO-A.8.12', projectId: 'proj-1' },
    { id: 'risk-2', title: 'Lack of formal incident response plan', level: RiskLevel.MEDIUM, status: 'Open', controlId: 'NIST-RS.RP-1', projectId: 'proj-2' },
];

const mockPolicies: Policy[] = [
    { id: 'pol-1', title: 'Access Control Policy', content: 'This policy outlines the access control requirements for all company information systems...', ownerId: 'user-2', status: PolicyStatus.APPROVED, version: '1.2', lastUpdated: '2023-10-26', projectId: 'proj-1', history: [{status: PolicyStatus.APPROVED, date: '2023-10-26', userId: 'user-2', notes: 'Final approval.'}] },
];

const mockPolicyVersions: Record<string, PolicyVersion[]> = {
    'pol-1': [
        { version: '1.2', date: '2023-10-26', editorId: 'user-2', changes: 'Updated section 3.1 to include MFA requirements.' },
        { version: '1.1', date: '2023-09-15', editorId: 'user-5', changes: 'Added password complexity rules.' },
        { version: '1.0', date: '2023-08-01', editorId: 'user-2', changes: 'Initial draft created.' },
    ]
};

const mockEvidence: Evidence[] = [
    { id: 'ev-1', title: 'Q3 Access Review Sign-off.pdf', fileUrl: '#', uploadDate: '2023-11-01', uploaderId: 'user-5', controlId: 'NIST-PR.AC-1', projectId: 'proj-2' },
];

const mockVendors: Vendor[] = [
    { id: 'ven-1', name: 'Amazon Web Services', service: 'Cloud Hosting', tier: '1', status: VendorLifecycleStage.ACTIVE, owner: 'CTO', projectId: 'proj-1' },
    { id: 'ven-2', name: 'CrowdStrike', service: 'Endpoint Security', tier: '2', status: VendorLifecycleStage.ONBOARDING, owner: 'CISO', projectId: 'proj-2' },
];

let mockControlMappings: ControlMapping[] = [
    { id: 'map-1', sourceControlId: 'ISO-A.5.1', targetControlId: 'NIST-GV.OC-1', projectId: 'proj-1' },
];

export const consultantClientLinks: Record<string, string[]> = {
    'org-aurelius': ['org-northwind', 'org-contoso', 'org-litware'],
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
    async getLinkedClients(consultantOrgId: string): Promise<Organization[]> {
        await delay(200);
        const clientIds = consultantClientLinks[consultantOrgId] || [];
        return mockOrganizations.filter(org => clientIds.includes(org.id));
    },
    async getProjectsForOrg(organizationId: string): Promise<Project[]> {
        await delay(200);
        return mockProjects.filter(p => p.organizationId === organizationId);
    },
    async createProject(name: string, organizationId: string, frameworks: string[]): Promise<Project> {
        await delay(300);
        const newProject: Project = { id: `proj-${Date.now()}`, name, organizationId, frameworks };
        mockProjects.push(newProject);
        const projectControls = mockControls.filter(c => frameworks.includes(c.framework));
        projectControls.forEach(c => {
            mockAssessmentItems.push({
                id: `item-${Date.now()}-${c.id}`,
                controlId: c.id,
                projectId: newProject.id,
                status: AssessmentStatus.NOT_STARTED,
                notes: '',
                remediationPlan: '',
                assignedTo: 'user-1'
            });
        });
        return newProject;
    },
    async createOrganization(name: string): Promise<Organization> {
        await delay(300);
        const newOrg: Organization = { id: `org-${Date.now()}`, name };
        mockOrganizations.push(newOrg);
        consultantClientLinks['org-aurelius'].push(newOrg.id);
        return newOrg;
    },
    async getProject(id: string): Promise<Project | undefined> {
        await delay(100);
        return mockProjects.find(p => p.id === id);
    },
    async getAllControls(): Promise<Control[]> {
        await delay(100);
        return mockControls;
    },
    async getAssessmentItems(projectId: string): Promise<AssessmentItem[]> {
        await delay(250);
        return mockAssessmentItems.filter(i => i.projectId === projectId);
    },
    async updateAssessmentItem(itemId: string, updates: Partial<Pick<AssessmentItem, 'status' | 'notes' | 'remediationPlan'>>): Promise<AssessmentItem> {
        await delay(200);
        const itemIndex = mockAssessmentItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) throw new Error("Assessment item not found");
        mockAssessmentItems[itemIndex] = { ...mockAssessmentItems[itemIndex], ...updates };
        return mockAssessmentItems[itemIndex];
    },
    async getRisks(projectId: string): Promise<Risk[]> {
        await delay(250);
        return mockRisks.filter(r => r.projectId === projectId);
    },
    async createRisk(riskData: Omit<Risk, 'id'>): Promise<Risk> {
        await delay(200);
        const newRisk: Risk = { ...riskData, id: `risk-${Date.now()}` };
        mockRisks.push(newRisk);
        return newRisk;
    },
    async getPolicies(projectId: string): Promise<Policy[]> {
        await delay(250);
        return mockPolicies.filter(p => p.projectId === projectId);
    },
    async createPolicy(policyData: Omit<Policy, 'id' | 'history'>): Promise<Policy> {
        await delay(200);
        const newPolicy: Policy = { ...policyData, id: `pol-${Date.now()}`, history: [{ status: policyData.status, date: policyData.lastUpdated, userId: policyData.ownerId }] };
        mockPolicies.push(newPolicy);
        return newPolicy;
    },
    async updatePolicyStatus(policyId: string, status: PolicyStatus, userId: string): Promise<Policy> {
        await delay(200);
        const policyIndex = mockPolicies.findIndex(p => p.id === policyId);
        if (policyIndex === -1) throw new Error("Policy not found");
        const updatedPolicy = { ...mockPolicies[policyIndex], status, lastUpdated: new Date().toISOString().split('T')[0] };
        updatedPolicy.history.push({ status, date: updatedPolicy.lastUpdated, userId });
        mockPolicies[policyIndex] = updatedPolicy;
        return updatedPolicy;
    },
    async getPolicyVersions(policyId: string): Promise<PolicyVersion[]> {
        await delay(150);
        return mockPolicyVersions[policyId] || [];
    },
    async getEvidence(projectId: string): Promise<Evidence[]> {
        await delay(250);
        return mockEvidence.filter(e => e.projectId === projectId);
    },
    async createEvidence(evidenceData: Omit<Evidence, 'id'>): Promise<Evidence> {
        await delay(200);
        const newEvidence: Evidence = { ...evidenceData, id: `ev-${Date.now()}` };
        mockEvidence.push(newEvidence);
        return newEvidence;
    },
    async getVendors(projectId: string): Promise<Vendor[]> {
        await delay(250);
        return mockVendors.filter(v => v.projectId === projectId);
    },
    async getVendorById(vendorId: string): Promise<Vendor | undefined> {
        await delay(100);
        return mockVendors.find(v => v.id === vendorId);
    },
    async createVendor(vendorData: Omit<Vendor, 'id' | 'status'>): Promise<Vendor> {
        await delay(200);
        const newVendor: Vendor = { 
            ...vendorData, 
            id: `ven-${Date.now()}`, 
            status: VendorLifecycleStage.IDENTIFICATION 
        };
        mockVendors.push(newVendor);
        return newVendor;
    },
    async updateVendorLifecycleStage(vendorId: string, stage: VendorLifecycleStage): Promise<Vendor> {
        await delay(150);
        const vendorIndex = mockVendors.findIndex(v => v.id === vendorId);
        if (vendorIndex === -1) throw new Error("Vendor not found");
        mockVendors[vendorIndex].status = stage;
        return mockVendors[vendorIndex];
    },
    async getControlMappingsForProject(projectId: string): Promise<ControlMapping[]> {
        await delay(100);
        return mockControlMappings.filter(m => m.projectId === projectId);
    },
    async createControlMapping(mappingData: Omit<ControlMapping, 'id'>): Promise<ControlMapping> {
        await delay(200);
        const newMapping: ControlMapping = { ...mappingData, id: `map-${Date.now()}` };
        mockControlMappings.push(newMapping);
        return newMapping;
    },
    async deleteControlMapping(mappingId: string): Promise<void> {
        await delay(200);
        mockControlMappings = mockControlMappings.filter(m => m.id !== mappingId);
    },
    getAvailableFrameworks(): Promise<string[]> {
        return Promise.resolve(['ISO 27001:2022', 'NIST CSF 2.0', 'SOC 2', 'HIPAA']);
    }
};