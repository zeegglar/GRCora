import React, { useState } from 'react';
import type { Organization } from '../../types';
import { mockApi } from '../../services/api';

interface NewEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Organization[];
  onCreate: (name: string, organizationId: string, frameworks: string[]) => void;
  onClientCreated: () => void;
}

const availableFrameworks = ['SOC 2', 'ISO 27001:2022', 'HIPAA', 'PCI DSS v4.0', 'NIST CSF 2.0'];

const NewEngagementModal: React.FC<NewEngagementModalProps> = ({ isOpen, onClose, clients, onCreate, onClientCreated }) => {
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  
  const isAddingNewClient = clientId === 'add_new_client';

  if (!isOpen) return null;

  const handleFrameworkChange = (framework: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(framework) ? prev.filter(f => f !== framework) : [...prev, framework]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalClientId = clientId;

    if (isAddingNewClient) {
        if (!newClientName) {
            alert('Please enter a name for the new client.');
            return;
        }
        const newOrg = await mockApi.createOrganization(newClientName);
        finalClientId = newOrg.id;
        onClientCreated(); // Callback to refresh client list in dashboard
    }
    
    if (!finalClientId || !projectName || selectedFrameworks.length === 0) {
      alert('Please fill out all fields and select at least one framework.');
      return;
    }

    onCreate(projectName, finalClientId, selectedFrameworks);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 animate-fade-in-scale-up">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Engagement</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-300 mb-1">Client Organization</label>
              <select
                id="client"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
                <option value="add_new_client">-- Add a new client --</option>
              </select>
            </div>

            {isAddingNewClient && (
                 <div>
                    <label htmlFor="newClientName" className="block text-sm font-medium text-slate-300 mb-1">New Client Name</label>
                    <input
                        type="text"
                        id="newClientName"
                        value={newClientName}
                        onChange={e => setNewClientName(e.target.value)}
                        className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new client's company name"
                        required
                    />
                </div>
            )}

            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-slate-200 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q3 2024 SOC 2 Audit"
                required
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Frameworks</label>
                <div className="grid grid-cols-2 gap-2">
                    {availableFrameworks.map(fw => (
                        <label key={fw} className="flex items-center space-x-2 p-3 bg-slate-700/50 rounded-lg cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={selectedFrameworks.includes(fw)}
                                onChange={() => handleFrameworkChange(fw)}
                                className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-300">{fw}</span>
                        </label>
                    ))}
                </div>
            </div>
          </div>
          <footer className="p-4 border-t border-slate-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors text-white">Create Project</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NewEngagementModal;
