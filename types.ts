
// types.ts

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
  trend?: 'up' | 'down' | 'stable';
}

export enum AssessmentStatus {
  COMPLETED = 'Completed',
  IN_PROGRESS = 'In Progress',
  IN_REVIEW = 'In Review',
  NOT_STARTED = 'Not Started',
}

export interface AssessmentItem {
  id: string;
  projectId: string;
  controlId: string;
  status: AssessmentStatus;
  notes: string;
  remediationPlan?: string;
}

export interface Control {
  id: string;
  name: string;
  description: string;
  family: string;
  framework: string;
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  level: RiskLevel;
  status: 'Open' | 'Closed';
  controlId: string;
}

export enum PolicyStatus {
  DRAFT = 'Draft',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ARCHIVED = 'Archived',
}

export interface Policy {
  id: string;
  projectId: string;
  title: string;
  content: string;
  version: string;
  status: PolicyStatus;
  ownerId: string;
  lastUpdated: string; // YYYY-MM-DD
  controlId?: string;
  history: PolicyVersion[];
}

export interface PolicyVersion {
  version: string;
  date: string;
  editorId: string;
  changes: string;
}

export interface Evidence {
  id: string;
  projectId: string;
  controlId: string;
  title: string;
  fileUrl: string;
  uploaderId: string;
  uploadDate: string; // YYYY-MM-DD
}

export enum VendorLifecycleStage {
    IDENTIFICATION = 'Identification',
    ONBOARDING = 'Onboarding',
    ACTIVE = 'Active',
    OFFBOARDING = 'Offboarding',
}

export interface Vendor {
  id: string;
  projectId: string;
  name: string;
  service: string;
  tier: '1' | '2' | '3';
  status: VendorLifecycleStage;
  owner: string;
}

export interface ControlMapping {
    id: string;
    projectId: string;
    sourceControlId: string;
    targetControlId: string;
}


export type View =
  | { type: 'landing' }
  | { type: 'login' }
  | { type: 'dashboard' }
  | { type: 'project'; projectId: string; tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'reports' }
  | { type: 'vendorDetail', projectId: string, vendorId: string };