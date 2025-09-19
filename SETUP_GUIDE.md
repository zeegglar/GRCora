# 🚀 GRCora Real Platform Setup Guide

Follow these steps to get your real GRC platform running with AI reports and file uploads.

## Step 1: Database Setup (5 minutes)

### 1.1 Apply Schema to Supabase
1. Go to https://supabase.com/dashboard
2. Open your project (already configured)
3. Click **"SQL Editor"** in left sidebar
4. Copy and paste the **entire contents** of `supabase_schema.sql`
5. Click **"Run"** button

This creates:
- ✅ Organizations, Projects, Assessments tables
- ✅ Risk management tables
- ✅ File storage buckets
- ✅ Security policies
- ✅ Default GRC controls (SOC2, ISO27001, NIST)

### 1.2 Verify Schema Applied
In SQL Editor, run: `SELECT * FROM controls LIMIT 5;`
You should see controls like "SOC2-CC6.1", "ISO-A.5.15", etc.

## Step 2: Get Free Gemini API Key (2 minutes)

### 2.1 Get API Key
1. Go to https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Copy the key (starts with "AIza...")

### 2.2 Add to Environment
Replace `your_gemini_api_key_here` in `.env` file with your actual key:
```
VITE_GOOGLE_API_KEY=AIzaSyYourActualKeyHere
```

**Cost**: ~$0.50/month for 100 AI reports (super cheap!)

## Step 3: Test the Platform

### 3.1 Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3.2 Test Report Generation
1. Login as consultant
2. Click on any client card
3. Click **"📊 Reports"** button
4. Click **"Generate Report"**
5. Watch AI generate professional PDF!

## Step 4: What You Can Do Now

### ✅ Real Functionality Available:

**Consultant Features:**
- ✅ Dashboard with real client health scores
- ✅ AI-generated assessment reports
- ✅ Executive summaries for C-suite
- ✅ Risk register with AI insights
- ✅ File upload for evidence
- ✅ Client-branded PDFs

**Report Types:**
1. **Full Assessment Report** - Complete control analysis
2. **Executive Dashboard** - KPI summary for leadership
3. **Risk Register** - AI-powered risk insights

**File Management:**
- Upload evidence per control
- Secure cloud storage
- Download links with expiration

## Step 5: Demo Workflow

### 5.1 Complete Consultant Workflow:
1. **Dashboard** → See client health scores
2. **Click client** → View project details
3. **Assessments** → Mark controls compliant/non-compliant
4. **Risks** → Add identified risks
5. **Evidence** → Upload supporting documents
6. **Reports** → Generate AI-powered deliverables
7. **Download** → Professional PDFs ready for clients

### 5.2 What Makes This Special:
- **AI Insights**: Gemini analyzes your data for executive summaries
- **Professional Output**: Client-branded PDFs, not generic templates
- **Real Database**: Persistent data, not demo placeholders
- **Consultant-Focused**: Built for actual GRC workflow

## Troubleshooting

### Database Issues:
- Ensure schema ran successfully in Supabase SQL Editor
- Check browser console for errors

### API Issues:
- Verify Gemini API key is correct in `.env`
- Restart dev server after adding key

### Report Generation:
- First report may take 60 seconds (AI processing)
- Check network tab for error details

## Next Steps

Once working:
1. **Add Real Clients**: Create organizations and projects
2. **Upload Evidence**: Test file upload system
3. **Generate Reports**: Create professional deliverables
4. **Customize Branding**: Add client logos to reports

---

**This is now a REAL GRC platform, not a demo!** 🎉

You have:
- Real database with GRC schema
- AI-powered report generation
- Professional PDF output
- File upload system
- Consultant workflow

Cost: ~$2-5/month for typical usage.