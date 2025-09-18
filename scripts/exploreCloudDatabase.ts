#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzAyNTgsImV4cCI6MjA3MzQ0NjI1OH0.4eR8GhWzbb8Ar2r2bB4XTLF6Ms52I0F20_OdQRuGtRc';

console.log('🔍 EXPLORING CLOUD SUPABASE DATABASE STRUCTURE\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exploreCloudDatabase() {
  try {
    console.log('🌐 Connected to cloud Supabase instance');
    console.log(`📍 URL: ${supabaseUrl}\n`);

    console.log('📋 Attempting to discover existing tables...\n');

    // Try common table names that might exist
    const commonTables = [
      'nist_controls',
      'controls',
      'security_controls',
      'frameworks',
      'organizations',
      'projects',
      'users',
      'profiles',
      'test',
      'todos',
      'items'
    ];

    const existingTables = [];

    for (const tableName of commonTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          existingTables.push({ name: tableName, count: count || 0 });
          console.log(`✅ Found table: ${tableName} (${count || 0} records)`);
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }

    if (existingTables.length === 0) {
      console.log('❌ No accessible tables found in the public schema.');
      console.log('\n💡 Possible solutions:');
      console.log('   1. Create the nist_controls table manually in Supabase dashboard');
      console.log('   2. Check if RLS (Row Level Security) is blocking access');
      console.log('   3. Verify API key permissions');
      console.log('   4. Use the local Supabase instance instead');

      return false;
    }

    console.log(`\n📊 Summary: Found ${existingTables.length} accessible tables`);

    // If we found any tables, let's try to create a simple test to see if we can write
    if (existingTables.length > 0) {
      console.log('\n🧪 Testing write permissions...');

      // Try to create a simple test table with a basic structure
      const testData = {
        id: Date.now().toString(),
        name: 'Test Entry',
        created_at: new Date().toISOString()
      };

      // Try the first available table for a test insert
      const testTable = existingTables[0].name;
      console.log(`   Testing insert on: ${testTable}`);

      const { error: testError } = await supabase
        .from(testTable)
        .insert(testData);

      if (testError) {
        console.log(`   ❌ Cannot insert into ${testTable}: ${testError.message}`);
        console.log('   This suggests read-only access or RLS restrictions');
      } else {
        console.log(`   ✅ Successfully inserted test data into ${testTable}`);

        // Clean up test data
        await supabase.from(testTable).delete().eq('id', testData.id);
        console.log('   ✅ Test data cleaned up');
      }
    }

    // Check if we can determine the database schema
    console.log('\n🔍 Attempting to check database capabilities...');

    try {
      // Test RPC function access
      const { data: rpcTest, error: rpcError } = await supabase.rpc('version');

      if (!rpcError) {
        console.log('✅ RPC functions accessible');
      } else {
        console.log('❌ RPC functions not accessible:', rpcError.message);
      }
    } catch (e) {
      console.log('❌ RPC test failed');
    }

    console.log('\n📝 RECOMMENDATIONS:');

    if (existingTables.length > 0) {
      console.log('✅ Database is accessible but may need table setup');
      console.log('💡 Next steps:');
      console.log('   1. Create nist_controls table via Supabase dashboard');
      console.log('   2. Set up proper column structure');
      console.log('   3. Configure RLS policies if needed');
      console.log('   4. Re-run data upload script');
    } else {
      console.log('❌ Database access limited');
      console.log('💡 Alternative approaches:');
      console.log('   1. Use local Supabase instance (recommended for development)');
      console.log('   2. Work with mock data (current RAG demo approach)');
      console.log('   3. Request admin access to cloud instance');
    }

    return existingTables.length > 0;

  } catch (error) {
    console.error('❌ Database exploration failed:', error);
    return false;
  }
}

exploreCloudDatabase().catch(console.error);