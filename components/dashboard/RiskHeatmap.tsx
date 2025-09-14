import React from 'react';
import type { Risk, RiskLevel as RiskLevelType } from '../../types';
import { RiskLevel } from '../../types';

interface RiskHeatmapProps {
  risks: Risk[];
}

const riskLevelStyles: { [key in RiskLevelType]: string } = {
  [RiskLevel.LOW]: 'bg-blue-500/70 hover:bg-blue-500',
  [RiskLevel.MEDIUM]: 'bg-yellow-500/70 hover:bg-yellow-500',
  [RiskLevel.HIGH]: 'bg-orange-500/70 hover:bg-orange-500',
  [RiskLevel.CRITICAL]: 'bg-red-500/70 hover:bg-red-500',
};

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
  const getRiskCount = (level: RiskLevelType) => {
    return risks.filter(risk => risk.level === level && risk.status === 'Open').length;
  };

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 h-48">
      <div className={`rounded-lg flex flex-col justify-center items-center p-2 transition-colors ${riskLevelStyles[RiskLevel.CRITICAL]}`}>
        <span className="text-3xl font-bold text-white">{getRiskCount(RiskLevel.CRITICAL)}</span>
        <span className="text-sm font-semibold text-white/80">{RiskLevel.CRITICAL}</span>
      </div>
      <div className={`rounded-lg flex flex-col justify-center items-center p-2 transition-colors ${riskLevelStyles[RiskLevel.HIGH]}`}>
        <span className="text-3xl font-bold text-white">{getRiskCount(RiskLevel.HIGH)}</span>
        <span className="text-sm font-semibold text-white/80">{RiskLevel.HIGH}</span>
      </div>
      <div className={`rounded-lg flex flex-col justify-center items-center p-2 transition-colors ${riskLevelStyles[RiskLevel.MEDIUM]}`}>
        <span className="text-3xl font-bold text-white">{getRiskCount(RiskLevel.MEDIUM)}</span>
        <span className="text-sm font-semibold text-white/80">{RiskLevel.MEDIUM}</span>
      </div>
      <div className={`rounded-lg flex flex-col justify-center items-center p-2 transition-colors ${riskLevelStyles[RiskLevel.LOW]}`}>
        <span className="text-3xl font-bold text-white">{getRiskCount(RiskLevel.LOW)}</span>
        <span className="text-sm font-semibold text-white/80">{RiskLevel.LOW}</span>
      </div>
    </div>
  );
};

export default RiskHeatmap;
