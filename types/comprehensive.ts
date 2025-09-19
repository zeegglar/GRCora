// Comprehensive GRC Platform Types
// Professional-grade TypeScript interfaces for enterprise GRC functionality

// =============================================================================
// CORE TENANT & USER MANAGEMENT
// =============================================================================

export interface Tenant {
  id: string;
  name: string;
  tenant_type: 'consultant' | 'client';
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  risk_appetite: 'low' | 'medium' | 'high';
  settings: {
    default_frameworks: string[];
    reporting_frequency: 'weekly' | 'monthly' | 'quarterly';
    notification_preferences: Record<string, boolean>;
  };
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'consultant_owner' | 'consultant_admin' | 'consultant_user' | 'client_admin' | 'client_user';
  organization_id: string;
  avatar_url?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      in_app: boolean;
      sms: boolean;
    };
  };
  created_at: Date;
  updated_at: Date;
}

export interface Engagement {
  id: string;
  consultant_org_id: string;
  client_org_id: string;
  name: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  lead_consultant_id: string;
  client_contact_id: string;
  contract_value?: number;
  settings: {
    frameworks: string[];
    scope: string[];
    deliverables: string[];
  };
  created_at: Date;
  updated_at: Date;
}

export interface ProjectEnhanced {
  id: string;
  engagement_id?: string;
  name: string;
  organization_id: string;
  frameworks: string[];
  status: 'planning' | 'discovery' | 'assessment' | 'remediation' | 'audit_prep' | 'completed';
  target_completion_date?: Date;
  risk_methodology: 'qualitative' | 'quantitative' | 'hybrid';
  settings: {
    testing_approach: 'sampling' | 'comprehensive' | 'risk_based';
    audit_readiness: boolean;
    maturity_target: number;
  };
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// STATEMENT OF APPLICABILITY (SOA)
// =============================================================================

export interface SoAEntry {
  id: string;
  project_id: string;
  control_id: string;
  applicability: 'applicable' | 'not_applicable';
  inclusion: 'included' | 'excluded';
  justification: string;
  implementation_statement?: string;
  planned_implementation?: string;
  evidence_references: string[];
  status: 'draft' | 'review' | 'approved';
  reviewed_by?: string;
  approved_by?: string;
  approved_at?: Date;
  version: string;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// ENHANCED RISK MANAGEMENT
// =============================================================================

export interface RiskEnhanced {
  id: string;
  project_id: string;
  title: string;
  description: string;
  category: string;
  linked_assets: string[];
  linked_controls: string[];
  inherent_likelihood: 1 | 2 | 3 | 4 | 5;
  inherent_impact: 1 | 2 | 3 | 4 | 5;
  inherent_rating: number;
  residual_likelihood?: number;
  residual_impact?: number;
  residual_rating?: number;
  risk_appetite: number;
  status: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
  owner_id: string;
  due_date?: Date;
  quantitative_assessment?: {
    min_impact: number;
    max_impact: number;
    most_likely_impact: number;
    annual_loss_expectancy: number;
    confidence_level: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface RiskTreatment {
  id: string;
  risk_id: string;
  strategy: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  description: string;
  planned_actions: string[];
  implemented_actions: string[];
  cost?: number;
  timeline?: string;
  effectiveness?: number; // Expected reduction in risk rating
  status: 'planned' | 'in_progress' | 'completed' | 'deferred';
  owner_id: string;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// CONTROL TESTING & GAP ANALYSIS
// =============================================================================

export interface AssessmentItemEnhanced {
  id: string;
  control_id: string;
  project_id: string;
  status: 'not_started' | 'in_progress' | 'implemented' | 'tested' | 'compliant' | 'non_compliant';
  maturity_level: 0 | 1 | 2 | 3 | 4 | 5;
  target_maturity_level: number;
  implementation_notes?: string;
  testing_notes?: string;
  effectiveness: number; // 0-100
  last_tested_date?: Date;
  next_test_date?: Date;
  assigned_to?: string;
  notes?: string;
  evidence_required: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ControlTest {
  id: string;
  assessment_item_id: string;
  test_type: 'inquiry' | 'observation' | 'inspection' | 'reperformance';
  test_procedure: string;
  sample_size?: number;
  population_size?: number;
  test_results?: string;
  exceptions_noted: number;
  conclusion: 'effective' | 'deficient' | 'not_tested';
  tester_id?: string;
  test_date?: Date;
  created_at: Date;
}

export interface GapAnalysis {
  control_id: string;
  current_maturity: number;
  target_maturity: number;
  gap_size: number;
  implementation_effort: 'low' | 'medium' | 'high';
  business_impact: string;
  recommended_actions: string[];
  timeline: string;
  estimated_cost?: number;
}

// =============================================================================
// POLICY MANAGEMENT
// =============================================================================

export interface PolicyEnhanced {
  id: string;
  project_id: string;
  title: string;
  type: 'policy' | 'procedure' | 'standard' | 'guideline';
  category: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  effective_date?: Date;
  review_date?: Date;
  owner_id: string;
  approved_by?: string;
  linked_controls: string[];
  metadata: {
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
    mandatory: boolean;
    applicable_roles: string[];
  };
  created_at: Date;
  updated_at: Date;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version: string;
  content: string;
  changes?: string;
  author_id: string;
  status: 'draft' | 'review' | 'approved';
  approved_at?: Date;
  approved_by?: string;
  created_at: Date;
}

export interface PolicyException {
  id: string;
  policy_id?: string;
  control_id?: string;
  project_id: string;
  title: string;
  description: string;
  justification: string;
  risk_acceptance: string;
  status: 'requested' | 'approved' | 'denied' | 'expired';
  requested_by: string;
  approved_by?: string;
  expiration_date?: Date;
  compensating_controls: string[];
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// AUDIT MANAGEMENT
// =============================================================================

export interface Audit {
  id: string;
  project_id: string;
  name: string;
  type: 'internal' | 'external' | 'certification' | 'regulatory';
  frameworks: string[];
  status: 'planned' | 'in_progress' | 'fieldwork' | 'reporting' | 'completed';
  start_date: Date;
  end_date?: Date;
  lead_auditor_id?: string;
  audit_firm?: string;
  scope: string[];
  objectives: string[];
  sampling_approach?: string;
  findings_count: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  conclusion?: 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  certification_decision?: 'certified' | 'conditional' | 'denied';
  report_path?: string;
  next_audit_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditFinding {
  id: string;
  audit_id?: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  linked_controls: string[];
  evidence: string[];
  root_cause?: string;
  business_impact?: string;
  recommendation: string;
  management_response?: string;
  remediation_plan?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred' | 'accepted';
  identified_by: string;
  assigned_to?: string;
  due_date?: Date;
  resolved_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// ENHANCED VENDOR RISK MANAGEMENT (TPRM)
// =============================================================================

export interface VendorTier {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  criteria: string[];
  assessment_frequency: 'annual' | 'semi_annual' | 'quarterly';
  required_documents: string[];
  due_diligence_requirements: string[];
  contract_clauses: string[];
  monitoring_requirements: string[];
  created_at: Date;
}

export interface VendorEnhanced {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  category: string;
  tier_id: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  data_access: 'none' | 'internal' | 'confidential' | 'restricted';
  services: string[];
  contract_start?: Date;
  contract_end?: Date;
  contract_value?: number;
  primary_contact: {
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  security_contact?: {
    name: string;
    email: string;
    phone?: string;
  };
  last_assessment?: Date;
  next_assessment?: Date;
  risk_score?: number;
  compliance_status: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  created_at: Date;
  updated_at: Date;
}

export interface VendorQuestionnaire {
  id: string;
  vendor_id: string;
  template_id: string;
  name: string;
  version: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'reviewed';
  sent_date?: Date;
  due_date?: Date;
  completed_date?: Date;
  reviewed_by?: string;
  overall_score?: number;
  risk_rating?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VendorResponse {
  id: string;
  questionnaire_id: string;
  question_id: string;
  question_text: string;
  answer_type: 'text' | 'boolean' | 'multiple_choice' | 'rating' | 'file';
  answer: any;
  evidence?: string[];
  score?: number;
  risk_flag: boolean;
  review_notes?: string;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// ASSET & DATA MANAGEMENT
// =============================================================================

export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: 'system' | 'application' | 'database' | 'network' | 'physical' | 'cloud_service';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  owner_id: string;
  custodian_id?: string;
  location?: string;
  description?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  data_types: string[];
  linked_controls: string[];
  last_assessed?: Date;
  next_assessment?: Date;
  metadata: {
    vendor?: string;
    version?: string;
    support_contact?: string;
    business_function: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface DataFlow {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  source_asset_id: string;
  target_asset_id: string;
  data_types: string[];
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  frequency: 'real_time' | 'batch' | 'on_demand';
  protocol?: string;
  encryption: boolean;
  authentication: boolean;
  logging: boolean;
  controls: string[];
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// TASK & WORKFLOW MANAGEMENT
// =============================================================================

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  type: 'assessment' | 'remediation' | 'evidence_collection' | 'review' | 'approval' | 'training';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by: string;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  linked_entity_type?: 'control' | 'risk' | 'policy' | 'vendor';
  linked_entity_id?: string;
  dependencies: string[];
  completion_criteria?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// METRICS & KPIs
// =============================================================================

export interface Metric {
  id: string;
  project_id: string;
  name: string;
  type: 'kri' | 'kci' | 'kpi';
  category: string;
  description: string;
  formula: string;
  data_source: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  thresholds: {
    green: number;
    yellow: number;
    red: number;
  };
  owner_id: string;
  is_active: boolean;
  last_value?: number;
  last_calculated?: Date;
  trend: 'improving' | 'stable' | 'declining';
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// REPORTING & ANALYTICS
// =============================================================================

export interface Report {
  id: string;
  project_id: string;
  title: string;
  type: 'assessment' | 'risk_register' | 'compliance' | 'executive_summary' | 'vendor_assessment' | 'soa' | 'audit';
  format: 'pdf' | 'docx' | 'html' | 'json';
  status: 'generating' | 'completed' | 'failed';
  file_path?: string;
  file_name?: string;
  generated_by: string;
  generation_params: {
    frameworks?: string[];
    date_range?: { start: Date; end: Date };
    sections?: string[];
    audience?: 'technical' | 'management' | 'board' | 'auditor';
    confidentiality?: 'public' | 'internal' | 'confidential';
  };
  ai_assisted: boolean;
  review_required: boolean;
  reviewed_by?: string;
  approved_by?: string;
  distributed_to: string[];
  expiration_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// DASHBOARD & NOTIFICATIONS
// =============================================================================

export interface DashboardCard {
  id: string;
  organization_id: string;
  user_id?: string; // Null for org-wide cards
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'alert';
  position: { x: number; y: number; w: number; h: number };
  configuration: {
    data_source: string;
    filters?: Record<string, any>;
    chart_type?: 'line' | 'bar' | 'pie' | 'gauge' | 'sparkline';
    time_range?: '7d' | '30d' | '90d' | '1y';
    refresh_interval?: number; // minutes
  };
  permissions: {
    roles: string[];
    users: string[];
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id?: string; // Null for broadcast notifications
  type: 'task_due' | 'task_overdue' | 'approval_required' | 'risk_threshold' | 'audit_finding' | 'system' | 'security';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  is_archived: boolean;
  read_at?: Date;
  expires_at?: Date;
  channels: {
    in_app: boolean;
    email: boolean;
    sms: boolean;
  };
  metadata?: Record<string, any>;
  created_at: Date;
}

// =============================================================================
// BUSINESS LOGIC INTERFACES
// =============================================================================

export interface ComplianceStatus {
  framework: string;
  total_controls: number;
  compliant: number;
  non_compliant: number;
  in_progress: number;
  not_applicable: number;
  percentage: number;
  last_updated: Date;
}

export interface RiskProfile {
  total_risks: number;
  by_level: Record<string, number>;
  by_status: Record<string, number>;
  trend: 'improving' | 'stable' | 'worsening';
  average_days_to_resolution: number;
}

export interface VendorRiskSummary {
  total_vendors: number;
  by_criticality: Record<string, number>;
  by_risk_score: Record<string, number>;
  assessments_due: number;
  contracts_expiring: number;
}

export interface ProjectHealthScore {
  overall_score: number;
  components: {
    compliance: number;
    risk_management: number;
    vendor_risk: number;
    policy_coverage: number;
    evidence_completeness: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  last_calculated: Date;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateSoARequest {
  project_id: string;
  control_selections: Array<{
    control_id: string;
    applicability: 'applicable' | 'not_applicable';
    inclusion: 'included' | 'excluded';
    justification: string;
    implementation_statement?: string;
  }>;
}

export interface RiskAssessmentRequest {
  project_id: string;
  methodology: 'qualitative' | 'quantitative';
  risks: Array<{
    title: string;
    description: string;
    category: string;
    inherent_likelihood: number;
    inherent_impact: number;
    linked_assets?: string[];
    linked_controls?: string[];
  }>;
}

export interface VendorAssessmentRequest {
  vendor_id: string;
  assessment_type: 'initial' | 'annual' | 'triggered';
  questionnaire_template: string;
  due_date: Date;
}

export interface ReportGenerationRequest {
  project_id: string;
  report_type: 'assessment' | 'executive_summary' | 'risk_register' | 'soa';
  format: 'pdf' | 'docx';
  audience: 'technical' | 'management' | 'board';
  sections: string[];
  ai_enhanced: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UserRole = 'consultant_owner' | 'consultant_admin' | 'consultant_user' | 'client_admin' | 'client_user';
export type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'tested' | 'compliant' | 'non_compliant';
export type ProjectStatus = 'planning' | 'discovery' | 'assessment' | 'remediation' | 'audit_prep' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// View state management
export type ViewState =
  | { type: 'landing' }
  | { type: 'login' }
  | { type: 'dashboard'; role: UserRole }
  | { type: 'project'; projectId: string; tab: 'overview' | 'assessments' | 'risks' | 'policies' | 'vendors' | 'reports' | 'soa' | 'audit' }
  | { type: 'soa_management'; projectId: string }
  | { type: 'risk_assessment'; projectId: string; mode: 'qualitative' | 'quantitative' }
  | { type: 'vendor_assessment'; projectId: string; vendorId?: string }
  | { type: 'policy_workflow'; projectId: string; policyId?: string }
  | { type: 'audit_management'; projectId: string; auditId?: string }
  | { type: 'gap_analysis'; projectId: string; framework: string }
  | { type: 'executive_dashboard'; organizationId: string };