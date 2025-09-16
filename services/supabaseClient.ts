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

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// FIX: Use optional chaining (?.) to safely access environment variables.
// This prevents a crash if `import.meta.env` is undefined during the initial
// module load, which was the cause of the TypeError. The `as any` is used
// to bypass TypeScript's strict checking for this environment-injected variable.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// This flag will now be correctly calculated as `false` if the env vars are missing,
// instead of crashing the application.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key');

// Provide a real or dummy client based on configuration.
export let supabase: SupabaseClient;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
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

// Auth helper functions
export const authService = {
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, metadata?: any) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser(): Promise<User | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  }
};
