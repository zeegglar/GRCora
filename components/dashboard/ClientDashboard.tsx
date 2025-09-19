import React, { useMemo } from 'react';
import type { User, Project, AssessmentItem, Risk } from '../../types';
import { RiskLevel } from '../../types';
import RiskHeatmap from './RiskHeatmap';

interface ClientDashboardProps {
  user: User;
  project: Project;
  assessmentItems: AssessmentItem[];
  risks: Risk[];
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, project, assessmentItems, risks }) => {

  const complianceSummary = useMemo(() => {
    const total = assessmentItems.length;
    if (total === 0) return { compliant: 0, nonCompliant: 0, inProgress: 0, percentage: 0 };

    const compliant = assessmentItems.filter(i => i.status === 'Compliant').length;
    const nonCompliant = assessmentItems.filter(i => i.status === 'Non-Compliant').length;
    const inProgress = assessmentItems.filter(i => i.status === 'In Progress').length;
    
    const percentage = Math.round((compliant / total) * 100);

    return { compliant, nonCompliant, inProgress, percentage };
  }, [assessmentItems]);

  const openRisks = useMemo(() => risks.filter(r => r.status === 'Open'), [risks]);
  
  const riskCounts = useMemo(() => ({
      critical: openRisks.filter(r => r.level === RiskLevel.CRITICAL).length,
      high: openRisks.filter(r => r.level === RiskLevel.HIGH).length,
      medium: openRisks.filter(r => r.level === RiskLevel.MEDIUM).length,
      low: openRisks.filter(r => r.level === RiskLevel.LOW).length,
  }), [openRisks]);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-heading">Dashboard</h1>
        <p className="text-muted mt-1">Welcome back, <span className="text-heading font-medium">{user.name}</span>. Here's the status of the <span className="text-subheading text-sm">"{project.name}"</span> engagement.</p>
      </header>
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-lg">
            <h2 className="font-semibold text-subheading">Compliance Posture</h2>
            <p className="text-sm text-muted">Overall assessment progress</p>
            <div className="relative pt-8">
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold text-green-400">{complianceSummary.percentage}%</span>
              </div>
              <p className="text-center text-sm text-muted mt-2">Compliant</p>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Compliant</span><span className="font-medium text-subheading">{complianceSummary.compliant}</span></div>
              <div className="flex justify-between"><span className="text-muted">Non-Compliant</span><span className="font-medium text-subheading">{complianceSummary.nonCompliant}</span></div>
              <div className="flex justify-between"><span className="text-muted">In Progress</span><span className="font-medium text-subheading">{complianceSummary.inProgress}</span></div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
             <h2 className="font-semibold text-subheading">Open Risks by Level</h2>
             <p className="text-sm text-muted">Total: {openRisks.length} open risks</p>
             <div className="mt-6 space-y-4">
                <div className="flex items-center">
                    <div className="w-24 text-sm text-red-400">Critical</div>
                    <div className="flex-1 bg-slate-700/50 h-3 rounded-full"><div className="bg-red-500 h-3 rounded-full" style={{width: `${riskCounts.critical > 0 ? 100 : 0}%`}}></div></div>
                    <div className="w-10 text-right font-bold">{riskCounts.critical}</div>
                </div>
                <div className="flex items-center">
                    <div className="w-24 text-sm text-orange-400">High</div>
                    <div className="flex-1 bg-slate-700/50 h-3 rounded-full"><div className="bg-orange-500 h-3 rounded-full" style={{width: `${riskCounts.high > 0 ? 60 : 0}%`}}></div></div>
                    <div className="w-10 text-right font-bold">{riskCounts.high}</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-24 text-sm text-yellow-400">Medium</div>
                    <div className="flex-1 bg-slate-700/50 h-3 rounded-full"><div className="bg-yellow-500 h-3 rounded-full" style={{width: `${riskCounts.medium > 0 ? 40 : 0}%`}}></div></div>
                    <div className="w-10 text-right font-bold">{riskCounts.medium}</div>
                </div>
                 <div className="flex items-center">
                    <div className="w-24 text-sm text-blue-400">Low</div>
                    <div className="flex-1 bg-slate-700/50 h-3 rounded-full"><div className="bg-blue-500 h-3 rounded-full" style={{width: `${riskCounts.low > 0 ? 20 : 0}%`}}></div></div>
                    <div className="w-10 text-right font-bold">{riskCounts.low}</div>
                </div>
             </div>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <h2 className="font-semibold text-subheading">Project Details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div><p className="text-muted">Project Name</p><p className="font-semibold text-subheading">{project.name}</p></div>
              <div><p className="text-muted">Frameworks</p><p className="font-semibold text-subheading">{project.frameworks.join(', ')}</p></div>
            </div>
          </div>
        </div>
        <div className="mt-6">
            <RiskHeatmap risks={risks} />
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
