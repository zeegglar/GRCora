// Database seeding script for GRCora
// Run this after applying the schema to populate with realistic demo data

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://bxuemorpwwelxpbrpyve.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dWVtb3Jwd3dlbHhwYnJweXZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE2MTk2MSwiZXhwIjoyMDczNzM3OTYxfQ.aYEmwj_19lMtENxbZeL7wXCCLL3wH4qD2cungLGkfjw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Seeding GRCora database with realistic demo data...');

  try {
    // 1. Create Organizations
    console.log('Creating organizations...');
    const { data: orgs } = await supabase
      .from('organizations')
      .insert([
        { id: 'org-consultancy', name: 'SecureGRC Consultants', industry: 'Consulting', size: 'medium' },
        { id: 'org-medical-center', name: 'Regional Medical Center', industry: 'Healthcare', size: 'large' },
        { id: 'org-financial-trust', name: 'Financial Trust Corp', industry: 'Financial Services', size: 'large' },
        { id: 'org-techflow-mfg', name: 'TechFlow Manufacturing', industry: 'Manufacturing', size: 'medium' },
        { id: 'org-innovate-tech', name: 'InnovateTech Startup', industry: 'Technology', size: 'startup' }
      ])
      .select();

    // 2. Create Consultant-Client Links
    console.log('Creating consultant-client relationships...');
    await supabase
      .from('consultant_client_links')
      .insert([
        { consultant_org_id: 'org-consultancy', client_org_id: 'org-medical-center' },
        { consultant_org_id: 'org-consultancy', client_org_id: 'org-financial-trust' },
        { consultant_org_id: 'org-consultancy', client_org_id: 'org-techflow-mfg' },
        { consultant_org_id: 'org-consultancy', client_org_id: 'org-innovate-tech' }
      ]);

    // 3. Create Projects
    console.log('Creating projects...');
    const { data: projects } = await supabase
      .from('projects')
      .insert([
        {
          id: 'proj-1',
          name: 'Post-Ransomware Recovery Assessment',
          organization_id: 'org-medical-center',
          frameworks: ['ISO 27001:2022', 'HIPAA'],
          status: 'in_progress'
        },
        {
          id: 'proj-2',
          name: 'Cloud Migration Security Review',
          organization_id: 'org-financial-trust',
          frameworks: ['SOC 2', 'NIST CSF 2.0'],
          status: 'in_progress'
        },
        {
          id: 'proj-3',
          name: 'Supply Chain Security Assessment',
          organization_id: 'org-techflow-mfg',
          frameworks: ['NIST CSF 2.0', 'ISO 27001:2022'],
          status: 'in_progress'
        },
        {
          id: 'proj-4',
          name: 'Insider Threat Response & Controls',
          organization_id: 'org-innovate-tech',
          frameworks: ['SOC 2', 'NIST CSF 2.0'],
          status: 'in_progress'
        }
      ])
      .select();

    // 4. Create Assessment Items
    console.log('Creating assessment items...');
    const assessmentItems = [
      // Regional Medical Center - Post-Ransomware Recovery (proj-1)
      { control_id: 'ISO-A.5.15', project_id: 'proj-1', status: 'Non-Compliant', notes: 'Post-ransomware: Emergency access controls bypassed critical approval processes during incident response.' },
      { control_id: 'ISO-A.5.16', project_id: 'proj-1', status: 'In Progress', notes: 'Reviewing all user accounts created during ransomware recovery - several temp accounts lack proper documentation.' },
      { control_id: 'ISO-A.8.1', project_id: 'proj-1', status: 'Critical', notes: 'Endpoint devices compromised by ransomware - rebuilding with enhanced security configurations.' },
      { control_id: 'ISO-A.6.4', project_id: 'proj-1', status: 'In Progress', notes: 'Incident response plan activated during ransomware attack - conducting post-incident review and improvements.' },

      // Financial Trust Corp - Cloud Migration Security (proj-2)
      { control_id: 'SOC2-CC6.1', project_id: 'proj-2', status: 'In Progress', notes: 'Migrating logical access controls to AWS IAM - mapping existing roles to cloud permissions.' },
      { control_id: 'SOC2-CC6.2', project_id: 'proj-2', status: 'Compliant', notes: 'Multi-factor authentication successfully implemented for AWS console and privileged access.' },
      { control_id: 'NIST-PR.DS-1', project_id: 'proj-2', status: 'In Progress', notes: 'Configuring encryption at rest for RDS instances and S3 buckets in new AWS environment.' },
      { control_id: 'NIST-PR.DS-2', project_id: 'proj-2', status: 'Compliant', notes: 'TLS 1.3 enforced for all data in transit between on-premises and AWS resources.' },

      // TechFlow Manufacturing - Supply Chain Security (proj-3)
      { control_id: 'NIST-PR.AC-1', project_id: 'proj-3', status: 'Non-Compliant', notes: 'Third-party vendor access policies compromised during supply chain attack - urgent revision needed.' },
      { control_id: 'NIST-DE.CM-1', project_id: 'proj-3', status: 'In Progress', notes: 'Enhanced network monitoring deployed to detect lateral movement from compromised vendor systems.' },
      { control_id: 'ISO-A.5.15', project_id: 'proj-3', status: 'Critical', notes: 'Supply chain breach exposed weak vendor access controls - implementing zero-trust architecture.' },
      { control_id: 'NIST-RS.RP-1', project_id: 'proj-3', status: 'Compliant', notes: 'Supply chain incident response plan executed - coordination with FBI and vendor notification complete.' },

      // InnovateTech Startup - Insider Threat (proj-4)
      { control_id: 'SOC2-CC6.1', project_id: 'proj-4', status: 'Critical', notes: 'Insider threat incident: privileged user accessed confidential data outside normal patterns.' },
      { control_id: 'SOC2-CC6.3', project_id: 'proj-4', status: 'In Progress', notes: 'Implementing data loss prevention and user activity monitoring following insider data exfiltration.' },
      { control_id: 'NIST-PR.AC-3', project_id: 'proj-4', status: 'Non-Compliant', notes: 'Remote access controls insufficient - insider used personal device to access sensitive systems.' },
      { control_id: 'NIST-DE.CM-1', project_id: 'proj-4', status: 'In Progress', notes: 'Deploying user behavior analytics to detect anomalous access patterns and potential insider threats.' }
    ];

    await supabase.from('assessment_items').insert(assessmentItems);

    // 5. Create Risks
    console.log('Creating risks...');
    const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const risks = [
      // Regional Medical Center risks
      { title: 'Patient Data Exposed in Ransomware Attack', level: 'CRITICAL', status: 'Open', control_id: 'ISO-A.5.15', project_id: 'proj-1', created_at: daysAgo(7) },
      { title: 'Emergency Access Accounts Still Active', level: 'HIGH', status: 'Open', control_id: 'ISO-A.5.16', project_id: 'proj-1', created_at: daysAgo(14) },
      { title: 'Backup Systems Compromised During Attack', level: 'CRITICAL', status: 'In Progress', control_id: 'ISO-A.8.1', project_id: 'proj-1', created_at: daysAgo(7) },

      // Financial Trust Corp risks
      { title: 'Legacy Systems Still Connected During Migration', level: 'HIGH', status: 'Open', control_id: 'SOC2-CC6.1', project_id: 'proj-2', created_at: daysAgo(21) },
      { title: 'Cloud Configuration Drift from Security Baseline', level: 'MEDIUM', status: 'In Progress', control_id: 'NIST-PR.DS-1', project_id: 'proj-2', created_at: daysAgo(12) },

      // TechFlow Manufacturing risks
      { title: 'Compromised Vendor Software Still in Use', level: 'CRITICAL', status: 'Open', control_id: 'NIST-PR.AC-1', project_id: 'proj-3', created_at: daysAgo(3) },
      { title: 'Third-Party Access Credentials Exposed', level: 'CRITICAL', status: 'Open', control_id: 'ISO-A.5.15', project_id: 'proj-3', created_at: daysAgo(3) },

      // InnovateTech risks
      { title: 'Insider Used Personal Device for Data Access', level: 'HIGH', status: 'Open', control_id: 'NIST-PR.AC-3', project_id: 'proj-4', created_at: daysAgo(1) },
      { title: 'Privileged User Activity Not Monitored', level: 'MEDIUM', status: 'In Progress', control_id: 'SOC2-CC6.1', project_id: 'proj-4', created_at: daysAgo(5) }
    ];

    await supabase.from('risks').insert(risks);

    // 6. Create some sample policies
    console.log('Creating policies...');
    const policies = [
      {
        title: 'Information Security Policy',
        content: 'This policy establishes the framework for information security...',
        version: '2.1',
        status: 'APPROVED',
        project_id: 'proj-1',
        effective_date: '2024-01-01',
        review_date: '2024-12-31'
      },
      {
        title: 'Access Control Policy',
        content: 'This policy defines requirements for user access management...',
        version: '1.3',
        status: 'APPROVED',
        project_id: 'proj-2',
        effective_date: '2024-02-01',
        review_date: '2024-12-31'
      }
    ];

    await supabase.from('policies').insert(policies);

    // 7. Create sample vendors
    console.log('Creating vendors...');
    const vendors = [
      {
        name: 'CloudSecure Solutions',
        description: 'Cloud infrastructure security services',
        category: 'Cloud Security',
        criticality: 'HIGH',
        status: 'ACTIVE',
        contact_email: 'security@cloudsecure.com',
        project_id: 'proj-2'
      },
      {
        name: 'DataGuard Analytics',
        description: 'Data analytics and monitoring platform',
        category: 'Monitoring',
        criticality: 'MEDIUM',
        status: 'ACTIVE',
        contact_email: 'support@dataguard.com',
        project_id: 'proj-3'
      }
    ];

    await supabase.from('vendors').insert(vendors);

    console.log('✅ Database seeded successfully!');
    console.log('\n🎉 Your GRCora platform now has:');
    console.log('- 5 Organizations (1 consultant + 4 clients)');
    console.log('- 4 Active projects with realistic scenarios');
    console.log('- 16 Assessment items with real findings');
    console.log('- 9 Risks across different severity levels');
    console.log('- 2 Sample policies');
    console.log('- 2 Vendor relationships');
    console.log('\n🚀 Ready to test report generation!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding
seedDatabase();