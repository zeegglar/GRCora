import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '../ui/Icons';

const LoginPage: React.FC = () => {
  const { signIn, signUp, resetPassword, isDemoMode, mockLogin, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Demo mode users
  const demoUsers = [
    { id: 'user-1', name: 'Alice Martin (Consultant Owner)', role: 'CONSULTANT_OWNER' },
    { id: 'user-2', name: 'Bob Chen (Client Admin)', role: 'CLIENT_ADMIN' },
    { id: 'user-3', name: 'Charlie Davis (Client User)', role: 'CLIENT_USER' },
    { id: 'user-4', name: 'Diana Prince (Consultant Admin)', role: 'CONSULTANT_ADMIN' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isResetPassword) {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox.');
        setIsResetPassword(false);
        return;
      }

      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        const metadata = {
          name: formData.name,
          organization_name: formData.organizationName,
          role: 'CLIENT_USER' // Default role, can be changed by admin later
        };

        await signUp(formData.email, formData.password, metadata);
        setSuccess('Account created! Please check your email to confirm your account.');
        setIsSignUp(false);
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDemoLogin = (userId: string) => {
    mockLogin(userId);
  };

  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
            <p className="text-slate-400 mt-2">GRC for Consultants and Their Clients</p>
          </div>
          <div className="glass-card rounded-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center">Demo Mode</h2>
            <p className="text-center text-sm text-slate-400 mt-2 mb-6">
              Supabase not configured. Select a demo user to continue.
            </p>
            <div className="space-y-3">
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleDemoLogin(user.id)}
                  className="w-full p-3 text-left rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-white"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.role.replace(/_/g, ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
          <p className="text-slate-400 mt-2">GRC for Consultants and Their Clients</p>
        </div>

        <div className="glass-card rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    id="organization"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your organization name"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors font-semibold text-white"
            >
              {isLoading ? 'Processing...' :
               isResetPassword ? 'Send Reset Email' :
               isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {!isResetPassword && (
              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            )}

            {!isSignUp && (
              <div className="text-center">
                <button
                  onClick={() => setIsResetPassword(!isResetPassword)}
                  className="text-slate-400 hover:text-slate-300 text-sm"
                >
                  {isResetPassword ? 'Back to sign in' : 'Forgot your password?'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
