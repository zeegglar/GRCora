import React from 'react';

interface BasicLandingProps {
  setView: (view: any) => void;
  onLogin: (userId: string) => void;
}

const BasicLanding: React.FC<BasicLandingProps> = ({ setView, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-blue-400 mb-8">
          GRCora
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Unified GRC for Consultants and Their Clients
        </p>
        <div className="space-x-4">
          <button
            onClick={() => onLogin('user-1')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Try Consultant Dashboard
          </button>
          <button
            onClick={() => onLogin('user-4')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Try Client Portal
          </button>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              🎯 Interactive Dashboards
            </h3>
            <p className="text-slate-400">
              Advanced portfolio management with real-time analytics and health scoring
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              ⚡ Real-Time Monitoring
            </h3>
            <p className="text-slate-400">
              Live notifications for risks, compliance changes, and vendor incidents
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              🔄 Automated Workflows
            </h3>
            <p className="text-slate-400">
              Smart task generation and intelligent remediation planning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicLanding;