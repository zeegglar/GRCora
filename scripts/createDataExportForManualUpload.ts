#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';

console.log('📤 CREATING DATA EXPORT FOR MANUAL SUPABASE UPLOAD\n');

async function createDataExport() {
  try {
    console.log('📊 Step 1: Loading all local framework data...');

    const frameworks = [
      { file: 'nist-800-53.jsonl', name: 'NIST_800_53' },
      { file: 'nist-csf.jsonl', name: 'NIST_CSF' },
      { file: 'iso-27001.jsonl', name: 'ISO_27001' },
      { file: 'cis-v8.jsonl', name: 'CIS_V8' },
      { file: 'nist-ai-rmf.jsonl', name: 'NIST_AI_RMF' }
    ];

    const allControls = [];
    let totalProcessed = 0;

    for (const framework of frameworks) {
      console.log(`   📋 Processing ${framework.name}...`);

      try {
        const fileContent = readFileSync(`public/data/${framework.file}`, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        console.log(`      📄 Found ${lines.length} controls`);

        for (const line of lines) {
          try {
            const control = JSON.parse(line);

            // Create standardized control for Supabase schema
            const standardizedControl = {
              id: control.control_id || control.id || control.identifier || `${framework.name}-${allControls.length + 1}`,
              family: control.family || control.category || control.control_family || 'General',
              title: control.title || control.name || control.control_name || 'Untitled Control',
              description: control.description || control.text || control.implementation_guidance || 'No description available',
              guidance: control.guidance || control.implementation_guidance || control.supplemental_guidance || null,
              assessment_objectives: JSON.stringify(control.assessment_objectives || []),
              assessment_methods: JSON.stringify(control.assessment_methods || []),
              parameters: JSON.stringify(control.parameters || []),
              related_controls: JSON.stringify(control.related_controls || []),
              framework: framework.name,
              category: control.category || null,
              subcategory: control.subcategory || null,
              informative_references: JSON.stringify(control.informative_references || []),
              content_hash: `${framework.name}-${control.control_id || control.id || allControls.length}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Ensure required fields are not null
            standardizedControl.family = standardizedControl.family || 'General';
            standardizedControl.title = standardizedControl.title || 'Untitled Control';

            // Limit text field lengths for database compatibility
            if (standardizedControl.description.length > 5000) {
              standardizedControl.description = standardizedControl.description.substring(0, 4997) + '...';
            }
            if (standardizedControl.guidance && standardizedControl.guidance.length > 5000) {
              standardizedControl.guidance = standardizedControl.guidance.substring(0, 4997) + '...';
            }

            allControls.push(standardizedControl);
            totalProcessed++;

          } catch (parseError) {
            console.log(`      ⚠️  Skipping malformed line`);
          }
        }

        console.log(`      ✅ ${framework.name}: ${lines.length} controls processed`);

      } catch (fileError) {
        console.log(`      ❌ Error processing ${framework.name}:`, fileError.message);
      }
    }

    console.log(`\n📊 Total processed: ${totalProcessed} controls across ${frameworks.length} frameworks`);

    // Create CSV export for Supabase dashboard upload
    console.log('\n📤 Step 2: Creating CSV export...');

    const csvHeaders = [
      'id', 'family', 'title', 'description', 'guidance',
      'assessment_objectives', 'assessment_methods', 'parameters',
      'related_controls', 'framework', 'category', 'subcategory',
      'informative_references', 'content_hash', 'created_at', 'updated_at'
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    for (const control of allControls) {
      const csvRow = csvHeaders.map(header => {
        let value = control[header] || '';

        // Escape CSV special characters
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""'); // Escape quotes
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`; // Wrap in quotes if contains special chars
          }
        }

        return value;
      }).join(',');

      csvContent += csvRow + '\n';
    }

    // Write CSV file
    const csvFilename = 'nist_controls_export.csv';
    writeFileSync(csvFilename, csvContent);
    console.log(`✅ CSV export created: ${csvFilename} (${allControls.length} records)`);

    // Create JSON export as backup
    console.log('\n📤 Step 3: Creating JSON export...');

    const jsonFilename = 'nist_controls_export.json';
    writeFileSync(jsonFilename, JSON.stringify(allControls, null, 2));
    console.log(`✅ JSON export created: ${jsonFilename} (${allControls.length} records)`);

    // Create SQL INSERT statements
    console.log('\n📤 Step 4: Creating SQL export...');

    let sqlContent = `-- NIST Controls Data Export\n-- Total records: ${allControls.length}\n\n`;

    // Add table creation SQL
    sqlContent += `
-- Create table (run this first if table doesn't exist)
CREATE TABLE IF NOT EXISTS nist_controls (
  id TEXT PRIMARY KEY,
  family TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  guidance TEXT,
  assessment_objectives TEXT[],
  assessment_methods TEXT[],
  parameters TEXT[],
  related_controls TEXT[],
  framework TEXT CHECK (framework IN ('NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF', 'CIS_V8', 'ISO_27001')),
  category TEXT,
  subcategory TEXT,
  informative_references TEXT[],
  embedding vector(768),
  content_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert data
`;

    // Add INSERT statements in batches
    const batchSize = 50;
    for (let i = 0; i < allControls.length; i += batchSize) {
      const batch = allControls.slice(i, i + batchSize);

      sqlContent += `\nINSERT INTO nist_controls (id, family, title, description, guidance, framework, category, subcategory, content_hash, created_at, updated_at) VALUES\n`;

      const valueRows = batch.map(control => {
        const values = [
          control.id,
          control.family,
          control.title,
          control.description,
          control.guidance,
          control.framework,
          control.category,
          control.subcategory,
          control.content_hash,
          control.created_at,
          control.updated_at
        ].map(val => val ? `'${String(val).replace(/'/g, "''")}'` : 'NULL');

        return `(${values.join(', ')})`;
      }).join(',\n');

      sqlContent += valueRows + ';\n';
    }

    const sqlFilename = 'nist_controls_export.sql';
    writeFileSync(sqlFilename, sqlContent);
    console.log(`✅ SQL export created: ${sqlFilename} (${allControls.length} records)`);

    // Framework breakdown
    const frameworkStats = allControls.reduce((acc: any, control: any) => {
      acc[control.framework] = (acc[control.framework] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Export Summary:');
    console.log(`   📄 Total controls: ${allControls.length}`);
    console.log('   📋 Framework breakdown:');
    Object.entries(frameworkStats).forEach(([framework, count]) => {
      console.log(`      ${framework}: ${count} controls`);
    });

    console.log('\n💡 Manual Upload Options:');
    console.log('   1. 📁 CSV Upload: Use Supabase dashboard table editor to import CSV');
    console.log('   2. 🗄️  SQL Upload: Run SQL file in Supabase SQL editor');
    console.log('   3. 📝 JSON Backup: Keep JSON file for reference');

    console.log('\n🎉 DATA EXPORT COMPLETE!');
    console.log('   📊 All framework data processed and standardized');
    console.log('   📤 Multiple export formats created');
    console.log('   🚀 Ready for manual Supabase upload');

    return true;

  } catch (error) {
    console.error('❌ Export creation failed:', error);
    return false;
  }
}

createDataExport().catch(console.error);