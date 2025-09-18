// Audit-Ready RAG System - No Hallucinations Allowed
// Strict adherence to retrieved data only

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ControlResult {
  id: number;
  control_id: string;
  framework: string;
  title: string;
  description: string;
}

class AuditReadyRAG {
  private retrievedControls: ControlResult[] = [];

  async queryAccessControls(): Promise<string> {
    console.log("🔍 AUDIT-READY RAG: Querying Access Controls");
    console.log("=" * 50);

    // Query for ISO 27001 access control
    const { data: iso27001Data, error: iso27001Error } = await supabase
      .from('nist_controls')
      .select('id, control_id, framework, title, description')
      .eq('framework', 'ISO_27001')
      .ilike('title', '%access%')
      .limit(10);

    // Query for NIST 800-53 access control
    const { data: nist80053Data, error: nist80053Error } = await supabase
      .from('nist_controls')
      .select('id, control_id, framework, title, description')
      .eq('framework', 'NIST_800_53')
      .ilike('title', '%access%')
      .limit(10);

    if (iso27001Error || nist80053Error) {
      throw new Error(`Database query failed: ${iso27001Error?.message || nist80053Error?.message}`);
    }

    this.retrievedControls = [...(iso27001Data || []), ...(nist80053Data || [])];

    console.log(`📊 Retrieved ${this.retrievedControls.length} controls from live database`);
    console.log(`   ISO 27001: ${iso27001Data?.length || 0} controls`);
    console.log(`   NIST 800-53: ${nist80053Data?.length || 0} controls`);

    console.log("\n📋 Raw Retrieved Controls:");
    this.retrievedControls.forEach((control, index) => {
      console.log(`   ${index + 1}. [${control.framework}] ${control.control_id}: ${control.title}`);
    });

    return this.generateStrictResponse();
  }

  private generateStrictResponse(): string {
    // STRICT RULE: Only reference what was actually retrieved
    const isoControls = this.retrievedControls.filter(c => c.framework === 'ISO_27001');
    const nistControls = this.retrievedControls.filter(c => c.framework === 'NIST_800_53');

    let response = "Based on the controls retrieved from the database, here are the access control requirements:\n\n";

    if (isoControls.length > 0) {
      response += "**ISO 27001 Access Control Requirements (Retrieved):**\n";
      isoControls.forEach(control => {
        response += `• [${control.control_id}] ${control.title}\n`;
      });
      response += "\n";
    }

    if (nistControls.length > 0) {
      response += "**NIST 800-53 Access Control Requirements (Retrieved):**\n";
      nistControls.forEach(control => {
        response += `• [${control.control_id}] ${control.title}\n`;
      });
      response += "\n";
    }

    // ONLY mention patterns we can see in the actual data
    response += "**Implementation Themes (Based on Retrieved Controls Only):**\n";

    const hasPrivileged = this.retrievedControls.some(c =>
      c.title.toLowerCase().includes('privilege') || c.description?.toLowerCase().includes('privilege')
    );
    if (hasPrivileged) {
      response += "• Privileged access management and control\n";
    }

    const hasRolesBased = this.retrievedControls.some(c =>
      c.title.toLowerCase().includes('role') || c.description?.toLowerCase().includes('role')
    );
    if (hasRolesBased) {
      response += "• Role-based access control mechanisms\n";
    }

    const hasGovernance = this.retrievedControls.some(c =>
      c.title.toLowerCase().includes('governance') || c.title.toLowerCase().includes('provision')
    );
    if (hasGovernance) {
      response += "• Access governance and provisioning processes\n";
    }

    response += "\n**Important Note:** This analysis is strictly limited to the controls retrieved from the database. Additional access control requirements may exist in the complete frameworks.";

    return response;
  }

  validateResponse(response: string): { hallucinations: string[], score: number } {
    const hallucinations: string[] = [];

    // Extract all [control_id] references
    const citationRegex = /\[([^\]]+)\]/g;
    const mentions: string[] = [];
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      mentions.push(match[1]);
    }

    // Check each mention against retrieved data
    mentions.forEach(mention => {
      const found = this.retrievedControls.some(c => c.control_id === mention);
      if (!found) {
        hallucinations.push(`Referenced control "${mention}" not found in retrieved data`);
      }
    });

    // Check for unsupported claims
    if (response.includes("Multi-Factor Authentication") &&
        !this.retrievedControls.some(c =>
          c.title.toLowerCase().includes("authentication") ||
          c.description?.toLowerCase().includes("authentication")
        )) {
      hallucinations.push("Claims about authentication not supported by retrieved controls");
    }

    // Calculate score
    let score = 100;
    score -= hallucinations.length * 25; // Heavy penalty for hallucinations

    if (mentions.length === 0) {
      score -= 20; // Penalty for no citations
    }

    return {
      hallucinations,
      score: Math.max(0, score)
    };
  }
}

// Test the audit-ready RAG system
async function testAuditReadyRAG() {
  console.log("🏛️ AUDIT-READY RAG SYSTEM TEST");
  console.log("Testing strict adherence to retrieved data only\n");

  const rag = new AuditReadyRAG();

  try {
    const response = await rag.queryAccessControls();

    console.log("\n🤖 AUDIT-READY AI RESPONSE:");
    console.log("=" * 50);
    console.log(response);

    console.log("\n🔍 VALIDATION RESULTS:");
    console.log("=" * 50);

    const validation = rag.validateResponse(response);

    console.log(`Hallucinations Detected: ${validation.hallucinations.length}`);
    if (validation.hallucinations.length > 0) {
      validation.hallucinations.forEach(h => console.log(`   ❌ ${h}`));
    } else {
      console.log("   ✅ No hallucinations detected - all claims backed by retrieved data");
    }

    console.log(`\n📊 Audit Score: ${validation.score}/100`);

    if (validation.score >= 80) {
      console.log("✅ AUDIT RESULT: PASSED - System maintains fidelity to retrieved data");
    } else {
      console.log("❌ AUDIT RESULT: FAILED - System contains hallucinations or unsupported claims");
    }

    return validation.score;

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return 0;
  }
}

// Run the test
testAuditReadyRAG().catch(console.error);