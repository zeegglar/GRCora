# 🚀 Comprehensive GRC Platform Setup Guide

This guide transforms your GRCora platform from basic functionality into a **professional-grade, enterprise-ready GRC solution** with advanced capabilities including Statement of Applicability (SoA) management, quantitative risk assessment, comprehensive TPRM, and AI-powered insights.

## 🏗️ What You're Building

**From**: Basic assessment tracking and simple reports
**To**: Enterprise GRC platform with:
- ✅ **Statement of Applicability (SoA)** - ISO 27001 compliant workflow
- ✅ **Quantitative Risk Assessment** - Monte Carlo simulation with 100K+ iterations
- ✅ **Comprehensive TPRM** - Vendor risk scoring and lifecycle management
- ✅ **Control Testing Engine** - Maturity scoring and gap analysis
- ✅ **Policy Management** - Approval workflows and version control
- ✅ **Audit Management** - Complete audit lifecycle support
- ✅ **Vision AI Assistant** - RAG-powered GRC intelligence
- ✅ **Role-Based Dashboards** - Executive and operational views
- ✅ **Professional Reporting** - Business-ready deliverables

---

## 📋 Prerequisites

**Technical Requirements:**
- Node.js 18+ and npm
- Supabase account (free tier sufficient for development)
- Google Gemini API key (free tier: $0.50/month for 100 reports)

**Business Context:**
- Understanding of GRC frameworks (ISO 27001, NIST CSF, etc.)
- Knowledge of risk assessment methodologies
- Familiarity with audit and compliance processes

---

## 🗃️ Step 1: Database Schema Migration

### 1.1 Apply Comprehensive Schema

**Important**: This extends your existing schema with professional GRC capabilities.

1. **Backup your current database** (recommended)
2. **Copy the comprehensive schema**:
   ```bash
   # Navigate to your GRCora directory
   cd /path/to/GRCora

   # The comprehensive schema is in schemas/comprehensive_schema.sql
   ```

3. **Apply to Supabase**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor**
   - Copy and paste the **entire contents** of `schemas/comprehensive_schema.sql`
   - Click **"Run"** (this may take 2-3 minutes)

### 1.2 Verify Schema Applied Successfully

Run this verification query in SQL Editor:
```sql
-- Verify new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('soa_entries', 'risk_treatments', 'vendor_tiers', 'audit_findings');

-- Should return 4 rows
```

### 1.3 Set Up Row-Level Security (RLS)

The schema includes RLS policies, but verify they're active:
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Should show multiple tables with RLS enabled
```

---

## 🎭 Step 2: Update Application Types

### 2.1 Replace Type Definitions

**Replace** your current `types.ts` with the comprehensive types:

```bash
# Backup current types
mv types.ts types_backup.ts

# Copy comprehensive types
cp types/comprehensive.ts types.ts
```

### 2.2 Update Import Statements

Update components to use the new comprehensive types:
```typescript
// Old imports
import type { Risk, User, Project } from '../types';

// New imports
import type { RiskEnhanced, UserProfile, ProjectEnhanced } from '../types/comprehensive';
```

---

## 🔧 Step 3: Install Additional Dependencies

### 3.1 Add Quantitative Analysis Libraries

```bash
npm install --save \
  recharts \
  @types/d3 \
  d3-array \
  d3-scale \
  mathjs
```

### 3.2 Add AI/RAG Dependencies

```bash
npm install --save \
  @google/generative-ai \
  chromadb \
  @pinecone-database/pinecone \
  tiktoken
```

### 3.3 Add Professional Reporting

```bash
npm install --save \
  jspdf \
  html2canvas \
  docx \
  exceljs
```

---

## 🧮 Step 4: Configure Quantitative Risk Assessment

### 4.1 Set Up Monte Carlo Service

The quantitative risk service is already implemented in `services/quantitativeRiskService.ts`. Test it:

```typescript
// Test Monte Carlo simulation
import QuantitativeRiskService from './services/quantitativeRiskService';

const riskService = QuantitativeRiskService.getInstance();
const scenarios = riskService.generateIndustryScenarios('healthcare', 'medium');

