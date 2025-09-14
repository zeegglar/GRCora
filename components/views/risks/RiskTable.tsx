import React, { useState } from 'react';
import type { Risk, Control, RiskLevel as RiskLevelType } from '../../../types';
import { RiskLevel } from '../../../types';
import { ExclamationTriangleIcon, PlusCircleIcon } from '../../ui/Icons';
import NewRiskModal from './NewRiskModal';

// FIX: Added projectId to props to resolve a type error where this component was used.
interface RiskTableProps {
  risks: Risk[];
  controls: Map<string, Control>;
  onCreateRisk: (riskData: Omit<Risk, 'id'>) => void;
  projectId: string;
}

const riskLevelStyles: { [key in RiskLevelType]: { badge: string; icon: string } } = {
  [RiskLevel.LOW]: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: 'text-blue-400' },
  [RiskLevel.MEDIUM]: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: 'text-yellow-400' },
  [RiskLevel.HIGH]: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: 'text-orange-400' },
  [RiskLevel.CRITICAL]: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: 'text-red-400' },
};

const RiskLevelBadge: React.FC<{ level: RiskLevelType }> = ({ level }) => (
  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${riskLevelStyles[level].badge}`}>
    <ExclamationTriangleIcon className={`h-4 w-4 mr-1.5 ${riskLevelStyles[level].icon}`} />
    {level}
  </span>
);

// FIX: Updated component to accept projectId prop.
const RiskTable: React.FC<RiskTableProps> = ({ risks, controls, onCreateRisk, projectId }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleSaveRisk = (riskData: Omit<Risk, 'id'>) => {
    onCreateRisk(riskData);
    setIsNewModalOpen(false);
  };

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Risk Register</h3>
            <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
            >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Add Risk</span>
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Risk Title</th>
                <th scope="col" className="px-6 py-3">Level</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Related Control</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => {
                const control = controls.get(risk.controlId);
                return (
                  <tr key={risk.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-white">{risk.title}</td>
                    <td className="px-6 py-4">
                      <RiskLevelBadge level={risk.level} />
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${risk.status === 'Open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {risk.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{control?.id || 'N/A'}</td>
                  </tr>
                );
              })}
               {risks.length === 0 && (
                  <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No risks documented for this project.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NewRiskModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveRisk}
        controls={Array.from(controls.values())}
        // FIX: Replaced hacky logic with the projectId prop.
        projectId={projectId}
      />
    </>
  );
};

export default RiskTable;
