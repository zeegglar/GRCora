-- SQL functions for enhanced RAG pipeline

-- Function for semantic similarity search with pgvector
CREATE OR REPLACE FUNCTION match_chunks_semantic(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 12,
  tenant_filter uuid DEFAULT NULL,
  framework_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id text,
  content text,
  heading text,
  framework text,
  control_id text,
  section text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.chunk_id,
    dc.content,
    dc.heading,
    dc.framework,
    dc.control_id,
    dc.section,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE
    dc.embedding IS NOT NULL
    AND (tenant_filter IS NULL OR dc.tenant_id = tenant_filter)
    AND (framework_filter IS NULL OR dc.framework = ANY(framework_filter))
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function for BM25 text search with ranking
CREATE OR REPLACE FUNCTION match_chunks_bm25(
  query_text text,
  match_count int DEFAULT 12,
  tenant_filter uuid DEFAULT NULL,
  framework_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id text,
  content text,
  heading text,
  framework text,
  control_id text,
  section text,
  bm25_score float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.chunk_id,
    dc.content,
    dc.heading,
    dc.framework,
    dc.control_id,
    dc.section,
    ts_rank(dc.bm25_tokens, plainto_tsquery('english', query_text)) AS bm25_score
  FROM document_chunks dc
  WHERE
    dc.bm25_tokens @@ plainto_tsquery('english', query_text)
    AND (tenant_filter IS NULL OR dc.tenant_id = tenant_filter)
    AND (framework_filter IS NULL OR dc.framework = ANY(framework_filter))
  ORDER BY ts_rank(dc.bm25_tokens, plainto_tsquery('english', query_text)) DESC
  LIMIT match_count;
$$;

-- Function for hybrid search combining semantic and BM25
CREATE OR REPLACE FUNCTION match_chunks_hybrid(
  query_text text,
  query_embedding vector(768),
  semantic_weight float DEFAULT 0.7,
  bm25_weight float DEFAULT 0.3,
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 6,
  tenant_filter uuid DEFAULT NULL,
  framework_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id text,
  content text,
  heading text,
  framework text,
  control_id text,
  section text,
  combined_score float,
  semantic_score float,
  bm25_score float
)
LANGUAGE sql STABLE
AS $$
  WITH semantic_results AS (
    SELECT
      dc.chunk_id,
      dc.content,
      dc.heading,
      dc.framework,
      dc.control_id,
      dc.section,
      1 - (dc.embedding <=> query_embedding) AS semantic_score,
      0::float AS bm25_score
    FROM document_chunks dc
    WHERE
      dc.embedding IS NOT NULL
      AND (tenant_filter IS NULL OR dc.tenant_id = tenant_filter)
      AND (framework_filter IS NULL OR dc.framework = ANY(framework_filter))
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  bm25_results AS (
    SELECT
      dc.chunk_id,
      dc.content,
      dc.heading,
      dc.framework,
      dc.control_id,
      dc.section,
      0::float AS semantic_score,
      ts_rank(dc.bm25_tokens, plainto_tsquery('english', query_text)) AS bm25_score
    FROM document_chunks dc
    WHERE
      dc.bm25_tokens @@ plainto_tsquery('english', query_text)
      AND (tenant_filter IS NULL OR dc.tenant_id = tenant_filter)
      AND (framework_filter IS NULL OR dc.framework = ANY(framework_filter))
    ORDER BY ts_rank(dc.bm25_tokens, plainto_tsquery('english', query_text)) DESC
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT
      COALESCE(s.chunk_id, b.chunk_id) AS chunk_id,
      COALESCE(s.content, b.content) AS content,
      COALESCE(s.heading, b.heading) AS heading,
      COALESCE(s.framework, b.framework) AS framework,
      COALESCE(s.control_id, b.control_id) AS control_id,
      COALESCE(s.section, b.section) AS section,
      COALESCE(s.semantic_score, 0) AS semantic_score,
      COALESCE(b.bm25_score, 0) AS bm25_score
    FROM semantic_results s
    FULL OUTER JOIN bm25_results b ON s.chunk_id = b.chunk_id
  )
  SELECT
    chunk_id,
    content,
    heading,
    framework,
    control_id,
    section,
    (semantic_score * semantic_weight + bm25_score * bm25_weight) AS combined_score,
    semantic_score,
    bm25_score
  FROM combined
  WHERE (semantic_score * semantic_weight + bm25_score * bm25_weight) > match_threshold
  ORDER BY combined_score DESC
  LIMIT match_count;
$$;

-- Function to get chunk statistics for monitoring
CREATE OR REPLACE FUNCTION get_chunk_statistics(
  tenant_filter uuid DEFAULT NULL,
  framework_filter text[] DEFAULT NULL
)
RETURNS TABLE (
  framework text,
  total_chunks bigint,
  chunks_with_embeddings bigint,
  avg_token_count numeric,
  last_updated timestamp with time zone
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.framework,
    COUNT(*) AS total_chunks,
    COUNT(dc.embedding) AS chunks_with_embeddings,
    AVG(dc.token_count) AS avg_token_count,
    MAX(dc.updated_at) AS last_updated
  FROM document_chunks dc
  WHERE
    (tenant_filter IS NULL OR dc.tenant_id = tenant_filter)
    AND (framework_filter IS NULL OR dc.framework = ANY(framework_filter))
  GROUP BY dc.framework
  ORDER BY dc.framework;
$$;

-- Function to cleanup expired cache entries (enhanced)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired entries
    DELETE FROM rag_query_cache
    WHERE expires_at < timezone('utc'::text, now());

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Also cleanup entries that haven't been accessed in 24 hours and have low hit counts
    DELETE FROM rag_query_cache
    WHERE last_accessed < timezone('utc'::text, now()) - INTERVAL '24 hours'
    AND hit_count < 3;

    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to get query cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics(
  tenant_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  total_entries bigint,
  active_entries bigint,
  expired_entries bigint,
  avg_hit_count numeric,
  cache_hit_rate numeric
)
LANGUAGE sql STABLE
AS $$
  WITH cache_stats AS (
    SELECT
      COUNT(*) AS total_entries,
      COUNT(CASE WHEN expires_at > timezone('utc'::text, now()) THEN 1 END) AS active_entries,
      COUNT(CASE WHEN expires_at <= timezone('utc'::text, now()) THEN 1 END) AS expired_entries,
      AVG(hit_count) AS avg_hit_count
    FROM rag_query_cache
    WHERE (tenant_filter IS NULL OR tenant_id = tenant_filter)
  )
  SELECT
    total_entries,
    active_entries,
    expired_entries,
    avg_hit_count,
    CASE
      WHEN total_entries > 0 THEN (active_entries::numeric / total_entries::numeric) * 100
      ELSE 0
    END AS cache_hit_rate
  FROM cache_stats;
$$;

-- Function to invalidate cache for tenant and framework
CREATE OR REPLACE FUNCTION invalidate_cache_for_framework(
  target_framework text,
  tenant_filter uuid DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rag_query_cache
    WHERE (tenant_filter IS NULL OR tenant_id = tenant_filter)
    AND (
      filters->>'framework' LIKE '%' || target_framework || '%'
      OR filters->'framework' @> to_jsonb(ARRAY[target_framework])
    );

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create an optimized index for hybrid search
CREATE INDEX IF NOT EXISTS idx_document_chunks_hybrid_search
ON document_chunks(framework, tenant_id, updated_at)
WHERE embedding IS NOT NULL;

-- Create an index for BM25 search with framework filter
CREATE INDEX IF NOT EXISTS idx_document_chunks_bm25_framework
ON document_chunks USING gin(bm25_tokens);

-- Create separate index for framework filtering
CREATE INDEX IF NOT EXISTS idx_document_chunks_framework_filter
ON document_chunks(framework) WHERE bm25_tokens IS NOT NULL;

-- Function to update chunk embedding and BM25 tokens
CREATE OR REPLACE FUNCTION update_chunk_search_data(
  chunk_id_param text,
  embedding_param vector(768),
  content_param text,
  heading_param text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE document_chunks
  SET
    embedding = embedding_param,
    bm25_tokens = to_tsvector('english', COALESCE(content_param, '') || ' ' || COALESCE(heading_param, '')),
    updated_at = timezone('utc'::text, now())
  WHERE chunk_id = chunk_id_param;

  RETURN FOUND;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON FUNCTION match_chunks_semantic IS 'Performs semantic similarity search using pgvector with configurable threshold and filters';
COMMENT ON FUNCTION match_chunks_bm25 IS 'Performs BM25 full-text search with PostgreSQL tsvector and ranking';
COMMENT ON FUNCTION match_chunks_hybrid IS 'Combines semantic and BM25 search with weighted scoring for optimal relevance';
COMMENT ON FUNCTION get_chunk_statistics IS 'Returns statistics about document chunks for monitoring and analytics';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries and low-usage entries to maintain performance';
COMMENT ON FUNCTION get_cache_statistics IS 'Provides insights into query cache performance and hit rates';
COMMENT ON FUNCTION invalidate_cache_for_framework IS 'Selectively invalidates cached queries for specific frameworks when content is updated';