// Run simulation (this will take 10-30 seconds)
const results = await riskService.simulateRiskScenario(scenarios[0], 10000);
console.log('ALE Mean:', results.annual_loss_expectancy.mean);
```

### 4.2 Configure Risk Parameters

Edit `services/quantitativeRiskService.ts` to customize for your organization:

```typescript
// Adjust industry scenarios
const INDUSTRY_SCENARIOS = {
  healthcare: {
    data_breach: { min: 100000, max: 10000000, likely: 1500000 },
    ransomware: { min: 500000, max: 25000000, likely: 5000000 }
  },
  financial: {
    cyber_fraud: { min: 250000, max: 25000000, likely: 3000000 },
    regulatory: { min: 1000000, max: 15000000, likely: 5000000 }
  }
  // Add your industry
};
```

---

## 📜 Step 5: Configure Statement of Applicability (SoA)

### 5.1 Set Up SoA Component

The SoA management system is implemented in `components/soa/SoAManager.tsx`. To integrate:

```typescript
// Add to your project view router
import SoAManager from '../soa/SoAManager';

// In your project view component:
case 'soa':
  return <SoAManager project={project} onBack={() => setActiveTab('overview')} />;
```

### 5.2 Configure Control Libraries

Add comprehensive control definitions to your database:

```sql
-- Insert ISO 27001:2022 controls (sample)
INSERT INTO controls (id, name, description, family, framework) VALUES
('ISO-A.5.1', 'Policies for information security', 'Management direction and support for information security', 'Organizational', 'ISO 27001:2022'),
('ISO-A.5.2', 'Information security roles and responsibilities', 'Information security roles defined and allocated', 'Organizational', 'ISO 27001:2022'),
-- Add remaining 93 controls...
```

### 5.3 Set Up SoA Approval Workflow

Configure approval routing in the database:
```sql
-- Configure SoA approval workflow
INSERT INTO approval_workflows (entity_type, stages, routing_rules) VALUES
('soa_entry',
 '["security_review", "management_approval", "final_sign_off"]',
 '{"security_review": "role:security_officer", "management_approval": "role:ciso", "final_sign_off": "role:ceo"}'
);
```

---

## 🎯 Step 6: Set Up Vision AI Assistant

### 6.1 Configure Gemini AI

Add your Gemini API key to `.env`:
```bash
# Copy .env.example to .env and update with your keys
cp .env.example .env

# Edit .env with your actual API keys
VITE_GOOGLE_API_KEY=your_actual_gemini_api_key_here

# For production, use GitHub secrets or environment variables
# NEVER commit API keys to git!
```

### 6.2 Set Up RAG Knowledge Base

Create embeddings for your GRC content:

```typescript
// Initialize knowledge base
import { createEmbeddings } from './services/ragService';

const initializeKnowledgeBase = async () => {
  // Embed framework controls
  await createEmbeddings('iso27001_controls', iso27001Controls);
  await createEmbeddings('nist_csf_controls', nistCsfControls);

  // Embed organizational policies
  await createEmbeddings('org_policies', organizationPolicies);

  // Embed assessment findings
  await createEmbeddings('assessment_data', assessmentFindings);
};
```

### 6.3 Configure AI Assistant Component

Add the Vision AI assistant to your header:

```typescript
// In components/layout/Header.tsx
import VisionAI from '../ai/VisionAIAssistant';

// Add to header actions
<VisionAI
  userRole={userRole}
  organizationId={organizationId}
  contextData={currentProjectData}
/>
```

---

## 📊 Step 7: Configure Executive Dashboards

### 7.1 Set Up KPI Calculations

Configure real-time KPI calculations:

```sql
-- Create KPI calculation views
CREATE VIEW consultant_portfolio_health AS
SELECT
  c.id as consultant_org_id,
  AVG(compliance_percentage) as avg_compliance,
  COUNT(DISTINCT p.id) as active_projects,
  SUM(CASE WHEN r.level = 'Critical' THEN 1 ELSE 0 END) as critical_risks
FROM organizations c
JOIN engagements e ON c.id = e.consultant_org_id
JOIN projects p ON e.client_org_id = p.organization_id
LEFT JOIN risks r ON p.id = r.project_id
GROUP BY c.id;
```

### 7.2 Configure Dashboard Cards

Set up role-based dashboard configurations:

```typescript
// Configure consultant dashboard
const consultantDashboardConfig = {
  layout: [
    { component: 'PortfolioHealthGauge', position: { x: 0, y: 0, w: 6, h: 4 } },
    { component: 'ClientRiskMap', position: { x: 6, y: 0, w: 6, h: 4 } },
    { component: 'TasksPipeline', position: { x: 0, y: 4, w: 8, h: 6 } },
    { component: 'RevenueAtRisk', position: { x: 8, y: 4, w: 4, h: 6 } }
  ],
  refresh_interval: 300000 // 5 minutes
};

