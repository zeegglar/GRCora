#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RawNISTControl {
  framework?: string;
  framework_version?: string;
  source_file?: string;
  control_id?: string;
  family?: string;
  title?: string;
  text?: string;
  guidance?: string;
  // CSF format properties
  response?: {
    elements?: Array<{
      element_identifier?: string;
      element_type?: string;
      text?: string;
      title?: string;
      doc_identifier?: string;
    }>;
  };
}

interface ProcessedNISTControl {
  id: string;
  family: string;
  title: string;
  description: string;
  guidance: string;
  assessment_objectives: string[];
  assessment_methods: string[];
  parameters?: string[];
  related_controls: string[];
  framework: 'NIST_CSF' | 'NIST_800_53' | 'NIST_AI_RMF';
  category?: string;
  subcategory?: string;
  informative_references?: string[];
  embedding?: number[];
  content_hash: string;
}

/**
 * Generate a simple mock embedding for testing
 * In production, this would use OpenAI, Cohere, or another embedding service
 */
function generateMockEmbedding(text: string, dimensions: number = 768): number[] {
  const hash = crypto.createHash('sha256').update(text).digest();
  const embedding: number[] = [];

  for (let i = 0; i < dimensions; i++) {
    // Use hash bytes to generate deterministic but distributed values
    const byte1 = hash[i % hash.length];
    const byte2 = hash[(i + 1) % hash.length];
    const value = (byte1 + byte2) / 512 - 0.5; // Scale to [-0.5, 0.5]
    embedding.push(value);
  }

  return embedding;
}

/**
 * Generate content hash for deduplication
 */
function generateContentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Process NIST CSF 2.0 format
 */
