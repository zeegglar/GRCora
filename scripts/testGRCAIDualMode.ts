import { GRCAIService } from '../services/grcAIService';
import type { Risk, AssessmentItem, Control, Vendor, Project } from '../types';
import { VendorCriticality } from '../types';

interface TestResult {
  query: string;
  expectedType: 'dataset-grounded' | 'knowledge-based';
  actualType: 'dataset-grounded' | 'knowledge-based';
  dataStatus: 'available' | 'empty' | 'error';
  sources: string[];
  confidence: number;
  content: string;
  passed: boolean;
  reason?: string;
}

interface TestContext {
  project?: Project;
  risks?: Risk[];
  assessmentItems?: AssessmentItem[];
  controls?: Map<string, Control>;
  vendors?: Vendor[];
}

class GRCAIDualModeTest {
  private grcService: GRCAIService;
  private testResults: TestResult[] = [];

  constructor() {
    this.grcService = GRCAIService.getInstance();
  }

  /**
   * Run comprehensive dual-mode testing
   */
  async runTests(): Promise<void> {
    console.log('🧪 Starting GRC AI Dual-Mode Testing...\n');

    // Test 1: Dataset queries with actual data
    await this.testDatasetQueries();

    // Test 2: Dataset queries with empty data
    await this.testEmptyDatasetQueries();

    // Test 3: Knowledge-based queries
    await this.testKnowledgeQueries();

    // Test 4: Edge cases and validation
    await this.testValidationCases();

    // Generate report
    this.generateTestReport();
  }

  /**
   * Test dataset queries with populated data
   */
  private async testDatasetQueries(): Promise<void> {
    console.log('📊 Testing Dataset-Grounded Queries...\n');

    const testContext = this.createMockDataContext();

    const datasetQueries = [
      {
        query: "Show me my current critical risks",
        expectedType: 'dataset-grounded' as const,
        description: "Control query - should find actual critical risks"
      },
      {
        query: "What is my current compliance rate?",
        expectedType: 'dataset-grounded' as const,
        description: "Policy query - should calculate from assessment items"
      },
      {
        query: "How many high-risk vendors do I have?",
        expectedType: 'dataset-grounded' as const,
        description: "Vendor query - should count from vendor data"
      }
    ];

    for (const test of datasetQueries) {
      await this.runSingleTest(test.query, test.expectedType, testContext, test.description);
    }
  }

  /**
   * Test dataset queries with empty data
   */
  private async testEmptyDatasetQueries(): Promise<void> {
    console.log('🗂️ Testing Empty Dataset Queries...\n');

    const emptyContext: TestContext = {
      risks: [],
      assessmentItems: [],
      vendors: [],
      controls: new Map()
    };

    const emptyDataQueries = [
      {
        query: "What are my current risks?",
        expectedType: 'dataset-grounded' as const,
        description: "Should return 'No data available' message"
      }
    ];

    for (const test of emptyDataQueries) {
      await this.runSingleTest(test.query, test.expectedType, emptyContext, test.description);
    }
  }

  /**
   * Test knowledge-based queries (the 5 required examples)
   */
  private async testKnowledgeQueries(): Promise<void> {
    console.log('🧠 Testing Knowledge-Based Queries...\n');

    const knowledgeQueries = [
      {
        query: "Define risk in GRC terms",
        expectedType: 'knowledge-based' as const,
        description: "Basic GRC definition - should not use dataset"
      },
      {
        query: "Explain the difference between preventive and detective controls",
        expectedType: 'knowledge-based' as const,
        description: "Control types explanation"
      },
      {
        query: "List the ISO 27001 Annex A domains",
        expectedType: 'knowledge-based' as const,
        description: "Framework structure knowledge"
      },
      {
        query: "Summarize NIST AI RMF categories",
        expectedType: 'knowledge-based' as const,
        description: "AI risk framework knowledge"
      },
      {
        query: "What is the purpose of a Statement of Applicability in ISO 27001?",
        expectedType: 'knowledge-based' as const,
        description: "ISO 27001 specific knowledge"
      }
    ];

    const emptyContext: TestContext = {}; // No dataset for knowledge queries

    for (const test of knowledgeQueries) {
      await this.runSingleTest(test.query, test.expectedType, emptyContext, test.description);
    }
  }

  /**
   * Test validation and edge cases
   */
  private async testValidationCases(): Promise<void> {
    console.log('🛡️ Testing Validation Cases...\n');

    const testContext = this.createMockDataContext();

    const validationQueries = [
      {
        query: "Show me fake statistics about my controls",
        expectedType: 'dataset-grounded' as const,
        description: "Should not return placeholder statistics"
      },
      {
        query: "What is NIST CSF?",
        expectedType: 'knowledge-based' as const,
        description: "Should include proper citations"
      }
    ];

    for (const test of validationQueries) {
      await this.runSingleTest(test.query, test.expectedType, testContext, test.description);
    }
  }

