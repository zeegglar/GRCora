import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, AssessmentItem, Risk, Policy, Vendor, Evidence, Control, Organization } from './types';
import { UserRole } from './types';
import { mockApi, mockUsers } from './services/api';
import { isSupabaseConfigured } from './services/supabaseClient';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './components/landing/LandingPage';
import ConsultantDashboard from './components/dashboard/ConsultantDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import ProjectView from './components/views/ProjectView';
import VendorDetailView from './components/views/vendors/VendorDetailView';
import EnvironmentNotice from './components/setup/EnvironmentNotice';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>({ type: 'landing' });
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching logic
  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Simulate fetching data based on user role and current view
    if (user.role.startsWith('CONSULTANT')) {
        // Consultant data is fetched inside ConsultantDashboard
    } else {
        // Client user data
        const project = await mockApi.getProjectForClient(user.organizationId);
        if (project) {
            const [assessmentItems, risks, policies, vendors, evidence, controls] = await Promise.all([
                mockApi.getAssessmentItems(project.id),
                mockApi.getRisks(project.id),
                mockApi.getPolicies(project.id),
                mockApi.getVendors(project.id),
                mockApi.getEvidence(project.id),
                mockApi.getControls(project.frameworks)
            ]);
            const controlsMap = new Map(controls.map(c => [c.id, c]));
            setData({ project, assessmentItems, risks, policies, vendors, evidence, controls: controlsMap });
        }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogin = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      if (foundUser.role.startsWith('CLIENT')) {
          // Find client project and set view
          mockApi.getProjectForClient(foundUser.organizationId).then(p => {
              if (p) setView({type: 'project', projectId: p.id, tab: 'assessments' });
              else setView({type: 'dashboard'});
          })
      } else {
        setView({ type: 'dashboard' });
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setData({});
    setView({type: 'landing'}); // Show landing page after logout
  };

  const currentProjectName = useMemo(() => {
    if (view.type === 'project' || view.type === 'vendorDetail') {
      if (data.project?.id === view.projectId) {
        return data.project.name;
      }
      // For consultants, need to fetch project name separately if not already loaded
      return "Loading Project...";
    }
    return undefined;
  }, [view, data.project]);

  if (!isSupabaseConfigured) {
    return <EnvironmentNotice />;
  }

  if (!user) {
    if (view.type === 'landing') {
      return <LandingPage setView={setView} onLogin={handleLogin} />;
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8">Loading...</div>;
    }

    switch (view.type) {
      case 'dashboard':
        if (user.role.startsWith('CONSULTANT')) {
          return <ConsultantDashboard user={user} setView={setView} />;
        }
        if (data.project) {
          return <ClientDashboard user={user} project={data.project} assessmentItems={data.assessmentItems} risks={data.risks} />;
        }
        return <div className="p-8">No project assigned.</div>
        
      case 'project':
        if (data.project?.id === view.projectId) {
            return <ProjectView user={user} view={view} projectData={data} setView={setView} onUpdate={fetchData} />;
        }
        // Placeholder for consultant viewing a client project
        return <div className="p-8">Loading project data...</div>
      
      case 'vendorDetail':
        return <VendorDetailView vendorId={view.vendorId} projectId={view.projectId} setView={setView} />

      default:
        return <div className="p-8">Unknown view</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar 
        user={user} 
        currentView={view} 
        setView={setView} 
        onLogout={handleLogout}
        currentProjectName={currentProjectName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* The header is removed as the main content areas have their own headers now. */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
