import React, { useState } from 'react';
import type { Risk, Control, RiskLevel as RiskLevelType } from '../../../types';
import { RiskLevel } from '../../../types';

interface NewRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (riskData: Omit<Risk, 'id'>) => void;
  controls: Control[];
  projectId: string;
}

const NewRiskModal: React.FC<NewRiskModalProps> = ({ isOpen, onClose, onSave, controls, projectId }) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<RiskLevelType>(RiskLevel.MEDIUM);
  const [controlId, setControlId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !controlId) {
      alert('Please fill out all fields.');
      return;
    }
    onSave({
      title,
      level,
      controlId,
      status: 'Open',
      projectId,
    });
    // Reset form
    setTitle('');
    setLevel(RiskLevel.MEDIUM);
    setControlId('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add New Risk</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div>
              <label htmlFor="riskTitle" className="block text-sm font-medium text-slate-300 mb-1">Risk Title</label>
              <input
                type="text"
                id="riskTitle"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Inadequate user access reviews"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="riskLevel" className="block text-sm font-medium text-slate-300 mb-1">Risk Level</label>
                    <select
                        id="riskLevel"
                        value={level}
                        onChange={e => setLevel(e.target.value as RiskLevelType)}
                        className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        {Object.values(RiskLevel).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="relatedControl" className="block text-sm font-medium text-slate-300 mb-1">Related Control</label>
                    <select
                        id="relatedControl"
                        value={controlId}
                        onChange={e => setControlId(e.target.value)}
                        className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="" disabled>Select a control</option>
                        {controls.map(c => <option key={c.id} value={c.id}>{c.id} - {c.name}</option>)}
                    </select>
                </div>
            </div>
          </div>
          <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white">Save Risk</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NewRiskModal;
