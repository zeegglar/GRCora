
import React from 'react';
import type { Policy, PolicyVersion } from '../../../types';
import { mockUsers } from '../../../services/api';

interface PolicyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  history: PolicyVersion[];
}

const PolicyHistoryModal: React.FC<PolicyHistoryModalProps> = ({ isOpen, onClose, policy, history }) => {
  if (!isOpen) return null;
  
  // FIX: Explicitly type userMap to resolve potential type inference issues.
  const userMap: Map<string, string> = new Map(mockUsers.map(u => [u.id, u.name]));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Version History</h2>
            <p className="text-sm text-slate-400">{policy?.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {history.length > 0 ? (
            <ul className="space-y-4">
              {history.map(version => (
                <li key={version.version} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-400">Version {version.version}</span>
                    <span className="text-xs text-slate-500">{version.date}</span>
                  </div>
                  <p className="text-sm text-slate-300">{version.changes}</p>
                  <p className="text-xs text-slate-500 mt-2">Edited by: {userMap.get(version.editorId) || 'Unknown'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-400 py-8">No version history found for this policy.</p>
          )}
        </div>
         <footer className="p-4 border-t border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Close</button>
        </footer>
      </div>
    </div>
  );
};

export default PolicyHistoryModal;