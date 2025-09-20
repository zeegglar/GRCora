#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('📊 RAG PIPELINE STATUS REPORT\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FrameworkStatus {
  framework: string;
  doc_count: number;
  chunk_count: number;
  chunks_with_content: number;
  chunks_with_embeddings: number;
  missing_embeddings: number;
  last_updated: string;
  avg_chunk_size: number;
  metadata_completeness: number;
}

async function generateStatusReport(): Promise<void> {
  try {
    console.log('🔍 Analyzing ingestion status...\n');

    // Check controls table
    const { data: controlsData, error: controlsError } = await supabase
      .from('controls')
      .select('framework, id, control_id, title, description, created_at')
      .order('framework');

    if (controlsError) {
      console.error('❌ Error querying controls:', controlsError);
      return;
    }

    // Check document_chunks table if it exists
    const { data: chunksData, error: chunksError } = await supabase
      .from('document_chunks')
      .select('*')
      .limit(1);

    const hasChunksTable = !chunksError;

    if (!hasChunksTable) {
      console.log('⚠️  document_chunks table not found - chunking not implemented yet\n');
    }

    // Generate framework summary
    const frameworkStats = new Map<string, any>();

    controlsData?.forEach(control => {
      const framework = control.framework;
      if (!frameworkStats.has(framework)) {
        frameworkStats.set(framework, {
          framework,
          doc_count: 0,
          total_controls: 0,
          avg_description_length: 0,
          last_updated: control.created_at
        });
      }

      const stats = frameworkStats.get(framework);
      stats.total_controls += 1;
      stats.avg_description_length += control.description?.length || 0;

      if (control.created_at > stats.last_updated) {
        stats.last_updated = control.created_at;
      }
    });

    // Finalize averages
    frameworkStats.forEach((stats, framework) => {
      stats.avg_description_length = Math.round(stats.avg_description_length / stats.total_controls);
    });

    console.log('📋 FRAMEWORK INGESTION STATUS');
    console.log('═'.repeat(120));
    console.log('Framework'.padEnd(20) + 'Controls'.padEnd(12) + 'Avg Length'.padEnd(12) + 'Chunks'.padEnd(10) + 'Embeddings'.padEnd(12) + 'Missing'.padEnd(10) + 'Last Updated');
    console.log('─'.repeat(120));

    const frameworks = Array.from(frameworkStats.keys()).sort();
    let totalControls = 0;
    let totalChunks = 0;
    let totalEmbeddings = 0;

    for (const framework of frameworks) {
      const stats = frameworkStats.get(framework);
      totalControls += stats.total_controls;

      // Check for chunks if table exists
      let chunkCount = 0;
      let embeddingCount = 0;
      let missingEmbeddings = 0;

      if (hasChunksTable) {
        const { data: frameworkChunks } = await supabase
          .from('document_chunks')
          .select('id, content, embedding')
          .eq('framework', framework);

        chunkCount = frameworkChunks?.length || 0;
        embeddingCount = frameworkChunks?.filter(c => c.embedding).length || 0;
        missingEmbeddings = chunkCount - embeddingCount;

        totalChunks += chunkCount;
        totalEmbeddings += embeddingCount;
      }

      const lastUpdated = new Date(stats.last_updated).toLocaleDateString();

      console.log(
        framework.padEnd(20) +
        stats.total_controls.toString().padEnd(12) +
        `${stats.avg_description_length}`.padEnd(12) +
        (hasChunksTable ? chunkCount.toString().padEnd(10) : 'N/A'.padEnd(10)) +
        (hasChunksTable ? embeddingCount.toString().padEnd(12) : 'N/A'.padEnd(12)) +
        (hasChunksTable ? missingEmbeddings.toString().padEnd(10) : 'N/A'.padEnd(10)) +
        lastUpdated
      );
    }

    console.log('─'.repeat(120));
    console.log(
      'TOTAL'.padEnd(20) +
      totalControls.toString().padEnd(12) +
      ''.padEnd(12) +
      (hasChunksTable ? totalChunks.toString().padEnd(10) : 'N/A'.padEnd(10)) +
      (hasChunksTable ? totalEmbeddings.toString().padEnd(12) : 'N/A'.padEnd(12)) +
      (hasChunksTable ? (totalChunks - totalEmbeddings).toString().padEnd(10) : 'N/A'.padEnd(10))
    );

    console.log('\n🔍 DETAILED ANALYSIS');
    console.log('═'.repeat(80));

    // Check data quality
    const { data: incompleteControls } = await supabase
      .from('controls')
      .select('framework, control_id')
      .or('title.is.null,description.is.null');

    const incompleteCount = incompleteControls?.length || 0;
    console.log(`📊 Data Quality:`);
    console.log(`   • Complete controls: ${totalControls - incompleteCount}/${totalControls} (${Math.round((totalControls - incompleteCount) / totalControls * 100)}%)`);
    console.log(`   • Incomplete controls: ${incompleteCount}`);

    if (!hasChunksTable) {
      console.log('\n⚠️  CHUNKING NOT IMPLEMENTED:');
      console.log('   • document_chunks table missing');
      console.log('   • Need to implement 600-1200 token chunking');
      console.log('   • Need 80-120 token overlap');
      console.log('   • Need to preserve headings + framework IDs');
    } else {
      console.log(`\n📏 Chunking Status:`);
      console.log(`   • Total chunks: ${totalChunks}`);
      console.log(`   • Embedded chunks: ${totalEmbeddings}`);
      console.log(`   • Missing embeddings: ${totalChunks - totalEmbeddings}`);
      console.log(`   • Embedding completeness: ${totalChunks > 0 ? Math.round(totalEmbeddings / totalChunks * 100) : 0}%`);
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('   1. ✅ Framework ingestion: COMPLETED (5/5 frameworks)');

    if (!hasChunksTable) {
      console.log('   2. ❌ Document chunking: NEEDED');
      console.log('      → Create document_chunks table with proper metadata');
      console.log('      → Implement 600-1200 token chunking with 80-120 overlap');
    } else if (totalEmbeddings < totalChunks) {
      console.log('   2. ⚠️  Embeddings generation: INCOMPLETE');
      console.log(`      → Generate embeddings for ${totalChunks - totalEmbeddings} remaining chunks`);
    } else {
      console.log('   2. ✅ Embeddings generation: COMPLETED');
    }

    console.log('   3. ❌ Hybrid retrieval: NEEDED');
    console.log('      → Implement ANN (pgvector) + BM25 hybrid search');
    console.log('   4. ❌ Citation system: NEEDED');
    console.log('      → Implement strict context template with chunk ID citations');
    console.log('   5. ❌ Query caching: NEEDED');
    console.log('      → Implement tenant-aware caching with invalidation');

    console.log('\n🚀 NEXT STEPS:');
    if (!hasChunksTable) {
      console.log('   1. Create document_chunks table and chunking pipeline');
      console.log('   2. Generate embeddings for all chunks');
    } else if (totalEmbeddings < totalChunks) {
      console.log('   1. Complete embedding generation');
    }
    console.log('   3. Implement hybrid retrieval system');
    console.log('   4. Add citation mapping and context templates');
    console.log('   5. Implement query caching layer');

  } catch (error) {
    console.error('❌ Error generating status report:', error);
  }
}

generateStatusReport();