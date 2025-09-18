-- SQL commands to run in Supabase SQL Editor
-- Copy and paste this entire script into your Supabase dashboard SQL editor

-- Create nist_controls table with proper primary key
CREATE TABLE IF NOT EXISTS public.nist_controls (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    control_id TEXT NOT NULL UNIQUE, -- The actual control identifier (AC-1, etc.)
    family TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    guidance TEXT,
    framework TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    content_hash TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.nist_controls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GRC system (public read access, authenticated write)
CREATE POLICY "Allow public read access" ON public.nist_controls
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.nist_controls
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated update" ON public.nist_controls
FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated delete" ON public.nist_controls
FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.nist_controls TO anon;
GRANT ALL ON public.nist_controls TO authenticated;
GRANT ALL ON public.nist_controls TO service_role;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_nist_controls_control_id ON public.nist_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_nist_controls_framework ON public.nist_controls(framework);
CREATE INDEX IF NOT EXISTS idx_nist_controls_family ON public.nist_controls(family);
CREATE INDEX IF NOT EXISTS idx_nist_controls_title ON public.nist_controls USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_nist_controls_description ON public.nist_controls USING gin(to_tsvector('english', description));

-- Insert a test record to verify the table works
INSERT INTO public.nist_controls (control_id, family, title, description, framework, content_hash)
VALUES ('TEST-001', 'Test', 'Test Control', 'This is a test control to verify table creation', 'TEST_FRAMEWORK', 'test-hash-001');

-- Query to verify the table and test record
SELECT * FROM public.nist_controls WHERE control_id = 'TEST-001';