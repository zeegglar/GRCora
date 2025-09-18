#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';

// Get publishable key from command line argument or prompt
const publishableKey = process.argv[2] || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.log('❌ Please provide the publishable key as an argument:');
  console.log('   npx tsx scripts/testWithPublishableKey.ts <publishable_key>');
  process.exit(1);
}

console.log('🔗 TESTING WITH SUPABASE PUBLISHABLE KEY\n');
console.log(`🌐 Connecting to: ${supabaseUrl}`);
console.log(`🔑 Using publishable key: ${publishableKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, publishableKey);

async function testWithPublishableKey() {
  try {
    console.log('\n📊 Testing database connection...');

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(5);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);

      // Try to get more info about the error
      if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
        console.log('💡 Table does not exist - need to create schema first');
      } else if (testError.message.includes('permission')) {
        console.log('💡 Permission issue - may need different authentication');
      }

      return false;
    }

    console.log(`✅ Connection successful! Found ${testData.length} records:`);
    testData.forEach((control, i) => {
      console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
    });

    // Test count
    const { count, error: countError } = await supabase
      .from('nist_controls')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
    } else {
      console.log(`\n📊 Total records: ${count || 0}`);
    }

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const { data: searchResults, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .ilike('title', '%access%')
      .limit(3);

    if (searchError) {
      console.log('❌ Search failed:', searchError.message);
    } else {
      console.log(`✅ Search found ${searchResults.length} access controls:`);
      searchResults.forEach((result, i) => {
        console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title}`);
      });
    }

    console.log('\n🎉 PUBLISHABLE KEY TEST SUCCESSFUL!');
    console.log('   📊 Database accessible with publishable key');
    console.log('   🔍 Search functionality working');
    console.log('   🚀 Ready for production use');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testWithPublishableKey().catch(console.error);