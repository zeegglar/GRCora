import React, { useState } from 'react';
import { mockUsers } from '../../services/api';

interface LoginPageProps {
  onLogin: (userId: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
            <p className="text-slate-400 mt-2">GRC for Consultants and Their Clients</p>
        </div>
        <div className="glass-card rounded-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center">Sign In</h2>
            <p className="text-center text-sm text-slate-400 mt-2 mb-6">This is a demo. Please select a user profile to log in.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="user-select" className="block text-sm font-medium text-slate-300 mb-2">Select a user to continue</label>
                    <select
                        id="user-select"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {mockUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.role.replace(/_/g, ' ')})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="w-full mt-4 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white">
                    Sign In
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
