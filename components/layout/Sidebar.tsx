

import React from 'react';
import type { User, View } from '../../types';
import { UserRole } from '../../types';
import { 
    DashboardIcon, AssessmentIcon, EvidenceIcon, RiskIcon, 
    PolicyIcon, VendorIcon, ReportsIcon, LogoutIcon, ClientsIcon 
} from '../ui/Icons';

interface SidebarProps {
  user: User;
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
  currentProjectName?: string;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? 'bg-slate-700 text-heading'
        : 'text-muted hover:bg-slate-700/50 hover:text-subheading'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, setView, onLogout, currentProjectName }) => {
  const isConsultant = [UserRole.CONSULTANT_OWNER, UserRole.CONSULTANT_ADMIN, UserRole.CONSULTANT_COLLABORATOR].includes(user.role);

  const renderConsultantNav = () => (
    <>
      <NavItem
        icon={<DashboardIcon className="h-6 w-6" />}
        label="Dashboard"
        isActive={currentView.type === 'dashboard'}
        onClick={() => setView({ type: 'dashboard' })}
      />
      <NavItem
        icon={<ClientsIcon className="h-6 w-6" />}
        label="Clients"
        isActive={currentView.type === 'dashboard'}
        onClick={() => setView({ type: 'dashboard' })}
      />
    </>
  );

  const renderClientOrProjectNav = () => {
    const projectId = currentView.type === 'project' ? currentView.projectId : currentView.type === 'vendorDetail' ? currentView.projectId : null;
    if (!projectId) {
        return (
             <NavItem
                icon={<DashboardIcon className="h-6 w-6" />}
                label={'Dashboard'}
                isActive={currentView.type === 'dashboard'}
                onClick={() => setView({ type: 'dashboard' })}
            />
        );
    }

    return (
        <>
            <NavItem
                icon={<DashboardIcon className="h-6 w-6" />}
                label={isConsultant ? 'Project Home' : 'Dashboard'}
                isActive={currentView.type === 'project' && currentView.tab === 'dashboard'}
                onClick={() => setView({ type: 'project', projectId: projectId, tab: 'dashboard' })}
            />
            <hr className="my-2 border-slate-700"/>
            <NavItem icon={<AssessmentIcon className="h-6 w-6" />} label="Controls" isActive={currentView.type === 'project' && currentView.tab === 'assessments'} onClick={() => setView({ type: 'project', projectId, tab: 'assessments'})} />
            <NavItem icon={<RiskIcon className="h-6 w-6" />} label="Risks" isActive={currentView.type === 'project' && currentView.tab === 'risks'} onClick={() => setView({ type: 'project', projectId, tab: 'risks'})} />
            <NavItem icon={<VendorIcon className="h-6 w-6" />} label="Vendors" isActive={(currentView.type === 'project' && currentView.tab === 'vendors') || currentView.type === 'vendorDetail'} onClick={() => setView({ type: 'project', projectId, tab: 'vendors'})} />
            <NavItem icon={<PolicyIcon className="h-6 w-6" />} label="Policies" isActive={currentView.type === 'project' && currentView.tab === 'policies'} onClick={() => setView({ type: 'project', projectId, tab: 'policies'})} />
            <NavItem icon={<EvidenceIcon className="h-6 w-6" />} label="Evidence" isActive={currentView.type === 'project' && currentView.tab === 'evidence'} onClick={() => setView({ type: 'project', projectId, tab: 'evidence'})} />
            <NavItem icon={<ReportsIcon className="h-6 w-6" />} label="Reports" isActive={currentView.type === 'project' && currentView.tab === 'reports'} onClick={() => setView({ type: 'project', projectId, tab: 'reports'})} />
        </>
    );
  };
    

  return (
    <aside className="w-64 bg-slate-900 text-heading flex flex-col h-screen p-4 border-r border-slate-800">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient bg-gradient-grcora">GRCora</h1>
      </div>

      {currentProjectName && (
          <div className="mb-4 p-3 bg-slate-800 rounded-lg">
              <p className="text-xs text-muted">Project</p>
              <p className="font-semibold text-subheading">{currentProjectName}</p>
          </div>
      )}
      
      <nav className="flex-grow">
        <ul>
          {isConsultant && (currentView.type === 'dashboard' || currentView.type === 'login') ? renderConsultantNav() : renderClientOrProjectNav()}
        </ul>
      </nav>

      <div>
        <div className="flex items-center p-3 rounded-lg bg-slate-800">
            <img src={user.avatarUrl} alt="User Avatar" className="h-10 w-10 rounded-full" />
            <div className="ml-3">
                <p className="font-semibold text-subheading">{user.name}</p>
                <p className="text-xs text-muted">{user.role.replace(/_/g, ' ')}</p>
            </div>
        </div>
        <NavItem
            icon={<LogoutIcon className="h-6 w-6" />}
            label="Logout"
            isActive={false}
            onClick={onLogout}
        />
      </div>
    </aside>
  );
};

export default Sidebar;