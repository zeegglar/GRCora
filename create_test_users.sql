-- Create test organizations first
INSERT INTO organizations (id, name) VALUES
('org-aurelius', 'Aurelius Risk Partners'),
('org-northwind', 'Northwind Health'),
('org-contoso', 'Contoso Manufacturing'),
('org-litware', 'Litware Finance')
ON CONFLICT (id) DO NOTHING;

-- You'll need to manually create auth users via the Supabase Dashboard first,
-- then run this to add their profiles:

-- Example: After creating auth user for owner@aurelius.test,
-- get their UUID from the auth.users table and insert:
-- INSERT INTO users (id, full_name, role, organization_id) VALUES
-- ('the-uuid-from-auth-users', 'Marcus Aurelius', 'consultant_owner', 'org-aurelius');