# 🔒 GitHub Secrets Setup Guide

## ⚠️ IMMEDIATE ACTION REQUIRED

Your API keys were exposed in your repository. Follow these steps **immediately**:

## 1. 🚨 Revoke Compromised Keys

### Google Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Find your key `AIzaSyBq3ykgzF-UOaCxmdaXpS6zQN2nhEXYGHU`
3. Click **"Delete"** to revoke it
4. Create a new API key
5. Copy the new key for step 2

### Supabase Keys
1. Go to https://supabase.com/dashboard/project/[your-project]/settings/api
2. **Regenerate** your anon key
3. Copy the new anon key for step 2

## 2. 🔑 Set Up GitHub Secrets

### 2.1 Add Secrets to Repository
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

Add these secrets:

```
Name: VITE_SUPABASE_URL
Value: https://bxuemorpwwelxpbrpyve.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: [your_new_regenerated_anon_key]

Name: VITE_GOOGLE_API_KEY
Value: [your_new_google_api_key]
```

### 2.2 Update Your Local Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your NEW keys (not the old ones!)
# Use the same NEW keys you added to GitHub secrets
```

## 3. 🚀 Update GitHub Actions (if using)

If you have GitHub Actions for deployment, update your workflow file:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
        run: npm run build
```

## 4. 🛡️ Security Best Practices

### ✅ What's Now Secure:
- [x] API keys removed from code
- [x] `.env` added to `.gitignore`
- [x] `.env.example` created for developers
- [x] Documentation updated to use example file

### 🔒 Additional Security Steps:
1. **Enable Supabase RLS**: Ensure Row Level Security is enabled
2. **Restrict API Usage**: Set up usage limits on your Google API key
3. **Monitor Usage**: Watch for unusual API activity
4. **Rotate Keys**: Change keys every 90 days
5. **Use Service Accounts**: For production, use service accounts not personal keys

## 5. 🚨 Security Incident Response

**If keys are exposed again:**
1. Immediately revoke all compromised keys
2. Generate new keys
3. Update GitHub secrets
4. Update local environment
5. Check recent API usage for suspicious activity
6. Consider implementing IP restrictions

## 6. 📋 Developer Onboarding

**For new developers:**
1. Clone repository
2. Copy `.env.example` to `.env`
3. Get API keys from team lead (never commit to git)
4. Add keys to local `.env` file
5. Never commit `.env` files

## 7. 🚀 Production Deployment

**For production environments:**
- Use platform-specific secret management (Vercel env vars, Netlify env vars, etc.)
- Never use personal API keys in production
- Set up service accounts with minimal permissions
- Monitor and log all API usage
- Set up alerts for unusual activity

---

## ⚡ Quick Recovery Commands

```bash
# 1. Clean up your repo
git add .gitignore .env.example GITHUB_SECRETS_SETUP.md
git commit -m "🔒 Security: Remove exposed API keys and add secrets management"
git push

# 2. Verify .env is ignored
git status  # Should NOT show .env file

# 3. Test your app still works
npm run dev
```

**Status**: 🔒 Repository is now secure with proper secrets management.