
import React, { useState, useEffect } from 'react';
import type { Project, User, View, AssessmentItem } from '../../types';
import { AssessmentStatus } from '../../types';
import { mockApi } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClientDashboardProps {
  user: User;
  setView: (view: View) => void;
}

const statusColors: { [key in AssessmentStatus]: string } = {
    [AssessmentStatus.COMPLETED]: '#4ade80',
    [AssessmentStatus.IN_PROGRESS]: '#facc15',
    [AssessmentStatus.IN_REVIEW]: '#60a5fa',
    [AssessmentStatus.NOT_STARTED]: '#71717a',
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, setView }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userProjects = await mockApi.getProjectsForOrg(user.organizationId);
      setProjects(userProjects);

      if (userProjects.length > 0) {
          const items = await mockApi.getAssessmentItems(userProjects[0].id);
          const statusCounts = items.reduce((acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1;
              return acc;
          }, {} as Record<AssessmentStatus, number>);

          const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
          setAssessmentData(chartData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user.organizationId]);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }
  
  const project = projects[0];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user.name}.</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Assessment Status</h2>
            <p className="text-sm text-slate-400 mb-6">Current status of controls for the {project?.name} project.</p>
            <div style={{width: '100%', height: 300}}>
                <ResponsiveContainer>
                    <BarChart data={assessmentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {assessmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={statusColors[entry.name as AssessmentStatus]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="glass-card rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Active Project</h2>
            {project ? (
                <>
                <div className="flex-grow">
                    <p className="text-lg font-semibold text-blue-400">{project.name}</p>
                    <p className="text-slate-400 text-sm mt-2">Frameworks: {project.frameworks.join(', ')}</p>
                </div>
                <button
                    onClick={() => setView({ type: 'project', projectId: project.id, tab: 'assessments' })}
                    className="mt-6 w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
                >
                    Go to Project
                </button>
                </>
            ) : (
                <p className="text-slate-400">No active projects found.</p>
            )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
