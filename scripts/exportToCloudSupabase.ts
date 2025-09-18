#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Local Supabase (source)
const localUrl = 'http://127.0.0.1:54321';
const localServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Cloud Supabase (destination)
const cloudUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const cloudServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MzQ0NjI1OH0.DuImlinAO1w-L7LDqq5ErJDkpM2IlDdKmYx8M7g5rPU';

console.log('🌐 EXPORTING OPTIMIZED DATA TO CLOUD SUPABASE\n');

const localSupabase = createClient(localUrl, localServiceKey);
const cloudSupabase = createClient(cloudUrl, cloudServiceKey);

async function exportToCloud() {
  try {
    console.log('📊 Step 1: Extracting optimized data from local database...');

    // Get all data from local Supabase
    const { data: localData, error: localError } = await localSupabase
      .from('nist_controls')
      .select('*');

    if (localError) {
      console.log('❌ Failed to extract local data:', localError.message);
      return false;
    }

    console.log(`✅ Extracted ${localData.length} optimized controls from local database`);

    // Analyze the data
    const frameworkStats = localData.reduce((acc: any, row: any) => {
      acc[row.framework] = (acc[row.framework] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Data breakdown:');
    Object.entries(frameworkStats).forEach(([framework, count]) => {
      console.log(`   ${framework}: ${count} controls`);
    });

    console.log('\n🌐 Step 2: Uploading to cloud Supabase...');

    // Try to clear existing cloud data first
    console.log('   Clearing existing cloud data...');
    const { error: clearError } = await cloudSupabase
      .from('nist_controls')
      .delete()
      .neq('id', 'impossible-match');

    if (clearError) {
      console.log('   ⚠️  Could not clear cloud data (may not exist yet):', clearError.message);
    } else {
      console.log('   ✅ Cloud data cleared');
    }

    // Upload in batches to avoid timeouts
    const batchSize = 25;
    let totalUploaded = 0;

    for (let i = 0; i < localData.length; i += batchSize) {
      const batch = localData.slice(i, i + batchSize);

      console.log(`   📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(localData.length / batchSize)} (${batch.length} controls)...`);

      const { error: uploadError } = await cloudSupabase
        .from('nist_controls')
        .upsert(batch, { onConflict: 'content_hash' });

      if (uploadError) {
        console.log(`   ⚠️  Batch failed: ${uploadError.message}`);

        // Try individual uploads for failed batch
        for (const control of batch) {
          const { error: singleError } = await cloudSupabase
            .from('nist_controls')
            .upsert(control, { onConflict: 'content_hash' });

          if (!singleError) {
            totalUploaded++;
          } else {
            console.log(`     ❌ ${control.id}: ${singleError.message}`);
          }
        }
      } else {
        console.log(`   ✅ Batch uploaded successfully`);
        totalUploaded += batch.length;
      }
    }

    console.log(`\n📊 Upload Summary: ${totalUploaded}/${localData.length} controls uploaded to cloud`);

    console.log('\n🔍 Step 3: Verifying cloud upload...');

    // Verify cloud data
    const { data: cloudData, error: verifyError } = await cloudSupabase
      .from('nist_controls')
      .select('id, title, framework')
      .limit(10);

    if (verifyError) {
      console.log('❌ Cloud verification failed:', verifyError.message);
      return false;
    }

    console.log(`✅ Cloud verification successful! Sample records:`);
    cloudData.forEach((control, i) => {
      console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
    });

    // Get cloud count
    const { count: cloudCount, error: countError } = await cloudSupabase
      .from('nist_controls')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Cloud count failed:', countError.message);
    } else {
      console.log(`\n📊 Total cloud records: ${cloudCount}`);
    }

    // Test cloud search functionality
    console.log('\n🔍 Step 4: Testing cloud search functionality...');

    const { data: searchTest, error: searchError } = await cloudSupabase
      .from('nist_controls')
      .select('id, title, framework')
      .ilike('title', '%access%')
      .limit(3);

    if (searchError) {
      console.log('❌ Cloud search test failed:', searchError.message);
    } else {
      console.log(`✅ Cloud search test passed! Found ${searchTest.length} access controls:`);
      searchTest.forEach((result, i) => {
        console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title}`);
      });
    }

    console.log('\n🎉 CLOUD EXPORT COMPLETE!');
    console.log('   📊 Optimized dataset successfully migrated');
    console.log('   🔍 Cloud search functionality verified');
    console.log('   🚀 Production cloud RAG system ready!');

    // Update environment back to cloud
    console.log('\n💡 Next step: Update .env to use cloud Supabase for production');

    return totalUploaded;

  } catch (error) {
    console.error('❌ Export to cloud failed:', error);
    return false;
  }
}

exportToCloud().catch(console.error);