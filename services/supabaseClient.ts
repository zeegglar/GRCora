// services/supabaseClient.ts

// Manually define types for import.meta.env to resolve errors when vite/client types are not found.
// This helps with TypeScript checking but doesn't affect runtime.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// FIX: Use optional chaining (?.) to safely access environment variables.
// This prevents a crash if `import.meta.env` is undefined during the initial
// module load, which was the cause of the TypeError. The `as any` is used
// to bypass TypeScript's strict checking for this environment-injected variable.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// This flag will now be correctly calculated as `false` if the env vars are missing,
// instead of crashing the application.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Provide a real or dummy client based on configuration.
export let supabase: SupabaseClient;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // A warning for developers in the console is helpful for debugging.
  // The UI will handle showing the primary notice to the user.
  console.warn(
    "Supabase credentials are not configured. The app will display a setup notice. " +
    "Please create a .env file and restart the development server."
  );
  // Create a dummy client to avoid further errors in components that import supabase.
  supabase = {} as SupabaseClient;
}
