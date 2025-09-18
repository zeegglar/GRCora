#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('🔍 VERIFYING LOCAL DATABASE DATA\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyData() {
  try {
    console.log('📊 Direct data query...');

    // Try different approaches to get data
    const { data: directData, error: directError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(10);

    if (directError) {
      console.log('❌ Direct query failed:', directError.message);
    } else {
      console.log(`✅ Direct query found ${directData.length} records:`);
      directData.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
      });
    }

    // Try count with different method
    const { count, error: countError } = await supabase
      .from('nist_controls')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
    } else {
      console.log(`✅ Count query result: ${count} total records`);
    }

    // Try framework breakdown
    const { data: allData, error: allError } = await supabase
      .from('nist_controls')
      .select('framework');

    if (allError) {
      console.log('❌ Framework query failed:', allError.message);
    } else {
      const frameworkStats = allData.reduce((acc: any, row: any) => {
        acc[row.framework] = (acc[row.framework] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Framework breakdown:');
      Object.entries(frameworkStats).forEach(([framework, count]) => {
        console.log(`   ${framework}: ${count} controls`);
      });
    }

    // Test specific searches
    console.log('\n🔍 Testing specific searches...');

    const searchTerms = ['access', 'control', 'security', 'governance', 'risk'];

    for (const term of searchTerms) {
      const { data: searchData, error: searchError } = await supabase
        .from('nist_controls')
        .select('id, title, framework')
        .ilike('title', `%${term}%`)
        .limit(3);

      if (searchError) {
        console.log(`❌ Search for "${term}" failed:`, searchError.message);
      } else {
        console.log(`✅ Search for "${term}": ${searchData.length} results`);
        searchData.forEach((result, i) => {
          console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title.substring(0, 50)}...`);
        });
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

verifyData().catch(console.error);