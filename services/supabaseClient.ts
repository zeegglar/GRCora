// services/supabaseClient.ts

// Fix: Manually define types for import.meta.env to resolve errors when vite/client types are not found.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export the client and a flag indicating if it's configured.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Provide a real or dummy client based on configuration.
// This prevents a crash on module import.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as SupabaseClient;