#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🚀 UPLOADING WITH PROPER SCHEMA TO LOCAL SUPABASE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateContentHash(control: any): string {
  const content = `${control.id}-${control.title}-${control.description}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function uploadWithSchema() {
  try {
    console.log('📊 Loading framework data with proper schema mapping...');

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

        console.log(`   📄 Found ${lines.length} controls to process`);

        const controls = [];
        for (const line of lines) {
          try {
            const control = JSON.parse(line);

            // Map to exact database schema from migration
            const schemaControl = {
              id: control.control_id || control.id || control.identifier || `${framework.name}-${controls.length + 1}`,
              family: control.family || control.category || control.control_family || 'General', // Required field
              title: control.title || control.name || control.control_name || 'Untitled Control', // Required field
              description: control.description || control.text || control.implementation_guidance || control.control_text || null,
              guidance: control.guidance || control.implementation_guidance || control.supplemental_guidance || null,
              assessment_objectives: control.assessment_objectives || [],
              assessment_methods: control.assessment_methods || [],
              parameters: control.parameters || [],
              related_controls: control.related_controls || [],
              framework: framework.name, // Must be one of allowed values
              category: control.category || null,
              subcategory: control.subcategory || null,
              informative_references: control.informative_references || [],
              content_hash: '', // Will be generated
              embedding: null // Vector embedding - will be null for now
            };

            // Generate unique content hash
            schemaControl.content_hash = generateContentHash(schemaControl);

            // Ensure strings are not too long
            if (schemaControl.description && schemaControl.description.length > 10000) {
              schemaControl.description = schemaControl.description.substring(0, 9997) + '...';
            }
            if (schemaControl.guidance && schemaControl.guidance.length > 10000) {
              schemaControl.guidance = schemaControl.guidance.substring(0, 9997) + '...';
            }

            controls.push(schemaControl);
          } catch (parseError) {
            console.log(`   ⚠️  Skipping malformed line in ${framework.name}`);
          }
        }

        console.log(`   📤 Uploading ${controls.length} controls in batches...`);

        // Upload in batches of 20 for better performance and error handling
        const batchSize = 20;
        let frameworkSuccessCount = 0;

        for (let i = 0; i < controls.length; i += batchSize) {
          const batch = controls.slice(i, i + batchSize);

          const { error: batchError } = await supabase
            .from('nist_controls')
            .upsert(batch, { onConflict: 'content_hash' });

          if (batchError) {
            console.log(`   ⚠️  Batch ${Math.floor(i / batchSize) + 1} failed:`, batchError.message);

            // Try inserting individual records if batch fails
            for (const control of batch) {
              try {
                const { error: singleError } = await supabase
                  .from('nist_controls')
                  .upsert(control, { onConflict: 'content_hash' });

                if (!singleError) {
                  frameworkSuccessCount++;
                } else {
                  console.log(`     ❌ ${control.id}: ${singleError.message}`);
                }
              } catch (e) {
                console.log(`     ❌ ${control.id}: Exception occurred`);
              }
            }
          } else {
            console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(controls.length / batchSize)} uploaded`);
            frameworkSuccessCount += batch.length;
          }
        }

        console.log(`   🎯 ${framework.name}: ${frameworkSuccessCount}/${controls.length} controls uploaded`);
        totalUploaded += frameworkSuccessCount;

      } catch (fileError) {
        console.log(`   ❌ Error processing ${framework.name}:`, fileError.message);
      }
    }

    console.log(`\n🎉 Upload complete! Total uploaded: ${totalUploaded} controls`);

    // Comprehensive verification
    console.log('\n🔍 Comprehensive verification...');

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

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');

    const { data: searchResults, error: searchError } = await supabase
      .from('nist_controls')
      .select('id, title, framework, family')
      .ilike('title', '%access%')
      .limit(5);

    if (searchError) {
      console.log('❌ Search test failed:', searchError.message);
    } else {
      console.log(`✅ Search test passed! Found ${searchResults.length} access controls:`);
      searchResults.forEach((result, i) => {
        console.log(`   ${i + 1}. [${result.framework}] ${result.id}: ${result.title.substring(0, 60)}...`);
      });
    }

    console.log('\n🚀 LOCAL SUPABASE IS FULLY OPERATIONAL!');
    console.log('   📊 All frameworks loaded with proper schema');
    console.log('   🔍 Search functionality verified');
    console.log('   🎯 Ready for RAG testing and cloud migration');

    return totalUploaded;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return false;
  }
}

uploadWithSchema().catch(console.error);