import { createClient } from '@supabase/supabase-js';
import { OllamaEmbeddings } from '@langchain/ollama';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

interface RetrievalFilters {
  tenant_id?: string;
  framework?: string[];
  date_range?: {
    start: Date;
    end: Date;
  };
  document_types?: string[];
}

interface RetrievalResult {
  chunk_id: string;
  content: string;
  heading?: string;
  framework: string;
  control_id?: string;
  section?: string;
  relevance_score: number;
  score_breakdown: {
    semantic_score: number;
    bm25_score: number;
    combined_score: number;
  };
  citation: string;
}

interface ContextTemplate {
  query: string;
  retrieved_chunks: RetrievalResult[];
  context_text: string;
  citations: string[];
  total_chunks: number;
  avg_relevance: number;
  confidence: 'high' | 'medium' | 'low';
}

export class HybridRetrievalService {
  private static instance: HybridRetrievalService;
  private supabase: any;
  private embeddings: OllamaEmbeddings;
  private relevanceThreshold: number = 0.35; // Cosine similarity threshold
  private maxChunks: number = 12; // ANN top-k
  private rerankedChunks: number = 6; // Final re-ranked results

  private constructor() {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: 'http://localhost:11434',
    });
  }

  public static getInstance(): HybridRetrievalService {
    if (!HybridRetrievalService.instance) {
      HybridRetrievalService.instance = new HybridRetrievalService();
    }
    return HybridRetrievalService.instance;
  }

  /**
   * Main hybrid retrieval method combining ANN and BM25
   */
  async retrieveRelevantChunks(
    query: string,
    filters: RetrievalFilters = {},
    useCache: boolean = true
  ): Promise<ContextTemplate> {
    console.log('🔍 Starting hybrid retrieval...');

    // Check cache first
    if (useCache) {
      const cached = await this.getCachedResult(query, filters);
      if (cached) {
        console.log('💾 Cache hit - returning cached result');
        return cached;
      }
    }

    // Step 1: Generate query embedding for semantic search
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Step 2: Perform ANN (semantic) search
    const semanticResults = await this.performSemanticSearch(
      queryEmbedding,
      filters,
      this.maxChunks
    );

    console.log(`🧠 Semantic search found ${semanticResults.length} chunks`);

    // Step 3: Perform BM25 (keyword) search
    const bm25Results = await this.performBM25Search(
      query,
      filters,
      this.maxChunks
    );

    console.log(`📝 BM25 search found ${bm25Results.length} chunks`);

    // Step 4: Combine and re-rank results
    const combinedResults = await this.combineAndRerank(
      semanticResults,
      bm25Results,
      query
    );

    console.log(`🎯 Re-ranked to ${combinedResults.length} final chunks`);

    // Step 5: Apply relevance threshold and fallback
    const filteredResults = this.applyRelevanceThreshold(combinedResults);

    // Step 6: Generate context template with citations
    const contextTemplate = this.generateContextTemplate(query, filteredResults);

    // Step 7: Cache result if valid
    if (useCache && filteredResults.length > 0) {
      await this.cacheResult(query, filters, contextTemplate);
    }

    return contextTemplate;
  }

  /**
   * Semantic search using pgvector ANN
   */
  private async performSemanticSearch(
    queryEmbedding: number[],
    filters: RetrievalFilters,
    limit: number
  ): Promise<Array<RetrievalResult>> {
    try {
      let query = this.supabase
        .from('document_chunks')
        .select(`
          chunk_id,
          content,
          heading,
          framework,
          control_id,
          section,
          embedding
        `)
        .not('embedding', 'is', null)
        .limit(limit);

      // Apply filters
      query = this.applyFilters(query, filters);

      // Use RPC for vector similarity search (more efficient)
      const { data, error } = await this.supabase.rpc('match_chunks_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: this.relevanceThreshold,
        match_count: limit,
        tenant_filter: filters.tenant_id,
        framework_filter: filters.framework
      });

      if (error) {
        console.error('❌ Semantic search error:', error);
        return [];
      }

      return (data || []).map((chunk: any) => ({
        chunk_id: chunk.chunk_id,
        content: chunk.content,
        heading: chunk.heading,
        framework: chunk.framework,
        control_id: chunk.control_id,
        section: chunk.section,
        relevance_score: chunk.similarity,
        score_breakdown: {
          semantic_score: chunk.similarity,
          bm25_score: 0,
          combined_score: chunk.similarity
        },
        citation: this.generateCitation(chunk)
      }));

    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  /**
   * BM25 full-text search using PostgreSQL tsvector
   */
  private async performBM25Search(
    query: string,
    filters: RetrievalFilters,
    limit: number
  ): Promise<Array<RetrievalResult>> {
    try {
      const searchQuery = query
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .split(/\s+/)
        .filter(word => word.length > 2)
        .join(' & '); // Create tsquery format

      let dbQuery = this.supabase
        .from('document_chunks')
        .select(`
          chunk_id,
          content,
          heading,
          framework,
          control_id,
          section,
          ts_rank(bm25_tokens, plainto_tsquery('english', $1)) as bm25_score
        `, [searchQuery])
        .textSearch('bm25_tokens', searchQuery, {
          type: 'plain',
          config: 'english'
        })
        .order('bm25_score', { ascending: false })
        .limit(limit);

      // Apply filters
      dbQuery = this.applyFilters(dbQuery, filters);

      const { data, error } = await dbQuery;

      if (error) {
        console.error('❌ BM25 search error:', error);
        return [];
      }

      return (data || []).map((chunk: any) => ({
        chunk_id: chunk.chunk_id,
        content: chunk.content,
        heading: chunk.heading,
        framework: chunk.framework,
        control_id: chunk.control_id,
        section: chunk.section,
        relevance_score: chunk.bm25_score,
        score_breakdown: {
          semantic_score: 0,
          bm25_score: chunk.bm25_score,
          combined_score: chunk.bm25_score
        },
        citation: this.generateCitation(chunk)
      }));

    } catch (error) {
      console.error('❌ BM25 search failed:', error);
      return [];
    }
  }

  /**
   * Apply query filters to Supabase query
   */
  private applyFilters(query: any, filters: RetrievalFilters): any {
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }

    if (filters.framework && filters.framework.length > 0) {
      query = query.in('framework', filters.framework);
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString());
    }

    if (filters.document_types && filters.document_types.length > 0) {
      query = query.in('document_type', filters.document_types);
    }

    return query;
  }

  /**
   * Combine semantic and BM25 results with intelligent re-ranking
   */
  private async combineAndRerank(
    semanticResults: RetrievalResult[],
    bm25Results: RetrievalResult[],
    query: string
  ): Promise<RetrievalResult[]> {
    const combinedMap = new Map<string, RetrievalResult>();

    // Add semantic results
    semanticResults.forEach(result => {
      combinedMap.set(result.chunk_id, result);
    });

    // Merge BM25 results
    bm25Results.forEach(bm25Result => {
      const existing = combinedMap.get(bm25Result.chunk_id);
      if (existing) {
        // Combine scores for chunks found in both searches
        existing.score_breakdown.bm25_score = bm25Result.score_breakdown.bm25_score;
        existing.score_breakdown.combined_score = this.calculateCombinedScore(
          existing.score_breakdown.semantic_score,
          bm25Result.score_breakdown.bm25_score
        );
        existing.relevance_score = existing.score_breakdown.combined_score;
      } else {
        // Add BM25-only results
        combinedMap.set(bm25Result.chunk_id, bm25Result);
      }
    });

    // Sort by combined score and return top results
    const sortedResults = Array.from(combinedMap.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, this.rerankedChunks);

    return sortedResults;
  }

  /**
   * Calculate combined score using weighted average
   */
  private calculateCombinedScore(semanticScore: number, bm25Score: number): number {
    const semanticWeight = 0.7; // Favor semantic similarity
    const bm25Weight = 0.3;

    return (semanticScore * semanticWeight) + (bm25Score * bm25Weight);
  }

  /**
   * Apply relevance threshold and implement fallback logic
   */
  private applyRelevanceThreshold(results: RetrievalResult[]): RetrievalResult[] {
    const filteredResults = results.filter(
      result => result.relevance_score >= this.relevanceThreshold
    );

    if (filteredResults.length === 0) {
      console.log('⚠️  No results above relevance threshold - applying fallback');

      // Fallback: Return top 2 results even if below threshold
      return results.slice(0, 2).map(result => ({
        ...result,
        citation: result.citation + ' [LOW_CONFIDENCE]'
      }));
    }

    return filteredResults;
  }

  /**
   * Generate structured context template with inline citations
   */
  private generateContextTemplate(
    query: string,
    results: RetrievalResult[]
  ): ContextTemplate {
    if (results.length === 0) {
      return {
        query,
        retrieved_chunks: [],
        context_text: 'No relevant information found for your query. Please try rephrasing or contact a compliance expert.',
        citations: [],
        total_chunks: 0,
        avg_relevance: 0,
        confidence: 'low'
      };
    }

    // Build context with inline citations
    let contextText = `Based on the following compliance framework documentation:\n\n`;
    const citations: string[] = [];

    results.forEach((result, index) => {
      const citationIndex = index + 1;

      // Add chunk content with citation marker
      contextText += `[${citationIndex}] ${result.heading ? result.heading + ': ' : ''}${result.content}\n\n`;

      // Build citation reference
      citations.push(`[${citationIndex}] ${result.citation}`);
    });

    // Add citation references at the end
    contextText += `\nSources:\n${citations.join('\n')}`;

    const avgRelevance = results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length;
    const confidence: 'high' | 'medium' | 'low' =
      avgRelevance > 0.8 ? 'high' :
      avgRelevance > 0.5 ? 'medium' : 'low';

    return {
      query,
      retrieved_chunks: results,
      context_text: contextText,
      citations,
      total_chunks: results.length,
      avg_relevance: avgRelevance,
      confidence
    };
  }

  /**
   * Generate citation for a chunk
   */
  private generateCitation(chunk: any): string {
    const parts = [chunk.framework];

    if (chunk.control_id) {
      parts.push(chunk.control_id);
    }

    if (chunk.section) {
      parts.push(chunk.section);
    }

    return parts.join(' - ');
  }

  /**
   * Cache query results for performance
   */
  private async cacheResult(
    query: string,
    filters: RetrievalFilters,
    contextTemplate: ContextTemplate
  ): Promise<void> {
    try {
      const queryHash = this.generateQueryHash(query, filters);

      const { error } = await this.supabase
        .from('rag_query_cache')
        .upsert({
          query_hash: queryHash,
          query_text: query,
          filters: filters,
          retrieved_chunks: contextTemplate.retrieved_chunks,
          context_template: contextTemplate.context_text,
          tenant_id: filters.tenant_id,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        });

      if (error) {
        console.error('⚠️  Cache storage failed:', error);
      }
    } catch (error) {
      console.error('⚠️  Cache storage error:', error);
    }
  }

  /**
   * Retrieve cached query results
   */
  private async getCachedResult(
    query: string,
    filters: RetrievalFilters
  ): Promise<ContextTemplate | null> {
    try {
      const queryHash = this.generateQueryHash(query, filters);

      const { data, error } = await this.supabase
        .from('rag_query_cache')
        .select('*')
        .eq('query_hash', queryHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Update hit count and last accessed
      await this.supabase
        .from('rag_query_cache')
        .update({
          hit_count: data.hit_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('id', data.id);

      return {
        query: data.query_text,
        retrieved_chunks: data.retrieved_chunks,
        context_text: data.context_template,
        citations: data.retrieved_chunks.map((chunk: any) => chunk.citation),
        total_chunks: data.retrieved_chunks.length,
        avg_relevance: data.retrieved_chunks.reduce((sum: number, chunk: any) => sum + chunk.relevance_score, 0) / data.retrieved_chunks.length,
        confidence: data.retrieved_chunks.length > 0 ? 'high' : 'low'
      };

    } catch (error) {
      console.error('⚠️  Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Generate hash for query + filters combination
   */
  private generateQueryHash(query: string, filters: RetrievalFilters): string {
    const normalizedQuery = query.toLowerCase().trim();
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    const combined = normalizedQuery + '|' + filterString;

    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Invalidate cache for specific tenant when new content is ingested
   */
  async invalidateCacheForTenant(tenantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rag_query_cache')
        .delete()
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('⚠️  Cache invalidation failed:', error);
      } else {
        console.log(`🗑️  Invalidated cache for tenant: ${tenantId}`);
      }
    } catch (error) {
      console.error('⚠️  Cache invalidation error:', error);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('cleanup_expired_cache');

      if (error) {
        console.error('⚠️  Cache cleanup failed:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('⚠️  Cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * Update retrieval configuration
   */
  updateConfig(config: {
    relevanceThreshold?: number;
    maxChunks?: number;
    rerankedChunks?: number;
  }): void {
    if (config.relevanceThreshold !== undefined) {
      this.relevanceThreshold = Math.max(0, Math.min(1, config.relevanceThreshold));
    }
    if (config.maxChunks !== undefined) {
      this.maxChunks = Math.max(1, config.maxChunks);
    }
    if (config.rerankedChunks !== undefined) {
      this.rerankedChunks = Math.max(1, config.rerankedChunks);
    }

    console.log('🔧 Updated retrieval config:', {
      relevanceThreshold: this.relevanceThreshold,
      maxChunks: this.maxChunks,
      rerankedChunks: this.rerankedChunks
    });
  }
}

export default HybridRetrievalService;