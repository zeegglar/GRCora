import React, { useState } from 'react';
import type { Evidence, Control } from '../../../types';
import { mockUsers } from '../../../services/api';
import { EvidenceIcon, PlusCircleIcon } from '../../ui/Icons';
import NewEvidenceModal from './NewEvidenceModal';

interface EvidenceTableProps {
  evidence: Evidence[];
  controls: Map<string, Control>;
  projectId: string;
  onCreateEvidence: (evidenceData: Omit<Evidence, 'id' | 'uploadDate'>) => void;
}

const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidence, controls, projectId, onCreateEvidence }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  // FIX: Explicitly type userMap to resolve potential type inference issues.
  const userMap: Map<string, string> = new Map(mockUsers.map(u => [u.id, u.name]));

  const handleSaveEvidence = (evidenceData: Omit<Evidence, 'id' | 'uploadDate'>) => {
    onCreateEvidence(evidenceData);
    setIsNewModalOpen(false);
  };

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
          <div className="p-4 bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evidence Portal</h3>
            <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
            >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Add Evidence</span>
            </button>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Evidence Title</th>
                <th scope="col" className="px-6 py-3">Control ID</th>
                <th scope="col" className="px-6 py-3">Uploader</th>
                <th scope="col" className="px-6 py-3">Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((item) => (
                <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-medium text-white flex items-center">
                      <EvidenceIcon className="h-4 w-4 mr-3 text-slate-500" />
                      <a href={item.fileUrl} className="hover:underline">{item.title}</a>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{item.controlId}</td>
                  <td className="px-6 py-4">{userMap.get(item.uploaderId) || 'Unknown User'}</td>
                  <td className="px-6 py-4">{item.uploadDate}</td>
                </tr>
              ))}
              {evidence.length === 0 && (
                  <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No evidence has been uploaded for this project.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NewEvidenceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveEvidence}
        controls={Array.from(controls.values())}
        projectId={projectId}
      />
    </>
  );
};

export default EvidenceTable;
