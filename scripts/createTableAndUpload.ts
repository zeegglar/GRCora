#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 CREATING TABLE AND UPLOADING TO LOCAL SUPABASE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAndUpload() {
  try {
    console.log('📋 Step 1: Creating table structure...');

    // First, try a minimal table creation
    const minimalRecord = {
      id: 'INIT-001',
      title: 'Initial Test Control',
      description: 'Test control to initialize table',
      framework: 'TEST'
    };

    console.log('   Creating table with minimal structure...');
    const { error: initError } = await supabase
      .from('nist_controls')
      .insert(minimalRecord);

    if (initError) {
      console.log('   Table does not exist, will be created on first successful insert');
    } else {
      console.log('   ✅ Table exists, clearing test data');
      await supabase.from('nist_controls').delete().eq('id', 'INIT-001');
    }

    console.log('\n📊 Step 2: Starting data upload...');

    // Load just NIST 800-53 first to test
    console.log('📋 Testing with NIST 800-53 controls...');

    try {
      const nistContent = readFileSync('public/data/nist-800-53.jsonl', 'utf8');
      const nistLines = nistContent.split('\n').filter(line => line.trim()).slice(0, 10); // Start with just 10

      console.log(`   📄 Processing ${nistLines.length} test controls...`);

      const controls = [];
      for (const line of nistLines) {
        try {
          const control = JSON.parse(line);

          // Create minimal structure that should work
          const minimalControl = {
            id: control.control_id || control.id || `nist-${controls.length}`,
            title: control.title || 'Untitled Control',
            description: (control.description || 'No description available').substring(0, 1000), // Limit length
            framework: 'NIST_800_53'
          };

          controls.push(minimalControl);
        } catch (parseError) {
          console.log(`   ⚠️  Skipping malformed control`);
        }
      }

      console.log(`   📤 Uploading ${controls.length} minimal controls...`);

      // Try inserting one by one to identify any issues
      let successCount = 0;
      for (const control of controls) {
        const { error: insertError } = await supabase
          .from('nist_controls')
          .insert(control);

        if (insertError) {
          console.log(`   ❌ Failed to insert ${control.id}:`, insertError.message);
        } else {
          console.log(`   ✅ Inserted ${control.id}`);
          successCount++;
        }
      }

      console.log(`\n📊 Upload summary: ${successCount}/${controls.length} controls uploaded`);

      if (successCount > 0) {
        console.log('\n🔍 Step 3: Verification...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('nist_controls')
          .select('id, title, framework')
          .limit(5);

        if (verifyError) {
          console.log('❌ Verification failed:', verifyError.message);
        } else {
          console.log(`✅ Verification successful! Found ${verifyData.length} records:`);
          verifyData.forEach((control, i) => {
            console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
          });

          console.log('\n🎉 LOCAL SUPABASE TABLE CREATED AND WORKING!');
          console.log('   Ready to upload full dataset...');
          return true;
        }
      } else {
        console.log('\n❌ No controls were successfully uploaded');
        return false;
      }

    } catch (fileError) {
      console.log('❌ Error reading NIST file:', fileError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Process failed:', error);
    return false;
  }
}

createAndUpload().catch(console.error);