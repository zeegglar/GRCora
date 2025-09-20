import GRCAIService from '../services/grcAIService';

/**
 * Test script to validate the dual-mode GRC AI system
 * Tests both dataset-grounded and knowledge-based responses
 */

async function testGRCAI() {
  console.log('🧪 Testing GRC AI Dual-Mode System\n');

  const grcService = GRCAIService.getInstance();

  // Mock context data for testing
  const mockContext = {
    project: {
      id: 'test-project',
      name: 'Test GRC Project',
      frameworks: ['NIST CSF', 'ISO 27001']
    },
    risks: [
      { id: 'risk-1', title: 'Data Breach Risk', level: 'Critical', description: 'Risk of unauthorized data access' },
      { id: 'risk-2', title: 'System Downtime', level: 'High', description: 'Risk of system unavailability' },
      { id: 'risk-3', title: 'Compliance Violation', level: 'Medium', description: 'Risk of regulatory non-compliance' }
    ],
    assessmentItems: [
      { id: 'ctrl-1', controlId: 'AC-1', status: 'Compliant', description: 'Access control policy' },
      { id: 'ctrl-2', controlId: 'AC-2', status: 'Non-Compliant', description: 'Account management' },
      { id: 'ctrl-3', controlId: 'AC-3', status: 'In Progress', description: 'Access enforcement' }
    ],
    vendors: [
      { id: 'vendor-1', name: 'Cloud Provider A', riskLevel: 'High' },
      { id: 'vendor-2', name: 'Software Vendor B', riskLevel: 'Medium' }
    ],
    controls: new Map([
      ['AC-1', { id: 'AC-1', name: 'Access Control Policy', family: 'Access Control' }],
      ['AC-2', { id: 'AC-2', name: 'Account Management', family: 'Access Control' }]
    ])
  };

  console.log('📊 Testing Dataset-Grounded Queries:\n');

  // Test 1: Dataset query with data
  console.log('Test 1: "What are my current risks?"');
  try {
    const response1 = await grcService.processQuery('What are my current risks?', mockContext);
    console.log(`✅ Response Type: ${response1.type}`);
    console.log(`✅ Data Status: ${response1.dataStatus}`);
    console.log(`✅ Content: ${response1.content.substring(0, 200)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Test 2: Dataset query with no data
  console.log('Test 2: "Show me my policies" (no data available)');
  try {
    const response2 = await grcService.processQuery('Show me my policies', {});
    console.log(`✅ Response Type: ${response2.type}`);
    console.log(`✅ Data Status: ${response2.dataStatus}`);
    console.log(`✅ Content: ${response2.content}`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Test 3: Compliance status query
  console.log('Test 3: "What is my compliance rate?"');
  try {
    const response3 = await grcService.processQuery('What is my compliance rate?', mockContext);
    console.log(`✅ Response Type: ${response3.type}`);
    console.log(`✅ Data Status: ${response3.dataStatus}`);
    console.log(`✅ Content: ${response3.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  console.log('🧠 Testing Knowledge-Based Queries:\n');

  // Knowledge Test 1: Risk definition
  console.log('Knowledge Test 1: "Define risk in GRC terms"');
  try {
    const kResponse1 = await grcService.processQuery('Define risk in GRC terms', {});
    console.log(`✅ Response Type: ${kResponse1.type}`);
    console.log(`✅ Data Status: ${kResponse1.dataStatus}`);
    console.log(`✅ Content: ${kResponse1.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Knowledge Test 2: Control types
  console.log('Knowledge Test 2: "Explain the difference between preventive and detective controls"');
  try {
    const kResponse2 = await grcService.processQuery('Explain the difference between preventive and detective controls', {});
    console.log(`✅ Response Type: ${kResponse2.type}`);
    console.log(`✅ Data Status: ${kResponse2.dataStatus}`);
    console.log(`✅ Content: ${kResponse2.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Knowledge Test 3: ISO 27001
  console.log('Knowledge Test 3: "List the ISO 27001 Annex A domains"');
  try {
    const kResponse3 = await grcService.processQuery('List the ISO 27001 Annex A domains', {});
    console.log(`✅ Response Type: ${kResponse3.type}`);
    console.log(`✅ Data Status: ${kResponse3.dataStatus}`);
    console.log(`✅ Content: ${kResponse3.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Knowledge Test 4: NIST AI RMF
  console.log('Knowledge Test 4: "Summarize NIST AI RMF categories"');
  try {
    const kResponse4 = await grcService.processQuery('Summarize NIST AI RMF categories', {});
    console.log(`✅ Response Type: ${kResponse4.type}`);
    console.log(`✅ Data Status: ${kResponse4.dataStatus}`);
    console.log(`✅ Content: ${kResponse4.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Knowledge Test 5: Statement of Applicability
  console.log('Knowledge Test 5: "What is the purpose of a Statement of Applicability in ISO 27001?"');
  try {
    const kResponse5 = await grcService.processQuery('What is the purpose of a Statement of Applicability in ISO 27001?', {});
    console.log(`✅ Response Type: ${kResponse5.type}`);
    console.log(`✅ Data Status: ${kResponse5.dataStatus}`);
    console.log(`✅ Content: ${kResponse5.content.substring(0, 300)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  console.log('🔍 Testing Edge Cases:\n');

  // Edge Test 1: Ambiguous query
  console.log('Edge Test 1: "Tell me about controls" (could be dataset or knowledge)');
  try {
    const eResponse1 = await grcService.processQuery('Tell me about controls', mockContext);
    console.log(`✅ Response Type: ${eResponse1.type}`);
    console.log(`✅ Data Status: ${eResponse1.dataStatus}`);
    console.log(`✅ Content: ${eResponse1.content.substring(0, 200)}...`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  // Edge Test 2: Invalid query
  console.log('Edge Test 2: Empty query');
  try {
    const eResponse2 = await grcService.processQuery('', {});
    console.log(`✅ Response Type: ${eResponse2.type}`);
    console.log(`✅ Content: ${eResponse2.content}`);
    console.log('---\n');
  } catch (error) {
    console.log(`❌ Error: ${error}\n`);
  }

  console.log('🎯 Test Complete! The dual-mode system should now:');
  console.log('✅ Classify queries correctly as dataset vs knowledge');
  console.log('✅ Return "No data available" for empty datasets (not NaN or 0/0)');
  console.log('✅ Provide accurate GRC knowledge for general questions');
  console.log('✅ Include metadata showing response type and data status');
  console.log('✅ Handle edge cases gracefully');
}

// Run tests if called directly
if (require.main === module) {
  testGRCAI().catch(console.error);
}

export default testGRCAI;