#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://kkptyzhobnfgaqlvcdxk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcHR5emhvYm5mZ2FxbHZjZHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MzQ0NjI1OH0.DuImlinAO1w-L7LDqq5ErJDkpM2IlDdKmYx8M7g5rPU';

console.log('🚀 FORCE UPLOAD TO CLOUD SUPABASE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceUpload() {
  try {
    console.log('🔧 Step 1: Ensuring table structure...');

    // First, try to clear any existing data and recreate structure
    const { error: clearError } = await supabase
      .from('nist_controls')
      .delete()
      .neq('id', 'impossible-id-to-match-nothing');

    if (clearError) {
      console.log('⚠️  Could not clear existing data:', clearError.message);
    } else {
      console.log('✅ Cleared any existing data');
    }

    console.log('\n📊 Step 2: Loading NIST 800-53 controls...');

    // Load just NIST 800-53 first (most critical)
    try {
      const nistContent = readFileSync('public/data/nist-800-53.jsonl', 'utf8');
      const nistLines = nistContent.split('\n').filter(line => line.trim()).slice(0, 20); // Start with just 20 controls

      console.log(`📄 Processing ${nistLines.length} NIST controls...`);

      const controls = [];
      for (const line of nistLines) {
        try {
          const control = JSON.parse(line);
          controls.push({
            id: control.control_id || control.id,
            title: control.title || 'Untitled Control',
            description: control.description || 'No description available',
            framework: 'NIST_800_53',
            family: control.family || 'General',
            control_type: control.control_type || 'Control',
            priority: control.priority || 'Medium'
          });
        } catch (parseError) {
          console.log('⚠️  Skipping malformed control');
        }
      }

      console.log(`📤 Uploading ${controls.length} controls one by one...`);

      let successCount = 0;
      for (let i = 0; i < controls.length; i++) {
        const control = controls[i];
        console.log(`   ${i + 1}/${controls.length}: ${control.id}...`);

        const { error: insertError } = await supabase
          .from('nist_controls')
          .insert(control);

        if (insertError) {
          console.log(`   ❌ Failed: ${insertError.message}`);

          // Try upsert instead
          const { error: upsertError } = await supabase
            .from('nist_controls')
            .upsert(control, { onConflict: 'id' });

          if (upsertError) {
            console.log(`   ❌ Upsert also failed: ${upsertError.message}`);
          } else {
            console.log(`   ✅ Upsert succeeded`);
            successCount++;
          }
        } else {
          console.log(`   ✅ Insert succeeded`);
          successCount++;
        }
      }

      console.log(`\n📊 Upload Summary: ${successCount}/${controls.length} controls uploaded`);

    } catch (fileError) {
      console.log('❌ Error reading NIST file:', fileError.message);
      return false;
    }

    console.log('\n🔍 Step 3: Verification...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('nist_controls')
      .select('id, title, framework', { count: 'exact' })
      .limit(5);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return false;
    }

    console.log(`✅ Verification: Found ${verifyData?.length || 0} records in database`);
    verifyData?.forEach((control, i) => {
      console.log(`   ${i + 1}. [${control.framework}] ${control.id}: ${control.title}`);
    });

    if ((verifyData?.length || 0) > 0) {
      console.log('\n🎉 SUCCESS! Cloud Supabase now has NIST controls data');
      return true;
    } else {
      console.log('\n❌ Upload verification failed - no data found');
      return false;
    }

  } catch (error) {
    console.error('❌ Force upload failed:', error);
    return false;
  }
}

forceUpload().catch(console.error);