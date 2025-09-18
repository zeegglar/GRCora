#!/usr/bin/env tsx
import { ChatOllama } from '@langchain/ollama';

/**
 * Hallucination Prevention System for GRC Compliance
 *
 * Critical safeguards for compliance-sensitive applications:
 * 1. Source verification against original controls
 * 2. Fact-checking layer for accuracy
 * 3. Confidence scoring with manual review triggers
 * 4. Template-based responses for consistency
 * 5. Audit trail for all generated content
 */

interface Control {
  id: number;
  control_id: string;
  title: string;
  description: string;
  framework: string;
  family: string;
}

interface VerificationResult {
  accuracy: number;
  verified_claims: string[];
  unverified_claims: string[];
  flagged_content: string[];
  recommendation: 'approve' | 'review' | 'reject';
}

interface AuditEntry {
  timestamp: Date;
  query: string;
  controls_used: string[];
  response_generated: string;
  verification_score: number;
  human_reviewed: boolean;
  approved: boolean;
}

class HallucinationGuard {
  private llm: ChatOllama;
  private auditLog: AuditEntry[] = [];

  constructor() {
    this.llm = new ChatOllama({
      model: 'mistral:latest',
      baseUrl: 'http://localhost:11434',
      temperature: 0.1, // Very low temperature for fact-checking
    });
  }

  /**
   * Verify generated response against source controls
   */
  async verifyResponse(
    generatedResponse: string,
    sourceControls: Control[]
  ): Promise<VerificationResult> {
    console.log('🔍 Fact-checking generated response...');

    const verificationPrompt = `
You are a strict fact-checker for compliance documents. Your job is to verify that EVERY claim in the generated response can be traced back to the source controls.

SOURCE CONTROLS:
${sourceControls.map(c => `
Control: ${c.control_id} (${c.framework})
Title: ${c.title}
Description: ${c.description}
`).join('\n')}

GENERATED RESPONSE TO VERIFY:
${generatedResponse}

CRITICAL VERIFICATION RULES:
1. ONLY approve claims that are directly stated in or clearly implied by the source controls
2. Flag ANY claim that adds external knowledge not in the controls
3. Flag ANY claim that interprets beyond what's explicitly stated
4. Flag ANY specific technical details not mentioned in the controls
5. Flag ANY recommendations not directly from the controls

Provide your verification in this EXACT format:

VERIFIED_CLAIMS:
- [List claims that are directly supported by the source controls]

UNVERIFIED_CLAIMS:
- [List claims that cannot be traced to the source controls]

FLAGGED_CONTENT:
- [List any content that appears to be hallucinated or externally sourced]

ACCURACY_SCORE: [0.0 to 1.0 based on percentage of verified vs total claims]

RECOMMENDATION: [approve/review/reject]
`;

    try {
      const verification = await this.llm.invoke(verificationPrompt);
      const result = this.parseVerificationResult(verification.content as string);

      console.log(`   📊 Accuracy Score: ${(result.accuracy * 100).toFixed(1)}%`);
      console.log(`   ✅ Verified Claims: ${result.verified_claims.length}`);
      console.log(`   ⚠️  Unverified Claims: ${result.unverified_claims.length}`);
      console.log(`   🚨 Flagged Content: ${result.flagged_content.length}`);
      console.log(`   📋 Recommendation: ${result.recommendation.toUpperCase()}`);

      return result;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return {
        accuracy: 0,
        verified_claims: [],
        unverified_claims: ['Verification system error'],
        flagged_content: ['Unable to verify response'],
        recommendation: 'reject'
      };
    }
  }

  private parseVerificationResult(verificationText: string): VerificationResult {
    const sections = {
      verified_claims: this.extractSection(verificationText, 'VERIFIED_CLAIMS'),
      unverified_claims: this.extractSection(verificationText, 'UNVERIFIED_CLAIMS'),
      flagged_content: this.extractSection(verificationText, 'FLAGGED_CONTENT')
    };

    const accuracyMatch = verificationText.match(/ACCURACY_SCORE:\s*([\d.]+)/);
    const accuracy = accuracyMatch ? parseFloat(accuracyMatch[1]) : 0;

    const recommendationMatch = verificationText.match(/RECOMMENDATION:\s*(\w+)/);
    const recommendation = recommendationMatch
      ? recommendationMatch[1].toLowerCase() as 'approve' | 'review' | 'reject'
      : 'reject';

    return {
      accuracy,
      verified_claims: sections.verified_claims,
      unverified_claims: sections.unverified_claims,
      flagged_content: sections.flagged_content,
      recommendation
    };
  }

