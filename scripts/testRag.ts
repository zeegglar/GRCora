#!/usr/bin/env tsx
import { nistKnowledgeService } from '../services/nistKnowledgeService.js';

async function testRAG() {
  console.log('🧪 Testing NIST RAG Functionality...\n');

  const testQueries = [
    'access control policies',
    'incident response planning',
    'data encryption requirements',
    'AI governance principles',
    'vulnerability management',
    'security assessment procedures'
  ];

  for (const query of testQueries) {
    console.log(`🔍 Query: "${query}"`);

    try {
      const result = await nistKnowledgeService.queryControls(
        query,
        ['NIST_CSF', 'NIST_800_53', 'NIST_AI_RMF', 'CIS_V8', 'ISO_27001'],
        3
      );

      console.log(`📋 Found ${result.controls.length} relevant controls`);

      if (result.controls.length > 0) {
        result.controls.forEach((control, index) => {
          const relevanceScore = result.relevanceScores[index];
          console.log(`   ${index + 1}. ${control.title}`);
          console.log(`      Framework: ${control.framework}`);
          console.log(`      Family: ${control.family}`);
          console.log(`      Relevance: ${(relevanceScore * 100).toFixed(1)}%`);
          console.log(`      Description: ${control.description.substring(0, 100)}...`);
        });

        if (result.suggestedImplementation) {
          console.log(`💡 Implementation Guidance:`);
          console.log(`   ${result.suggestedImplementation.substring(0, 200)}...`);
        }
      }

      console.log(''); // Empty line for readability

    } catch (error) {
      console.error(`❌ Error querying "${query}":`, error);
      console.log('');
    }
  }

  // Test gap analysis
  console.log('🔍 Testing Gap Analysis...');
  try {
    const gaps = await nistKnowledgeService.performGapAnalysis(
      'test-project-id',
      ['NIST_CSF', 'NIST_800_53', 'CIS_V8', 'ISO_27001']
    );
    console.log(`📊 Found ${gaps.length} potential gaps`);

    if (gaps.length > 0) {
      console.log('Top gaps:');
      gaps.slice(0, 3).forEach((gap, index) => {
        console.log(`   ${index + 1}. ${gap.control_id} - ${gap.gap_description.substring(0, 100)}...`);
        console.log(`      Priority: ${gap.priority}, Effort: ${gap.effort_estimate}`);
      });
    }
  } catch (error) {
    console.error('❌ Gap analysis test failed:', error);
  }

  console.log('\n✅ RAG testing completed!');
}

// Run the test
testRAG().catch(error => {
  console.error('❌ RAG testing failed:', error);
  process.exit(1);
});