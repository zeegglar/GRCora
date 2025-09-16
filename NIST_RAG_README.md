# Multi-Framework RAG Knowledge Base Setup

This document explains how to set up and use the comprehensive Retrieval-Augmented Generation (RAG) system for intelligent compliance guidance across multiple security frameworks.

## Overview

The Multi-Framework RAG system provides:
- **Intelligent querying** across multiple frameworks:
  - NIST Cybersecurity Framework 2.0 (CSF)
  - NIST SP 800-53 Rev 5 Security Controls
  - NIST AI Risk Management Framework 1.0 (AI RMF)
  - CIS Controls Version 8.1.2
  - ISO/IEC 27001:2022 Annex A Controls
- **Vector similarity search** for finding relevant controls across frameworks
- **Cross-framework gap analysis** for comprehensive compliance assessment
- **Contextual recommendations** based on industry, organization size, and framework combinations
- **Implementation roadmaps** with phased approaches across multiple standards

## Quick Start

### 1. Set Up Environment

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For real embeddings (recommended for production)
OPENAI_API_KEY=your-openai-api-key
```

### 2. Apply Database Migration

Run the NIST knowledge base migration to create the necessary tables:

```bash
# If using Supabase CLI
supabase db reset

# Or apply the specific migration
psql -d your_database < supabase/migrations/20250916120000_nist_knowledge_base.sql
```

### 3. Ingest Framework Data

The framework files have been processed and placed in `public/data/`:
- `nist-csf.jsonl` - NIST Cybersecurity Framework 2.0 (108 subcategories)
- `nist-800-53.jsonl` - NIST SP 800-53 Rev 5 Controls (1,006 controls)
- `nist-ai-rmf.jsonl` - NIST AI Risk Management Framework 1.0 (26 controls)
- `cis-v8.jsonl` - CIS Controls Version 8.1.2 (171 safeguards)
- `iso-27001.jsonl` - ISO/IEC 27001:2022 Annex A (93 controls)

**Total: ~1,400+ controls across 5 major frameworks**

Ingest the data into your database:

```bash
npm run ingest-nist
```

### 4. Test the System

Verify the RAG functionality:

```bash
npm run test-rag
```

## File Structure

```
├── public/data/                    # NIST data files
│   ├── nist-csf.jsonl
│   ├── nist-800-53.jsonl
│   └── nist-ai-rmf.jsonl
├── scripts/
│   ├── ingestNistData.ts          # Database ingestion script
│   └── testRag.ts                 # RAG testing script
├── services/
│   └── nistKnowledgeService.ts    # Core RAG service
├── utils/
│   └── nistDataInitializer.ts     # Browser initialization
└── supabase/migrations/
    └── 20250916120000_nist_knowledge_base.sql
```

## Usage Examples

### Basic Query

```typescript
import { nistKnowledgeService } from './services/nistKnowledgeService';

const result = await nistKnowledgeService.queryControls(
  'access control policies',
  ['NIST_CSF', 'NIST_800_53'],
  5
);

console.log(`Found ${result.controls.length} controls`);
console.log('Implementation guidance:', result.suggestedImplementation);
```

### Gap Analysis

```typescript
const gaps = await nistKnowledgeService.performGapAnalysis(
  'project-id',
  ['NIST_CSF', 'NIST_800_53']
);

gaps.forEach(gap => {
  console.log(`${gap.control_id}: ${gap.gap_description}`);
  console.log(`Priority: ${gap.priority}, Effort: ${gap.effort_estimate}`);
});
```

### Contextual Advice

```typescript
const advice = await nistKnowledgeService.getComplianceAdvice(
  'SOC 2 Type II preparation',
  'technology',
  'startup'
);

console.log('Recommendations:', advice.recommendations);
console.log('Implementation phases:', advice.implementation_roadmap);
```

## Data Formats

### NIST CSF 2.0 Format
- Complex nested JSON with elements array
- Contains functions, categories, subcategories, and implementation examples
- Mapped to control families based on function identifiers

### NIST SP 800-53 Format
- Structured controls with IDs, families, titles, and detailed text
- Includes assessment objectives and methods
- Rich guidance and implementation details

### NIST AI RMF Format
- AI-specific governance and risk management controls
- Organized by functions (GOVERN, MAP, MEASURE, MANAGE)
- Focused on AI trustworthiness and risk mitigation

## Architecture

### Vector Embeddings
- **Development**: Mock embeddings generated from SHA256 hash
- **Production**: Use OpenAI, Cohere, or local embedding models
- **Dimensions**: 768 (standard for many models)

### Similarity Search
- **PostgreSQL** with `pgvector` extension
- **Cosine similarity** for vector comparisons
- **Threshold**: 0.7 (adjustable based on needs)

### Database Schema
- `nist_controls`: Core controls with embeddings
- `project_controls`: Implementation status per project
- `ai_knowledge_queries`: Query history and feedback
- Support tables for client collaboration and tracking

## Performance Optimization

### Indexing
- Vector indexes using IVFFlat for fast similarity search
- Standard B-tree indexes on framework, family, and text fields
- Proper foreign key constraints for referential integrity

### Caching
- Browser-side initialization caching
- Query result caching (15-minute TTL)
- Embedding caching to avoid regeneration

### Batch Processing
- Ingestion processes in batches of 50 controls
- Progress tracking and error handling
- Graceful degradation on failures

## Troubleshooting

### Common Issues

1. **No search results**: Check vector similarity threshold
2. **Slow queries**: Verify vector indexes are created
3. **Ingestion fails**: Check Supabase connection and permissions
4. **Empty knowledge base**: Run `npm run ingest-nist`

### Debugging Commands

```bash
# Check ingested data
psql -d your_db -c "SELECT framework, COUNT(*) FROM nist_controls GROUP BY framework;"

# Test vector search function
psql -d your_db -c "SELECT match_nist_controls('{0.1,0.2,0.3,...}', 0.5, 5);"

# Verify embeddings
psql -d your_db -c "SELECT id, title, array_length(embedding, 1) FROM nist_controls LIMIT 5;"
```

## Integration with Client Dashboard

The RAG system integrates with the Enhanced Client Collaboration Dashboard:

1. **AI Compliance Assistant**: Provides real-time guidance
2. **Control Mapping**: Maps project requirements to NIST controls
3. **Gap Analysis**: Automated compliance gap identification
4. **Implementation Planning**: Phased roadmap generation

## Next Steps

1. **Real Embeddings**: Replace mock embeddings with OpenAI or similar
2. **Fine-tuning**: Train custom embeddings on GRC-specific content
3. **Multi-language**: Support for non-English compliance frameworks
4. **Advanced Analytics**: Usage patterns and recommendation improvements

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for detailed error messages
3. Test with the provided `npm run test-rag` script
4. Verify database connectivity and permissions