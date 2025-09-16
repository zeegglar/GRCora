-- GRCora Database Schema (Safe Migration)
-- This migration creates the complete database structure for the GRC platform
-- Uses CREATE TABLE IF NOT EXISTS to avoid conflicts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50), -- 'Small', 'Medium', 'Large', 'Enterprise'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client_user', -- 'admin', 'client_admin', 'client_user', 'vendor'
  avatar_url TEXT,
  phone VARCHAR(50),
  department VARCHAR(100),
  job_title VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frameworks TEXT[] DEFAULT '{}', -- Array of framework names like 'SOC 2', 'ISO 27001'
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Inactive', 'Completed'
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  project_manager_id UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Controls table (framework controls library)
CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_id VARCHAR(50) NOT NULL, -- e.g., 'SOC2-CC6.1', 'ISO27001-A.5.1.1'
  framework VARCHAR(100) NOT NULL, -- 'SOC 2', 'ISO 27001', etc.
  domain VARCHAR(100), -- 'Access Control', 'Encryption', etc.
  title VARCHAR(500) NOT NULL,
  description TEXT,
  control_type VARCHAR(50), -- 'Preventive', 'Detective', 'Corrective'
  frequency VARCHAR(50), -- 'Continuous', 'Annual', 'Quarterly', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'controls_control_id_framework_key'
  ) THEN
    ALTER TABLE controls ADD CONSTRAINT controls_control_id_framework_key UNIQUE(control_id, framework);
  END IF;
END $$;

-- Assessment items table (project-specific control assessments)
CREATE TABLE IF NOT EXISTS assessment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Compliant', 'Non-Compliant', 'Not Applicable'
  implementation_status VARCHAR(50) DEFAULT 'Not Implemented', -- 'Not Implemented', 'Partially Implemented', 'Implemented', 'Not Applicable'
  testing_status VARCHAR(50) DEFAULT 'Not Tested', -- 'Not Tested', 'Test Failed', 'Test Passed', 'Not Applicable'
  notes TEXT,
  evidence_description TEXT,
  assigned_to UUID REFERENCES user_profiles(id),
  reviewer_id UUID REFERENCES user_profiles(id),
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'assessment_items_project_id_control_id_key'
  ) THEN
    ALTER TABLE assessment_items ADD CONSTRAINT assessment_items_project_id_control_id_key UNIQUE(project_id, control_id);
  END IF;
END $$;

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'Operational', 'Financial', 'Strategic', 'Compliance'
  level VARCHAR(50) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (impact_score * likelihood_score) STORED,
  status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'In Progress', 'Closed', 'Accepted'
  owner_id UUID REFERENCES user_profiles(id),
  identified_by UUID REFERENCES user_profiles(id),
  identified_date DATE DEFAULT CURRENT_DATE,
  target_resolution_date DATE,
  actual_resolution_date DATE,
  mitigation_plan TEXT,
  residual_risk_level VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  tier VARCHAR(10), -- '1', '2', '3', '4' (1 being most critical)
  criticality VARCHAR(50), -- 'Critical', 'High', 'Medium', 'Low'
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Inactive', 'Under Review'
  services_provided TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  annual_spend DECIMAL(15,2),
  data_classification VARCHAR(50), -- 'Public', 'Internal', 'Confidential', 'Restricted'
  has_data_access BOOLEAN DEFAULT false,
  security_review_date DATE,
  next_review_date DATE,
  overall_risk_score INTEGER CHECK (overall_risk_score BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'Security', 'Privacy', 'HR', 'Operations'
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'In Review', 'Approved', 'Rejected', 'Archived'
  effective_date DATE,
  review_date DATE,
  next_review_date DATE,
  owner_id UUID REFERENCES user_profiles(id),
  approver_id UUID REFERENCES user_profiles(id),
  approved_date DATE,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence table (for storing assessment evidence)
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_item_id UUID REFERENCES assessment_items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  file_url TEXT, -- Supabase Storage URL
  uploaded_by UUID REFERENCES user_profiles(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_items_project_id ON assessment_items(project_id);
CREATE INDEX IF NOT EXISTS idx_assessment_items_control_id ON assessment_items(control_id);
CREATE INDEX IF NOT EXISTS idx_assessment_items_status ON assessment_items(status);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_level ON risks(level);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_criticality ON vendors(criticality);
CREATE INDEX IF NOT EXISTS idx_policies_organization_id ON policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_evidence_assessment_item_id ON evidence(assessment_item_id);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON controls(framework);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_organizations_updated_at') THEN
    CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_user_profiles_updated_at') THEN
    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_controls_updated_at') THEN
    CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_assessment_items_updated_at') THEN
    CREATE TRIGGER update_assessment_items_updated_at BEFORE UPDATE ON assessment_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_risks_updated_at') THEN
    CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vendors_updated_at') THEN
    CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_policies_updated_at') THEN
    CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;