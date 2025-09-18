#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔍 CHECKING WITH SERVICE ROLE KEY\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWithServiceRole() {
  try {
    console.log('📊 Service role data query...');

    // Check with service role
    const { data: serviceData, error: serviceError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(10);

    if (serviceError) {
      console.log('❌ Service role query failed:', serviceError.message);
    } else {
      console.log(`✅ Service role query found ${serviceData.length} records:`);
      serviceData.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
      });
    }

    // Get total count with service role
    const { count, error: countError } = await supabase
      .from('nist_controls')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Service role count failed:', countError.message);
    } else {
      console.log(`✅ Service role count: ${count} total records`);
    }

    if (count && count > 0) {
      console.log('\n📊 SUCCESS! Data exists but may be blocked by RLS policies');
      console.log('💡 Solution: Update RLS policies or use service role in RAG system');

      // Test a real search with service role
      const { data: searchData, error: searchError } = await supabase
        .from('nist_controls')
        .select('id, title, framework, description')
        .ilike('title', '%access%')
        .limit(5);

      if (searchError) {
        console.log('❌ Search test failed:', searchError.message);
      } else {
        console.log(`\n🔍 Search test with service role: ${searchData.length} access controls found:`);
        searchData.forEach((control, i) => {
          console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
          console.log(`      ${control.description?.substring(0, 100)}...`);
        });
      }

      return true;
    } else {
      console.log('\n❌ No data found even with service role - database may be empty');
      return false;
    }

  } catch (error) {
    console.error('❌ Service role check failed:', error);
    return false;
  }
}

checkWithServiceRole().catch(console.error);