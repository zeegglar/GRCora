#!/usr/bin/env tsx
import { ChatOllama } from '@langchain/ollama';
import { OllamaEmbeddings } from '@langchain/ollama';
import { createClient } from '@supabase/supabase-js';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

console.log('🚀 ENHANCED RAG SYSTEM WITH LANGCHAIN + OLLAMA\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Ollama models
const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434',
});

const llm = new ChatOllama({
  model: 'mistral:latest', // Using your Mistral model
  baseUrl: 'http://localhost:11434',
  temperature: 0.3, // Lower temperature for more factual responses
});

interface Control {
  id: number;
  control_id: string;
  title: string;
  description: string;
  framework: string;
  family: string;
  similarity?: number;
}

interface ComplianceGuidance {
  query: string;
  applicableControls: Control[];
  requirements: string[];
  implementationSteps: string[];
  auditEvidence: string[];
  sourceQuotes: string[];
  confidence: 'high' | 'medium' | 'low';
  requiresReview: boolean;
}

class EnhancedRAGSystem {
  private supabase: any;
  private embeddings: OllamaEmbeddings;
  private llm: ChatOllama;
  private chain: RunnableSequence;

  constructor() {
    this.supabase = supabase;
    this.embeddings = embeddings;
    this.llm = llm;
    this.chain = this.createRAGChain();
  }

