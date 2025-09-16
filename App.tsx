import React, { useState, useEffect, useMemo } from 'react';
import type { User, View, Project, AssessmentItem, Risk, Policy, Vendor, Evidence, Control, Organization } from './types';
import { UserRole } from './types';
import { mockApi, mockUsers } from './services/api';
import { isSupabaseConfigured } from './services/supabaseClient';

// Context Providers
import { NotificationProvider } from './components/context/NotificationContext';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// UI Components
import ErrorBoundary from './components/ui/ErrorBoundary';
import { PageLoading } from './components/ui/LoadingStates';
import { SkipLink } from './components/ui/AccessibleComponents';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Auth Components
import LoginPage from './components/auth/LoginPage';
import AuthenticatedLoginPage from './components/auth/AuthenticatedLoginPage';
import LandingPage from './components/landing/LandingPage';

// Feature Components
import ConsultantDashboard from './components/dashboard/ProfessionalConsultantDashboard';
import ClientDashboard from './components/dashboard/EnhancedClientDashboard';
import ProjectView from './components/views/ProjectView';
import VendorDetailView from './components/views/vendors/VendorDetailView';
import TPRMDashboard from './components/views/tprm/TPRMDashboard';
import TPRMReportsView from './components/views/reports/TPRMReportsView';
import RemediationTracker from './components/views/remediation/RemediationTracker';
import RealTimeSystem from './components/realtime/RealTimeSystem';
import EnvironmentNotice from './components/setup/EnvironmentNotice';

// Inner App component that uses auth context
const AppContent: React.FC = () => {
  const { user, isLoading: authLoading, isDemoMode, mockLogin } = useAuth();
  const [view, setView] = useState<View>({ type: 'landing' });
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Data fetching logic
  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      // Handle different scenarios based on user role and current view
      if (user.role.startsWith('CONSULTANT')) {
          // For consultants viewing a specific project, load that project's data
          if (view.type === 'project') {
              const project = await mockApi.getProjectById(view.projectId);
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
          } else {
              // For consultant dashboard, data is fetched inside ConsultantDashboard
              setData({});
          }
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, view]);

  const handleMockLogin = (userId: string) => {
    mockLogin(userId);
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser?.role.startsWith('CLIENT')) {
        // Find client project and set project view with dashboard tab
        mockApi.getProjectForClient(foundUser.organizationId).then(p => {
            if (p) setView({type: 'project', projectId: p.id, tab: 'dashboard' });
            else setView({type: 'dashboard'});
        })
    } else {
      setView({ type: 'dashboard' });
    }
  };

  const handleLogout = () => {
    setData({});
    setView({type: 'landing'}); // Show landing page after logout
  };

  const currentProjectName = useMemo(() => {
    if (view.type === 'project' || view.type === 'vendorDetail' || view.type === 'tprmDashboard') {
      if (data.project?.id === view.projectId) {
        return data.project.name;
      }
      // For consultants, need to fetch project name separately if not already loaded
      return "Loading Project...";
    }
    return undefined;
  }, [view, data.project]);

  // Show environment notice if Supabase is not configured
  if (!isSupabaseConfigured && !isDemoMode) {
    return <EnvironmentNotice />;
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return <PageLoading message="Initializing application..." />;
  }

  // Show auth flow if no user
  if (!user) {
    if (view.type === 'landing') {
      return <LandingPage setView={setView} onLogin={handleMockLogin} />;
    }

    if (isDemoMode) {
      return <LoginPage onLogin={handleMockLogin} />;
    }

    return (
      <AuthenticatedLoginPage
        onLoginSuccess={() => setView({ type: 'dashboard' })}
        fallbackToMockLogin={() => setView({ type: 'login' })}
      />
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return <PageLoading message="Loading project data..." />;
    }

    switch (view.type) {
      case 'dashboard':
        if (user.role.startsWith('CONSULTANT')) {
          return <ConsultantDashboard user={user} setView={setView} />;
        }
        if (data.project) {
          return (
            <ClientDashboard
              user={user}
              project={data.project}
              assessmentItems={data.assessmentItems}
              risks={data.risks}
              onNavigate={(tab) => setView({ type: 'project', projectId: data.project.id, tab: tab as 'dashboard' | 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'workflows' | 'reports' })}
            />
          );
        }
        return <div className="p-8">No project assigned.</div>

      case 'project':
        if (data.project?.id === view.projectId) {
            // If client user with dashboard tab, show ClientDashboard
            if (user.role.startsWith('CLIENT') && view.tab === 'dashboard') {
                return (
                    <ClientDashboard
                        user={user}
                        project={data.project}
                        assessmentItems={data.assessmentItems}
                        risks={data.risks}
                        onNavigate={(tab) => setView({ type: 'project', projectId: view.projectId, tab: tab as 'dashboard' | 'assessments' | 'evidence' | 'risks' | 'policies' | 'vendors' | 'workflows' | 'reports' })}
                    />
                );
            }
            return <ProjectView user={user} view={view} projectData={data} setView={setView} onUpdate={fetchData} />;
        }
        // Placeholder for consultant viewing a client project
        return <PageLoading message="Loading project data..." />

      case 'vendorDetail':
        return <VendorDetailView vendorId={view.vendorId} projectId={view.projectId} setView={setView} />

      case 'tprmDashboard':
        return <TPRMDashboard projectId={view.projectId} setView={setView} />

      case 'tprmReports':
        return <TPRMReportsView projectId={view.projectId} setView={setView} />

      case 'remediationTracker':
        return <RemediationTracker projectId={view.projectId} setView={setView} />

      default:
        return <div className="p-8">Unknown view</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <Sidebar
        user={user}
        currentView={view}
        setView={setView}
        onLogout={handleLogout}
        currentProjectName={currentProjectName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 pb-4" tabIndex={-1}>
          <div className="fade-in">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      {user && <RealTimeSystem user={user} currentProjectId={view.type === 'project' ? view.projectId : undefined} />}
    </div>
  );
};

// Main App component with all providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