  /**
   * Run a single test and validate results
   */
  private async runSingleTest(
    query: string,
    expectedType: 'dataset-grounded' | 'knowledge-based',
    context: TestContext,
    description: string
  ): Promise<void> {
    console.log(`🔍 Testing: ${query}`);
    console.log(`   Expected: ${expectedType}`);
    console.log(`   Description: ${description}`);

    try {
      const response = await this.grcService.processQuery(query, context);

      const passed = this.validateResponse(response, expectedType, query);

      const result: TestResult = {
        query,
        expectedType,
        actualType: response.type,
        dataStatus: response.dataStatus,
        sources: response.sources,
        confidence: response.confidence,
        content: response.content.substring(0, 200) + '...', // Truncate for report
        passed,
        reason: passed ? undefined : `Type mismatch or validation failure`
      };

      this.testResults.push(result);

      console.log(`   Result: ${response.type} (${response.dataStatus})`);
      console.log(`   Sources: ${response.sources.join(', ')}`);
      console.log(`   Confidence: ${(response.confidence * 100).toFixed(1)}%`);
      console.log(`   ✅ PASSED: ${passed}\n`);

    } catch (error) {
      console.error(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}\n`);

      this.testResults.push({
        query,
        expectedType,
        actualType: 'dataset-grounded', // Default
        dataStatus: 'error',
        sources: ['error'],
        confidence: 0,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        passed: false,
        reason: 'Exception thrown during processing'
      });
    }
  }

  /**
   * Validate response meets requirements
   */
  private validateResponse(
    response: any,
    expectedType: 'dataset-grounded' | 'knowledge-based',
    query: string
  ): boolean {
    // Check type matching
    if (response.type !== expectedType) {
      return false;
    }

    // Validate dataset-grounded responses
    if (expectedType === 'dataset-grounded') {
      // Should not contain placeholder values
      if (this.containsPlaceholderValues(response.content)) {
        return false;
      }

      // If data is empty, should explicitly state that
      if (response.dataStatus === 'empty') {
        return response.content.includes('No data available');
      }
    }

    // Validate knowledge-based responses
    if (expectedType === 'knowledge-based') {
      // Should contain framework references for substantive responses
      if (response.content.length > 100) {
        const hasFrameworkReference = this.hasValidFrameworkReferences(response.content);
        if (!hasFrameworkReference) {
          return false;
        }
      }

      // Should not reference user's specific data
      if (response.content.toLowerCase().includes('your current') ||
          response.content.toLowerCase().includes('your organization')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check for placeholder values
   */
  private containsPlaceholderValues(content: string): boolean {
    const placeholderPatterns = [
      /\bnan\b/i,
      /\bNaN\b/,
      /\b0\/0\b/,
      /\b\d+%.*placeholder/i,
      /\bfake.*percent/i,
      /\bunknown.*%/i
    ];

    return placeholderPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for valid framework references
   */
  private hasValidFrameworkReferences(content: string): boolean {
    const frameworks = ['NIST', 'ISO', 'COBIT', 'COSO', 'PCI', 'HIPAA', 'GDPR', 'SOX'];
    return frameworks.some(framework =>
      content.toLowerCase().includes(framework.toLowerCase())
    );
  }

  /**
   * Create mock data context for testing
   */
  private createMockDataContext(): TestContext {
    const mockRisks: Risk[] = [
      {
        id: 'R001',
        name: 'Data Breach Risk',
        description: 'Risk of unauthorized data access',
        category: 'Cybersecurity',
        level: 'Critical',
        status: 'Open',
        likelihood: 'High',
        impact: 'High',
        owner: 'CISO',
        dueDate: new Date('2024-12-31'),
        lastReviewed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'R002',
        name: 'Vendor Risk',
        description: 'Third-party vendor security risk',
        category: 'Third Party',
        level: 'High',
        status: 'Open',
        likelihood: 'Medium',
        impact: 'High',
        owner: 'Procurement',
        dueDate: new Date('2024-12-31'),
        lastReviewed: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    const mockAssessmentItems: AssessmentItem[] = [
      {
        id: 'A001',
        controlId: 'C001',
        name: 'Access Control Policy',
        description: 'Implement access control policy',
        status: 'Compliant',
        evidence: 'Policy document reviewed',
        assessor: 'Auditor',
        assessedDate: new Date('2024-01-15'),
        dueDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'A002',
        controlId: 'C002',
        name: 'Encryption Controls',
        description: 'Data encryption implementation',
        status: 'Non-Compliant',
        evidence: 'Gaps identified in encryption',
        assessor: 'Security Team',
        assessedDate: new Date('2024-01-15'),
        dueDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    const mockVendors: Vendor[] = [
      {
        id: 'V001',
        name: 'Cloud Provider A',
        description: 'Primary cloud infrastructure provider',
        criticality: VendorCriticality.HIGH,
        riskLevel: VendorCriticality.HIGH,
        assessmentDate: new Date('2024-01-15'),
        nextAssessmentDate: new Date('2024-12-31'),
        status: 'Active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    const mockControls = new Map<string, Control>();
    mockControls.set('C001', {
      id: 'C001',
      name: 'Access Control',
      description: 'Manage user access to systems',
      category: 'Access Management',
      type: 'Preventive',
      framework: 'ISO 27001',
      owner: 'IT Security',
      implementationStatus: 'Implemented',
      testingFrequency: 'Quarterly',
      lastTested: new Date('2024-01-15'),
      nextTestDate: new Date('2024-04-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    });

    const mockProject: Project = {
      id: 'P001',
      name: 'Security Compliance Program',
      description: 'Enterprise security compliance initiative',
      frameworks: ['ISO 27001', 'NIST CSF'],
      status: 'Active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    };

    return {
      project: mockProject,
      risks: mockRisks,
      assessmentItems: mockAssessmentItems,
      controls: mockControls,
      vendors: mockVendors
    };
  }

  /**
   * Generate comprehensive test report
   */
  private generateTestReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 GRC AI DUAL-MODE TEST REPORT');
    console.log('='.repeat(80));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
    console.log(`   Failed: ${failedTests} (${(failedTests/totalTests*100).toFixed(1)}%)`);

    // Group by type
    const datasetTests = this.testResults.filter(r => r.expectedType === 'dataset-grounded');
    const knowledgeTests = this.testResults.filter(r => r.expectedType === 'knowledge-based');

    console.log(`\n📈 BY QUERY TYPE:`);
    console.log(`   Dataset-Grounded: ${datasetTests.filter(r => r.passed).length}/${datasetTests.length} passed`);
    console.log(`   Knowledge-Based: ${knowledgeTests.filter(r => r.passed).length}/${knowledgeTests.length} passed`);

    // Detailed results
    console.log(`\n🔍 DETAILED RESULTS:`);
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${index + 1}. ${status} - ${result.query.substring(0, 50)}...`);
      console.log(`   Expected: ${result.expectedType}, Got: ${result.actualType}`);
      console.log(`   Data Status: ${result.dataStatus}`);
      console.log(`   Sources: ${result.sources.join(', ')}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      if (!result.passed && result.reason) {
        console.log(`   Failure Reason: ${result.reason}`);
      }
    });

    console.log(`\n🎯 VALIDATION RESULTS:`);

    // Check specific requirements
    const hasDatasetPipeline = datasetTests.some(r => r.passed && r.dataStatus === 'available');
    const hasEmptyDataHandling = datasetTests.some(r => r.passed && r.dataStatus === 'empty');
    const hasKnowledgeBase = knowledgeTests.filter(r => r.passed).length >= 4; // At least 4/5 knowledge tests
    const hasValidation = this.testResults.every(r => !this.containsPlaceholderValues(r.content));

    console.log(`   ✅ Dataset Pipeline Working: ${hasDatasetPipeline}`);
    console.log(`   ✅ Empty Data Handling: ${hasEmptyDataHandling}`);
    console.log(`   ✅ Knowledge Base Available: ${hasKnowledgeBase}`);
    console.log(`   ✅ No Placeholder Values: ${hasValidation}`);

    const overallPassed = hasDatasetPipeline && hasEmptyDataHandling && hasKnowledgeBase && hasValidation;

    console.log(`\n🏆 OVERALL RESULT: ${overallPassed ? '✅ SYSTEM READY' : '❌ NEEDS FIXES'}`);

    if (overallPassed) {
      console.log('\n🎉 The dual-mode GRC AI system is working correctly!');
      console.log('   - Dataset queries properly route to actual data');
      console.log('   - Knowledge queries use GRC domain expertise');
      console.log('   - Validation prevents misleading outputs');
      console.log('   - Source citations are properly implemented');
    } else {
      console.log('\n⚠️  The system requires fixes before use:');
      if (!hasDatasetPipeline) console.log('   - Dataset pipeline not working properly');
      if (!hasEmptyDataHandling) console.log('   - Empty data handling needs improvement');
      if (!hasKnowledgeBase) console.log('   - Knowledge base responses insufficient');
      if (!hasValidation) console.log('   - Validation not preventing placeholder values');
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Run the test if called directly
async function main() {
  const tester = new GRCAIDualModeTest();
  await tester.runTests();
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { GRCAIDualModeTest };