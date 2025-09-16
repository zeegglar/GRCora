-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- NIST Controls Knowledge Base
CREATE TABLE IF NOT EXISTS nist_controls (
  id TEXT PRIMARY KEY,
  family TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  guidance TEXT,
  assessment_objectives TEXT[],
  assessment_methods TEXT[],
  parameters TEXT[],
  related_controls TEXT[],
  framework TEXT CHECK (framework IN ('NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF', 'CIS_V8', 'ISO_27001')),
  category TEXT,
  subcategory TEXT,
  informative_references TEXT[],
  embedding vector(768),
  content_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_nist_controls_framework ON nist_controls(framework);
CREATE INDEX IF NOT EXISTS idx_nist_controls_family ON nist_controls(family);
CREATE INDEX IF NOT EXISTS idx_nist_controls_embedding ON nist_controls USING ivfflat (embedding vector_cosine_ops);

-- Project Controls Implementation Status
CREATE TABLE IF NOT EXISTS project_controls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  control_id TEXT REFERENCES nist_controls(id),
  status TEXT CHECK (status IN ('not_implemented', 'partially_implemented', 'implemented', 'not_applicable')),
  implementation_notes TEXT,
  evidence_references TEXT[],
  assigned_to UUID REFERENCES users(id),
  target_completion_date DATE,
  actual_completion_date DATE,
  last_assessed_date DATE,
  assessment_result TEXT CHECK (assessment_result IN ('satisfactory', 'other_than_satisfactory', 'not_assessed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, control_id)
);

-- Client Communication & Collaboration
CREATE TABLE IF NOT EXISTS client_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  message_type TEXT CHECK (message_type IN ('message', 'notification', 'approval_request', 'status_update')),
  subject TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  requires_response BOOLEAN DEFAULT FALSE,
  response_deadline TIMESTAMPTZ,
  parent_message_id UUID REFERENCES client_communications(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Task Management
CREATE TABLE IF NOT EXISTS client_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  task_type TEXT CHECK (task_type IN ('document_review', 'information_request', 'approval', 'implementation', 'meeting')),
  due_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  related_control_id TEXT REFERENCES nist_controls(id),
  attachments JSONB DEFAULT '[]',
  client_visible BOOLEAN DEFAULT TRUE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Budget & Financial Tracking
CREATE TABLE IF NOT EXISTS project_financials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  budget_category TEXT CHECK (budget_category IN ('consulting', 'tools', 'training', 'certification', 'other')),
  budgeted_amount DECIMAL(12,2),
  actual_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  billing_period TEXT CHECK (billing_period IN ('one_time', 'monthly', 'quarterly', 'annual')),
  last_billed_date DATE,
  next_billing_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Tracking for Transparency
CREATE TABLE IF NOT EXISTS consultant_time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id),
  task_id UUID REFERENCES client_tasks(id),
  activity_description TEXT NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL,
  billable_hours DECIMAL(4,2) NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(8,2),
  work_date DATE NOT NULL,
  client_visible BOOLEAN DEFAULT TRUE,
  approved_by_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Approval Workflows
CREATE TABLE IF NOT EXISTS client_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  approval_type TEXT CHECK (approval_type IN ('document', 'scope_change', 'budget_change', 'deliverable', 'timeline')),
  title TEXT NOT NULL,
  description TEXT,
  requested_by UUID REFERENCES users(id),
  approval_required_from UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  attachments JSONB DEFAULT '[]',
  approval_deadline TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Progress Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_date DATE,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')) DEFAULT 'planned',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  dependencies TEXT[], -- Array of other milestone IDs
  deliverables TEXT[],
  is_client_facing BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Knowledge Queries & Responses (for RAG)
CREATE TABLE IF NOT EXISTS ai_knowledge_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  query_text TEXT NOT NULL,
  query_embedding vector(768),
  response_text TEXT,
  confidence_score DECIMAL(3,2),
  controls_referenced TEXT[],
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT,
  query_type TEXT CHECK (query_type IN ('gap_analysis', 'implementation_guidance', 'compliance_question', 'general')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function for vector similarity search on NIST controls
CREATE OR REPLACE FUNCTION match_nist_controls(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  frameworks text[] DEFAULT ARRAY['NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF', 'CIS_V8', 'ISO_27001']
)
RETURNS TABLE (
  id text,
  family text,
  title text,
  description text,
  guidance text,
  framework text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    nist_controls.id,
    nist_controls.family,
    nist_controls.title,
    nist_controls.description,
    nist_controls.guidance,
    nist_controls.framework,
    1 - (nist_controls.embedding <=> query_embedding) as similarity
  FROM nist_controls
  WHERE
    nist_controls.framework = ANY(frameworks) AND
    1 - (nist_controls.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create RLS policies
ALTER TABLE nist_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_queries ENABLE ROW LEVEL SECURITY;

-- NIST controls are public for all authenticated users
CREATE POLICY "NIST controls are viewable by authenticated users" ON nist_controls
  FOR SELECT TO authenticated USING (true);

-- Project controls are viewable by project members
CREATE POLICY "Project controls viewable by project members" ON project_controls
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Client communications are viewable by sender and recipient
CREATE POLICY "Communications viewable by participants" ON client_communications
  FOR ALL TO authenticated
  USING (
    from_user_id = auth.uid() OR
    to_user_id = auth.uid() OR
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Client tasks are viewable by project members
CREATE POLICY "Tasks viewable by project members" ON client_tasks
  FOR ALL TO authenticated
  USING (
    assigned_to = auth.uid() OR
    assigned_by = auth.uid() OR
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Project financials are viewable by project members (sensitive data)
CREATE POLICY "Financials viewable by authorized users" ON project_financials
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Time entries visibility rules
CREATE POLICY "Time entries viewable by relevant parties" ON consultant_time_entries
  FOR ALL TO authenticated
  USING (
    consultant_id = auth.uid() OR
    (client_visible = true AND project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    ))
  );

-- Approval workflows
CREATE POLICY "Approvals viewable by participants" ON client_approvals
  FOR ALL TO authenticated
  USING (
    requested_by = auth.uid() OR
    approval_required_from = auth.uid() OR
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Milestones viewable by project members
CREATE POLICY "Milestones viewable by project members" ON project_milestones
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- AI queries viewable by project members
CREATE POLICY "AI queries viewable by project members" ON ai_knowledge_queries
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT projects.id FROM projects
      WHERE projects.organization_id = (
        SELECT users.organization_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nist_controls_updated_at BEFORE UPDATE ON nist_controls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_controls_updated_at BEFORE UPDATE ON project_controls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_client_tasks_updated_at BEFORE UPDATE ON client_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_financials_updated_at BEFORE UPDATE ON project_financials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();