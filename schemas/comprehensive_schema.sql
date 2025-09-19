-- Comprehensive GRC Database Schema
-- Extends the existing schema with professional GRC capabilities

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCED TENANT & USER MANAGEMENT
-- =============================================================================

-- Enhanced organizations table with GRC-specific fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tenant_type TEXT CHECK (tenant_type IN ('consultant', 'client')) DEFAULT 'client';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS risk_appetite TEXT CHECK (risk_appetite IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- Enhanced projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS engagement_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_methodology TEXT CHECK (risk_methodology IN ('qualitative', 'quantitative', 'hybrid')) DEFAULT 'qualitative';

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('consultant_owner', 'consultant_admin', 'consultant_user', 'client_admin', 'client_user')) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultant-client engagements
CREATE TABLE IF NOT EXISTS engagements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultant_org_id UUID REFERENCES organizations(id) NOT NULL,
  client_org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  lead_consultant_id UUID REFERENCES user_profiles(id),
  client_contact_id UUID REFERENCES user_profiles(id),
  contract_value DECIMAL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STATEMENT OF APPLICABILITY (SOA) MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS soa_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  control_id TEXT REFERENCES controls(id) NOT NULL,
  applicability TEXT CHECK (applicability IN ('applicable', 'not_applicable')) NOT NULL,
  inclusion TEXT CHECK (inclusion IN ('included', 'excluded')) NOT NULL,
  justification TEXT NOT NULL,
  implementation_statement TEXT,
  planned_implementation TEXT,
  evidence_references TEXT[],
  status TEXT CHECK (status IN ('draft', 'review', 'approved')) DEFAULT 'draft',
  reviewed_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, control_id, version)
);

-- =============================================================================
-- ENHANCED RISK MANAGEMENT
-- =============================================================================

-- Enhanced risks table with quantitative assessment
ALTER TABLE risks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS linked_assets TEXT[];
ALTER TABLE risks ADD COLUMN IF NOT EXISTS linked_controls TEXT[];
ALTER TABLE risks ADD COLUMN IF NOT EXISTS inherent_likelihood INTEGER CHECK (inherent_likelihood BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS inherent_impact INTEGER CHECK (inherent_impact BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS inherent_rating DECIMAL;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_rating DECIMAL;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS risk_appetite DECIMAL;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS quantitative_assessment JSONB;

-- Risk treatments table
CREATE TABLE IF NOT EXISTS risk_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE NOT NULL,
  strategy TEXT CHECK (strategy IN ('accept', 'mitigate', 'transfer', 'avoid')) NOT NULL,
  description TEXT NOT NULL,
  planned_actions TEXT[],
  implemented_actions TEXT[],
  cost DECIMAL,
  timeline TEXT,
  effectiveness INTEGER CHECK (effectiveness BETWEEN 0 AND 100),
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'deferred')) DEFAULT 'planned',
  owner_id UUID REFERENCES user_profiles(id),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CONTROL TESTING & GAP ANALYSIS
-- =============================================================================

-- Enhanced assessment items with maturity scoring
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS maturity_level INTEGER CHECK (maturity_level BETWEEN 0 AND 5) DEFAULT 0;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS target_maturity_level INTEGER CHECK (target_maturity_level BETWEEN 0 AND 5) DEFAULT 4;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS implementation_notes TEXT;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS testing_notes TEXT;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS effectiveness INTEGER CHECK (effectiveness BETWEEN 0 AND 100) DEFAULT 0;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS last_tested_date DATE;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS next_test_date DATE;
ALTER TABLE assessment_items ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES user_profiles(id);

-- Control testing procedures
CREATE TABLE IF NOT EXISTS control_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_item_id UUID REFERENCES assessment_items(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT CHECK (test_type IN ('inquiry', 'observation', 'inspection', 'reperformance')) NOT NULL,
  test_procedure TEXT NOT NULL,
  sample_size INTEGER,
  population_size INTEGER,
  test_results TEXT,
  exceptions_noted INTEGER DEFAULT 0,
  conclusion TEXT CHECK (conclusion IN ('effective', 'deficient', 'not_tested')) DEFAULT 'not_tested',
  tester_id UUID REFERENCES user_profiles(id),
  test_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- POLICY MANAGEMENT
-- =============================================================================

-- Enhanced policies table
ALTER TABLE policies ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('policy', 'procedure', 'standard', 'guideline')) DEFAULT 'policy';
ALTER TABLE policies ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS effective_date DATE;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS review_date DATE;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id);
ALTER TABLE policies ADD COLUMN IF NOT EXISTS linked_controls TEXT[];
ALTER TABLE policies ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Policy versions table
CREATE TABLE IF NOT EXISTS policy_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  changes TEXT,
  author_id UUID REFERENCES user_profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'review', 'approved')) DEFAULT 'draft',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy exceptions/waivers
CREATE TABLE IF NOT EXISTS policy_exceptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES policies(id),
  control_id TEXT REFERENCES controls(id),
  project_id UUID REFERENCES projects(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT NOT NULL,
  risk_acceptance TEXT NOT NULL,
  status TEXT CHECK (status IN ('requested', 'approved', 'denied', 'expired')) DEFAULT 'requested',
  requested_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  expiration_date DATE,
  compensating_controls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- AUDIT MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('internal', 'external', 'certification', 'regulatory')) NOT NULL,
  frameworks TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('planned', 'in_progress', 'fieldwork', 'reporting', 'completed')) DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  lead_auditor_id UUID REFERENCES user_profiles(id),
  audit_firm TEXT,
  scope TEXT[],
  objectives TEXT[],
  sampling_approach TEXT,
  findings_count JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}',
  conclusion TEXT CHECK (conclusion IN ('satisfactory', 'needs_improvement', 'unsatisfactory')),
  certification_decision TEXT CHECK (certification_decision IN ('certified', 'conditional', 'denied')),
  report_path TEXT,
  next_audit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  category TEXT NOT NULL,
  linked_controls TEXT[],
  evidence TEXT[],
  root_cause TEXT,
  business_impact TEXT,
  recommendation TEXT NOT NULL,
  management_response TEXT,
  remediation_plan TEXT,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'deferred', 'accepted')) DEFAULT 'open',
  identified_by UUID REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  due_date DATE,
  resolved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ENHANCED VENDOR RISK MANAGEMENT (TPRM)
-- =============================================================================

