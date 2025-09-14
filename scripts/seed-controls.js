#!/usr/bin/env node

/**
 * Supabase Controls Seeder
 *
 * This script reads JSONL files containing NIST framework controls and inserts them
 * into the Supabase 'controls' table using efficient batch upserts.
 *
 * Usage: node scripts/seed-controls.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// =============================================================================
// CONFIGURATION - Modify these variables as needed
// =============================================================================

const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'nist-800-53.jsonl');
const FRAMEWORK_NAME = 'NIST 800-53';
const BATCH_SIZE = 100;

// =============================================================================
// DATA MAPPING CONFIGURATION
// =============================================================================

/**
 * Maps fields from the JSONL data to Supabase table columns
 * Modify this mapping based on your actual JSONL structure
 */
const FIELD_MAPPING = {
  id: 'control_identifier',           // JSON field -> Supabase column
  name: 'control_name',               // JSON field -> Supabase column
  description: 'control_text',        // JSON field -> Supabase column
  family: 'control_family'            // JSON field -> Supabase column
  // framework will be set from FRAMEWORK_NAME constant
};

// =============================================================================
// SUPABASE CLIENT SETUP
// =============================================================================

function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
    );
  }

  console.log('🔗 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  return createClient(supabaseUrl, supabaseKey);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Reads and parses a JSONL file
 * @param {string} filePath - Path to the JSONL file
 * @returns {Array} Array of parsed JSON objects
 */
function readJsonlFile(filePath) {
  console.log(`📂 Reading file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.trim().split('\n').filter(line => line.trim());

  console.log(`📋 Found ${lines.length} lines in file`);

  const controls = [];
  const errors = [];

  lines.forEach((line, index) => {
    try {
      const jsonObject = JSON.parse(line);
      controls.push(jsonObject);
    } catch (error) {
      errors.push({
        line: index + 1,
        content: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
        error: error.message
      });
    }
  });

  if (errors.length > 0) {
    console.warn(`⚠️  Found ${errors.length} JSON parsing errors:`);
    errors.forEach(({ line, content, error }) => {
      console.warn(`   Line ${line}: ${error}`);
      console.warn(`   Content: ${content}`);
    });
  }

  console.log(`✅ Successfully parsed ${controls.length} controls`);
  return controls;
}

/**
 * Maps a control object to the Supabase table schema
 * @param {Object} controlData - Raw control data from JSONL
 * @returns {Object} Mapped control object for Supabase
 */
function mapControlToSchema(controlData) {
  const mappedControl = {
    framework: FRAMEWORK_NAME
  };

  // Apply field mapping
  for (const [supabaseColumn, jsonField] of Object.entries(FIELD_MAPPING)) {
    if (controlData[jsonField] !== undefined) {
      mappedControl[supabaseColumn] = controlData[jsonField];
    } else {
      console.warn(`⚠️  Missing field '${jsonField}' in control data:`,
        JSON.stringify(controlData, null, 2).substring(0, 200) + '...');
    }
  }

  return mappedControl;
}

/**
 * Inserts controls into Supabase in batches
 * @param {Object} supabase - Supabase client
 * @param {Array} controls - Array of control objects
 * @returns {Promise<void>}
 */
async function insertControlsBatch(supabase, controls) {
  if (controls.length === 0) {
    console.log('📭 No controls to insert');
    return;
  }

  console.log(`🚀 Starting batch insert of ${controls.length} controls...`);
  console.log(`📦 Using batch size: ${BATCH_SIZE}`);

  let successCount = 0;
  let errorCount = 0;

  // Process controls in batches
  for (let i = 0; i < controls.length; i += BATCH_SIZE) {
    const batch = controls.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(controls.length / BATCH_SIZE);

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} controls)...`);

    try {
      const { data, error } = await supabase
        .from('controls')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select('id');

      if (error) {
        console.error(`❌ Error in batch ${batchNumber}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ Batch ${batchNumber} completed successfully (${data?.length || batch.length} records)`);
        successCount += batch.length;
      }

      // Add a small delay between batches to respect rate limits
      if (i + BATCH_SIZE < controls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`💥 Unexpected error in batch ${batchNumber}:`, error);
      errorCount += batch.length;
    }
  }

  // Final summary
  console.log('\n📊 INSERTION SUMMARY:');
  console.log(`   ✅ Successfully processed: ${successCount} controls`);
  console.log(`   ❌ Failed to process: ${errorCount} controls`);
  console.log(`   📋 Total attempted: ${controls.length} controls`);

  if (errorCount > 0) {
    console.log('\n⚠️  Some controls failed to insert. Check the error messages above for details.');
  }
}

/**
 * Validates the database connection and table schema
 * @param {Object} supabase - Supabase client
 * @returns {Promise<void>}
 */
async function validateDatabaseConnection(supabase) {
  console.log('🔍 Validating database connection and schema...');

  try {
    // Test connection by attempting to query the controls table
    const { data, error } = await supabase
      .from('controls')
      .select('id, name, description, family, framework')
      .limit(1);

    if (error) {
      throw new Error(`Database validation failed: ${error.message}`);
    }

    console.log('✅ Database connection and schema validated successfully');

    // Show current count
    const { count } = await supabase
      .from('controls')
      .select('*', { count: 'exact', head: true })
      .eq('framework', FRAMEWORK_NAME);

    console.log(`📊 Current controls in database for framework '${FRAMEWORK_NAME}': ${count || 0}`);

  } catch (error) {
    throw new Error(`Failed to validate database: ${error.message}`);
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  console.log('🚀 Starting Supabase Controls Seeder');
  console.log('=' .repeat(50));
  console.log(`📁 File: ${JSONL_FILE_PATH}`);
  console.log(`🏷️  Framework: ${FRAMEWORK_NAME}`);
  console.log('=' .repeat(50));

  try {
    // Step 1: Create Supabase client
    const supabase = createSupabaseClient();

    // Step 2: Validate database connection
    await validateDatabaseConnection(supabase);

    // Step 3: Read and parse JSONL file
    const rawControls = readJsonlFile(JSONL_FILE_PATH);

    if (rawControls.length === 0) {
      console.log('📭 No controls found in file. Exiting.');
      return;
    }

    // Step 4: Map controls to database schema
    console.log('🔄 Mapping controls to database schema...');
    const mappedControls = rawControls.map(mapControlToSchema);
    console.log(`✅ Mapped ${mappedControls.length} controls`);

    // Step 5: Insert controls into database
    await insertControlsBatch(supabase, mappedControls);

    console.log('\n🎉 Controls seeding completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n💥 Script failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

// Run the script if this file is executed directly
if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main, readJsonlFile, mapControlToSchema };