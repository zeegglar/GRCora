import React, { useState, useEffect } from 'react';
import type { Organization, Project, User, View } from '../../types';
import { mockApi, mockOrganizations as allOrgs } from '../../services/api';
import { PlusCircleIcon } from '../ui/Icons';
import NewEngagementModal from './NewEngagementModal';

interface ClientCardProps {
  client: Organization;
  project: Project;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, project, onClick }) => {
  const completion = 75; // Mock completion percentage
  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-lg p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div>
        <p className="text-lg font-bold text-white">{client.name}</p>
        <p className="text-sm text-slate-400">{project.name}</p>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-400">Progress</span>
          <span className="text-xs font-bold text-blue-400">{completion}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${completion}%` }}></div>
        </div>
      </div>
    </div>
  );
};

interface ConsultantDashboardProps {
  user: User;
  setView: (view: View) => void;
}

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ user, setView }) => {
  const [clients, setClients] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewEngagementModalOpen, setIsNewEngagementModalOpen] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    const linkedClients = await mockApi.getLinkedClients(user.organizationId);
    const clientProjects = await Promise.all(
      linkedClients.map(client => mockApi.getProjectsForOrg(client.id))
    );
    setClients(linkedClients);
    setProjects(clientProjects.flat());
    setAllOrganizations(allOrgs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.organizationId]);
  
  const handleCreateEngagement = async (name: string, organizationId: string, frameworks: string[]) => {
      const newProject = await mockApi.createProject(name, organizationId, frameworks);
      setIsNewEngagementModalOpen(false);
      await fetchData(); // Refresh data to show new project
      setView({ type: 'project', projectId: newProject.id, tab: 'assessments' });
  };

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
              <h1 className="text-4xl font-bold text-white">Consultant Dashboard</h1>
              <p className="text-slate-400 mt-1">Overview of your client engagements.</p>
          </div>
          <button 
            onClick={() => setIsNewEngagementModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Engagement</span>
          </button>
        </header>
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => {
              const project = projects.find(p => p.organizationId === client.id);
              if (!project) return null;
              return (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  project={project} 
                  onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
                />
              );
            })}
          </div>
        </main>
      </div>
      <NewEngagementModal
        isOpen={isNewEngagementModalOpen}
        onClose={() => setIsNewEngagementModalOpen(false)}
        clients={clients}
        onCreate={handleCreateEngagement}
        onClientCreated={fetchData}
      />
    </>
  );
};

export default ConsultantDashboard;
