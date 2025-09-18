-- Create hybrid search function for cloud Supabase
-- Run this in your Supabase SQL Editor to enable vector + keyword search

CREATE OR REPLACE FUNCTION hybrid_search_controls(
  query_text TEXT DEFAULT NULL,
  query_embedding VECTOR(768) DEFAULT NULL,
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
        WHEN query_embedding IS NOT NULL AND nc.embedding IS NOT NULL
        THEN semantic_weight * (1 - (nc.embedding <=> query_embedding))
        ELSE 0
      END)
    ) AS similarity
  FROM public.nist_controls nc
  WHERE
    (query_text IS NULL OR nc.title ILIKE '%' || query_text || '%' OR nc.description ILIKE '%' || query_text || '%')
    AND (query_embedding IS NULL OR nc.embedding IS NULL OR 1 - (nc.embedding <=> query_embedding) > match_threshold)
    AND nc.control_id != 'TEST-001' -- Exclude test record
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION hybrid_search_controls TO authenticated, anon, service_role;

-- Test the function with a simple query
-- SELECT control_id, title, framework, similarity
-- FROM hybrid_search_controls(
--   query_text := 'access control',
--   match_count := 5
-- );