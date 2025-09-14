import React, { useState, useEffect } from 'react';
import type { User, View, Project, Organization } from '../../types';
import { mockApi, mockOrganizations, consultantClientLinks } from '../../services/api';
import { PlusCircleIcon } from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const linkedClientIds = consultantClientLinks[user.organizationId] || [];
    const linkedClients = mockOrganizations.filter(org => linkedClientIds.includes(org.id));
    setClients(linkedClients);
    const consultantProjects = await mockApi.getProjectsForConsultant(linkedClientIds);
    setProjects(consultantProjects);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);

  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
    await mockApi.createProject(name, organizationId, frameworks);
    fetchData(); // Refresh data
    setIsModalOpen(false);
  };
  
  const getClientName = (orgId: string) => clients.find(c => c.id === orgId)?.name || 'Unknown Client';

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Consultant Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user.name}.</p>
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
          <div className="glass-card rounded-lg overflow-hidden">
             <div className="p-4 bg-slate-800/50">
                <h3 className="text-lg font-semibold">Active Engagements</h3>
            </div>
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Project Name</th>
                        <th scope="col" className="px-6 py-3">Client</th>
                        <th scope="col" className="px-6 py-3">Frameworks</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        <tr 
                            key={project.id}
                            onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
                            className="border-t border-slate-700 hover:bg-slate-800/40 cursor-pointer"
                        >
                            <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                            <td className="px-6 py-4">{getClientName(project.organizationId)}</td>
                            <td className="px-6 py-4">{project.frameworks.join(', ')}</td>
                        </tr>
                    ))}
                    {projects.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-8 text-slate-500">No active engagements. Click "New Engagement" to begin.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
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
