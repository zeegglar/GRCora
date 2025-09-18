import React, { useMemo, useState } from 'react';
import type { Risk, Vendor, Control } from '../../types';
import { RiskLevel, VendorCriticality } from '../../types';

interface RiskHeatmapProps {
  risks: Risk[];
  vendors?: Vendor[];
  controls?: Map<string, Control>;
  onRiskClick?: (risk: Risk) => void;
}

interface HeatmapCell {
  likelihood: number;
  impact: number;
  risks: Risk[];
  riskLevel: RiskLevel;
  count: number;
}

const LIKELIHOOD_LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

const getRiskLevel = (likelihood: number, impact: number): RiskLevel => {
  const score = likelihood * impact;
  if (score >= 20) return RiskLevel.CRITICAL;
  if (score >= 12) return RiskLevel.HIGH;
  if (score >= 6) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};

const getLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case RiskLevel.CRITICAL: return 'bg-red-600 border-red-500';
    case RiskLevel.HIGH: return 'bg-orange-500 border-orange-400';
    case RiskLevel.MEDIUM: return 'bg-yellow-500 border-yellow-400';
    case RiskLevel.LOW: return 'bg-green-500 border-green-400';
    default: return 'bg-slate-600 border-slate-500';
  }
};

const getTextColor = (level: RiskLevel): string => {
  switch (level) {
    case RiskLevel.CRITICAL:
    case RiskLevel.HIGH:
      return 'text-white';
    case RiskLevel.MEDIUM:
      return 'text-slate-900';
    default:
      return 'text-white';
  }
};

const EnhancedRiskHeatmap: React.FC<RiskHeatmapProps> = ({
  risks,
  vendors = [],
  controls = new Map(),
  onRiskClick
}) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const matrix: HeatmapCell[][] = [];

    // Initialize 5x5 matrix
    for (let impact = 5; impact >= 1; impact--) {
      const row: HeatmapCell[] = [];
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const cellRisks = risks.filter(risk => {
          // Map risk levels to likelihood/impact scores
          const riskScore = getRiskScore(risk.level);
          return Math.floor(riskScore.likelihood) === likelihood &&
                 Math.floor(riskScore.impact) === impact;
        });

        row.push({
          likelihood,
          impact,
          risks: cellRisks,
          riskLevel: getRiskLevel(likelihood, impact),
          count: cellRisks.length
        });
      }
      matrix.push(row);
    }

    return matrix;
  }, [risks]);

  // Helper function to map risk levels to scores
  const getRiskScore = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return { likelihood: 5, impact: 5 };
      case RiskLevel.HIGH: return { likelihood: 4, impact: 4 };
      case RiskLevel.MEDIUM: return { likelihood: 3, impact: 3 };
      case RiskLevel.LOW: return { likelihood: 2, impact: 2 };
      default: return { likelihood: 1, impact: 1 };
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const openRisks = risks.filter(r => r.status === 'Open');
    const total = openRisks.length;
    const critical = openRisks.filter(r => r.level === RiskLevel.CRITICAL).length;
    const high = openRisks.filter(r => r.level === RiskLevel.HIGH).length;
    const medium = openRisks.filter(r => r.level === RiskLevel.MEDIUM).length;
    const low = openRisks.filter(r => r.level === RiskLevel.LOW).length;

    const riskScore = total > 0 ?
      (critical * 4 + high * 3 + medium * 2 + low * 1) / total : 0;

    return { total, critical, high, medium, low, riskScore };
  }, [risks]);

  const handleCellClick = (cell: HeatmapCell) => {
    setSelectedCell(cell);
    setShowDetails(true);
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Risk Heat Map</h2>
          <p className="text-slate-400 text-sm">Visual representation of risk distribution by likelihood and impact</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Open Risks</div>
          <div className="text-sm text-slate-400 mt-2">
            Risk Score: <span className="font-semibold text-white">{stats.riskScore.toFixed(1)}/4.0</span>
          </div>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
          <div className="text-xs text-red-300">Critical</div>
        </div>
        <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
          <div className="text-xs text-orange-300">High</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
          <div className="text-xs text-yellow-300">Medium</div>
        </div>
        <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.low}</div>
          <div className="text-xs text-green-300">Low</div>
        </div>
      </div>

      {/* Heatmap Matrix */}
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90">
          <span className="text-sm font-semibold text-slate-400">IMPACT</span>
        </div>

        {/* Y-axis values */}
        <div className="absolute -left-8 top-0 h-full flex flex-col justify-between py-4">
          {IMPACT_LABELS.reverse().map((label, index) => (
            <div key={index} className="text-xs text-slate-400 transform -rotate-45 origin-center">
              {label}
            </div>
          ))}
        </div>

        {/* Matrix */}
        <div className="ml-4">
          <div className="grid grid-rows-5 gap-1">
            {heatmapData.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-1">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      h-16 w-16 rounded border-2 cursor-pointer transition-all duration-200
                      flex items-center justify-center font-bold text-lg
                      hover:scale-105 hover:shadow-lg
                      ${getLevelColor(cell.riskLevel)}
                      ${getTextColor(cell.riskLevel)}
                      ${cell.count === 0 ? 'opacity-30' : 'opacity-90 hover:opacity-100'}
                    `}
                    onClick={() => handleCellClick(cell)}
                    title={`${cell.count} risks - ${LIKELIHOOD_LABELS[cell.likelihood - 1]} likelihood, ${IMPACT_LABELS[cell.impact - 1]} impact`}
                  >
                    {cell.count > 0 ? cell.count : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* X-axis values */}
          <div className="grid grid-cols-5 gap-1 mt-2">
            {LIKELIHOOD_LABELS.map((label, index) => (
              <div key={index} className="text-xs text-slate-400 text-center transform rotate-45">
                {label}
              </div>
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center mt-6">
            <span className="text-sm font-semibold text-slate-400">LIKELIHOOD</span>
          </div>
        </div>
      </div>

      {/* Risk Details Modal */}
      {showDetails && selectedCell && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Risk Details - {LIKELIHOOD_LABELS[selectedCell.likelihood - 1]} Likelihood,
                {IMPACT_LABELS[selectedCell.impact - 1]} Impact
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {selectedCell.risks.length > 0 ? (
                <div className="space-y-3">
                  {selectedCell.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className="bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700/70"
                      onClick={() => onRiskClick?.(risk)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-white">{risk.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(risk.level)} ${getTextColor(risk.level)}`}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">Control: {controls.get(risk.controlId)?.name || 'Unknown'}</p>
                      <p className="text-slate-400 text-xs mt-1">Created: {risk.creationDate || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <p>No risks in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-400">Low Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-slate-400">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-slate-400">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-slate-400">Critical Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRiskHeatmap;