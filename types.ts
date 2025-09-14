export enum UserRole {
  CONSULTANT_OWNER = 'consultant_owner',
  CONSULTANT_ADMIN = 'consultant_admin',
  CONSULTANT_COLLABORATOR = 'consultant_collaborator',
  CLIENT_ADMIN = 'client_admin',
  CLIENT_CONTRIBUTOR = 'client_contributor',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatarUrl: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  frameworks: string[];
}

export type View =
  | { type: 'landing' }
  | { type: 'login' }
  | { type: 'dashboard' }
  | { type: 'project'; projectId: string; tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'reports' }
  | { type: 'vendorDetail'; projectId: string; vendorId: string };


export interface Control {
    id: string;
    name: string;
    description: string;
    family: string; // e.g., 'Organizational Controls', 'Protect'
    framework: string;
}

export enum AssessmentStatus {
    COMPLETED = 'Completed',
    IN_PROGRESS = 'In Progress',
    IN_REVIEW = 'In Review',
    NOT_STARTED = 'Not Started',
}

export interface AssessmentItem {
    id: string;
    controlId: string;
    projectId: string;
    status: AssessmentStatus;
    notes: string;
    remediationPlan?: string;
    assignedTo: string; // userId
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

export interface Risk {
    id: string;
    title: string;
    level: RiskLevel;
    status: 'Open' | 'Closed';
    controlId: string;
    projectId: string;
}

export enum PolicyStatus {
    DRAFT = 'Draft',
    IN_REVIEW = 'In Review',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    ARCHIVED = 'Archived',
}

export interface PolicyHistory {
    status: PolicyStatus;
    date: string;
    userId: string;
    notes?: string;
}

export interface Policy {
    id: string;
    title: string;
    content: string;
    ownerId: string;
    status: PolicyStatus;
    version: string;
    lastUpdated: string;
    projectId: string;
    history: PolicyHistory[];
    controlId?: string; // Link to the control that prompted this policy
}

export interface PolicyVersion {
    version: string;
    date: string;
    editorId: string;
    changes: string;
}

export enum VendorLifecycleStage {
    IDENTIFICATION = 'Identification',
    ONBOARDING = 'Onboarding',
    ACTIVE = 'Active',
    OFFBOARDING = 'Offboarding',
}

export interface Vendor {
    id: string;
    name: string;
    service: string;
    tier: '1' | '2' | '3';
    status: VendorLifecycleStage;
    owner: string;
    projectId: string;
}

export interface Evidence {
    id: string;
    title: string;
    fileUrl: string;
    uploadDate: string;
    uploaderId: string; // userId
    controlId: string;
    projectId: string;
}

export interface ControlMapping {
    id: string;
    sourceControlId: string;
    targetControlId: string;
    projectId: string;
}