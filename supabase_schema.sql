-- GRCora Database Schema for Supabase
-- This creates the real database structure for the GRC platform

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Organizations table
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  industry text,
  size text check (size in ('startup', 'small', 'medium', 'large', 'enterprise')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  organization_id uuid references organizations(id) on delete cascade,
  frameworks text[] not null default '{}',
  status text check (status in ('planning', 'in_progress', 'review', 'completed')) default 'planning',
  start_date date,
  target_completion_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Controls table (for frameworks like SOC2, ISO27001, NIST)
create table controls (
  id text primary key, -- e.g., 'SOC2-CC6.1'
  name text not null,
  description text not null,
  family text not null,
  framework text not null,
  created_at timestamp with time zone default now()
);

-- Assessment items table
create table assessment_items (
  id uuid default uuid_generate_v4() primary key,
  control_id text references controls(id),
  project_id uuid references projects(id) on delete cascade,
  status text check (status in ('Not Started', 'In Progress', 'Compliant', 'Non-Compliant', 'Critical')) default 'Not Started',
  notes text,
  evidence_required boolean default false,
  testing_date date,
  tested_by text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Risks table
create table risks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  level text check (level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) not null,
  status text check (status in ('Open', 'In Progress', 'Mitigated', 'Closed')) default 'Open',
  control_id text references controls(id),
  project_id uuid references projects(id) on delete cascade,
  likelihood integer check (likelihood between 1 and 5),
  impact integer check (impact between 1 and 5),
  mitigation_plan text,
  owner text,
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Evidence table (for file uploads)
create table evidence (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_path text, -- Supabase Storage path
  file_name text,
  file_size bigint,
  mime_type text,
  control_id text references controls(id),
  project_id uuid references projects(id) on delete cascade,
  assessment_item_id uuid references assessment_items(id) on delete cascade,
  uploaded_by uuid, -- references auth.users
  created_at timestamp with time zone default now()
);

-- Policies table
create table policies (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  version text not null default '1.0',
  status text check (status in ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED')) default 'DRAFT',
  project_id uuid references projects(id) on delete cascade,
  effective_date date,
  review_date date,
  owner text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Vendors table (for TPRM)
create table vendors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text,
  criticality text check (criticality in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) default 'MEDIUM',
  status text check (status in ('ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED')) default 'ACTIVE',
  contact_email text,
  contact_phone text,
  website text,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Consultant-Client relationships
create table consultant_client_links (
  id uuid default uuid_generate_v4() primary key,
  consultant_org_id uuid references organizations(id) on delete cascade,
  client_org_id uuid references organizations(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(consultant_org_id, client_org_id)
);

-- Reports table (for generated reports)
create table reports (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text check (type in ('assessment', 'risk_register', 'compliance', 'executive_summary', 'vendor_assessment')) not null,
  project_id uuid references projects(id) on delete cascade,
  file_path text, -- Supabase Storage path for PDF
  file_name text,
  generated_by uuid, -- references auth.users
  generation_parameters jsonb, -- store report parameters
  created_at timestamp with time zone default now()
);

-- User profiles (extends Supabase auth.users)
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text check (role in ('CONSULTANT_OWNER', 'CONSULTANT_ADMIN', 'CONSULTANT_USER', 'CLIENT_ADMIN', 'CLIENT_USER')) not null,
  organization_id uuid references organizations(id),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table organizations enable row level security;
alter table projects enable row level security;
alter table assessment_items enable row level security;
alter table risks enable row level security;
alter table evidence enable row level security;
alter table policies enable row level security;
alter table vendors enable row level security;
alter table consultant_client_links enable row level security;
alter table reports enable row level security;
alter table user_profiles enable row level security;

-- RLS Policies
-- Users can only see data related to their organization or linked clients

-- User profiles: users can only see their own profile
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);

-- Organizations: users can see their own org and linked client orgs
create policy "Users can view related organizations" on organizations for select using (
  id in (
    select organization_id from user_profiles where id = auth.uid()
    union
    select client_org_id from consultant_client_links
    where consultant_org_id = (select organization_id from user_profiles where id = auth.uid())
    union
    select consultant_org_id from consultant_client_links
    where client_org_id = (select organization_id from user_profiles where id = auth.uid())
  )
);

-- Projects: users can see projects for their org or linked client orgs
create policy "Users can view related projects" on projects for select using (
  organization_id in (
    select organization_id from user_profiles where id = auth.uid()
    union
    select client_org_id from consultant_client_links
    where consultant_org_id = (select organization_id from user_profiles where id = auth.uid())
    union
    select consultant_org_id from consultant_client_links
    where client_org_id = (select organization_id from user_profiles where id = auth.uid())
  )
);

-- Similar policies for other tables...
-- (Assessment items, risks, evidence, etc. follow same pattern)

-- Insert default controls data
insert into controls (id, name, description, family, framework) values
  -- SOC 2 Controls
  ('SOC2-CC6.1', 'Logical Access Security', 'The entity implements logical access security measures to protect against threats to information systems.', 'Logical and Physical Access Controls', 'SOC 2'),
  ('SOC2-CC6.2', 'User Access Management', 'The entity restricts user access to information based on their assigned authority level.', 'Logical and Physical Access Controls', 'SOC 2'),
  ('SOC2-CC6.3', 'Data Access Restrictions', 'The entity restricts access to data and system configurations based on user authorization.', 'Logical and Physical Access Controls', 'SOC 2'),
  ('SOC2-CC7.1', 'System Boundary', 'The entity implements controls to protect the boundaries of its systems.', 'System Operations', 'SOC 2'),
  ('SOC2-CC8.1', 'Change Management', 'The entity implements controls related to changes to systems and software.', 'Change Management', 'SOC 2'),

  -- ISO 27001 Controls
  ('ISO-A.5.15', 'Access Control', 'Access to information and other associated assets should be managed based on business and information security requirements.', 'Access Control', 'ISO 27001:2022'),
  ('ISO-A.5.16', 'Identity Management', 'The full life cycle of identities should be managed.', 'Access Control', 'ISO 27001:2022'),
  ('ISO-A.8.1', 'User Endpoint Devices', 'Information stored on, processed by or accessible via user endpoint devices should be protected.', 'Technology', 'ISO 27001:2022'),
  ('ISO-A.8.23', 'Web Filtering', 'Access to external websites should be managed to reduce exposure to malicious content.', 'Technology', 'ISO 27001:2022'),
  ('ISO-A.6.4', 'Incident Response', 'Information security incidents should be responded to in accordance with documented procedures.', 'Incident Management', 'ISO 27001:2022'),

  -- NIST CSF Controls
  ('NIST-PR.AC-1', 'Access Control Policies and Procedures', 'Access control policies and procedures are defined and implemented.', 'Access Control', 'NIST CSF 2.0'),
  ('NIST-PR.AC-3', 'Remote Access Management', 'Remote access is managed and monitored.', 'Access Control', 'NIST CSF 2.0'),
  ('NIST-PR.DS-1', 'Data-at-rest Protection', 'Data-at-rest is protected using appropriate mechanisms.', 'Data Security', 'NIST CSF 2.0'),
  ('NIST-PR.DS-2', 'Data-in-transit Protection', 'Data-in-transit is protected using appropriate mechanisms.', 'Data Security', 'NIST CSF 2.0'),
  ('NIST-DE.CM-1', 'Network Monitoring', 'Networks and network communications are monitored to detect potential cybersecurity events.', 'Anomalies and Events', 'NIST CSF 2.0'),
  ('NIST-RS.RP-1', 'Response Plan Execution', 'Response plan is executed during or after an incident.', 'Response Planning', 'NIST CSF 2.0');

-- Create storage bucket for file uploads
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false);
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- Storage policies
create policy "Users can upload evidence files" on storage.objects for insert with check (
  bucket_id = 'evidence' and
  auth.uid() is not null
);

create policy "Users can view evidence files" on storage.objects for select using (
  bucket_id = 'evidence' and
  auth.uid() is not null
);

create policy "Users can upload report files" on storage.objects for insert with check (
  bucket_id = 'reports' and
  auth.uid() is not null
);

create policy "Users can view report files" on storage.objects for select using (
  bucket_id = 'reports' and
  auth.uid() is not null
);