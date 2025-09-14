import React, { useState } from 'react';
import type { Control, ControlMapping } from '../../../types';
import { LinkIcon, TrashIcon } from '../../ui/Icons';

interface ControlMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control;
  allControls: Control[];
  mappings: ControlMapping[];
  onCreate: (sourceControlId: string, targetControlId: string) => void;
  onDelete: (mappingId: string) => void;
}

const ControlMappingModal: React.FC<ControlMappingModalProps> = ({ isOpen, onClose, control, allControls, mappings, onCreate, onDelete }) => {
  const [targetControlId, setTargetControlId] = useState('');
  
  if (!isOpen) return null;

  const getTargetControl = (mapping: ControlMapping) => {
      const targetId = mapping.sourceControlId === control.id ? mapping.targetControlId : mapping.sourceControlId;
      return allControls.find(c => c.id === targetId);
  }

  const handleAddMapping = () => {
    if (targetControlId && targetControlId !== control.id) {
        onCreate(control.id, targetControlId);
        setTargetControlId('');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Control Mappings</h2>
            <p className="text-sm text-slate-400">{control.id} - {control.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Add New Mapping</h3>
            <div className="flex space-x-2">
                <select
                    value={targetControlId}
                    onChange={(e) => setTargetControlId(e.target.value)}
                    className="flex-grow px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled>Select a control to map to...</option>
                    {allControls
                        .filter(c => {
                           const isSelf = c.id === control.id;
                           const isAlreadyMapped = mappings.some(m => {
                               const target = getTargetControl(m);
                               return target?.id === c.id;
                           });
                           return !isSelf && !isAlreadyMapped;
                        })
                        .map(c => <option key={c.id} value={c.id}>{c.id} ({c.framework}) - {c.name}</option>)
                    }
                </select>
                <button 
                  onClick={handleAddMapping} 
                  disabled={!targetControlId}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LinkIcon className="h-4 w-4" />
                    <span>Map</span>
                </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Existing Mappings</h3>
            {mappings.length > 0 ? (
                <ul className="space-y-2">
                    {mappings.map(m => {
                        const target = getTargetControl(m);
                        if (!target) return null;
                        return (
                            <li key={m.id} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-300">{target.name}</span>
                                    <span className="font-mono text-blue-400 text-xs">{target.id} ({target.framework})</span>
                                </div>
                                <button onClick={() => onDelete(m.id)} className="text-slate-500 hover:text-red-400 p-1 rounded">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            ) : <p className="text-slate-400 text-center py-4">No mappings found for this control.</p>
            }
          </div>
        </div>
        <footer className="p-4 border-t border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Close</button>
        </footer>
      </div>
    </div>
  );
};

export default ControlMappingModal;
