// Consultant Simulation: Onboarding Two Clients
// Testing with live Supabase database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function onboardClients() {
  console.log("🏢 CONSULTANT SIMULATION: Client Onboarding");
  console.log("=" * 50);

  // Client 1: Green Earth Foundation (NGO)
  const ngoClient = {
    name: "Green Earth Foundation",
    type: "NGO",
    size: "Small (25-50 employees)",
    frameworks: ["ISO_27001", "NIST_CSF"],
    industry: "Non-Profit Environmental",
    maturity: "Basic",
    budget: "Limited (<$50k)",
    timeline: "6 months",
    primaryContact: "Sarah Martinez, Operations Director"
  };

  // Client 2: TechFlow AI (Tech Startup)
  const techClient = {
    name: "TechFlow AI",
    type: "Tech Startup",
    size: "Medium (50-200 employees)",
    frameworks: ["CIS_V8", "NIST_AI_RMF", "NIST_800_53"],
    industry: "AI/Machine Learning SaaS",
    maturity: "Intermediate",
    budget: "Moderate ($100k-250k)",
    timeline: "12 months",
    primaryContact: "Alex Chen, CTO"
  };

  console.log("📋 Client 1: NGO Engagement");
  console.log(`   Organization: ${ngoClient.name}`);
  console.log(`   Frameworks: ${ngoClient.frameworks.join(", ")}`);
  console.log(`   Industry: ${ngoClient.industry}`);
  console.log(`   Timeline: ${ngoClient.timeline}`);

  console.log("\n📋 Client 2: Tech Startup Engagement");
  console.log(`   Organization: ${techClient.name}`);
  console.log(`   Frameworks: ${techClient.frameworks.join(", ")}`);
  console.log(`   Industry: ${techClient.industry}`);
  console.log(`   Timeline: ${techClient.timeline}`);

  // Query database for framework coverage
  console.log("\n🔍 Querying live database for framework coverage...");

  try {
    // NGO frameworks
    console.log("\n📊 NGO Framework Analysis:");
    for (const framework of ngoClient.frameworks) {
      const { data, error } = await supabase
        .from('nist_controls')
        .select('control_id, title')
        .eq('framework', framework)
        .limit(5);

      if (error) {
        console.log(`   ❌ Error querying ${framework}: ${error.message}`);
      } else {
        console.log(`   ✅ ${framework}: ${data.length} controls found (showing first 5)`);
        data.forEach(control => {
          console.log(`      • ${control.control_id}: ${control.title}`);
        });
      }
    }

    // Tech startup frameworks
    console.log("\n📊 Tech Startup Framework Analysis:");
    for (const framework of techClient.frameworks) {
      const { data, error } = await supabase
        .from('nist_controls')
        .select('control_id, title')
        .eq('framework', framework)
        .limit(5);

      if (error) {
        console.log(`   ❌ Error querying ${framework}: ${error.message}`);
      } else {
        console.log(`   ✅ ${framework}: ${data.length} controls found (showing first 5)`);
        data.forEach(control => {
          console.log(`      • ${control.control_id}: ${control.title}`);
        });
      }
    }

    // Calculate readiness percentages (simulated based on maturity)
    console.log("\n📈 Engagement Dashboard Summary:");
    console.log("   NGO (Green Earth Foundation):");
    console.log("   • ISO 27001 Readiness: 15% (Basic maturity, limited resources)");
    console.log("   • NIST CSF Readiness: 25% (Easier framework for NGOs)");
    console.log("   • Overall Risk: HIGH - Limited security awareness");

    console.log("\n   Tech Startup (TechFlow AI):");
    console.log("   • CIS v8 Readiness: 45% (Good technical foundation)");
    console.log("   • NIST AI RMF Readiness: 20% (New framework, AI-specific)");
    console.log("   • NIST 800-53 Readiness: 35% (Some existing controls)");
    console.log("   • Overall Risk: MEDIUM - Good tech skills, needs governance");

  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
  }
}

// Run the simulation
onboardClients().catch(console.error);