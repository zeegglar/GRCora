#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzAyNTgsImV4cCI6MjA3MzQ0NjI1OH0.4eR8GhWzbb8Ar2r2bB4XTLF6Ms52I0F20_OdQRuGtRc';

console.log('🔗 TESTING CLOUD SUPABASE CONNECTION\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCloudConnection() {
  try {
    console.log(`🌐 Connecting to: ${supabaseUrl}`);
    console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);

    // Test basic connection
    console.log('\n📊 Testing basic table access...');

    const { data, error, count } = await supabase
      .from('nist_controls')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Connection failed:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      return false;
    }

    console.log('✅ Connection successful!');
    console.log(`📈 Total records: ${count || 0}`);

    // Test data retrieval
    console.log('\n📋 Testing data retrieval...');
    const { data: sampleData, error: dataError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(5);

    if (dataError) {
      console.log('❌ Data retrieval failed:', dataError.message);
      return false;
    }

    console.log(`✅ Retrieved ${sampleData?.length || 0} sample records:`);
    sampleData?.forEach((record, i) => {
      console.log(`   ${i + 1}. [${record.framework}] ${record.id}: ${record.title}`);
    });

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const { data: searchResults, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .ilike('title', '%access%')
      .limit(3);

    if (searchError) {
      console.log('❌ Search failed:', searchError.message);
      return false;
    }

    console.log(`✅ Search found ${searchResults?.length || 0} results:`);
    searchResults?.forEach((result, i) => {
      console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title}`);
    });

    console.log('\n🎉 CLOUD SUPABASE STATUS: ✅ FULLY OPERATIONAL');
    console.log('   📊 Database connection: WORKING');
    console.log('   🔍 Data retrieval: WORKING');
    console.log('   🔎 Search functionality: WORKING');
    console.log('   🚀 RAG system ready for use!');

    return true;

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return false;
  }
}

testCloudConnection().catch(console.error);