-- Vendor tiers for risk-based assessment
CREATE TABLE IF NOT EXISTS vendor_tiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria TEXT[],
  assessment_frequency TEXT CHECK (assessment_frequency IN ('annual', 'semi_annual', 'quarterly')) DEFAULT 'annual',
  required_documents TEXT[],
  due_diligence_requirements TEXT[],
  contract_clauses TEXT[],
  monitoring_requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES vendor_tiers(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS criticality TEXT CHECK (criticality IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS data_access TEXT CHECK (data_access IN ('none', 'internal', 'confidential', 'restricted')) DEFAULT 'none';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS services TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contract_end DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contract_value DECIMAL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS primary_contact JSONB;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS security_contact JSONB;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_assessment DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS next_assessment DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS compliance_status TEXT CHECK (compliance_status IN ('compliant', 'minor_issues', 'major_issues', 'non_compliant')) DEFAULT 'compliant';

-- Vendor questionnaires
CREATE TABLE IF NOT EXISTS vendor_questionnaires (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  template_id UUID,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'reviewed')) DEFAULT 'draft',
  sent_date DATE,
  due_date DATE,
  completed_date DATE,
  reviewed_by UUID REFERENCES user_profiles(id),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  risk_rating TEXT CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  questionnaire_id UUID REFERENCES vendor_questionnaires(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_type TEXT CHECK (answer_type IN ('text', 'boolean', 'multiple_choice', 'rating', 'file')) NOT NULL,
  answer JSONB,
  evidence TEXT[],
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  risk_flag BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ASSET & DATA MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('system', 'application', 'database', 'network', 'physical', 'cloud_service')) NOT NULL,
  classification TEXT CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')) NOT NULL,
  owner_id UUID REFERENCES user_profiles(id),
  custodian_id UUID REFERENCES user_profiles(id),
  location TEXT,
  description TEXT,
  criticality TEXT CHECK (criticality IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  data_types TEXT[],
  linked_controls TEXT[],
  last_assessed DATE,
  next_assessment DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_flows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_asset_id UUID REFERENCES assets(id),
  target_asset_id UUID REFERENCES assets(id),
  data_types TEXT[],
  classification TEXT CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')) NOT NULL,
  frequency TEXT CHECK (frequency IN ('real_time', 'batch', 'on_demand')) DEFAULT 'batch',
  protocol TEXT,
  encryption BOOLEAN DEFAULT FALSE,
  authentication BOOLEAN DEFAULT FALSE,
  logging BOOLEAN DEFAULT FALSE,
  controls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TASK & WORKFLOW MANAGEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('assessment', 'remediation', 'evidence_collection', 'review', 'approval', 'training')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  due_date DATE,
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  linked_entity_type TEXT,
  linked_entity_id TEXT,
  dependencies TEXT[],
  completion_criteria TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- METRICS & KPIs
-- =============================================================================

CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('kri', 'kci', 'kpi')) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  formula TEXT NOT NULL,
  data_source TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')) DEFAULT 'monthly',
  thresholds JSONB NOT NULL, -- {green: number, yellow: number, red: number}
  owner_id UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_value DECIMAL,
  last_calculated TIMESTAMP WITH TIME ZONE,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- REPORTING & ANALYTICS
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('assessment', 'risk_register', 'compliance', 'executive_summary', 'vendor_assessment', 'soa', 'audit')) NOT NULL,
  format TEXT CHECK (format IN ('pdf', 'docx', 'html', 'json')) DEFAULT 'pdf',
  status TEXT CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  file_path TEXT,
  file_name TEXT,
  generated_by UUID REFERENCES user_profiles(id) NOT NULL,
  generation_params JSONB,
  ai_assisted BOOLEAN DEFAULT FALSE,
  review_required BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  distributed_to TEXT[],
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- DASHBOARD & NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES user_profiles(id), -- NULL for org-wide cards
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('metric', 'chart', 'list', 'progress', 'alert')) NOT NULL,
  position JSONB NOT NULL, -- {x, y, w, h}
  configuration JSONB NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES user_profiles(id), -- NULL for broadcast
  type TEXT CHECK (type IN ('task_due', 'task_overdue', 'approval_required', 'risk_threshold', 'audit_finding', 'system', 'security')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  channels JSONB DEFAULT '{"inApp": true, "email": false, "sms": false}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE soa_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (tenant isolation)
-- Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations: users can see their own org and linked orgs
CREATE POLICY IF NOT EXISTS "Users can view related organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      UNION
      SELECT client_org_id FROM engagements
      WHERE consultant_org_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
      UNION
      SELECT consultant_org_id FROM engagements
      WHERE client_org_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Projects: similar pattern for project access
CREATE POLICY IF NOT EXISTS "Users can view related projects" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      UNION
      SELECT client_org_id FROM engagements
      WHERE consultant_org_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
      UNION
      SELECT consultant_org_id FROM engagements
      WHERE client_org_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_items_project_id ON assessment_items(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to, due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_soa_entries_project_control ON soa_entries(project_id, control_id);
CREATE INDEX IF NOT EXISTS idx_vendors_project_id ON vendors(project_id);

COMMENT ON SCHEMA public IS 'Comprehensive GRC platform schema with professional capabilities including SoA management, quantitative risk assessment, TPRM, audit management, and policy workflows';