#!/usr/bin/env tsx
/**
 * Mock RAG Demo - Demonstrates multi-framework responses
 * This simulates what the RAG system would return with real data
 */

interface MockControl {
  id: string;
  framework: string;
  family: string;
  title: string;
  description: string;
  guidance: string;
  relevance: number;
}

// Mock data representing actual processed controls
const mockDatabase: MockControl[] = [
  // NIST 800-53 Controls
  {
    id: "AC-1",
    framework: "NIST SP 800-53 Rev 5",
    family: "Access Control",
    title: "Policy and Procedures",
    description: "Develop, document, and disseminate access control policy and procedures that address purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance.",
    guidance: "Access control policy and procedures address the controls in the AC family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures.",
    relevance: 0.953
  },
  {
    id: "IR-1",
    framework: "NIST SP 800-53 Rev 5",
    family: "Incident Response",
    title: "Incident Response Policy and Procedures",
    description: "Develop, document, and disseminate incident response policy and procedures that address purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance.",
    guidance: "Incident response policy and procedures address the controls in the IR family that are implemented within systems and organizations.",
    relevance: 0.945
  },

  // ISO 27001 Controls
  {
    id: "A.5.15",
    framework: "ISO 27001:2022",
    family: "Organizational Security",
    title: "Access control governance",
    description: "Define and enforce access control principles based on least privilege and need-to-know.",
    guidance: "Define RBAC/ABAC rules; Implement joiner/mover/leaver process; Quarterly access reviews and recertification Evidence types: Access requests/approvals, Quarterly recertification reports, JML process docs. NIST CSF Functions: PR.",
    relevance: 0.921
  },
  {
    id: "A.5.24",
    framework: "ISO 27001:2022",
    family: "Organizational Security",
    title: "Incident response planning & readiness",
    description: "Define and test incident response plans, roles, and communications before incidents occur.",
    guidance: "Define IR plan and roles; Run tabletop exercise; Capture metrics and lessons learned Evidence types: IR plan, Tabletop notes, Incident tickets and post‑mortems. NIST CSF Functions: RS.",
    relevance: 0.968
  },

  // CIS Controls
  {
    id: "CIS_05.01",
    framework: "CIS Controls v8",
    family: "Account Management",
    title: "Establish and Maintain Detailed Enterprise Asset Inventory",
    description: "Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data.",
    guidance: "Implementation Groups: IG1, IG2, IG3",
    relevance: 0.897
  },
  {
    id: "CIS_17.01",
    framework: "CIS Controls v8",
    family: "Incident Response Management",
    title: "Designate Personnel to Manage Incident Handling",
    description: "Designate one or more personnel to manage and coordinate incident response. Personnel selected should have appropriate authority and cross-organizational accountability.",
    guidance: "Implementation Groups: IG1, IG2, IG3",
    relevance: 0.912
  },

  // NIST AI RMF
  {
    id: "GOVERN_1.1",
    framework: "NIST AI RMF 1.0",
    family: "GOVERN",
    title: "Legal and regulatory requirements involving AI",
    description: "Legal and regulatory requirements involving AI are understood, managed, and documented.",
    guidance: "",
    relevance: 0.985
  },
  {
    id: "GOVERN_1.2",
    framework: "NIST AI RMF 1.0",
    family: "GOVERN",
    title: "Trustworthy AI characteristics integration",
    description: "The characteristics of trustworthy AI are integrated into organizational policies, processes, and procedures.",
    guidance: "",
    relevance: 0.963
  },

  // Additional ISO Controls for technology scenarios
  {
    id: "A.8.25",
    framework: "ISO 27001:2022",
    family: "Technological Security",
    title: "Secure SDLC",
    description: "Integrate security activities throughout the software development lifecycle.",
    guidance: "Define security gates in CI/CD; Run SAST/DAST/dep scans; Fix high/critical before release Evidence types: Policy/standard or SOP, Screenshots/configs, Logs/records, Review minutes or approvals. NIST CSF Functions: PR.",
    relevance: 0.894
  }
];

function queryControls(query: string, frameworks: string[] = []): MockControl[] {
  console.log(`🔍 Query: "${query}"`);

  // Filter by frameworks if specified
  let results = mockDatabase;
  if (frameworks.length > 0) {
    results = mockDatabase.filter(control =>
      frameworks.some(framework => control.framework.includes(framework))
    );
  }

  // Sort by relevance
  results = results.sort((a, b) => b.relevance - a.relevance);

  return results.slice(0, 5); // Return top 5
}

function generateImplementationGuidance(query: string, controls: MockControl[]): string {
  return `Based on your query "${query}", here are the recommended implementation steps:

${controls.slice(0, 3).map((control, index) =>
  `${index + 1}. ${control.title} (${control.framework}): ${control.guidance || control.description}`
).join('\n\n')}`;
}

function generateGapAnalysis(controls: MockControl[]): string {
  return `Gap Analysis Results:
Key areas requiring attention:
${controls.slice(0, 3).map(control =>
  `• ${control.family}: ${control.title} (${control.framework})`
).join('\n')}`;
}

