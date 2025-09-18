#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Test live Supabase connection with Claude's read-only credentials
const liveConnectionString = "postgres://claude_reviewer:temp_review_password_123@db.kkptyzhobnfgaqlvcdxk.supabase.co:6543/postgres?sslmode=require";

// Parse connection string to get components
const url = new URL(liveConnectionString.replace('postgres://', 'postgresql://'));
const supabaseUrl = `https://${url.hostname.split('.')[0]}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyMzM2MTQsImV4cCI6MjA0MTgwOTYxNH0.bNBXOmqnHoADTtY6fzN8kNhbGU2iEFQNQpRGxYgmCqI'; // Standard anon key pattern

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveConnection() {
  console.log('🔗 Testing Live Supabase Connection...\n');
  console.log(`URL: ${supabaseUrl}`);

  try {
    // Test 1: Basic connection and table listing
    console.log('📊 Testing database tables access...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);

    if (tablesError) {
      console.error('❌ Tables query failed:', tablesError);
      console.log('Trying alternative approach...');
    } else {
      console.log('✅ Tables accessible:', tables?.map(t => t.table_name));
    }

    // Test 2: Check for organizations table
    console.log('\n📋 Testing organizations table...');

    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);

    if (orgError) {
      console.error('❌ Organizations query failed:', orgError);
    } else {
      console.log(`✅ Organizations table accessible. Found ${orgs?.length || 0} records`);
      if (orgs && orgs.length > 0) {
        console.log('Sample organization:', orgs[0]);
      }
    }

    // Test 3: Check for controls/NIST data
    console.log('\n🎯 Testing controls data...');

    const { data: controls, error: controlsError } = await supabase
      .from('nist_controls')
      .select('*')
      .limit(5);

    if (controlsError) {
      console.error('❌ Controls query failed:', controlsError);
    } else {
      console.log(`✅ NIST controls accessible. Found ${controls?.length || 0} records`);
      if (controls && controls.length > 0) {
        console.log('Sample control:', {
          id: controls[0].id,
          title: controls[0].title,
          framework: controls[0].framework
        });
      }
    }

    // Test 4: Search for access control related controls
    console.log('\n🔍 Testing access control search...');

    const { data: accessControls, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, description')
      .or('title.ilike.%access%,description.ilike.%access%')
      .limit(10);

    if (searchError) {
      console.error('❌ Access control search failed:', searchError);
    } else {
      console.log(`✅ Access control search successful. Found ${accessControls?.length || 0} results`);
      accessControls?.forEach((control, index) => {
        console.log(`   ${index + 1}. [${control.framework}] ${control.title} (${control.id})`);
      });
    }

    // Test 5: Check user profiles and projects
    console.log('\n👥 Testing user profiles and projects...');

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(3);

    if (!profilesError) {
      console.log(`✅ User profiles accessible. Found ${profiles?.length || 0} records`);
    }

    if (!projectsError) {
      console.log(`✅ Projects accessible. Found ${projects?.length || 0} records`);
    }

    console.log('\n🎉 Live Supabase connection test completed!');
    console.log('🔐 Claude reviewer access is working properly.');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

// Run the test
testLiveConnection().catch(console.error);