import React, { useMemo, useState } from 'react';
import type { Risk } from '../../types';
import { RiskLevel } from '../../types';

interface RiskHeatmapProps {
  risks: Risk[];
  onRiskClick?: (risks: Risk[], level: RiskLevel) => void;
}

interface DrillDownModalProps {
  risks: Risk[];
  level: RiskLevel;
  isOpen: boolean;
  onClose: () => void;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ risks, level, isOpen, onClose }) => {
  if (!isOpen) return null;

  const levelColors = {
    [RiskLevel.LOW]: 'border-emerald-500 bg-emerald-950/50',
    [RiskLevel.MEDIUM]: 'border-amber-500 bg-amber-950/50',
    [RiskLevel.HIGH]: 'border-orange-500 bg-orange-950/50',
    [RiskLevel.CRITICAL]: 'border-red-500 bg-red-950/50',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`glass-card rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border-2 ${levelColors[level]}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()} Risk Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {risks.map((risk) => (
              <div key={risk.id} className="glass-card p-4 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    risk.status === 'Open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {risk.status}
                  </span>
                </div>
                <p className="text-slate-300 mb-3">Risk level: {risk.level}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">Control: <span className="text-white font-mono">{risk.controlId}</span></span>
                  </div>
                  {risk.creationDate && (
                    <span className="text-slate-400">Created: <span className="text-white">{new Date(risk.creationDate).toLocaleDateString()}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const riskMatrix = [
    [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH],
    [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL],
    [RiskLevel.HIGH, RiskLevel.CRITICAL, RiskLevel.CRITICAL],
];

const levelStyles: { [key in RiskLevel]: string } = {
  [RiskLevel.LOW]: 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 hover:from-emerald-400 hover:to-emerald-500 border border-emerald-400/30 shadow-lg shadow-emerald-500/20',
  [RiskLevel.MEDIUM]: 'bg-gradient-to-br from-amber-500/90 to-amber-600/90 hover:from-amber-400 hover:to-amber-500 border border-amber-400/30 shadow-lg shadow-amber-500/20',
  [RiskLevel.HIGH]: 'bg-gradient-to-br from-orange-500/90 to-red-500/90 hover:from-orange-400 hover:to-red-400 border border-orange-400/30 shadow-lg shadow-orange-500/20',
  [RiskLevel.CRITICAL]: 'bg-gradient-to-br from-red-600/95 to-red-700/95 hover:from-red-500 hover:to-red-600 border border-red-400/40 shadow-lg shadow-red-500/30',
};

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks, onRiskClick }) => {
  const openRisks = useMemo(() => risks.filter(r => r.status === 'Open'), [risks]);
  const [selectedLevel, setSelectedLevel] = useState<RiskLevel | null>(null);
  const [modalRisks, setModalRisks] = useState<Risk[]>([]);

  const handleCellClick = (level: RiskLevel) => {
    const risksForLevel = openRisks.filter(r => r.level === level);
    if (risksForLevel.length > 0) {
      setSelectedLevel(level);
      setModalRisks(risksForLevel);
      onRiskClick?.(risksForLevel, level);
    }
  };

  const handleCloseModal = () => {
    setSelectedLevel(null);
    setModalRisks([]);
  };

  return (
    <>
      <div className="glass-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Risk Heatmap</h2>
          <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">Click cells to explore</span>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-between pt-8 pb-4 pr-4 text-sm font-semibold text-slate-400 text-right">
            <div className="transform -rotate-90">Impact</div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {riskMatrix.flat().map((level, index) => {
                const count = openRisks.filter(r => r.level === level).length;
                const isClickable = count > 0;
                return (
                  <div
                    key={index}
                    onClick={() => isClickable && handleCellClick(level)}
                    className={`h-28 w-full rounded-xl flex items-center justify-center text-white font-bold text-3xl transition-all duration-300 transform ${
                      isClickable
                        ? 'hover:scale-105 cursor-pointer hover:shadow-2xl'
                        : 'opacity-40 grayscale cursor-not-allowed'
                    } ${levelStyles[level]} ${isClickable ? 'drop-shadow-lg' : ''}`}
                  >
                    {count > 0 ? (
                      <div className="text-center">
                        <div className="text-4xl font-extrabold mb-1">{count}</div>
                        <div className="text-xs font-medium opacity-80">{count === 1 ? 'risk' : 'risks'}</div>
                      </div>
                    ) : (
                      <div className="text-slate-400/60 text-xl">·</div>
                    )}
                  </div>
                );
              })}
            </div>
           <div className="flex justify-between pt-4 px-4 text-sm font-semibold text-slate-400 text-center">
                <div>Low</div>
                <div>Medium</div>
                <div>High</div>
            </div>
            <div className="text-center text-sm font-semibold text-slate-400 mt-1">Likelihood</div>
        </div>
      </div>
      </div>

      {selectedLevel && (
        <DrillDownModal
          risks={modalRisks}
          level={selectedLevel}
          isOpen={!!selectedLevel}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default RiskHeatmap;