// Demo Scenarios
console.log('🎭 Multi-Framework RAG Demo\n');
console.log('=====================================\n');

// Scenario 1: Access Control for SOC 2
console.log('**Client Query 1**: "We need access control policies for SOC 2 compliance"');
console.log('---');

const accessControlResults = queryControls('access control policies SOC 2 compliance');
console.log(`📋 Found ${accessControlResults.length} relevant controls across frameworks\n`);

accessControlResults.forEach((control, index) => {
  console.log(`${index + 1}. ${control.id} - ${control.title} (${control.relevance * 100}% relevance)`);
  console.log(`   Framework: ${control.framework}`);
  console.log(`   Family: ${control.family}`);
  console.log(`   Description: ${control.description.substring(0, 100)}...`);
  console.log('');
});

console.log('💡 Implementation Guidance:');
console.log(generateImplementationGuidance('access control policies SOC 2 compliance', accessControlResults));
console.log('\n🔍 ' + generateGapAnalysis(accessControlResults));
console.log('\nEstimated implementation: 4-6 weeks for access control framework\n');
console.log('=====================================\n');

// Scenario 2: Incident Response
console.log('**Client Query 2**: "What incident response capabilities do we need for a small team?"');
console.log('---');

const incidentResponseResults = queryControls('incident response capabilities small team', ['NIST', 'ISO', 'CIS']);
console.log(`📋 Found ${incidentResponseResults.length} relevant controls across frameworks\n`);

incidentResponseResults.forEach((control, index) => {
  console.log(`${index + 1}. ${control.id} - ${control.title} (${control.relevance * 100}% relevance)`);
  console.log(`   Framework: ${control.framework}`);
  console.log(`   Family: ${control.family}`);
  console.log(`   Description: ${control.description.substring(0, 100)}...`);
  console.log('');
});

console.log('💡 Small Team Implementation Guidance:');
console.log(`For a small team needing enterprise-level incident response:

1. **Start with ISO 27001 A.5.24**: Define IR plan and roles; Run tabletop exercise; Capture metrics and lessons learned
2. **Implement CIS 17.1**: Designate incident handler (can be part-time role); establish escalation procedures
3. **Follow NIST 800-53 IR-1**: Document formal incident response policy with management approval

**Small Team Recommendations**:
• Outsource 24/7 monitoring to SOC provider
• Use automated incident response tools (SOAR)
• Partner with incident response retainer service
• Focus on detection and containment procedures`);

console.log('\nEstimated effort: 4-6 weeks for planning phase, 2-3 months for full implementation\n');
console.log('=====================================\n');

// Scenario 3: AI Governance
console.log('**Client Query 3**: "We\'re implementing AI features - what governance do we need?"');
console.log('---');

const aiGovernanceResults = queryControls('AI features governance requirements', ['NIST AI', 'ISO']);
console.log(`📋 Found ${aiGovernanceResults.length} relevant controls across frameworks\n`);

aiGovernanceResults.forEach((control, index) => {
  console.log(`${index + 1}. ${control.id} - ${control.title} (${control.relevance * 100}% relevance)`);
  console.log(`   Framework: ${control.framework}`);
  console.log(`   Family: ${control.family}`);
  console.log(`   Description: ${control.description}`);
  console.log('');
});

console.log('💡 AI Governance Implementation Guidance:');
console.log(`**Phase 1 - Foundation (4-6 weeks)**:
• Establish AI governance board and accountability (NIST AI RMF GOVERN 1.4)
• Document AI risk tolerance and acceptable use policies
• Integrate AI security into existing SDLC (ISO 27001 A.8.25)

**Phase 2 - Risk Management (6-8 weeks)**:
• Implement AI risk assessment processes (NIST AI RMF MAP functions)
• Establish model validation and testing procedures
• Create AI incident response procedures

**Fintech-Specific Considerations**:
• Algorithmic fairness for lending decisions
• Model explainability for regulatory compliance
• Data privacy protection in AI training
• Financial services AI governance requirements`);

console.log('\nEstimated effort: 3-4 months for comprehensive AI governance implementation\n');
console.log('=====================================\n');

// Summary
console.log('🎯 **Consultant Summary**:');
console.log(`
The multi-framework RAG system provides:

✅ **Cross-framework intelligence** - Shows how NIST, ISO, and CIS requirements align
✅ **Contextual recommendations** - Tailored for fintech startup size and industry
✅ **Practical implementation guidance** - Specific evidence types and timelines
✅ **Risk-based prioritization** - Critical/High/Medium priority gaps
✅ **Industry-specific insights** - Fintech considerations for AI governance

**Total Knowledge Base**: 1,351 controls across 5 major frameworks:
• NIST CSF 2.0: 108 subcategories
• NIST SP 800-53 Rev 5: 1,006 controls
• NIST AI RMF 1.0: 72 principles
• CIS Controls v8: 170 safeguards
• ISO 27001:2022: 93 Annex A controls

This demonstrates how the expanded RAG system gives comprehensive, actionable compliance guidance that clients would pay premium rates for! 🚀`);