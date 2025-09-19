#!/usr/bin/env tsx
import { OllamaEmbeddings } from '@langchain/ollama';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

console.log('🔮 GENERATING VECTOR EMBEDDINGS FOR ALL CONTROLS\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Ollama embeddings with nomic-embed-text model
const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434', // Default Ollama URL
});

interface Control {
  id: number;
  control_id: string;
  title: string;
  description: string;
  framework: string;
  family: string;
}

async function generateEmbeddings() {
  try {
    console.log('📊 Fetching all controls from database...');

    const { data: controls, error: fetchError } = await supabase
      .from('nist_controls')
      .select('id, control_id, title, description, framework, family')
      .is('embedding', null) // Only process controls without embeddings
      .order('id');

    if (fetchError) {
      console.error('❌ Error fetching controls:', fetchError.message);
      return;
    }

    if (!controls || controls.length === 0) {
      console.log('✅ All controls already have embeddings generated!');
      return;
    }

    console.log(`🎯 Processing ${controls.length} controls without embeddings...\n`);

    // Process in batches to avoid overwhelming Ollama
    const batchSize = 10;
    const totalBatches = Math.ceil(controls.length / batchSize);
    let processed = 0;

    for (let i = 0; i < controls.length; i += batchSize) {
      const batch = controls.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} controls)...`);

      for (const control of batch) {
        try {
          // Combine title and description for rich context
          const textToEmbed = `${control.title}\n\n${control.description}`;

          console.log(`   🔄 Generating embedding for ${control.control_id} (${control.framework})...`);

          // Generate embedding using Ollama
          const embedding = await embeddings.embedQuery(textToEmbed);

          // Update database with embedding
          const { error: updateError } = await supabase
            .from('nist_controls')
            .update({ embedding: embedding })
            .eq('id', control.id);

          if (updateError) {
            console.error(`   ❌ Failed to update ${control.control_id}:`, updateError.message);
            continue;
          }

          processed++;
          console.log(`   ✅ ${control.control_id} embedded successfully (${processed}/${controls.length})`);

          // Small delay to avoid overwhelming Ollama
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`   ❌ Error processing ${control.control_id}:`, error);
        }
      }

      console.log(`   📋 Batch ${batchNum} completed\n`);
    }

    console.log('🎉 EMBEDDING GENERATION COMPLETE!');
    console.log(`   📊 Successfully processed: ${processed}/${controls.length} controls`);

    // Verify embeddings
    console.log('\n🔍 Verifying embeddings...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('nist_controls')
      .select('id')
      .not('embedding', 'is', null);

    if (!verifyError && verifyData) {
      console.log(`✅ Total controls with embeddings: ${verifyData.length}`);
    }

  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
  }
}

// Test Ollama connection first
async function testOllamaConnection() {
  try {
    console.log('🔌 Testing Ollama connection...');
    const testEmbedding = await embeddings.embedQuery('test');
    console.log(`✅ Ollama connected successfully! Embedding dimension: ${testEmbedding.length}`);

    if (testEmbedding.length !== 768) {
      console.log(`⚠️  Warning: Expected 768 dimensions, got ${testEmbedding.length}`);
      console.log('💡 Run fix-embedding-dimension.sql to update database schema');
    }

    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Ollama connection failed:', error);
    console.log('💡 Make sure Ollama is running: ollama serve');
    console.log('💡 Make sure nomic-embed-text model is available: ollama pull nomic-embed-text');
    return false;
  }
}

async function main() {
  const isOllamaConnected = await testOllamaConnection();
  if (isOllamaConnected) {
    await generateEmbeddings();
  }
}

main().catch(console.error);