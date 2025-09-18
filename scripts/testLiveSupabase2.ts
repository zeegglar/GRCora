#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Correct Supabase URL and anon key
const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyMzM2MTQsImV4cCI6MjA0MTgwOTYxNH0.bNBXOmqnHoADTtY6fzN8kNhbGU2iEFQNQpRGxYgmCqI';

console.log('🔗 Testing Live Supabase with Claude Reviewer Access...\n');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveSupabaseAccess() {
  try {
    // Test basic connection
    console.log('📊 Testing basic connection...');

    const { data, error } = await supabase
      .from('organizations')
      .select('count(*)', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Basic connection failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!');

    // Test organizations table
    console.log('\n📋 Testing organizations table...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(3);

    if (orgError) {
      console.log('❌ Organizations error:', orgError.message);
    } else {
      console.log(`✅ Found ${orgs?.length || 0} organizations`);
      orgs?.forEach(org => {
        console.log(`   - ${org.name} (${org.industry})`);
      });
    }

    // Test NIST controls
    console.log('\n🎯 Testing NIST controls...');
    const { data: controls, error: controlsError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(5);

    if (controlsError) {
      console.log('❌ Controls error:', controlsError.message);
    } else {
      console.log(`✅ Found ${controls?.length || 0} controls`);
      controls?.forEach(control => {
        console.log(`   - [${control.framework}] ${control.title} (${control.id})`);
      });
    }

    // Test access control search
    console.log('\n🔍 Testing "access control" search...');
    const { data: accessControls, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .ilike('title', '%access%')
      .limit(10);

    if (searchError) {
      console.log('❌ Search error:', searchError.message);
    } else {
      console.log(`✅ Found ${accessControls?.length || 0} access control results`);
      accessControls?.forEach((control, index) => {
        console.log(`   ${index + 1}. [${control.framework}] ${control.title}`);
      });
    }

    // Test projects
    console.log('\n📂 Testing projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('name, status, frameworks')
      .limit(3);

    if (projectsError) {
      console.log('❌ Projects error:', projectsError.message);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects`);
      projects?.forEach(project => {
        console.log(`   - ${project.name} (${project.status}) [${project.frameworks?.join(', ') || 'No frameworks'}]`);
      });
    }

    console.log('\n🎉 Live Supabase access test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLiveSupabaseAccess().catch(console.error);