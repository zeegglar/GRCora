// services/supabaseClient.ts

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