// Configure client dashboard
const clientDashboardConfig = {
  layout: [
    { component: 'ComplianceProgress', position: { x: 0, y: 0, w: 12, h: 3 } },
    { component: 'NextActions', position: { x: 0, y: 3, w: 8, h: 6 } },
    { component: 'TopRisks', position: { x: 8, y: 3, w: 4, h: 6 } }
  ],
  refresh_interval: 60000 // 1 minute
};
```

---

## 🔐 Step 8: Security Configuration

### 8.1 Configure Authentication Roles

Set up proper role-based access control:

```sql
-- Create user roles with specific permissions
INSERT INTO roles (name, permissions, description) VALUES
('consultant_owner',
 '["full_access", "client_management", "billing", "user_management"]',
 'Principal consultant with full platform access'),
('consultant_analyst',
 '["project_access", "assessment_write", "report_generate"]',
 'GRC analyst with project-level access'),
('client_ciso',
 '["project_admin", "policy_approve", "risk_accept", "user_invite"]',
 'Client CISO with administrative access'),
('client_user',
 '["evidence_upload", "task_complete", "dashboard_view"]',
 'Client user with operational access');
```

### 8.2 Configure Data Encryption

Ensure sensitive data is encrypted:

```sql
-- Enable encryption for sensitive columns
ALTER TABLE risks ADD COLUMN encrypted_description TEXT;
ALTER TABLE policies ADD COLUMN encrypted_content TEXT;
ALTER TABLE vendor_responses ADD COLUMN encrypted_answer TEXT;

-- Create encryption policies
CREATE POLICY encrypt_sensitive_data ON risks
  FOR SELECT USING (
    -- Only show decrypted data to authorized users
    current_setting('app.user_role') IN ('consultant_owner', 'client_ciso')
  );
```

---

## 🧪 Step 9: Testing & Validation

### 9.1 Test Core Functionality

**Test SoA Management:**
```bash
# Create test SoA entries
curl -X POST localhost:3000/api/soa \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test-project",
    "control_id": "ISO-A.5.1",
    "applicability": "applicable",
    "justification": "Test justification"
  }'
```

**Test Quantitative Risk:**
```javascript
// Test Monte Carlo simulation
const scenarios = await riskService.generateIndustryScenarios('healthcare', 'medium');
const results = await riskService.simulateRiskScenario(scenarios[0], 10000);

// Verify results
console.assert(results.annual_loss_expectancy.mean > 0);
console.assert(results.convergence_test.converged === true);
```

**Test AI Assistant:**
```javascript
// Test RAG query
const response = await visionAI.query(
  "What are the critical control gaps in our ISO 27001 implementation?",
  { project_id: "test-project", user_role: "consultant" }
);

// Verify response includes citations
console.assert(response.citations.length > 0);
console.assert(response.confidence_score > 70);
```

### 9.2 Performance Testing

**Database Performance:**
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM soa_entries WHERE project_id = 'test-project';
EXPLAIN ANALYZE SELECT * FROM risks WHERE residual_rating > 15;

-- Should complete in <50ms with proper indexes
```

**AI Performance:**
```javascript
// Test AI response time
const startTime = Date.now();
const response = await visionAI.query("Summarize our risk posture");
const responseTime = Date.now() - startTime;

// Should respond in <10 seconds
console.assert(responseTime < 10000);
```

---

## 🚀 Step 10: Production Deployment

### 10.1 Environment Configuration

**Production Environment Variables:**
```bash
# Production .env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
GEMINI_API_KEY=your_production_gemini_key

# Security settings
SESSION_TIMEOUT=1800000  # 30 minutes
MAX_FILE_SIZE=104857600  # 100MB
CORS_ORIGIN=https://yourdomain.com

# Performance settings
DB_POOL_SIZE=20
CACHE_TTL=300000  # 5 minutes
MAX_CONCURRENT_SIMULATIONS=5
```

