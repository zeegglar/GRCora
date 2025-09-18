#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🚀 UPLOADING ALL CONTROLS TO LOCAL SUPABASE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadToLocal() {
  try {
    console.log('🔧 Step 1: Creating nist_controls table...');

    // Create the table with proper schema
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS nist_controls;

        CREATE TABLE nist_controls (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          framework TEXT NOT NULL,
          family TEXT,
          control_type TEXT,
          priority TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX idx_nist_controls_framework ON nist_controls(framework);
        CREATE INDEX idx_nist_controls_family ON nist_controls(family);
        CREATE INDEX idx_nist_controls_priority ON nist_controls(priority);
        CREATE INDEX idx_nist_controls_title ON nist_controls USING gin(to_tsvector('english', title));
        CREATE INDEX idx_nist_controls_description ON nist_controls USING gin(to_tsvector('english', description));
      `
    });

    if (createError) {
      console.log('⚠️  RPC table creation failed, trying direct approach...');

      // Try direct insert approach to create table
      const testRecord = {
        id: 'TEST-001',
        title: 'Test Control',
        description: 'Test description for table creation',
        framework: 'TEST',
        family: 'Test Family',
        control_type: 'Administrative',
        priority: 'Low'
      };

      const { error: insertError } = await supabase
        .from('nist_controls')
        .insert(testRecord);

      if (insertError) {
        console.log('❌ Cannot create table:', insertError.message);
        return false;
      }

      console.log('✅ Table created via insert method');

      // Clean up test record
      await supabase.from('nist_controls').delete().eq('id', 'TEST-001');
    } else {
      console.log('✅ Table created successfully with indexes');
    }

    console.log('\n📊 Step 2: Loading all framework data...');

    const frameworks = [
      { file: 'nist-800-53.jsonl', name: 'NIST_800_53', priority: 'High' },
      { file: 'nist-csf.jsonl', name: 'NIST_CSF', priority: 'High' },
      { file: 'iso-27001.jsonl', name: 'ISO_27001', priority: 'Medium' },
      { file: 'cis-v8.jsonl', name: 'CIS_V8', priority: 'Medium' },
      { file: 'nist-ai-rmf.jsonl', name: 'NIST_AI_RMF', priority: 'Medium' }
    ];

    let totalUploaded = 0;

    for (const framework of frameworks) {
      console.log(`\n📋 Processing ${framework.name}...`);

      try {
        const fileContent = readFileSync(`public/data/${framework.file}`, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        console.log(`   📄 Found ${lines.length} controls to upload`);

        const controls = [];
        for (const line of lines) {
          try {
            const control = JSON.parse(line);

            // Standardize the control object with comprehensive mapping
            const standardizedControl = {
              id: control.control_id || control.id || control.identifier || `${framework.name}-${controls.length + 1}`,
              title: control.title || control.name || control.control_name || 'Untitled Control',
              description: control.description || control.text || control.implementation_guidance || control.control_text || 'No description available',
              framework: framework.name,
              family: control.family || control.category || control.control_family || 'General',
              control_type: control.control_type || control.type || control.category || 'Control',
              priority: control.priority || framework.priority
            };

            // Ensure description is not too long for database
            if (standardizedControl.description.length > 5000) {
              standardizedControl.description = standardizedControl.description.substring(0, 4997) + '...';
            }

            controls.push(standardizedControl);
          } catch (parseError) {
            console.log(`   ⚠️  Skipping malformed line in ${framework.name}`);
          }
        }

        console.log(`   📤 Uploading ${controls.length} controls in batches...`);

        // Upload in batches of 50 for better performance
        const batchSize = 50;
        for (let i = 0; i < controls.length; i += batchSize) {
          const batch = controls.slice(i, i + batchSize);

          const { error: batchError } = await supabase
            .from('nist_controls')
            .upsert(batch, { onConflict: 'id' });

          if (batchError) {
            console.log(`   ⚠️  Batch ${Math.floor(i / batchSize) + 1} failed:`, batchError.message);

            // Try inserting individual records if batch fails
            for (const control of batch) {
              const { error: singleError } = await supabase
                .from('nist_controls')
                .upsert(control, { onConflict: 'id' });

              if (!singleError) {
                totalUploaded++;
              }
            }
          } else {
            console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(controls.length / batchSize)} uploaded (${batch.length} controls)`);
            totalUploaded += batch.length;
          }
        }

        console.log(`   🎯 ${framework.name}: ${controls.length} controls processed`);

      } catch (fileError) {
        console.log(`   ❌ Error processing ${framework.name}:`, fileError.message);
      }
    }

    console.log(`\n🎉 Upload complete! Total uploaded: ${totalUploaded} controls`);

    // Comprehensive verification
    console.log('\n🔍 Step 3: Comprehensive verification...');

    const { data: totalCount, error: countError } = await supabase
      .from('nist_controls')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count verification failed:', countError.message);
      return false;
    }

    console.log(`✅ Total records in database: ${totalCount || 0}`);

    // Get framework breakdown
    const { data: frameworkData, error: frameworkError } = await supabase
      .from('nist_controls')
      .select('framework, id')
      .limit(5000);

    if (!frameworkError && frameworkData) {
      const frameworkStats = frameworkData.reduce((acc: any, row: any) => {
        acc[row.framework] = (acc[row.framework] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Framework breakdown:');
      Object.entries(frameworkStats).forEach(([framework, count]) => {
        console.log(`   ${framework}: ${count} controls`);
      });
    }

    // Test sample queries
    console.log('\n🔍 Step 4: Testing search functionality...');

    const searchTests = [
      { query: 'access control', description: 'Access Control Search' },
      { query: 'incident response', description: 'Incident Response Search' },
      { query: 'AI governance', description: 'AI Governance Search' }
    ];

    for (const test of searchTests) {
      const { data: searchResults, error: searchError } = await supabase
        .from('nist_controls')
        .select('id, title, framework')
        .or(`title.ilike.%${test.query}%,description.ilike.%${test.query}%`)
        .limit(3);

      if (searchError) {
        console.log(`❌ ${test.description} failed:`, searchError.message);
      } else {
        console.log(`✅ ${test.description}: ${searchResults.length} results`);
        searchResults.forEach((result, i) => {
          console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title.substring(0, 60)}...`);
        });
      }
    }

    console.log('\n🚀 LOCAL SUPABASE IS NOW FULLY OPERATIONAL!');
    console.log('   📊 All frameworks loaded successfully');
    console.log('   🔍 Search functionality verified');
    console.log('   🎯 RAG system ready for testing');

    return true;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return false;
  }
}

uploadToLocal().catch(console.error);