function processCSFControl(raw: RawNISTControl): ProcessedNISTControl[] {
  const controls: ProcessedNISTControl[] = [];

  if (raw.response?.elements) {
    for (const element of raw.response.elements) {
      if (element.element_type === 'subcategory') {
        const contentText = `${element.title || ''} ${element.text || ''}`;
        const content_hash = generateContentHash(contentText);

        controls.push({
          id: element.element_identifier || `CSF_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          family: element.element_identifier?.split('.')[0] || 'GENERAL',
          title: element.title || element.text || '',
          description: element.text || '',
          guidance: '', // CSF doesn't have separate guidance in this format
          assessment_objectives: [],
          assessment_methods: ['Review', 'Interview', 'Test'],
          related_controls: [],
          framework: 'NIST_CSF' as const,
          category: element.element_identifier?.includes('.') ? element.element_identifier.split('.')[1] : undefined,
          subcategory: element.element_identifier,
          informative_references: [],
          embedding: generateMockEmbedding(contentText),
          content_hash
        });
      }
    }
  }

  return controls;
}

/**
 * Process NIST SP 800-53 format
 */
function process80053Control(raw: RawNISTControl): ProcessedNISTControl {
  const contentText = `${raw.title || ''} ${raw.text || ''} ${raw.guidance || ''}`;
  const content_hash = generateContentHash(contentText);

  // Extract family name from control_id (e.g., "ac-1" -> "AC")
  const familyCode = raw.control_id?.split('-')[0]?.toUpperCase() || raw.family || 'GENERAL';
  const familyMap: Record<string, string> = {
    'AC': 'Access Control',
    'AU': 'Audit and Accountability',
    'CA': 'Security Assessment and Authorization',
    'CM': 'Configuration Management',
    'CP': 'Contingency Planning',
    'IA': 'Identification and Authentication',
    'IR': 'Incident Response',
    'MA': 'Maintenance',
    'MP': 'Media Protection',
    'PE': 'Physical and Environmental Protection',
    'PL': 'Planning',
    'PS': 'Personnel Security',
    'RA': 'Risk Assessment',
    'SA': 'System and Services Acquisition',
    'SC': 'System and Communications Protection',
    'SI': 'System and Information Integrity',
    'SR': 'Supply Chain Risk Management'
  };

  return {
    id: raw.control_id?.toUpperCase() || `SP800-53_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    family: familyMap[familyCode] || familyCode,
    title: raw.title || '',
    description: raw.text || '',
    guidance: raw.guidance || '',
    assessment_objectives: extractAssessmentObjectives(raw.text || ''),
    assessment_methods: ['Examine', 'Interview', 'Test'],
    related_controls: extractRelatedControls(raw.text || ''),
    framework: 'NIST_800_53' as const,
    embedding: generateMockEmbedding(contentText),
    content_hash
  };
}

/**
 * Process NIST AI RMF format
 */
function processAIRMFControl(raw: RawNISTControl): ProcessedNISTControl {
  const contentText = `${raw.title || ''} ${raw.text || ''}`;
  const content_hash = generateContentHash(contentText);

  // Extract function from title (e.g., "GOVERN 1.1" -> "GOVERN")
  const titleParts = raw.title?.split(' ') || [];
  const aiFunction = titleParts[0] || 'AI_GOVERNANCE';

  return {
    id: raw.title?.replace(/\s/g, '_') || `AI_RMF_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    family: aiFunction,
    title: raw.title || '',
    description: raw.text || '',
    guidance: '', // AI RMF doesn't have separate guidance in this format
    assessment_objectives: [],
    assessment_methods: ['Review', 'Assess', 'Monitor'],
    related_controls: [],
    framework: 'NIST_AI_RMF' as const,
    category: raw.title,
    embedding: generateMockEmbedding(contentText),
    content_hash
  };
}

/**
 * Extract assessment objectives from text
 */
function extractAssessmentObjectives(text: string): string[] {
  const objectives: string[] = [];
  const objectivePattern = /\[assessment-objective\]\s*([^[\n]+)/gi;
  let match;

  while ((match = objectivePattern.exec(text)) !== null) {
    objectives.push(match[1].trim());
  }

  return objectives.slice(0, 10); // Limit to prevent too many objectives
}

/**
 * Extract related controls from text
 */
function extractRelatedControls(text: string): string[] {
  const controls: string[] = [];
  // Look for control references like AC-1, AU-2, etc.
  const controlPattern = /\b[A-Z]{2}-\d+(?:\(\d+\))?\b/g;
  let match;

  while ((match = controlPattern.exec(text)) !== null) {
    if (!controls.includes(match[0])) {
      controls.push(match[0]);
    }
  }

  return controls.slice(0, 10); // Limit to prevent too many references
}

/**
 * Load and process JSONL file
 */
async function processJSONLFile(filePath: string): Promise<ProcessedNISTControl[]> {
  console.log(`\n📄 Processing ${path.basename(filePath)}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    const controls: ProcessedNISTControl[] = [];

    console.log(`   Found ${lines.length} lines to process`);

    for (let i = 0; i < lines.length; i++) {
      try {
        const raw: RawNISTControl = JSON.parse(lines[i]);

        // Determine format and process accordingly
        if (raw.response?.elements) {
          // CSF format
          const csfControls = processCSFControl(raw);
          controls.push(...csfControls);
        } else if (raw.control_id && raw.framework?.includes('800-53')) {
          // 800-53 format
          const control = process80053Control(raw);
          controls.push(control);
        } else if (raw.title && raw.framework?.includes('AI RMF')) {
          // AI RMF format
          const control = processAIRMFControl(raw);
          controls.push(control);
        } else {
          console.warn(`   ⚠️ Unrecognized format in line ${i + 1}`);
        }
      } catch (parseError) {
        console.warn(`   ⚠️ Failed to parse line ${i + 1}: ${parseError}`);
      }
    }

    console.log(`   ✅ Processed ${controls.length} controls`);
    return controls;

  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error);
    return [];
  }
}

/**
 * Insert controls into Supabase
 */
async function insertControls(controls: ProcessedNISTControl[]): Promise<void> {
  console.log(`\n💾 Inserting ${controls.length} controls into database...`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < controls.length; i += batchSize) {
    const batch = controls.slice(i, i + batchSize);

    try {
      for (const control of batch) {
        // Check if control already exists
        const { data: existing } = await supabase
          .from('nist_controls')
          .select('id')
          .eq('content_hash', control.content_hash)
          .single();

        if (existing) {
          // Update existing control
          const { error } = await supabase
            .from('nist_controls')
            .update({
              ...control,
              updated_at: new Date().toISOString()
            })
            .eq('content_hash', control.content_hash);

          if (error) {
            console.warn(`   ⚠️ Error updating ${control.id}:`, error.message);
            errors++;
          } else {
            updated++;
          }
        } else {
          // Insert new control
          const { error } = await supabase
            .from('nist_controls')
            .insert({
              ...control,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.warn(`   ⚠️ Error inserting ${control.id}:`, error.message);
            errors++;
          } else {
            inserted++;
          }
        }
      }

      // Progress indicator
      const progress = Math.min(i + batchSize, controls.length);
      process.stdout.write(`\r   Progress: ${progress}/${controls.length} (${Math.round(progress/controls.length*100)}%)`);

    } catch (batchError) {
      console.error(`\n   ❌ Batch error:`, batchError);
      errors += batch.length;
    }
  }

  console.log(`\n   ✅ Insertion complete:`);
  console.log(`      • Inserted: ${inserted} controls`);
  console.log(`      • Updated: ${updated} controls`);
  console.log(`      • Errors: ${errors} controls`);
}

/**
 * Test the ingested data
 */
async function testIngestedData(): Promise<void> {
  console.log(`\n🧪 Testing ingested data...`);

  try {
    const { data: stats, error } = await supabase
      .from('nist_controls')
      .select('framework, count(*)', { count: 'exact' })
      .returns<{ framework: string; count: number }[]>();

    if (error) {
      console.error(`   ❌ Error getting stats:`, error.message);
      return;
    }

    // Group by framework
    const frameworks = await supabase
      .from('nist_controls')
      .select('framework')
      .returns<{ framework: string }[]>();

    if (frameworks.data) {
      const counts = frameworks.data.reduce((acc, row) => {
        acc[row.framework] = (acc[row.framework] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`   📊 Framework breakdown:`);
      Object.entries(counts).forEach(([framework, count]) => {
        console.log(`      • ${framework}: ${count} controls`);
      });
    }

    // Test search functionality
    console.log(`\n   🔍 Testing search functionality...`);
    const testQuery = 'access control policy';
    const mockEmbedding = generateMockEmbedding(testQuery);

    const { data: searchResults, error: searchError } = await supabase
      .rpc('match_nist_controls', {
        query_embedding: mockEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        frameworks: ['NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF']
      });

    if (searchError) {
      console.error(`   ❌ Search test failed:`, searchError.message);
    } else {
      console.log(`   ✅ Search test passed: Found ${searchResults?.length || 0} results`);
      if (searchResults && searchResults.length > 0) {
        console.log(`      • Top result: ${searchResults[0].title} (${searchResults[0].framework})`);
      }
    }

  } catch (error) {
    console.error(`   ❌ Testing failed:`, error);
  }
}

/**
 * Main ingestion process
 */
async function main() {
  console.log('🚀 Starting NIST Knowledge Base Ingestion...\n');

  const dataDir = path.join(process.cwd(), 'public', 'data');
  const files = [
    path.join(dataDir, 'nist-csf.jsonl'),
    path.join(dataDir, 'nist-800-53.jsonl'),
    path.join(dataDir, 'nist-ai-rmf.jsonl')
  ];

  let allControls: ProcessedNISTControl[] = [];

  // Process each file
  for (const filePath of files) {
    if (require('fs').existsSync(filePath)) {
      const controls = await processJSONLFile(filePath);
      allControls.push(...controls);
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }
  }

  if (allControls.length === 0) {
    console.error('❌ No controls processed. Please check your data files.');
    process.exit(1);
  }

  console.log(`\n📋 Total processed: ${allControls.length} controls`);

  // Insert into database
  await insertControls(allControls);

  // Test the data
  await testIngestedData();

  console.log('\n🎉 NIST Knowledge Base ingestion completed successfully!');
  console.log('💡 You can now use the AI Assistant to query NIST controls for compliance guidance.');
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  });
}