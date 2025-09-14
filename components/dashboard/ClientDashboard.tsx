import React, { useState, useEffect } from 'react';
import type { User, View, Project, Risk, AssessmentItem } from '../../types';
import { mockApi } from '../../services/api';
import { AssessmentStatus } from '../../types';
import RiskHeatmap from './RiskHeatmap';

interface ClientDashboardProps {
  user: User;
  setView: (view: View) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userProjects = await mockApi.getProjectsForOrg(user.organizationId);
      setProjects(userProjects);
      if (userProjects.length > 0) {
        const projectRisks = await mockApi.getRisks(userProjects[0].id);
        setRisks(projectRisks);
        const projectItems = await mockApi.getAssessmentItems(userProjects[0].id);
        setAssessmentItems(projectItems);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user.organizationId]);
  
  const assessmentProgress = () => {
      if(assessmentItems.length === 0) return 0;
      const completed = assessmentItems.filter(item => item.status === AssessmentStatus.COMPLETED).length;
      return Math.round((completed / assessmentItems.length) * 100);
  }

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }
  
  const mainProject = projects[0];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">Client Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome, {user.name}.</p>
      </header>
      <main>
        {!mainProject ? (
          <div className="text-center text-slate-400 p-8">
            <p>No projects have been assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
             <div 
                className="glass-card p-6 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => setView({ type: 'project', projectId: mainProject.id, tab: 'assessments' })}
             >
                <h2 className="text-xl font-bold text-white">{mainProject.name}</h2>
                <p className="text-slate-400 text-sm mb-4">Frameworks: {mainProject.frameworks.join(', ')}</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-400">Assessment Progress</p>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${assessmentProgress()}%`}}></div>
                        </div>
                        <p className="text-lg font-semibold mt-1">{assessmentProgress()}% Complete</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-400">Open Risks</p>
                        <p className="text-3xl font-bold">{risks.filter(r => r.status === 'Open').length}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Risk Heatmap</h3>
                    <RiskHeatmap risks={risks} />
                </div>
                <div className="glass-card rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <p className="text-slate-500 text-center py-8">Activity feed coming soon.</p>
                </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