  private createRAGChain() {
    // Template for structured compliance guidance with hallucination prevention
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a GRC (Governance, Risk, and Compliance) expert providing factual guidance based ONLY on the provided controls.

CRITICAL RULES:
1. ONLY use information from the provided controls
2. ALWAYS cite specific control IDs (e.g., "NIST 800-53 AC-2")
3. NEVER add information not present in the controls
4. If information is insufficient, say "Additional analysis required"
5. Use direct quotes when possible

Query: {query}

Relevant Controls Found:
{controls}

Provide a structured response with:

## Applicable Controls
[List each control with ID, title, and framework]

## Key Requirements
[Extract specific requirements from the controls - use direct quotes]

## Implementation Steps
[Based ONLY on guidance in the controls]

## Audit Evidence Needed
[Based ONLY on what's mentioned in the controls]

## Source References
[Direct quotes from controls with control IDs]

## Confidence Level
[high/medium/low based on how well the controls address the query]

Remember: Base your response EXCLUSIVELY on the provided controls. Never add external knowledge.
`);

    return RunnableSequence.from([
      promptTemplate,
      this.llm,
      new StringOutputParser(),
    ]);
  }

  async hybridSearch(query: string, limit: number = 10): Promise<Control[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Call the hybrid search function
      const { data, error } = await this.supabase.rpc('hybrid_search_controls', {
        query_text: query,
        query_embedding: queryEmbedding,
        match_threshold: 0.3, // Lower threshold for more results
        match_count: limit,
        keyword_weight: 0.4,
        semantic_weight: 0.6
      });

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Hybrid search failed:', error);
      return [];
    }
  }

  async generateGuidance(query: string): Promise<ComplianceGuidance> {
    console.log(`🔍 Searching for: "${query}"`);

    // Search for relevant controls
    const controls = await this.hybridSearch(query, 8);

    if (controls.length === 0) {
      return {
        query,
        applicableControls: [],
        requirements: ['No relevant controls found in database'],
        implementationSteps: ['Additional research required'],
        auditEvidence: ['Consult additional compliance frameworks'],
        sourceQuotes: [],
        confidence: 'low',
        requiresReview: true
      };
    }

    console.log(`📋 Found ${controls.length} relevant controls`);

    // Format controls for the prompt
    const formattedControls = controls
      .map((control, index) => `
${index + 1}. Control: ${control.control_id}
   Framework: ${control.framework}
   Title: ${control.title}
   Description: ${control.description}
   Similarity: ${(control.similarity * 100).toFixed(1)}%
`)
      .join('\n');

    // Generate structured guidance using LLM
    console.log('🤖 Generating compliance guidance...');

    const response = await this.chain.invoke({
      query,
      controls: formattedControls
    });

    // Determine confidence and review requirements
    const avgSimilarity = controls.reduce((sum, c) => sum + (c.similarity || 0), 0) / controls.length;
    const confidence = avgSimilarity > 0.7 ? 'high' : avgSimilarity > 0.4 ? 'medium' : 'low';
    const requiresReview = query.toLowerCase().includes('audit') ||
                          query.toLowerCase().includes('certification') ||
                          confidence === 'low';

    return {
      query,
      applicableControls: controls,
      requirements: this.extractSection(response, 'Key Requirements'),
      implementationSteps: this.extractSection(response, 'Implementation Steps'),
      auditEvidence: this.extractSection(response, 'Audit Evidence Needed'),
      sourceQuotes: this.extractSection(response, 'Source References'),
      confidence,
      requiresReview
    };
  }

  private extractSection(response: string, sectionTitle: string): string[] {
    const lines = response.split('\n');
    const sectionIndex = lines.findIndex(line => line.includes(sectionTitle));

    if (sectionIndex === -1) return [];

    const sectionLines = [];
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('##')) break; // Next section
      if (line && !line.startsWith('#')) {
        sectionLines.push(line.replace(/^[-*•]\s*/, ''));
      }
    }

    return sectionLines.filter(line => line.length > 0);
  }

  async testQueries() {
    const testQueries = [
      'access control for financial services',
      'incident response for healthcare HIPAA',
      'AI governance and risk management',
      'encryption requirements for PCI DSS',
      'vulnerability management for SOC 2'
    ];

    console.log('🧪 TESTING ENHANCED RAG SYSTEM\n');

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎯 TEST ${i + 1}: ${query.toUpperCase()}`);
      console.log('='.repeat(80));

      try {
        const guidance = await this.generateGuidance(query);

        console.log(`\n📊 **Results Summary:**`);
        console.log(`   Controls Found: ${guidance.applicableControls.length}`);
        console.log(`   Confidence: ${guidance.confidence}`);
        console.log(`   Requires Review: ${guidance.requiresReview ? 'Yes' : 'No'}`);

        console.log(`\n🎯 **Top Controls:**`);
        guidance.applicableControls.slice(0, 3).forEach((control, idx) => {
          console.log(`   ${idx + 1}. [${control.framework}] ${control.control_id}: ${control.title}`);
          console.log(`      Similarity: ${((control.similarity || 0) * 100).toFixed(1)}%`);
        });

        console.log(`\n📋 **Key Requirements (${guidance.requirements.length}):**`);
        guidance.requirements.slice(0, 3).forEach((req, idx) => {
          console.log(`   ${idx + 1}. ${req.substring(0, 100)}...`);
        });

        console.log(`\n🚀 **Implementation Steps (${guidance.implementationSteps.length}):**`);
        guidance.implementationSteps.slice(0, 3).forEach((step, idx) => {
          console.log(`   ${idx + 1}. ${step.substring(0, 100)}...`);
        });

        if (guidance.requiresReview) {
          console.log(`\n⚠️  **Review Required**: ${guidance.confidence} confidence - manual review recommended`);
        }

      } catch (error) {
        console.error(`❌ Test failed for "${query}":`, error);
      }
    }

    console.log(`\n\n🎉 **ENHANCED RAG TESTING COMPLETE**`);
    console.log(`   🤖 LLM: Mistral (local Ollama)`);
    console.log(`   🔍 Search: Hybrid (keyword + semantic)`);
    console.log(`   🛡️  Hallucination Prevention: Source attribution + confidence scoring`);
    console.log(`   📊 Database: ${await this.getControlCount()} controls with embeddings`);
  }

  private async getControlCount(): Promise<number> {
    const { count } = await this.supabase
      .from('nist_controls')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    return count || 0;
  }
}

async function main() {
  const ragSystem = new EnhancedRAGSystem();
  await ragSystem.testQueries();
}

main().catch(console.error);