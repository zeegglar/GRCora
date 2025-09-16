import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { authService, isSupabaseConfigured } from '../../services/supabaseClient';
import { mockUsers, mockApi } from '../../services/api';
import type { User } from '../../types';
import { UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  mockLogin: (userId: string) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = !isSupabaseConfigured;

  // Map Supabase user to our User type
  const mapSupabaseUserToUser = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata || {};

    return {
      id: supabaseUser.id,
      name: metadata.name || supabaseUser.email?.split('@')[0] || 'Unknown User',
      email: supabaseUser.email || '',
      role: metadata.role || UserRole.CLIENT_USER,
      avatarUrl: metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.name || 'User')}&background=0ea5e9&color=fff`,
      organizationId: metadata.organization_id || 'default-org'
    };
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        // Demo mode - no real authentication
        setIsLoading(false);
        return;
      }

      try {
        // Get initial session
        const session = await authService.getSession();
        if (mounted) {
          setSession(session);
          if (session?.user) {
            setSupabaseUser(session.user);
            setUser(mapSupabaseUserToUser(session.user));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session);

        setSession(session);
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser(mapSupabaseUserToUser(session.user));
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: supabaseUser } = await authService.signIn(email, password);
      if (supabaseUser) {
        setSupabaseUser(supabaseUser);
        setUser(mapSupabaseUserToUser(supabaseUser));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      await authService.signUp(email, password, metadata);
      // User will be automatically signed in if email confirmation is disabled
      // Otherwise, they need to confirm their email first
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await authService.signOut();
      }
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Mock login for demo mode
  const mockLogin = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    mockLogin,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};