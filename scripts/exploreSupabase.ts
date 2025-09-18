#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔍 EXPLORING SUPABASE DATABASE STRUCTURE\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function exploreDatabase() {
  try {
    console.log('📊 Checking table structure...\n');

    // Test known tables directly
    const knownTables = ['organizations', 'projects', 'nist_controls', 'assessments', 'controls'];
    console.log('🔍 Testing known tables:');

    // Check organizations table
    console.log('\n📋 Organizations table:');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);

    if (orgError) {
      console.log('❌ Organizations error:', orgError.message);
    } else {
      console.log(`✅ Found ${orgs?.length || 0} organizations`);
      orgs?.forEach(org => {
        console.log(`   - ${org.name} (${org.industry})`);
      });
    }

    // Check projects table
    console.log('\n📂 Projects table:');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);

    if (projectError) {
      console.log('❌ Projects error:', projectError.message);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects`);
      projects?.forEach(project => {
        console.log(`   - ${project.name} (${project.status})`);
      });
    }

    // Check NIST controls
    console.log('\n🎯 NIST controls table:');
    const { data: controls, error: controlsError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(10);

    if (controlsError) {
      console.log('❌ Controls error:', controlsError.message);
    } else {
      console.log(`✅ Found ${controls?.length || 0} controls (showing first 10)`);
      controls?.forEach((control, index) => {
        console.log(`   ${index + 1}. [${control.framework}] ${control.title} (${control.id})`);
      });
    }

    // Count by framework
    console.log('\n📈 Framework breakdown:');
    const frameworks = ['CIS_V8', 'ISO_27001', 'NIST_800_53', 'NIST_AI_RMF', 'NIST_CSF'];

    for (const framework of frameworks) {
      const { data, error } = await supabase
        .from('nist_controls')
        .select('count(*)', { count: 'exact', head: true })
        .eq('framework', framework);

      if (!error) {
        console.log(`   ${framework}: ${data || 0} controls`);
      }
    }

    // Check if we can create test data
    console.log('\n🧪 Testing data creation...');
    const testOrg = {
      name: 'Test Organization',
      industry: 'Technology',
      size: 'Medium',
      description: 'Test organization for validation'
    };

    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (createError) {
      console.log('❌ Create test organization failed:', createError.message);
    } else {
      console.log('✅ Test organization created:', newOrg.name);

      // Clean up - delete the test organization
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrg.id);

      if (!deleteError) {
        console.log('✅ Test organization cleaned up');
      }
    }

    console.log('\n🎉 Database exploration completed!');

  } catch (error) {
    console.error('❌ Exploration failed:', error);
  }
}

exploreDatabase().catch(console.error);