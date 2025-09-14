
import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, Organization, Risk } from '../../types';
// FIX: Import mockOrganizations and consultantClientLinks directly to resolve property access errors.
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { RiskLevel } from '../../types';
import { PlusCircleIcon, ArrowUpRightIcon, ArrowDownRightIcon } from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

interface RiskSummary {
    critical: number;
    high: number;
}

const TrendIndicator: React.FC<{ trend?: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    if (trend === 'up') {
        return <div className="flex items-center space-x-1 text-red-400"><ArrowUpRightIcon className="h-4 w-4" /><span>Increasing</span></div>;
    }
    if (trend === 'down') {
        return <div className="flex items-center space-x-1 text-green-400"><ArrowDownRightIcon className="h-4 w-4" /><span>Decreasing</span></div>;
    }
    return <div className="text-slate-400">Stable</div>;
}

const ClientCard: React.FC<{
    project: Project;
    client: Organization;
    riskSummary: RiskSummary;
    setView: (view: View) => void;
}> = ({ project, client, riskSummary, setView }) => {
    return (
        <div 
            className="glass-card p-6 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex flex-col justify-between"
            onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
        >
            <div>
                <p className="text-sm text-slate-400">{client.name}</p>
                <h3 className="text-xl font-bold text-white mt-1">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-2">Frameworks: {project.frameworks.join(', ')}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-end">
                <div>
                    <p className="text-xs text-slate-400 mb-2">Open Risks</p>
                    <div className="flex space-x-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{riskSummary.critical}</p>
                            <p className="text-xs text-red-400/80">Critical</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-400">{riskSummary.high}</p>
                            <p className="text-xs text-orange-400/80">High</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Risk Trend</p>
                    <TrendIndicator trend={project.trend} />
                </div>
            </div>
        </div>
    );
}


const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    // FIX: Access consultantClientLinks directly.
    const linkedClientIds = consultantClientLinks[user.organizationId] || [];
    // FIX: Access mockOrganizations directly and remove unnecessary await.
    const allOrgs = mockOrganizations;
    const linkedClients = allOrgs.filter(org => linkedClientIds.includes(org.id));
    setClients(linkedClients);
    const consultantProjects = await mockApi.getProjectsForConsultant(linkedClientIds);
    setProjects(consultantProjects);

    const projectIds = consultantProjects.map(p => p.id);
    const risks = await mockApi.getAllRisksForProjects(projectIds);
    setAllRisks(risks);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const riskSummaries = useMemo(() => {
    const summaries = new Map<string, RiskSummary>();
    projects.forEach(project => {
        const projectRisks = allRisks.filter(r => r.projectId === project.id && r.status === 'Open');
        summaries.set(project.id, {
            critical: projectRisks.filter(r => r.level === RiskLevel.CRITICAL).length,
            high: projectRisks.filter(r => r.level === RiskLevel.HIGH).length,
        });
    });
    return summaries;
  }, [projects, allRisks]);


  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
    await mockApi.createProject(name, organizationId, frameworks);
    fetchData(); // Refresh all data
    setIsModalOpen(false);
  };
  
  const getClientForProject = (project: Project) => clients.find(c => c.id === project.organizationId);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Consultant Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user.name}. Here's your client overview.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Engagement</span>
          </button>
        </header>
        <main>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => {
                        const client = getClientForProject(project);
                        const riskSummary = riskSummaries.get(project.id);
                        if (!client || !riskSummary) return null;
                        return (
                            <ClientCard 
                                key={project.id}
                                project={project}
                                client={client}
                                riskSummary={riskSummary}
                                setView={setView}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 glass-card rounded-lg">
                    <h3 className="text-xl font-semibold text-white">No active engagements</h3>
                    <p className="text-slate-400 mt-2">Click "New Engagement" to get started with your first client project.</p>
                </div>
            )}
        </main>
      </div>
      <NewEngagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        onCreate={handleCreateEngagement}
        onClientCreated={fetchData} // Refresh clients if a new one is made
      />
    </>
  );
};

export default ConsultantDashboard;