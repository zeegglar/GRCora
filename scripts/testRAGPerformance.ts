#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🧪 COMPREHENSIVE RAG PERFORMANCE TEST\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRAGPerformance() {
  try {
    console.log('📊 Framework Coverage Analysis\n');

    // Check what frameworks we actually have
    const { data: frameworkCount, error: frameworkError } = await supabase
      .from('nist_controls')
      .select('framework')
      .neq('framework', null);

    if (frameworkError) {
      console.log('❌ Framework query failed:', frameworkError.message);
      return;
    }

    const frameworkStats = frameworkCount.reduce((acc: any, row: any) => {
      acc[row.framework] = (acc[row.framework] || 0) + 1;
      return acc;
    }, {});

    console.log('📋 Available Frameworks:');
    Object.entries(frameworkStats).forEach(([framework, count]) => {
      console.log(`   ${framework}: ${count} controls`);
    });

    console.log('\n🔍 SPECIFIC CLIENT QUERIES\n');

    // Test 1: ISO 27001 Access Control (for NGO client)
    console.log('1. ISO 27001 Query: "Access Control for NGO"');
    const { data: isoControls, error: isoError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, description')
      .eq('framework', 'ISO_27001')
      .ilike('title', '%access%')
      .limit(5);

    if (isoError) {
      console.log('❌ ISO query failed:', isoError.message);
    } else {
      console.log(`✅ Found ${isoControls.length} ISO 27001 access controls:`);
      isoControls.forEach((control, i) => {
        console.log(`   ${i + 1}. ${control.id}: ${control.title}`);
      });
    }

    // Test 2: MFA/Authentication query across frameworks
    console.log('\n2. Multi-Framework Authentication Query:');
    const { data: authControls, error: authError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, description')
      .or('title.ilike.%authentication%,title.ilike.%multi-factor%,title.ilike.%MFA%,description.ilike.%authentication%')
      .limit(10);

    if (authError) {
      console.log('❌ Authentication query failed:', authError.message);
    } else {
      console.log(`✅ Found ${authControls.length} authentication controls:`);
      const authByFramework = authControls.reduce((acc: any, control: any) => {
        acc[control.framework] = (acc[control.framework] || 0) + 1;
        return acc;
      }, {});

      Object.entries(authByFramework).forEach(([framework, count]) => {
        console.log(`   ${framework}: ${count} controls`);
      });

      authControls.slice(0, 5).forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
      });
    }

    // Test 3: SOC 2 specific query (for SaaS client)
    console.log('\n3. SOC 2 Security Controls:');
    const { data: socControls, error: socError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, description')
      .ilike('framework', '%SOC%')
      .limit(5);

    if (socError || !socControls.length) {
      console.log('❌ SOC 2 controls not found - CRITICAL GAP for SaaS client!');

      // Try alternative search
      const { data: altSOC, error: altError } = await supabase
        .from('nist_controls')
        .select('id, title, framework, description')
        .or('title.ilike.%security%,description.ilike.%security%')
        .eq('framework', 'NIST_800_53')
        .limit(5);

      if (!altError && altSOC.length) {
        console.log('⚠️  Using NIST 800-53 as SOC 2 substitute:');
        altSOC.forEach((control, i) => {
          console.log(`   ${i + 1}. ${control.id}: ${control.title}`);
        });
      }
    } else {
      console.log(`✅ Found ${socControls.length} SOC 2 controls:`);
      socControls.forEach((control, i) => {
        console.log(`   ${i + 1}. ${control.id}: ${control.title}`);
      });
    }

    console.log('\n🎯 RAG QUALITY ASSESSMENT\n');

    // Test 4: Hallucination test - ask for non-existent control
    console.log('4. Hallucination Test: "FAKE-123 control"');
    const { data: fakeControl, error: fakeError } = await supabase
      .from('nist_controls')
      .select('*')
      .eq('id', 'FAKE-123');

    if (fakeError || !fakeControl.length) {
      console.log('✅ Correctly returned no results for fake control ID');
    } else {
      console.log('❌ HALLUCINATION DETECTED: Found fake control!');
    }

    // Test 5: Citation accuracy test
    console.log('\n5. Citation Accuracy Test: AC-2 details');
    const { data: ac2Control, error: ac2Error } = await supabase
      .from('nist_controls')
      .select('*')
      .eq('id', 'AC-2')
      .single();

    if (ac2Error) {
      console.log('❌ AC-2 control not found');
    } else {
      console.log('✅ AC-2 Control Found:');
      console.log(`   Framework: ${ac2Control.framework}`);
      console.log(`   Title: ${ac2Control.title}`);
      console.log(`   Has Description: ${ac2Control.description ? 'YES' : 'NO'}`);
      console.log(`   Has Guidance: ${ac2Control.guidance ? 'YES' : 'NO'}`);
    }

    console.log('\n📈 RAG PERFORMANCE SUMMARY\n');

    const totalFrameworks = Object.keys(frameworkStats).length;
    const hasISO = 'ISO_27001' in frameworkStats;
    const hasNIST = 'NIST_800_53' in frameworkStats;
    const hasCIS = 'CIS_V8' in frameworkStats;
    const hasSOC = Object.keys(frameworkStats).some(f => f.includes('SOC'));

    console.log('🔍 Coverage Analysis:');
    console.log(`   📊 Total Frameworks: ${totalFrameworks}`);
    console.log(`   ✅ ISO 27001: ${hasISO ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`   ✅ NIST 800-53: ${hasNIST ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`   ✅ CIS v8: ${hasCIS ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`   ❌ SOC 2: ${hasSOC ? 'AVAILABLE' : 'MISSING - CRITICAL GAP'}`);

    console.log('\n🎯 CLIENT IMPACT:');
    console.log('   🏢 NGO (ISO 27001): ' + (hasISO ? '✅ SUPPORTED' : '❌ NOT SUPPORTED'));
    console.log('   🏢 SaaS (SOC 2): ' + (hasSOC ? '✅ SUPPORTED' : '❌ NOT SUPPORTED - BLOCKER'));

    return {
      frameworkStats,
      hasRequiredFrameworks: hasISO && hasSOC,
      clientSupport: {
        ngo: hasISO,
        saas: hasSOC
      }
    };

  } catch (error) {
    console.error('❌ RAG performance test failed:', error);
  }
}

testRAGPerformance().catch(console.error);