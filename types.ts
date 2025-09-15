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

// TPRM (Third-Party Risk Management) Types

export enum VendorCriticality {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum VendorRiskCategory {
  OPERATIONAL = 'Operational',
  FINANCIAL = 'Financial',
  COMPLIANCE = 'Compliance',
  SECURITY = 'Security',
  REPUTATION = 'Reputation'
}

export enum DueDiligenceStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REQUIRES_REVIEW = 'Requires Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum ContractStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  EXECUTED = 'Executed',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated'
}

export interface VendorContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface VendorCertification {
  id: string;
  name: string;
  issuer: string;
  validFrom: string;
  validUntil: string;
  status: 'Valid' | 'Expired' | 'Expiring Soon';
  documentUrl?: string;
}

export interface VendorRiskAssessment {
  id: string;
  vendorId: string;
  assessmentDate: string;
  assessorId: string;
  overallRiskScore: number; // 1-100
  riskLevel: VendorCriticality;
  categories: {
    [key in VendorRiskCategory]: {
      score: number;
      notes: string;
      lastUpdated: string;
    }
  };
  mitigationActions: VendorMitigationAction[];
  nextReviewDate: string;
}

export interface VendorMitigationAction {
  id: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed' | 'Closed';
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
}

export interface VendorContract {
  id: string;
  vendorId: string;
  title: string;
  type: 'MSA' | 'SOW' | 'DPA' | 'SLA' | 'BAA' | 'Other';
  status: ContractStatus;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  annualValue: number;
  currency: string;
  documentUrl?: string;
  keyTerms: string[];
  rightToAudit: boolean;
  dataProcessing: boolean;
  notifications: {
    renewal: number; // days before renewal
    expiry: number; // days before expiry
  };
}

export interface VendorDueDiligence {
  id: string;
  vendorId: string;
  status: DueDiligenceStatus;
  checklist: DueDiligenceItem[];
  startDate: string;
  completedDate?: string;
  reviewedBy?: string;
  approvedBy?: string;
  notes: string;
}

export interface DueDiligenceItem {
  id: string;
  category: string;
  requirement: string;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Not Applicable';
  evidence?: string;
  reviewNotes?: string;
  dueDate?: string;
  completedDate?: string;
}

export interface VendorPerformanceMetric {
  id: string;
  vendorId: string;
  metricType: 'SLA' | 'KPI' | 'Availability' | 'Response Time' | 'Quality Score';
  name: string;
  target: number;
  actual: number;
  unit: string;
  period: string; // e.g., "2024-Q1"
  lastUpdated: string;
}

export interface VendorIncident {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  reportedDate: string;
  resolvedDate?: string;
  impact: string;
  rootCause?: string;
  preventiveActions?: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  website?: string;
  industry: string;
  headquarters: string;
  foundedYear?: number;
  employeeCount?: string;
  annualRevenue?: string;

  // Service Details
  serviceCategory: string;
  servicesProvided: string[];
  criticality: VendorCriticality;
  tier: '1' | '2' | '3' | '4';

  // Risk & Compliance
  overallRiskScore: number;
  riskLevel: VendorCriticality;
  lastRiskAssessment?: string;
  nextRiskAssessment: string;
  regulatoryRequirements: string[];

  // Lifecycle Management
  status: VendorLifecycleStage;
  onboardingDate?: string;
  nextReviewDate: string;

  // Relationship Management
  businessOwner: string;
  technicalOwner?: string;
  procurementOwner?: string;
  contacts: VendorContact[];

  // Data & Security
  dataTypes: string[]; // PII, PHI, Financial, etc.
  accessLevel: 'None' | 'Limited' | 'Standard' | 'Privileged' | 'Administrative';
  hasSystemAccess: boolean;
  systemsAccessed?: string[];

  // Financial
  annualSpend: number;
  currency: string;
  paymentTerms: string;

  // Certifications & Compliance
  certifications: VendorCertification[];
  complianceFrameworks: string[];

  // Associations
  projectId: string;
  parentVendorId?: string; // For sub-vendors
  subVendors?: string[]; // Fourth-party vendors
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
  | { type: 'project'; projectId: string; tab: 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'workflows' | 'reports' }
  | { type: 'vendorDetail'; projectId: string; vendorId: string; tab?: 'overview' | 'risk' | 'contracts' | 'performance' | 'incidents' | 'due-diligence' }
  | { type: 'vendorRiskAssessment'; projectId: string; vendorId: string; assessmentId?: string }
  | { type: 'tprmDashboard'; projectId: string };