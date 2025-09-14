-- GRCora Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum (
  'consultant_owner',
  'consultant_admin',
  'consultant_collaborator',
  'client_admin',
  'client_contributor'
);

create type assessment_status as enum (
  'Not Started',
  'In Progress',
  'In Review',
  'Completed'
);

create type risk_level as enum (
  'Low',
  'Medium',
  'High',
  'Critical'
);

create type policy_status as enum (
  'Draft',
  'In Review',
  'Approved',
  'Rejected',
  'Archived'
);

create type vendor_lifecycle_stage as enum (
  'Identification',
  'Onboarding',
  'Active',
  'Offboarding'
);

-- Organizations table
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Users table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  frameworks text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Controls table
create table controls (
  id text primary key,
  name text not null,
  description text not null,
  family text not null,
  framework text not null,
  created_at timestamptz default now()
);

-- Assessment Items table
create table assessment_items (
  id uuid primary key default gen_random_uuid(),
  control_id text not null references controls(id),
  project_id uuid not null references projects(id) on delete cascade,
  status assessment_status not null default 'Not Started',
  notes text default '',
  remediation_plan text default '',
  assigned_to uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Risks table
create table risks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level risk_level not null,
  status text not null default 'Open',
  control_id text not null references controls(id),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Policies table
create table policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  owner_id uuid not null references users(id),
  status policy_status not null default 'Draft',
  version text not null default '1.0',
  project_id uuid not null references projects(id) on delete cascade,
  control_id text references controls(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Policy History table
create table policy_history (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references policies(id) on delete cascade,
  status policy_status not null,
  user_id uuid not null references users(id),
  notes text,
  created_at timestamptz default now()
);

-- Evidence table
create table evidence (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_url text not null,
  uploader_id uuid not null references users(id),
  control_id text not null references controls(id),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now()
);

-- Vendors table
create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service text not null,
  tier text not null check (tier in ('1', '2', '3')),
  status vendor_lifecycle_stage not null default 'Identification',
  owner text not null,
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Control Mappings table
create table control_mappings (
  id uuid primary key default gen_random_uuid(),
  source_control_id text not null references controls(id),
  target_control_id text not null references controls(id),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now()
);

-- Insert initial framework controls
insert into controls (id, name, description, family, framework) values
-- ISO 27001:2022
('ISO-A.5.1', 'Policies for information security', 'A set of policies for information security should be defined, approved by management, published and communicated.', 'Organizational Controls', 'ISO 27001:2022'),
('ISO-A.6.3', 'Information security awareness, education and training', 'Information security awareness, education and training should be provided to all relevant personnel.', 'People Controls', 'ISO 27001:2022'),
('ISO-A.7.2', 'Physical entry', 'Secure areas should be protected by appropriate entry controls.', 'Physical Controls', 'ISO 27001:2022'),
('ISO-A.8.12', 'Data leakage prevention', 'Data leakage prevention measures should be applied to systems, networks and any other devices that process, store or transmit sensitive information.', 'Technological Controls', 'ISO 27001:2022'),

-- NIST CSF 2.0
('NIST-GV.OC-1', 'Organizational Context', 'The organizational context that is relevant to cybersecurity risk management is understood.', 'Govern', 'NIST CSF 2.0'),
('NIST-ID.AM-1', 'Asset Management', 'Assets (e.g., data, hardware, software, systems, services, people, facilities) that enable the organization to achieve business purposes are identified and managed.', 'Identify', 'NIST CSF 2.0'),
('NIST-PR.AC-1', 'Access Control', 'Access to assets is managed, incorporating the principles of least privilege and separation of duties.', 'Protect', 'NIST CSF 2.0'),
('NIST-DE.CM-1', 'Continuous Monitoring', 'The information system and assets are monitored to identify cybersecurity events and verify the effectiveness of protective measures.', 'Detect', 'NIST CSF 2.0'),
('NIST-RS.RP-1', 'Response Planning', 'Response processes and procedures are executed and maintained, to ensure timely response to detected cybersecurity events.', 'Respond', 'NIST CSF 2.0'),
('NIST-RC.RP-1', 'Recovery Planning', 'Recovery processes and procedures are executed and maintained to ensure timely restoration of systems or assets affected by cybersecurity events.', 'Recover', 'NIST CSF 2.0'),

-- SOC 2
('SOC2-CC6.1', 'Logical Access Security', 'The entity implements logical access security measures to protect information assets.', 'Logical and Physical Access Controls', 'SOC 2');

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table users enable row level security;
alter table projects enable row level security;
alter table assessment_items enable row level security;
alter table risks enable row level security;
alter table policies enable row level security;
alter table policy_history enable row level security;
alter table evidence enable row level security;
alter table vendors enable row level security;
alter table control_mappings enable row level security;

-- Organizations: Users can only see their own organization
create policy "Users can view their own organization"
  on organizations for select
  using (id = (select organization_id from users where users.id = auth.uid()));

-- Users: Users can see users in their organization
create policy "Users can view users in their organization"
  on users for select
  using (organization_id = (select organization_id from users where users.id = auth.uid()));

-- Projects: Users can see projects for their organization
create policy "Users can view projects in their organization"
  on projects for select
  using (organization_id = (select organization_id from users where users.id = auth.uid()));

-- Assessment Items: Users can see assessment items for projects in their organization
create policy "Users can view assessment items in their organization"
  on assessment_items for select
  using (project_id in (
    select p.id from projects p
    join users u on u.organization_id = p.organization_id
    where u.id = auth.uid()
  ));

-- Similar policies for other tables
create policy "Users can view risks in their organization"
  on risks for select
  using (project_id in (
    select p.id from projects p
    join users u on u.organization_id = p.organization_id
    where u.id = auth.uid()
  ));

create policy "Users can view policies in their organization"
  on policies for select
  using (project_id in (
    select p.id from projects p
    join users u on u.organization_id = p.organization_id
    where u.id = auth.uid()
  ));

create policy "Users can view evidence in their organization"
  on evidence for select
  using (project_id in (
    select p.id from projects p
    join users u on u.organization_id = p.organization_id
    where u.id = auth.uid()
  ));

create policy "Users can view vendors in their organization"
  on vendors for select
  using (project_id in (
    select p.id from projects p
    join users u on u.organization_id = p.organization_id
    where u.id = auth.uid()
  ));

-- Controls are public (no RLS needed)
-- Policy history follows policies access

-- Functions and Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers to relevant tables
create trigger update_users_updated_at before update on users
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on projects
  for each row execute procedure update_updated_at_column();

create trigger update_assessment_items_updated_at before update on assessment_items
  for each row execute procedure update_updated_at_column();

create trigger update_risks_updated_at before update on risks
  for each row execute procedure update_updated_at_column();

create trigger update_policies_updated_at before update on policies
  for each row execute procedure update_updated_at_column();

create trigger update_vendors_updated_at before update on vendors
  for each row execute procedure update_updated_at_column();