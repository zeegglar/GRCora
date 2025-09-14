import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { View } from '../../types';

interface LoginPageProps {
  setView: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      // The onAuthStateChange listener in App.tsx will handle navigation
    }
    setLoading(false);
  };
  
  const demoUsers = [
      { email: 'owner@aurelius.test', role: 'Consultant Owner' },
      { email: 'admin@northwind.test', role: 'Client Admin' },
      { email: 'admin@contoso.test', role: 'Client Admin' },
      { email: 'admin@litware.test', role: 'Client Admin' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 bg-gradient-grcora">
      <div className="w-full max-w-md animate-fade-in-scale-up">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-gradient bg-gradient-grcora">GRCora</h1>
            <p className="text-xl text-indigo-200 mt-2">
                Compliance, streamlined. Risk, revealed.
            </p>
        </div>
        
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-slate-400 mb-6 text-center">Sign in to your account</p>
          <form onSubmit={handleSubmit}>
            {error && <p className="bg-red-500/20 text-red-400 text-center text-sm p-3 rounded-lg mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., owner@aurelius.test"
                className="w-full px-4 py-3 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6">
            <h3 className="text-indigo-200/80 font-semibold mb-3 text-center">Quick Logins</h3>
            <div className="grid grid-cols-2 gap-2">
                {demoUsers.map(user => (
                    <button 
                        key={user.email} 
                        onClick={() => { setEmail(user.email); setPassword('password123'); }} 
                        className="text-sm text-center p-2 rounded-md bg-slate-800/50 hover:bg-slate-700/70 text-indigo-300 transition-colors"
                    >
                        {user.role}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">(Demo password: password123)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
