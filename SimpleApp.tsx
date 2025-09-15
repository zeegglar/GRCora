import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';

type View = { type: 'landing' } | { type: 'login' } | { type: 'dashboard' };

const SimpleApp: React.FC = () => {
  const [view, setView] = useState<View>({ type: 'landing' });

  const handleLogin = (userId: string) => {
    console.log('Login clicked for user:', userId);
    // For now, just log - we can implement this later
  };

  return (
    <div className="min-h-screen">
      {view.type === 'landing' ? (
        <LandingPage setView={setView} onLogin={handleLogin} />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Login Page</h1>
            <button
              onClick={() => setView({ type: 'landing' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Landing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;