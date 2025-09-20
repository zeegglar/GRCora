import { GRCAIService } from '../services/grcAIService';

async function testKnowledgeQuestions() {
  console.log('🧠 Testing 5 Required GRC Knowledge Questions...\n');

  const questions = [
    "Define risk in GRC terms",
    "Explain the difference between preventive and detective controls",
    "List the ISO 27001 Annex A domains",
    "Summarize NIST AI RMF categories",
    "What is the purpose of a Statement of Applicability in ISO 27001?"
  ];

  const grcService = GRCAIService.getInstance();

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`${i + 1}. Testing: "${question}"`);

    try {
      // Test without Ollama (fallback knowledge)
      const response = await grcService.processQuery(question, {});

      console.log(`   Type: ${response.type}`);
      console.log(`   Sources: ${response.sources.join(', ')}`);
      console.log(`   Confidence: ${(response.confidence * 100).toFixed(1)}%`);

      // Check for proper framework citations
      const hasFrameworkCitation = ['NIST', 'ISO', 'COBIT', 'COSO'].some(framework =>
        response.content.toLowerCase().includes(framework.toLowerCase())
      );

      console.log(`   Has Framework Citations: ${hasFrameworkCitation ? '✅' : '❌'}`);
      console.log(`   Content Preview: ${response.content.substring(0, 150)}...\n`);

    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }
}

testKnowledgeQuestions().catch(console.error);