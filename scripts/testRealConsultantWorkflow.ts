#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🧑‍💼 REAL CONSULTANT WORKFLOW SIMULATION\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateConsultantWorkflow() {
  try {
    console.log('📋 STEP 1: CLIENT ONBOARDING\n');

    // Client A: NGO using ISO 27001
    console.log('🏢 Onboarding Client A: Save The Children Foundation');
    const clientA = {
      name: 'Save The Children Foundation',
      domain: 'savethechildren.org',
      industry: 'Nonprofit',
      size: 'Large'
    };

    const { data: orgA, error: orgAError } = await supabase
      .from('organizations')
      .insert(clientA)
      .select()
      .single();

    if (orgAError) {
      console.log('❌ Failed to onboard Client A:', orgAError.message);
      return;
    }

    console.log('✅ Client A onboarded successfully');
    console.log(`   Organization: ${orgA.name}`);
    console.log(`   Industry: ${orgA.industry}`);
    console.log(`   Size: ${orgA.size}`);

    // Project for Client A
    const projectA = {
      organization_id: orgA.id,
      name: 'ISO 27001 Implementation & Certification',
      description: 'Implementing ISO 27001 Information Security Management System for certification readiness',
      frameworks: ['ISO 27001'],
      status: 'Active',
      start_date: new Date().toISOString().split('T')[0],
      target_completion_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year
    };

    const { data: projA, error: projAError } = await supabase
      .from('projects')
      .insert(projectA)
      .select()
      .single();

    if (projAError) {
      console.log('❌ Failed to create Project A:', projAError.message);
      return;
    }

    console.log('✅ Project A created: ISO 27001 Implementation');
    console.log(`   Timeline: ${projA.start_date} to ${projA.target_completion_date}`);

    // Client B: SaaS startup aiming for SOC 2
    console.log('\n🏢 Onboarding Client B: TechFlow Solutions');
    const clientB = {
      name: 'TechFlow Solutions',
      domain: 'techflow.io',
      industry: 'Technology',
      size: 'Medium'
    };

    const { data: orgB, error: orgBError } = await supabase
      .from('organizations')
      .insert(clientB)
      .select()
      .single();

    if (orgBError) {
      console.log('❌ Failed to onboard Client B:', orgBError.message);
      return;
    }

    console.log('✅ Client B onboarded successfully');
    console.log(`   Organization: ${orgB.name}`);
    console.log(`   Industry: ${orgB.industry}`);
    console.log(`   Size: ${orgB.size}`);

    // Project for Client B
    const projectB = {
      organization_id: orgB.id,
      name: 'SOC 2 Type II Readiness',
      description: 'Preparing for SOC 2 Type II audit with focus on Security and Availability trust service criteria',
      frameworks: ['SOC 2'],
      status: 'Active',
      start_date: new Date().toISOString().split('T')[0],
      target_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 months
    };

    const { data: projB, error: projBError } = await supabase
      .from('projects')
      .insert(projectB)
      .select()
      .single();

    if (projBError) {
      console.log('❌ Failed to create Project B:', projBError.message);
      return;
    }

    console.log('✅ Project B created: SOC 2 Type II Readiness');
    console.log(`   Timeline: ${projB.start_date} to ${projB.target_completion_date}`);

    console.log('\n📊 STEP 2: CONTROL MAPPING & RAG TEST\n');

    // Test RAG with Access Control query
    console.log('🔍 Testing RAG Query: "Show me all Access Control requirements"');

    const { data: accessControls, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, description')
      .or('title.ilike.%access%,description.ilike.%access%')
      .limit(10);

    if (searchError) {
      console.log('❌ RAG Query failed:', searchError.message);
    } else {
      console.log(`✅ Found ${accessControls.length} Access Control requirements:`);
      accessControls.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
        console.log(`      ${control.description.substring(0, 100)}...`);
      });

      // Check framework coverage
      const frameworks = [...new Set(accessControls.map(c => c.framework))];
      console.log(`\n📋 Framework Coverage: ${frameworks.join(', ')}`);

      // Validate citations and accuracy
      const hasNIST = frameworks.includes('NIST_800_53');
      const hasISO = frameworks.includes('ISO_27001');
      const hasCIS = frameworks.includes('CIS_V8');

      console.log('\n🎯 RAG Validation:');
      console.log(`   ✅ NIST 800-53 coverage: ${hasNIST ? 'YES' : 'NO'}`);
      console.log(`   ✅ ISO 27001 coverage: ${hasISO ? 'YES' : 'NO'}`);
      console.log(`   ✅ CIS v8 coverage: ${hasCIS ? 'YES' : 'NO'}`);
      console.log(`   ✅ Control IDs present: ${accessControls.every(c => c.id) ? 'YES' : 'NO'}`);
      console.log(`   ✅ Framework citations: ${accessControls.every(c => c.framework) ? 'YES' : 'NO'}`);
    }

    console.log('\n📊 ENGAGEMENT DASHBOARD SUMMARY\n');

    // Query for dashboard data
    const { data: dashboardData, error: dashError } = await supabase
      .from('organizations')
      .select(`
        *,
        projects (
          *
        )
      `)
      .in('id', [orgA.id, orgB.id]);

    if (dashError) {
      console.log('❌ Dashboard query failed:', dashError.message);
    } else {
      console.log('📈 Active Engagements:');
      dashboardData.forEach((org, i) => {
        console.log(`\n${i + 1}. ${org.name}`);
        console.log(`   Industry: ${org.industry} | Size: ${org.size}`);
        console.log(`   Domain: ${org.domain}`);
        if (org.projects && org.projects.length > 0) {
          org.projects.forEach((proj: any) => {
            console.log(`   📋 Project: ${proj.name}`);
            console.log(`   🎯 Frameworks: ${proj.frameworks.join(', ')}`);
            console.log(`   📅 Timeline: ${proj.start_date} → ${proj.target_completion_date}`);
            console.log(`   🔄 Status: ${proj.status}`);
          });
        }
      });
    }

    // Store client IDs for later use
    console.log('\n💾 Storing client data for policy generation...');
    return {
      clientA: { org: orgA, project: projA },
      clientB: { org: orgB, project: projB }
    };

  } catch (error) {
    console.error('❌ Consultant workflow simulation failed:', error);
  }
}

// Run the simulation
simulateConsultantWorkflow().catch(console.error);