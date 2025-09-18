#!/usr/bin/env tsx
import { ReportExportService } from '../services/reportExportService';

console.log('📄 POLICY GENERATION TEST - AUDIT READINESS\n');

async function testPolicyGeneration() {
  try {
    console.log('🏢 POLICY 1: NGO Information Security Policy (ISO 27001)\n');

    const ngoReportData = {
      organizationName: 'Save The Children Foundation',
      assessmentDate: new Date().toLocaleDateString(),
      consultantName: 'GRC Solutions LLC',
      frameworks: ['ISO 27001'],
      risks: [
        {
          title: 'Inadequate Access Controls',
          level: 'Critical' as const,
          impact: 'High',
          likelihood: 'High',
          businessImpact: 'Unauthorized access to sensitive donor and beneficiary data could result in privacy breaches, regulatory penalties, and loss of donor trust',
          recommendation: 'Implement role-based access controls aligned with ISO 27001 A.5.15 and A.8.2',
          estimatedCost: '$8,000 - $15,000'
        },
        {
          title: 'Insufficient Data Protection',
          level: 'High' as const,
          impact: 'High',
          likelihood: 'Medium',
          businessImpact: 'Potential exposure of beneficiary personal information and financial records',
          recommendation: 'Deploy encryption for data at rest and in transit per ISO 27001 A.8.24 and A.13.1',
          estimatedCost: '$5,000 - $10,000'
        }
      ],
      controlCoverage: {
        framework: 'ISO 27001',
        totalControls: 93,
        implementedControls: 34,
        coveragePercentage: 37,
        missingControls: [
          'A.5.15 - Access control governance',
          'A.8.2 - Privileged access management',
          'A.8.24 - Cryptographic controls',
          'A.12.6 - Technical vulnerability management'
        ]
      },
      recommendations: [
        {
          priority: 'Critical',
          title: 'Implement Multi-Factor Authentication',
          description: 'Deploy MFA for all privileged accounts accessing donor management systems',
          timeline: '30 days',
          effort: 'Medium',
          cost: '$3,000',
          frameworks: ['ISO 27001 A.8.2'],
          businessJustification: 'Prevents 99.9% of password-based attacks on critical systems'
        },
        {
          priority: 'High',
          title: 'Establish Data Classification',
          description: 'Create and implement data classification scheme for donor, beneficiary, and operational data',
          timeline: '60 days',
          effort: 'High',
          cost: '$8,000',
          frameworks: ['ISO 27001 A.8.2'],
          businessJustification: 'Ensures appropriate protection levels and regulatory compliance'
        }
      ],
      timeline: [
        {
          phase: 'Phase 1: Critical Controls',
          duration: '30-60 days',
          activities: ['MFA Implementation', 'Access Control Review', 'Incident Response Plan'],
          deliverables: ['MFA Policy', 'Access Control Matrix', 'IR Procedures']
        },
        {
          phase: 'Phase 2: Data Protection',
          duration: '60-90 days',
          activities: ['Data Classification', 'Encryption Implementation', 'Backup Testing'],
          deliverables: ['Data Classification Policy', 'Encryption Standards', 'Backup Procedures']
        }
      ],
      budgetEstimate: {
        immediate: 25000,
        shortTerm: 40000,
        longTerm: 15000,
        total: 80000,
        roi: 'Avoid potential $500,000 in breach costs and regulatory fines'
      }
    };

    console.log('Generating NGO Information Security Policy...');
    const ngoPolicy = ReportExportService.generateInfoSecPolicy(ngoReportData);

    console.log('✅ NGO Policy Generated');
    console.log(`   Length: ${ngoPolicy.length} characters`);

    // Check policy structure
    const requiredSections = [
      'Purpose',
      'Scope',
      'Roles',
      'Policy Statements',
      'Exceptions',
      'Enforcement',
      'References',
      'Change History'
    ];

    console.log('\n📋 Policy Structure Analysis:');
    requiredSections.forEach(section => {
      const hasSection = ngoPolicy.toLowerCase().includes(section.toLowerCase());
      console.log(`   ${hasSection ? '✅' : '❌'} ${section}: ${hasSection ? 'PRESENT' : 'MISSING'}`);
    });

    // Check for specific ISO controls
    const isoControls = ['A.5.15', 'A.8.2', 'A.8.24', 'A.12.6'];
    console.log('\n🎯 ISO 27001 Control References:');
    isoControls.forEach(control => {
      const hasControl = ngoPolicy.includes(control);
      console.log(`   ${hasControl ? '✅' : '❌'} ${control}: ${hasControl ? 'REFERENCED' : 'MISSING'}`);
    });

    console.log('\n🏢 POLICY 2: SaaS SOC 2 Access Control Policy\n');

    const saasReportData = {
      organizationName: 'TechFlow Solutions',
      assessmentDate: new Date().toLocaleDateString(),
      consultantName: 'GRC Solutions LLC',
      frameworks: ['SOC 2 Type II'],
      risks: [
        {
          title: 'Inadequate Access Controls for Customer Data',
          level: 'Critical' as const,
          impact: 'High',
          likelihood: 'High',
          businessImpact: 'Unauthorized access to customer SaaS data could result in SOC 2 audit failure and customer churn',
          recommendation: 'Implement SOC 2 Security criteria access controls with automated provisioning/deprovisioning',
          estimatedCost: '$12,000 - $25,000'
        }
      ],
      controlCoverage: {
        framework: 'SOC 2',
        totalControls: 64, // Typical SOC 2 control count
        implementedControls: 18,
        coveragePercentage: 28,
        missingControls: [
          'CC6.1 - Logical access security measures',
          'CC6.2 - Authentication policies',
          'CC6.3 - Authorization policies',
          'CC6.7 - Data transmission controls'
        ]
      },
      recommendations: [],
      timeline: [],
      budgetEstimate: {
        immediate: 35000,
        shortTerm: 50000,
        longTerm: 20000,
        total: 105000,
        roi: 'Enable SOC 2 certification and $2M ARR growth'
      }
    };

    console.log('Generating SaaS SOC 2 Access Control Policy...');
    const saasPolicy = ReportExportService.generateInfoSecPolicy(saasReportData);

    console.log('✅ SaaS Policy Generated');
    console.log(`   Length: ${saasPolicy.length} characters`);

    // Check for SOC 2 specificity
    const soc2Terms = ['SOC 2', 'Trust Service', 'Security criteria', 'CC6.', 'customer data'];
    console.log('\n🎯 SOC 2 Specificity Analysis:');
    soc2Terms.forEach(term => {
      const hasTerm = saasPolicy.toLowerCase().includes(term.toLowerCase());
      console.log(`   ${hasTerm ? '✅' : '❌'} "${term}": ${hasTerm ? 'PRESENT' : 'MISSING'}`);
    });

    console.log('\n📊 AUDIT READINESS ASSESSMENT\n');

    // Save policies for review
    console.log('💾 Saving policies for manual review...');

    // Write NGO policy
    const fs = await import('fs');
    await fs.promises.writeFile('NGO_InfoSec_Policy.md', ngoPolicy);
    console.log('✅ NGO policy saved: NGO_InfoSec_Policy.md');

    // Write SaaS policy
    await fs.promises.writeFile('SaaS_SOC2_Policy.md', saasPolicy);
    console.log('✅ SaaS policy saved: SaaS_SOC2_Policy.md');

    console.log('\n🎯 POLICY QUALITY VERDICT:');

    const ngoQuality = {
      structure: requiredSections.every(section =>
        ngoPolicy.toLowerCase().includes(section.toLowerCase())
      ),
      frameworkMapping: isoControls.some(control => ngoPolicy.includes(control)),
      auditReady: ngoPolicy.length > 2000 && ngoPolicy.includes('ISO 27001'),
      businessContext: ngoPolicy.toLowerCase().includes('donor') || ngoPolicy.toLowerCase().includes('beneficiary')
    };

    const saasQuality = {
      structure: requiredSections.every(section =>
        saasPolicy.toLowerCase().includes(section.toLowerCase())
      ),
      frameworkMapping: soc2Terms.some(term => saasPolicy.toLowerCase().includes(term.toLowerCase())),
      auditReady: saasPolicy.length > 2000 && saasPolicy.toLowerCase().includes('soc 2'),
      businessContext: saasPolicy.toLowerCase().includes('customer') || saasPolicy.toLowerCase().includes('saas')
    };

    console.log('\n📋 NGO Policy Assessment:');
    console.log(`   📄 Structure Complete: ${ngoQuality.structure ? '✅ YES' : '❌ NO'}`);
    console.log(`   🎯 Framework Mapped: ${ngoQuality.frameworkMapping ? '✅ YES' : '❌ NO'}`);
    console.log(`   🔍 Audit Ready: ${ngoQuality.auditReady ? '✅ YES' : '❌ NO'}`);
    console.log(`   🏢 Business Context: ${ngoQuality.businessContext ? '✅ YES' : '❌ NO'}`);

    console.log('\n📋 SaaS Policy Assessment:');
    console.log(`   📄 Structure Complete: ${saasQuality.structure ? '✅ YES' : '❌ NO'}`);
    console.log(`   🎯 Framework Mapped: ${saasQuality.frameworkMapping ? '✅ YES' : '❌ NO'}`);
    console.log(`   🔍 Audit Ready: ${saasQuality.auditReady ? '✅ YES' : '❌ NO'}`);
    console.log(`   🏢 Business Context: ${saasQuality.businessContext ? '✅ YES' : '❌ NO'}`);

    const overallQuality = (ngoQuality.structure && ngoQuality.auditReady) &&
                          (saasQuality.structure && saasQuality.auditReady);

    console.log(`\n🎉 OVERALL POLICY QUALITY: ${overallQuality ? '✅ AUDIT READY' : '❌ NEEDS IMPROVEMENT'}`);

    return {
      ngoPolicy,
      saasPolicy,
      ngoQuality,
      saasQuality,
      overallQuality
    };

  } catch (error) {
    console.error('❌ Policy generation test failed:', error);
  }
}

testPolicyGeneration().catch(console.error);