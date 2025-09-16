import React, { useMemo } from 'react';
import type { Risk } from '../../types';
import { RiskLevel } from '../../types';

interface RiskHeatmapProps {
  risks: Risk[];
}

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

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
  const openRisks = useMemo(() => risks.filter(r => r.status === 'Open'), [risks]);
  
  return (
    <div className="glass-card rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Risk Heatmap</h2>
      <div className="flex">
        <div className="flex flex-col justify-between pt-8 pb-4 pr-4 text-sm font-semibold text-slate-400 text-right">
          <div className="transform -rotate-90">Impact</div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-2">
            {riskMatrix.flat().map((level, index) => {
              const count = openRisks.filter(r => r.level === level).length;
              return (
                <div key={index} className={`h-28 w-full rounded-xl flex items-center justify-center text-white font-bold text-3xl transition-all duration-300 transform hover:scale-105 ${levelStyles[level]} ${count === 0 ? 'opacity-40 grayscale' : 'drop-shadow-lg'}`}>
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
  );
};

export default RiskHeatmap;
