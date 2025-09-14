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
  [RiskLevel.LOW]: 'bg-blue-500/80 hover:bg-blue-500',
  [RiskLevel.MEDIUM]: 'bg-yellow-500/80 hover:bg-yellow-500',
  [RiskLevel.HIGH]: 'bg-orange-500/80 hover:bg-orange-500',
  [RiskLevel.CRITICAL]: 'bg-red-500/80 hover:bg-red-500',
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
                <div key={index} className={`h-24 w-full rounded-md flex items-center justify-center text-white font-bold text-3xl transition-colors ${levelStyles[level]} ${count === 0 ? 'opacity-30' : ''}`}>
                  {count > 0 ? count : ''}
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
