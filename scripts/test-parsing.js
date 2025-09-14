#!/usr/bin/env node

/**
 * Test script to verify JSONL parsing and data mapping functionality
 * This script can be run without Supabase credentials to test the core logic
 */

import { readJsonlFile, mapControlToSchema } from './seed-controls.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSONL_FILE_PATH = path.join(__dirname, '..', 'data', 'nist-800-53.jsonl');
const FRAMEWORK_NAME = 'NIST 800-53';

const FIELD_MAPPING = {
  id: 'control_identifier',
  name: 'control_name',
  description: 'control_text',
  family: 'control_family'
};

function testParsing() {
  console.log('🧪 Testing JSONL parsing and data mapping...');
  console.log('=' .repeat(50));

  try {
    // Test reading and parsing JSONL file
    const rawControls = readJsonlFile(JSONL_FILE_PATH);
    console.log(`✅ Successfully read ${rawControls.length} controls from file`);

    if (rawControls.length > 0) {
      console.log('\n📋 Sample raw control data:');
      console.log(JSON.stringify(rawControls[0], null, 2));

      // Test mapping functionality
      const mappedControl = mapControlToSchema(rawControls[0]);
      console.log('\n🔄 Mapped control data:');
      console.log(JSON.stringify(mappedControl, null, 2));

      // Test all controls mapping
      const allMappedControls = rawControls.map(control => {
        const mapped = { framework: FRAMEWORK_NAME };
        for (const [supabaseColumn, jsonField] of Object.entries(FIELD_MAPPING)) {
          if (control[jsonField] !== undefined) {
            mapped[supabaseColumn] = control[jsonField];
          }
        }
        return mapped;
      });

      console.log(`\n✅ Successfully mapped all ${allMappedControls.length} controls`);

      console.log('\n📊 Mapping Summary:');
      allMappedControls.forEach((control, index) => {
        console.log(`   ${index + 1}. ${control.id} - ${control.name}`);
      });

      console.log('\n🎉 Parsing test completed successfully!');
      console.log('💡 The script is ready to run with real Supabase credentials.');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testParsing();