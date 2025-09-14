import React, { useState, useMemo, useEffect } from 'react';
import type { User, View, Organization, Project } from './types';
import { UserRole } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { mockOrganizations, consultantClientLinks } from './services/api'; 

import EnvironmentNotice from './components/setup/EnvironmentNotice';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ConsultantDashboard from './components/dashboard/ConsultantDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import ProjectView from './components/views/ProjectView';
import VendorDetailView from './components/views/vendors/VendorDetailView';


const App: React.FC = () => {
  // Immediately check if the environment is configured.
  if (!isSupabaseConfigured) {
    // If not, render a helpful guide instead of the app.
    return <EnvironmentNotice />;
  }

  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>({ type: 'landing' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo users for testing
  const demoUsers: Record<string, User> = {
    'owner@aurelius.test': {
      id: 'demo-user-1',
      name: 'Marcus Aurelius',
      email: 'owner@aurelius.test',
      role: UserRole.CONSULTANT_OWNER,
      organizationId: 'org-1',
      avatarUrl: 'https://i.pravatar.cc/150?u=demo-user-1'
    },
    'admin@northwind.test': {
      id: 'demo-user-2',
      name: 'Alia Atreides',
      email: 'admin@northwind.test',
      role: UserRole.CLIENT_ADMIN,
      organizationId: 'org-2',
      avatarUrl: 'https://i.pravatar.cc/150?u=demo-user-2'
    },
    'admin@contoso.test': {
      id: 'demo-user-3',
      name: 'Bob Johnson',
      email: 'admin@contoso.test',
      role: UserRole.CLIENT_ADMIN,
      organizationId: 'org-3',
      avatarUrl: 'https://i.pravatar.cc/150?u=demo-user-3'
    },
    'admin@litware.test': {
      id: 'demo-user-4',
      name: 'Charlie Day',
      email: 'admin@litware.test',
      role: UserRole.CLIENT_ADMIN,
      organizationId: 'org-4',
      avatarUrl: 'https://i.pravatar.cc/150?u=demo-user-4'
    }
  };

  const handleDemoLogin = (email: string) => {
    const demoUser = demoUsers[email];
    if (demoUser) {
      setUser(demoUser);
      setView({ type: 'dashboard' });
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setLoading(true);
        if (session) {
            const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (userProfile) {
                setUser({
                    id: userProfile.id,
                    name: userProfile.full_name,
                    email: session.user.email!,
                    role: userProfile.role,
                    organizationId: userProfile.organization_id,
                    avatarUrl: userProfile.avatar_url,
                });
                setView({ type: 'dashboard' });
            } else {
                console.error('User profile not found:', error);
                setUser(null);
            }
        } else {
            setUser(null);
            setView({ type: 'landing' });
        }
        setLoading(false);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
      const fetchProjects = async () => {
          if(user) {
              const { data, error } = await supabase.from('projects').select('*');
              if(data) setProjects(data);
          } else {
              setProjects([]);
          }
      };
      fetchProjects();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView({ type: 'landing' });
  };
  
  const isConsultant = useMemo(() => 
    user && [UserRole.CONSULTANT_OWNER, UserRole.CONSULTANT_ADMIN, UserRole.CONSULTANT_COLLABORATOR].includes(user.role), 
    [user]
  );
  
  const currentProjectName = useMemo(() => {
    let projectId: string | null = null;
    if (view.type === 'project') {
      projectId = view.projectId;
    } else if (view.type === 'vendorDetail') {
      projectId = view.projectId;
    }
    
    if (projectId) {
      return projects.find(p => p.id === projectId)?.name;
    }
    return undefined;
  }, [view, projects]);

  if (loading) {
      return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>
  }

  const renderLoggedOutView = () => {
    switch(view.type) {
        case 'login':
            return <LoginPage setView={setView} onDemoLogin={handleDemoLogin} />;
        case 'landing':
        default:
            return <LandingPage setView={setView} />;
    }
  };

  const renderLoggedInView = () => {
    if (!user) return null;

    switch (view.type) {
      case 'dashboard':
        return isConsultant ? 
            <ConsultantDashboard user={user} setView={setView} /> : 
            <ClientDashboard user={user} setView={setView} />;
      case 'project':
          const project = projects.find(p => p.id === view.projectId);
          if (project) {
              return <ProjectView project={project} user={user} tab={view.tab} setView={setView} />;
          }
          return <div>Project not found</div>;
      case 'vendorDetail':
          return <VendorDetailView 
                    vendorId={view.vendorId} 
                    projectId={view.projectId}
                    setView={setView} 
                 />;
      default:
        setView({ type: 'dashboard' });
        return null;
    }
  };

  if (!user) {
    return renderLoggedOutView();
  }
  
  const linkedClientIds = (isConsultant && user && consultantClientLinks[user.organizationId]) || [];
  const linkedClients = mockOrganizations.filter(org => linkedClientIds.includes(org.id));

  return (
    <div className="flex h-screen bg-slate-900/50">
      <Sidebar 
        user={user} 
        currentView={view} 
        setView={setView} 
        onLogout={handleLogout}
        currentProjectName={currentProjectName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user}
          view={view}
          setView={setView}
          organizations={mockOrganizations}
          projects={projects}
          linkedClients={linkedClients}
        />
        <main className="flex-1 overflow-y-auto bg-slate-900">
           {renderLoggedInView()}
        </main>
      </div>
    </div>
  );
};

export default App;
