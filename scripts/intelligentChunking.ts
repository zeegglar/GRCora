#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { OllamaEmbeddings } from '@langchain/ollama';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 INTELLIGENT DOCUMENT CHUNKING PIPELINE\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize embeddings model
const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434',
});

interface ChunkingConfig {
  minTokens: number;
  maxTokens: number;
  overlapMin: number;
  overlapMax: number;
  preserveHeadings: boolean;
  preserveFrameworkIds: boolean;
}

interface DocumentChunk {
  chunk_id: string;
  content: string;
  heading?: string;
  token_count: number;
  framework: string;
  control_id?: string;
  section?: string;
  version: string;
  chunk_index: number;
  overlap_start: number;
  overlap_end: number;
  tenant_id?: string;
}

class IntelligentChunker {
  private config: ChunkingConfig;

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = {
      minTokens: 600,
      maxTokens: 1200,
      overlapMin: 80,
      overlapMax: 120,
      preserveHeadings: true,
      preserveFrameworkIds: true,
      ...config
    };
  }

  /**
   * Simple token estimation (approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Extract heading from content if present
   */
  private extractHeading(text: string): { heading?: string; content: string } {
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim();

    // Check if first line looks like a heading
    if (firstLine && (
      firstLine.length < 100 && // Short enough to be a heading
      (firstLine.includes('Control') || firstLine.includes('Policy') ||
       firstLine.includes('Requirement') || firstLine.match(/^[A-Z]{2,3}[-.]?\d+/))
    )) {
      return {
        heading: firstLine,
        content: lines.slice(1).join('\n').trim()
      };
    }

    return { content: text };
  }

  /**
   * Intelligent chunking that preserves semantic boundaries
   */
  chunkDocument(
    content: string,
    framework: string,
    controlId?: string,
    section?: string,
    tenantId?: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    // Extract heading if present
    const { heading, content: cleanContent } = this.extractHeading(content);

    // Split into sentences for better semantic preservation
    const sentences = this.splitIntoSentences(cleanContent);
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    // Add heading to first chunk if present
    if (heading && this.config.preserveHeadings) {
      currentChunk = heading + '\n\n';
      currentTokens = this.estimateTokens(currentChunk);
    }

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = this.estimateTokens(sentence);

      // Check if adding this sentence would exceed max tokens
      if (currentTokens + sentenceTokens > this.config.maxTokens && currentChunk.trim()) {
        // Create chunk if we have minimum tokens
        if (currentTokens >= this.config.minTokens) {
          chunks.push(this.createChunk(
            currentChunk.trim(),
            framework,
            controlId,
            section,
            chunkIndex,
            heading,
            tenantId
          ));
          chunkIndex++;

          // Start new chunk with overlap
          const overlap = this.calculateOverlap(currentChunk);
          currentChunk = overlap + sentence + ' ';
          currentTokens = this.estimateTokens(currentChunk);
        } else {
          // Current chunk too small, just add sentence
          currentChunk += sentence + ' ';
          currentTokens += sentenceTokens;
        }
      } else {
        // Add sentence to current chunk
        currentChunk += sentence + ' ';
        currentTokens += sentenceTokens;
      }
    }

    // Add final chunk if it has content
    if (currentChunk.trim() && currentTokens >= this.config.minTokens) {
      chunks.push(this.createChunk(
        currentChunk.trim(),
        framework,
        controlId,
        section,
        chunkIndex,
        heading,
        tenantId
      ));
    }

    // Calculate overlap tokens for each chunk
    this.calculateOverlapTokens(chunks);

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries while preserving structure
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
  }

  private calculateOverlap(text: string): string {
    const sentences = this.splitIntoSentences(text);
    const targetOverlapTokens = Math.floor(
      (this.config.overlapMin + this.config.overlapMax) / 2
    );

    let overlap = '';
    let overlapTokens = 0;

    // Take sentences from the end to create overlap
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      const sentenceTokens = this.estimateTokens(sentence);

      if (overlapTokens + sentenceTokens <= targetOverlapTokens) {
        overlap = sentence + ' ' + overlap;
        overlapTokens += sentenceTokens;
      } else {
        break;
      }
    }

    return overlap.trim();
  }

  private createChunk(
    content: string,
    framework: string,
    controlId?: string,
    section?: string,
    chunkIndex: number = 0,
    heading?: string,
    tenantId?: string
  ): DocumentChunk {
    const chunkId = this.generateChunkId(framework, controlId, chunkIndex);

    return {
      chunk_id: chunkId,
      content,
      heading,
      token_count: this.estimateTokens(content),
      framework,
      control_id: controlId,
      section,
      version: '1.0',
      chunk_index: chunkIndex,
      overlap_start: 0, // Will be calculated later
      overlap_end: 0,   // Will be calculated later
      tenant_id: tenantId
    };
  }

  private generateChunkId(framework: string, controlId?: string, chunkIndex: number): string {
    const frameworkSlug = framework.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const controlSlug = controlId ? controlId.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'general';
    return `${frameworkSlug}_${controlSlug}_${chunkIndex.toString().padStart(3, '0')}`;
  }

  private calculateOverlapTokens(chunks: DocumentChunk[]): void {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      if (i > 0) {
        // Calculate overlap with previous chunk
        const prevChunk = chunks[i - 1];
        chunk.overlap_start = this.calculateActualOverlap(prevChunk.content, chunk.content);
      }

      if (i < chunks.length - 1) {
        // Calculate overlap with next chunk
        const nextChunk = chunks[i + 1];
        chunk.overlap_end = this.calculateActualOverlap(chunk.content, nextChunk.content);
      }
    }
  }

  private calculateActualOverlap(text1: string, text2: string): number {
    // Find the longest common suffix/prefix
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);

    let overlapWords = 0;
    const minLength = Math.min(words1.length, words2.length);

    // Check for overlap at the end of text1 and beginning of text2
    for (let i = 1; i <= minLength; i++) {
      const suffix = words1.slice(-i).join(' ');
      const prefix = words2.slice(0, i).join(' ');

      if (suffix === prefix) {
        overlapWords = i;
      }
    }

    return this.estimateTokens(words1.slice(-overlapWords).join(' '));
  }
}

async function processFrameworkData(): Promise<void> {
  try {
    console.log('🔄 Processing framework controls for chunking...\n');

    // Get all controls from database
    const { data: controls, error } = await supabase
      .from('controls')
      .select('*')
      .order('framework, control_id');

    if (error) {
      console.error('❌ Error fetching controls:', error);
      return;
    }

    if (!controls || controls.length === 0) {
      console.log('⚠️  No controls found. Running ingestion first...');
      return;
    }

    console.log(`📋 Found ${controls.length} controls to process`);

    const chunker = new IntelligentChunker();
    const allChunks: DocumentChunk[] = [];

    let processedCount = 0;

    for (const control of controls) {
      const content = `${control.title}\n\n${control.description}`;

      const chunks = chunker.chunkDocument(
        content,
        control.framework,
        control.control_id,
        control.family,
        null // No tenant_id for base framework data
      );

      allChunks.push(...chunks);
      processedCount++;

      if (processedCount % 100 === 0) {
        console.log(`   Progress: ${processedCount}/${controls.length} (${Math.round(processedCount / controls.length * 100)}%)`);
      }
    }

    console.log(`\n✅ Generated ${allChunks.length} chunks from ${controls.length} controls`);

    // Insert chunks into database
    console.log('💾 Inserting chunks into database...');

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        continue;
      }

      insertedCount += batch.length;

      if (insertedCount % 200 === 0) {
        console.log(`   Inserted: ${insertedCount}/${allChunks.length} (${Math.round(insertedCount / allChunks.length * 100)}%)`);
      }
    }

    console.log(`\n✅ Successfully inserted ${insertedCount}/${allChunks.length} chunks`);

    // Generate embeddings for chunks
    console.log('\n🧠 Generating embeddings...');
    await generateEmbeddings();

    console.log('\n🎉 Chunking pipeline completed successfully!');

  } catch (error) {
    console.error('❌ Error in chunking pipeline:', error);
  }
}

async function generateEmbeddings(): Promise<void> {
  try {
    // Get chunks without embeddings
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('id, content, chunk_id')
      .is('embedding', null)
      .limit(100); // Process in batches

    if (error) {
      console.error('❌ Error fetching chunks for embedding:', error);
      return;
    }

    if (!chunks || chunks.length === 0) {
      console.log('✅ All chunks already have embeddings');
      return;
    }

    console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);

    let processedCount = 0;

    for (const chunk of chunks) {
      try {
        // Generate embedding
        const embedding = await embeddings.embedQuery(chunk.content);

        // Update chunk with embedding
        const { error: updateError } = await supabase
          .from('document_chunks')
          .update({
            embedding: `[${embedding.join(',')}]`, // PostgreSQL vector format
            embedding_model: 'nomic-embed-text',
            embedding_version: '1.0'
          })
          .eq('id', chunk.id);

        if (updateError) {
          console.error(`❌ Error updating embedding for ${chunk.chunk_id}:`, updateError);
          continue;
        }

        processedCount++;

        if (processedCount % 10 === 0) {
          console.log(`   Embeddings: ${processedCount}/${chunks.length} (${Math.round(processedCount / chunks.length * 100)}%)`);
        }

      } catch (embeddingError) {
        console.error(`❌ Error generating embedding for ${chunk.chunk_id}:`, embeddingError);
      }
    }

    console.log(`✅ Generated ${processedCount}/${chunks.length} embeddings`);

  } catch (error) {
    console.error('❌ Error in embedding generation:', error);
  }
}

// Run the chunking pipeline
processFrameworkData();