  private extractSection(text: string, sectionName: string): string[] {
    const lines = text.split('\n');
    const sectionIndex = lines.findIndex(line =>
      line.trim().toUpperCase().includes(sectionName.toUpperCase())
    );

    if (sectionIndex === -1) return [];

    const items = [];
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[A-Z_]+:/)) break; // Next section
      if (line.startsWith('-') || line.startsWith('•')) {
        items.push(line.replace(/^[-•]\s*/, '').trim());
      }
    }

    return items.filter(item => item.length > 0);
  }

  /**
   * Generate fallback response using direct quotes when verification fails
   */
  generateFallbackResponse(sourceControls: Control[], query: string): string {
    console.log('🛡️  Generating fallback response with direct quotes...');

    const fallbackResponse = `
## Compliance Guidance: ${query}

**⚠️ IMPORTANT: This response contains only direct information from compliance controls. Additional analysis may be required.**

### Applicable Controls Found:
${sourceControls.map(control => `
**${control.control_id}** (${control.framework})
- **Title:** ${control.title}
- **Family:** ${control.family}
- **Description:** "${control.description.substring(0, 300)}..."
`).join('\n')}

### Recommendations:
1. **Manual Review Required**: This query requires expert interpretation
2. **Consult Source Documents**: Review full control descriptions in ${sourceControls.map(c => c.framework).join(', ')}
3. **Expert Consultation**: Consider engaging compliance specialists for implementation guidance

### Source References:
${sourceControls.map(control => `- ${control.control_id}: ${control.title} (${control.framework})`).join('\n')}

**Note:** This response is limited to direct control content. Implementation details should be verified with compliance experts and relevant standards documentation.
`;

    return fallbackResponse;
  }

  /**
   * Check if query requires special handling for high-risk scenarios
   */
  requiresSpecialHandling(query: string): boolean {
    const highRiskTerms = [
      'audit', 'certification', 'assessment', 'compliance gap',
      'regulatory requirement', 'penalty', 'fine', 'violation',
      'legal requirement', 'mandatory', 'required by law',
      'sox', 'hipaa', 'gdpr', 'pci dss', 'fisma'
    ];

    const queryLower = query.toLowerCase();
    return highRiskTerms.some(term => queryLower.includes(term));
  }

  /**
   * Create audit entry for compliance tracking
   */
  createAuditEntry(
    query: string,
    controlsUsed: Control[],
    response: string,
    verificationScore: number
  ): AuditEntry {
    const entry: AuditEntry = {
      timestamp: new Date(),
      query,
      controls_used: controlsUsed.map(c => `${c.framework}:${c.control_id}`),
      response_generated: response,
      verification_score: verificationScore,
      human_reviewed: false,
      approved: verificationScore >= 0.8
    };

    this.auditLog.push(entry);
    console.log(`📝 Audit entry created (Score: ${(verificationScore * 100).toFixed(1)}%)`);

    return entry;
  }

  /**
   * Generate confidence-scored response with appropriate warnings
   */
  async generateSafeResponse(
    originalResponse: string,
    sourceControls: Control[],
    query: string
  ): Promise<{
    response: string;
    confidence: 'high' | 'medium' | 'low';
    requiresReview: boolean;
    auditEntry: AuditEntry;
  }> {
    console.log('🛡️  Applying hallucination safeguards...');

    // Step 1: Verify response accuracy
    const verification = await this.verifyResponse(originalResponse, sourceControls);

    // Step 2: Determine appropriate response based on verification
    let finalResponse: string;
    let confidence: 'high' | 'medium' | 'low';
    let requiresReview: boolean;

    if (verification.recommendation === 'approve' && verification.accuracy >= 0.9) {
      finalResponse = originalResponse;
      confidence = 'high';
      requiresReview = this.requiresSpecialHandling(query);
    } else if (verification.recommendation === 'review' && verification.accuracy >= 0.7) {
      finalResponse = `⚠️ **MEDIUM CONFIDENCE RESPONSE** - Manual review recommended\n\n${originalResponse}\n\n**Verification Notes:**\n${verification.unverified_claims.map(claim => `- ${claim}`).join('\n')}`;
      confidence = 'medium';
      requiresReview = true;
    } else {
      finalResponse = this.generateFallbackResponse(sourceControls, query);
      confidence = 'low';
      requiresReview = true;
    }

    // Step 3: Add verification warnings if needed
    if (verification.flagged_content.length > 0) {
      finalResponse = `🚨 **CONTENT VERIFICATION ALERT**\n\nThe following content could not be verified against source controls:\n${verification.flagged_content.map(content => `- ${content}`).join('\n')}\n\n---\n\n${finalResponse}`;
      requiresReview = true;
    }

    // Step 4: Create audit trail
    const auditEntry = this.createAuditEntry(query, sourceControls, finalResponse, verification.accuracy);

    return {
      response: finalResponse,
      confidence,
      requiresReview,
      auditEntry
    };
  }

  /**
   * Get audit log for compliance reporting
   */
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Export audit log for external review
   */
  exportAuditLog(): string {
    const csv = [
      'Timestamp,Query,Controls Used,Verification Score,Human Reviewed,Approved',
      ...this.auditLog.map(entry =>
        `"${entry.timestamp.toISOString()}","${entry.query}","${entry.controls_used.join('; ')}",${entry.verification_score},${entry.human_reviewed},${entry.approved}`
      )
    ].join('\n');

    return csv;
  }
}

