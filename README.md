# GRCora - Setup and Development Guide

This guide will walk you through setting up the GRCora application for local development, including connecting it to a real Supabase backend.

## Prerequisites

- Node.js and npm
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase setup)

## 1. Environment Setup (Critical Fix for `TypeError`)

The error `Uncaught TypeError: Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')` occurs because the application requires environment variables to connect to the Supabase backend, but they have not been provided.

To fix this, create a new file named `.env` in the root directory of your project.

#### Create `.env` file:
```
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

You must replace the placeholder values with your actual Supabase project credentials, which you can get by following the steps below.

## 2. Supabase Backend Setup

You can either use the Supabase cloud platform or run it locally.

### Option A: Supabase Cloud (Recommended)

1.  **Create a Project:** Go to [supabase.com](https://supabase.com), sign in, and create a new project.
2.  **Get Credentials:** In your project dashboard, go to **Project Settings > API**. You will find your **Project URL** and **Project API `anon` (public) key** there.
3.  **Update `.env` file:** Copy these values into the `.env` file you created in Step 1.
4.  **Run SQL Migration:** Go to the **SQL Editor** in your Supabase dashboard, create a "New query", and paste the entire content of `supabase/migrations/0001_initial_schema.sql`. Click "Run" to create your database tables and security policies.

### Option B: Local Supabase Setup

1.  **Initialize Supabase:** In your project's root directory, run `supabase init`.
2.  **Start Supabase:** Run `supabase start`. This will spin up the local Supabase stack in Docker.
3.  **Get Local Credentials:** The CLI will output your local **API URL** and **`anon` key**.
4.  **Update `.env` file:** Copy these local values into your `.env` file. The migration script in `supabase/migrations` will be applied automatically when you start the service.

## 3. Deploy Edge Function

The AI assistant feature relies on a secure backend function to protect your Gemini API key.

1.  **Set Supabase Secrets:**
    - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/).
    - In your project's root directory, run the following command, replacing `YOUR_GEMINI_KEY` with your actual key:
      ```bash
      supabase secrets set API_KEY=YOUR_GEMINI_KEY
      ```
2.  **Deploy the Function:**
    ```bash
    supabase functions deploy ai-assist --no-verify-jwt
    ```

## 4. Install Dependencies & Run the App

Once your `.env` file is created and your Supabase backend is running, you can start the frontend application.

```bash
# Install dependencies (only needs to be done once)
npm install

# Run the development server
npm run dev
```

The application should now start without the `TypeError` and will be connected to your Supabase backend.