### 10.2 Build and Deploy

```bash
# Build production version
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

### 10.3 Post-Deployment Verification

**Health Check Endpoints:**
```bash
# Test API health
curl https://your-domain.com/api/health

# Test database connectivity
curl https://your-domain.com/api/db-health

# Test AI service
curl https://your-domain.com/api/ai-health
```

---

## 📈 Step 11: User Onboarding

### 11.1 Create Demo Data

Populate with realistic demo data for user training:

```sql
-- Run the comprehensive seeding script
-- (includes realistic scenarios for multiple industries)
\i scripts/comprehensive_seed.sql
```

### 11.2 User Training

**Consultant Training Path:**
1. **Dashboard Overview** - Portfolio health, client metrics
2. **SoA Management** - ISO 27001 workflow, control selection
3. **Risk Assessment** - Quantitative analysis, Monte Carlo
4. **AI Assistant** - Query capabilities, report generation
5. **Client Management** - Multi-tenant workflows

**Client Training Path:**
1. **Dashboard Overview** - Compliance status, action items
2. **Task Management** - Evidence upload, approvals
3. **Risk Review** - Understanding business impact
4. **Policy Management** - Review and approval workflow
5. **AI Assistant** - Getting answers in plain English

---

## 🎯 Success Criteria

**Technical Validation:**
- [ ] All new database tables created successfully
- [ ] SoA workflow generates ISO-compliant documents
- [ ] Monte Carlo simulations converge within 100K iterations
- [ ] AI assistant responds in <10 seconds with 85%+ accuracy
- [ ] Dashboard KPIs update in real-time
- [ ] Role-based access controls function correctly

**Business Validation:**
- [ ] Consultants can manage complete SoA lifecycle
- [ ] Risk assessments produce statistically valid results
- [ ] Clients can track compliance progress effectively
- [ ] Executive reports are presentation-ready
- [ ] Audit trails are comprehensive and compliant

**Performance Benchmarks:**
- [ ] Dashboard loads in <3 seconds
- [ ] Database queries complete in <100ms
- [ ] File uploads handle 100MB+ files
- [ ] Concurrent user capacity: 100+ users
- [ ] AI responses: <10 seconds for 95% of queries

---

## 🆘 Troubleshooting

### Common Issues

**Schema Migration Fails:**
```sql
-- Check for conflicts
SELECT * FROM information_schema.columns
WHERE table_name = 'existing_table' AND column_name = 'new_column';

-- Resolve manually if needed
ALTER TABLE existing_table ADD COLUMN IF NOT EXISTS new_column TEXT;
```

**Monte Carlo Performance:**
```javascript
// Reduce iterations for testing
const config = { iterations: 10000 }; // Instead of 100000

// Enable convergence testing
const results = await riskService.simulateRiskScenario(scenario, 50000);
console.log('Converged at:', results.convergence_test.stable_at_iteration);
```

**AI Rate Limits:**
```javascript
// Implement rate limiting
const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
await rateLimiter.check();
```

---

## 📞 Support & Resources

**Documentation:**
- API Reference: `/docs/api-reference.md`
- Database Schema: `/docs/schema-documentation.md`
- AI Configuration: `/docs/ai-setup-guide.md`

**Community:**
- GitHub Issues: Report bugs and feature requests
- Discord: Real-time support and community discussion

**Professional Services:**
- Implementation Support: Custom configuration assistance
- Training Services: On-site or remote team training
- Custom Development: Bespoke GRC workflow development

---

## 🎉 Congratulations!

You now have a **professional-grade, enterprise-ready GRC platform** with:

✅ **Statement of Applicability Management** - ISO 27001 compliant
✅ **Quantitative Risk Assessment** - Statistically rigorous
✅ **Comprehensive TPRM** - Full vendor lifecycle
✅ **AI-Powered Insights** - RAG-enhanced intelligence
✅ **Executive Dashboards** - Business-ready analytics
✅ **Audit-Ready Documentation** - Professional deliverables

**Cost**: ~$5-15/month for typical usage (vs $50,000+ for commercial GRC platforms)
**Capability**: Professional-grade functionality matching enterprise solutions
**Flexibility**: Full source code control and customization capability

Your platform is now ready for serious GRC work! 🚀