export { HallucinationGuard, VerificationResult, AuditEntry };

// Test the hallucination guard system
async function testHallucinationGuard() {
  console.log('🧪 TESTING HALLUCINATION PREVENTION SYSTEM\n');

  const guard = new HallucinationGuard();

  // Mock controls for testing
  const mockControls: Control[] = [
    {
      id: 1,
      control_id: 'AC-2',
      title: 'Account Management',
      description: 'Organizations must define and document account types, assign account managers, and establish account management requirements.',
      framework: 'NIST_800_53',
      family: 'AC'
    },
    {
      id: 2,
      control_id: 'AC-3',
      title: 'Access Enforcement',
      description: 'The system must enforce approved authorizations for logical access to information and system resources.',
      framework: 'NIST_800_53',
      family: 'AC'
    }
  ];

  // Test cases with different levels of accuracy
  const testCases = [
    {
      name: 'High Accuracy Response',
      query: 'access control requirements',
      response: 'Based on NIST 800-53 AC-2 and AC-3, organizations must define account types, assign account managers, and enforce approved authorizations for logical access.'
    },
    {
      name: 'Response with Hallucination',
      query: 'access control requirements',
      response: 'Organizations must implement multi-factor authentication, conduct quarterly access reviews, and use advanced AI-based threat detection systems for compliance.'
    },
    {
      name: 'Partial Accuracy',
      query: 'account management',
      response: 'Account management requires defining account types as specified in AC-2, but also requires immediate deactivation upon termination which happens within 2 hours according to industry best practices.'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST ${i + 1}: ${testCase.name}`);
    console.log('='.repeat(60));

    try {
      const result = await guard.generateSafeResponse(
        testCase.response,
        mockControls,
        testCase.query
      );

      console.log(`\n📊 **Results:**`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Requires Review: ${result.requiresReview ? 'Yes' : 'No'}`);
      console.log(`   Verification Score: ${(result.auditEntry.verification_score * 100).toFixed(1)}%`);

      console.log(`\n📝 **Final Response Preview:**`);
      console.log(result.response.substring(0, 200) + '...');

    } catch (error) {
      console.error(`❌ Test failed: ${error}`);
    }
  }

  console.log(`\n🎉 **HALLUCINATION PREVENTION TESTING COMPLETE**`);
  console.log(`   📊 Total Audit Entries: ${guard.getAuditLog().length}`);
  console.log(`   🛡️  Safeguards Applied: Verification, Fallback, Audit Trail`);
}

// Run test if this file is executed directly
testHallucinationGuard().catch(console.error);