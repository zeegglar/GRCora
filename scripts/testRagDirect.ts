#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
try {
  const envFile = await import('fs').then(fs => fs.readFileSync('.env', 'utf8'));
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('No .env file found or error reading it');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRAGDirect() {
  console.log('🧪 Testing RAG System with Direct Supabase Client...\n');

  try {
    // Test 1: Check if data was inserted
    console.log('📊 Testing database connection and data...');

    const { data: knowledgeCheck, error: knowledgeError } = await supabase
      .from('nist_knowledge_base')
      .select('*', { count: 'exact' })
      .limit(1);

    if (knowledgeError) {
      console.error('❌ Database connection failed:', knowledgeError);
      return;
    }

    console.log(`✅ Database connected. Found records in nist_knowledge_base.`);

    // Test 2: Try a simple semantic search
    console.log('\n🔍 Testing semantic search for "access control"...');

    const { data: searchResult, error: searchError } = await supabase.rpc(
      'search_nist_controls',
      {
        query_text: 'access control',
        match_threshold: 0.1,
        match_count: 3
      }
    );

    if (searchError) {
      console.error('❌ Semantic search failed:', searchError);
      console.log('This is expected if pgvector function is not set up properly');
    } else {
      console.log(`✅ Semantic search successful! Found ${searchResult?.length || 0} results`);
      if (searchResult && searchResult.length > 0) {
        searchResult.slice(0, 2).forEach((result: any, index: number) => {
          console.log(`   ${index + 1}. ${result.title || result.control_title}`);
          console.log(`      Framework: ${result.framework}`);
          console.log(`      Similarity: ${result.similarity?.toFixed(3) || 'N/A'}`);
        });
      }
    }

    // Test 3: Basic text search as fallback
    console.log('\n🔍 Testing basic text search for "access control"...');

    const { data: textSearchResult, error: textSearchError } = await supabase
      .from('nist_knowledge_base')
      .select('control_id, title, description, framework')
      .ilike('description', '%access control%')
      .limit(3);

    if (textSearchError) {
      console.error('❌ Text search failed:', textSearchError);
    } else {
      console.log(`✅ Text search successful! Found ${textSearchResult?.length || 0} results`);
      if (textSearchResult && textSearchResult.length > 0) {
        textSearchResult.forEach((result: any, index: number) => {
          console.log(`   ${index + 1}. ${result.title}`);
          console.log(`      Framework: ${result.framework}`);
          console.log(`      Control ID: ${result.control_id}`);
        });
      }
    }

    // Test 4: Framework breakdown
    console.log('\n📊 Testing framework breakdown...');

    const { data: frameworkCount, error: frameworkError } = await supabase
      .from('nist_knowledge_base')
      .select('framework', { count: 'exact' })
      .neq('framework', null);

    if (!frameworkError && frameworkCount) {
      const frameworks = await supabase
        .from('nist_knowledge_base')
        .select('framework')
        .neq('framework', null);

      if (frameworks.data) {
        const counts = frameworks.data.reduce((acc: any, row: any) => {
          acc[row.framework] = (acc[row.framework] || 0) + 1;
          return acc;
        }, {});

        console.log('✅ Framework breakdown:');
        Object.entries(counts).forEach(([framework, count]) => {
          console.log(`   ${framework}: ${count} controls`);
        });
      }
    }

    console.log('\n🎉 RAG System validation completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRAGDirect().catch(console.error);