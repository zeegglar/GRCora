-- Enhanced document_chunks table for RAG pipeline
-- Supports chunking with proper metadata, embeddings, and tenant isolation

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content fields
  chunk_id TEXT NOT NULL UNIQUE, -- Format: {framework}_{control_id}_{chunk_index}
  content TEXT NOT NULL,
  heading TEXT, -- Preserved heading context
  token_count INTEGER NOT NULL,

  -- Metadata for RAG pipeline
  framework TEXT NOT NULL, -- NIST-CSF-2.0, NIST-800-53, etc.
  control_id TEXT, -- AC-2, ID.AM-1, etc.
  section TEXT, -- Section within document
  version TEXT NOT NULL DEFAULT '1.0',
  document_type TEXT NOT NULL DEFAULT 'control', -- control, policy, questionnaire

  -- Chunking metadata
  chunk_index INTEGER NOT NULL DEFAULT 0, -- 0-based chunk position
  parent_chunk_id TEXT, -- For hierarchical chunking
  overlap_start INTEGER DEFAULT 0, -- Token overlap with previous chunk
  overlap_end INTEGER DEFAULT 0, -- Token overlap with next chunk

  -- Tenant isolation
  tenant_id UUID, -- For multi-tenant support

  -- Vector embeddings
  embedding vector(768), -- nomic-embed-text dimensions

  -- Indexing and caching
  embedding_model TEXT DEFAULT 'nomic-embed-text',
  embedding_version TEXT DEFAULT '1.0',
  bm25_tokens TSVECTOR, -- For hybrid search

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  CONSTRAINT chunk_token_count_check CHECK (token_count >= 100 AND token_count <= 1500),
  CONSTRAINT chunk_overlap_check CHECK (overlap_start >= 0 AND overlap_end >= 0)
);

-- Indexes for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_document_chunks_framework ON document_chunks(framework);
CREATE INDEX IF NOT EXISTS idx_document_chunks_control_id ON document_chunks(control_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant ON document_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_id ON document_chunks(chunk_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_updated_at ON document_chunks(updated_at);

-- Vector similarity index for ANN search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search index for BM25
CREATE INDEX IF NOT EXISTS idx_document_chunks_bm25 ON document_chunks USING gin(bm25_tokens);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_document_chunks_framework_tenant ON document_chunks(framework, tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_updated ON document_chunks(tenant_id, updated_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_chunks_updated_at
    BEFORE UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically generate BM25 tokens
CREATE OR REPLACE FUNCTION update_bm25_tokens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bm25_tokens = to_tsvector('english', COALESCE(NEW.content, '') || ' ' || COALESCE(NEW.heading, ''));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_chunks_bm25
    BEFORE INSERT OR UPDATE OF content, heading ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_bm25_tokens();

-- Query cache table for performance
CREATE TABLE IF NOT EXISTS rag_query_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Query identification
  query_hash TEXT NOT NULL UNIQUE, -- SHA-256 of normalized query + filters
  query_text TEXT NOT NULL,
  filters JSONB DEFAULT '{}', -- Framework, tenant_id, date_range filters

  -- Cached results
  retrieved_chunks JSONB NOT NULL, -- Array of chunk IDs and relevance scores
  context_template TEXT NOT NULL, -- Pre-formatted context with citations

  -- Cache metadata
  tenant_id UUID,
  hit_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) + INTERVAL '1 hour' NOT NULL
);

-- Indexes for query cache
CREATE INDEX IF NOT EXISTS idx_rag_query_cache_hash ON rag_query_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_rag_query_cache_tenant ON rag_query_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_query_cache_expires ON rag_query_cache(expires_at);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rag_query_cache WHERE expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE document_chunks IS 'Chunked documents for RAG pipeline with vector embeddings and metadata';
COMMENT ON COLUMN document_chunks.chunk_id IS 'Unique identifier: {framework}_{control_id}_{chunk_index}';
COMMENT ON COLUMN document_chunks.token_count IS 'Number of tokens in chunk (600-1200 range)';
COMMENT ON COLUMN document_chunks.overlap_start IS 'Overlap tokens with previous chunk (80-120 range)';
COMMENT ON COLUMN document_chunks.overlap_end IS 'Overlap tokens with next chunk (80-120 range)';
COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding for semantic search (768 dimensions)';
COMMENT ON COLUMN document_chunks.bm25_tokens IS 'Preprocessed tokens for BM25 full-text search';

COMMENT ON TABLE rag_query_cache IS 'Query result cache for RAG pipeline performance optimization';
COMMENT ON COLUMN rag_query_cache.query_hash IS 'SHA-256 hash of normalized query + filters for deduplication';
COMMENT ON COLUMN rag_query_cache.retrieved_chunks IS 'Cached chunk IDs with relevance scores';
COMMENT ON COLUMN rag_query_cache.context_template IS 'Pre-formatted context with inline citations';