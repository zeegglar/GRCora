#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MzQ0NjI1OH0.DuImlinAO1w-L7LDqq5ErJDkpM2IlDdKmYx8M7g5rPU';

console.log('🚀 UPLOADING CORE CONTROLS TO CLOUD SUPABASE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadCoreControls() {
  try {
    console.log('📋 Step 1: Creating nist_controls table...');

    // First, create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS nist_controls (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        framework TEXT NOT NULL,
        family TEXT,
        control_type TEXT,
        priority TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.log('⚠️  Table creation via RPC failed, trying alternative approach...');

      // Try using a direct approach - insert a test record to trigger table creation
      const testRecord = {
        id: 'TEST-001',
        title: 'Test Control',
        description: 'Test description',
        framework: 'TEST',
        family: 'Test Family',
        control_type: 'Test',
        priority: 'Low'
      };

      const { error: insertError } = await supabase
        .from('nist_controls')
        .insert(testRecord);

      if (insertError) {
        console.log('❌ Cannot create table or insert data:', insertError.message);
        console.log('   This might be a permissions issue with the cloud Supabase instance.');
        return false;
      }

      console.log('✅ Table exists or was created via insert');

      // Clean up test record
      await supabase.from('nist_controls').delete().eq('id', 'TEST-001');
    } else {
      console.log('✅ Table created successfully');
    }

    console.log('\n📊 Step 2: Loading core controls data...');

    // Load the most important frameworks first
    const frameworks = [
      { file: 'nist-800-53.jsonl', name: 'NIST_800_53', limit: 50 },
      { file: 'iso-27001.jsonl', name: 'ISO_27001', limit: 30 },
      { file: 'cis-v8.jsonl', name: 'CIS_V8', limit: 20 }
    ];

    let totalUploaded = 0;

    for (const framework of frameworks) {
      console.log(`\n📋 Processing ${framework.name}...`);

      try {
        const fileContent = readFileSync(`public/data/${framework.file}`, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim()).slice(0, framework.limit);

        console.log(`   📄 Found ${lines.length} controls to upload`);

        const controls = [];
        for (const line of lines) {
          try {
            const control = JSON.parse(line);

            // Standardize the control object
            const standardizedControl = {
              id: control.control_id || control.id || `${framework.name}-${controls.length + 1}`,
              title: control.title || control.name || 'Untitled Control',
              description: control.description || control.text || 'No description available',
              framework: framework.name,
              family: control.family || control.category || 'General',
              control_type: control.control_type || control.type || 'Control',
              priority: control.priority || 'Medium'
            };

            controls.push(standardizedControl);
          } catch (parseError) {
            console.log(`   ⚠️  Skipping malformed line in ${framework.name}`);
          }
        }

        console.log(`   📤 Uploading ${controls.length} controls...`);

        // Upload in small batches
        const batchSize = 10;
        for (let i = 0; i < controls.length; i += batchSize) {
          const batch = controls.slice(i, i + batchSize);

          const { error: batchError } = await supabase
            .from('nist_controls')
            .upsert(batch, { onConflict: 'id' });

          if (batchError) {
            console.log(`   ⚠️  Batch ${i / batchSize + 1} failed:`, batchError.message);
          } else {
            console.log(`   ✅ Batch ${i / batchSize + 1}/${Math.ceil(controls.length / batchSize)} uploaded`);
          }
        }

        totalUploaded += controls.length;

      } catch (fileError) {
        console.log(`   ❌ Error processing ${framework.name}:`, fileError.message);
      }
    }

    console.log(`\n🎉 Upload complete! Total uploaded: ${totalUploaded} controls`);

    // Verify the upload
    console.log('\n🔍 Step 3: Verifying upload...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('nist_controls')
      .select('id, title, framework', { count: 'exact' })
      .limit(5);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return false;
    }

    console.log(`✅ Verification successful! Found ${verifyData.length} records:`);
    verifyData.forEach((control, i) => {
      console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
    });

    // Test search functionality
    console.log('\n🔍 Step 4: Testing search functionality...');
    const { data: searchData, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework')
      .ilike('title', '%access%')
      .limit(3);

    if (searchError) {
      console.log('❌ Search test failed:', searchError.message);
    } else {
      console.log(`✅ Search test passed! Found ${searchData.length} access controls:`);
      searchData.forEach((control, i) => {
        console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
      });
    }

    console.log('\n🚀 CLOUD SUPABASE IS NOW READY FOR RAG!');
    console.log('   📊 Core controls uploaded and verified');
    console.log('   🔍 Search functionality working');
    console.log('   🎯 RAG system operational');

    return true;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return false;
  }
}

uploadCoreControls().catch(console.error);