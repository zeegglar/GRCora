import React, { useState } from 'react';
import { authService, isSupabaseConfigured } from '../../services/supabaseClient';
import { EyeIcon, EyeSlashIcon } from '../ui/Icons';

interface AuthenticatedLoginPageProps {
  onLoginSuccess: () => void;
  fallbackToMockLogin?: () => void;
}

const AuthenticatedLoginPage: React.FC<AuthenticatedLoginPageProps> = ({
  onLoginSuccess,
  fallbackToMockLogin
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await authService.signUp(email, password, {
          name,
          organization,
          role: 'CLIENT_USER' // Default role for new signups
        });
        setError('Please check your email to confirm your account.');
        setIsSignUp(false);
      } else {
        await authService.signIn(email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      await authService.resetPassword(email);
      setResetEmailSent(true);
      setError('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  // If Supabase is not configured, show mock login option
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
            <p className="text-slate-400 mt-2">GRC for Consultants and Their Clients</p>
          </div>
          <div className="glass-card rounded-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Authentication Not Configured</h2>
            <p className="text-center text-sm text-slate-400 mb-6">
              Supabase authentication is not configured. You can use demo mode or configure authentication.
            </p>
            {fallbackToMockLogin && (
              <button
                onClick={fallbackToMockLogin}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
              >
                Continue with Demo Mode
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
          <p className="text-slate-400 mt-2">GRC for Consultants and Their Clients</p>
        </div>

        <div className="glass-card rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-2">
                    Organization
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required={isSignUp}
                    className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your organization name"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {!isSignUp && (
              <button
                onClick={handlePasswordReset}
                className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setResetEmailSent(false);
                }}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            {fallbackToMockLogin && (
              <div className="text-center border-t border-slate-700 pt-3">
                <button
                  onClick={fallbackToMockLogin}
                  className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Continue with Demo Mode
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedLoginPage;