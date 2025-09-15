// types.ts

export enum UserRole {
  CONSULTANT_OWNER = 'CONSULTANT_OWNER',
  CONSULTANT_ADMIN = 'CONSULTANT_ADMIN',
  CONSULTANT_COLLABORATOR = 'CONSULTANT_COLLABORATOR',
  CLIENT_ADMIN = 'CLIENT_ADMIN',
  CLIENT_USER = 'CLIENT_USER',
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

export enum PolicyStatus {
    DRAFT = 'Draft',
    IN_REVIEW = 'In Review',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    ARCHIVED = 'Archived',
}

export enum VendorLifecycleStage {
    IDENTIFICATION = 'Identification',
    ONBOARDING = 'Onboarding',
    ACTIVE = 'Active',
    OFFBOARDING = 'Offboarding',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  organizationId: string;
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

export interface Control {
  id: string;
  name: string;
  description: string;
  family: string;
  framework: string;
}

export interface AssessmentItem {
  id: string;
  controlId: string;
  projectId: string;
  status: 'Compliant' | 'Non-Compliant' | 'In Progress' | 'Not Applicable';
  notes: string;
  remediationPlan?: string;
}

export interface Risk {
  id: string;
  title: string;
  level: RiskLevel;
  status: 'Open' | 'Closed';
  controlId: string;
  projectId: string;
  creationDate?: string;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  version: string;
  status: PolicyStatus;
  ownerId: string;
  projectId: string;
  lastUpdated: string;
  controlId?: string;
  history?: PolicyVersion[];
}

export interface PolicyVersion {
  version: string;
  date: string;
  editorId: string;
  changes: string;
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
  uploaderId: string;
  controlId: string;
  projectId: string;
}

export interface ControlMapping {
  id: string;
  sourceControlId: string;
  targetControlId: string;
}

export type View =
  | { type: 'landing' }
  | { type: 'login' }
  | { type: 'dashboard' }
  | { type: 'project'; projectId: string; tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'reports' }
  | { type: 'vendorDetail'; projectId: string; vendorId: string };