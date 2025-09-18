-- Fix embedding column dimension for nomic-embed-text (768 dimensions)

-- Drop existing embedding column and index
DROP INDEX IF EXISTS idx_nist_controls_embedding;
ALTER TABLE public.nist_controls DROP COLUMN IF EXISTS embedding;

-- Add new embedding column with correct dimensions
ALTER TABLE public.nist_controls
ADD COLUMN embedding vector(768); -- nomic-embed-text uses 768 dimensions

-- Create index for vector similarity search
CREATE INDEX idx_nist_controls_embedding
ON public.nist_controls USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update hybrid search function with correct dimensions
CREATE OR REPLACE FUNCTION hybrid_search_controls(
  query_text TEXT,
  query_embedding VECTOR(768), -- Updated to 768 dimensions
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  keyword_weight FLOAT DEFAULT 0.3,
  semantic_weight FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id BIGINT,
  control_id TEXT,
  title TEXT,
  description TEXT,
  framework TEXT,
  family TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nc.id,
    nc.control_id,
    nc.title,
    nc.description,
    nc.framework,
    nc.family,
    (
      -- Combine keyword and semantic scores
      (CASE
        WHEN query_text IS NOT NULL AND (
          nc.title ILIKE '%' || query_text || '%' OR
          nc.description ILIKE '%' || query_text || '%'
        ) THEN keyword_weight
        ELSE 0
      END) +
      (CASE
        WHEN nc.embedding IS NOT NULL
        THEN semantic_weight * (1 - (nc.embedding <=> query_embedding))
        ELSE 0
      END)
    ) AS similarity
  FROM public.nist_controls nc
  WHERE
    (query_text IS NULL OR nc.title ILIKE '%' || query_text || '%' OR nc.description ILIKE '%' || query_text || '%')
    AND (nc.embedding IS NULL OR 1 - (nc.embedding <=> query_embedding) > match_threshold)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;