import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { User, Organization, Project, View } from '../../types';
import { UserRole } from '../../types';
import { ChevronDownIcon, CheckCircleIcon, DashboardIcon } from '../ui/Icons';

interface HeaderProps {
    user: User;
    view: View;
    setView: (view: View) => void;
    organizations: Organization[];
    projects: Project[];
    linkedClients: Organization[];
}

const Header: React.FC<HeaderProps> = ({ user, view, setView, organizations, projects, linkedClients }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isConsultant = useMemo(() => 
        [UserRole.CONSULTANT_OWNER, UserRole.CONSULTANT_ADMIN, UserRole.CONSULTANT_COLLABORATOR].includes(user.role), 
    [user.role]);

    const activeOrg = useMemo(() => {
        if (view.type === 'project') {
            const project = projects.find(p => p.id === view.projectId);
            return organizations.find(org => org.id === project?.organizationId);
        }
        return organizations.find(org => org.id === user.organizationId);
    }, [view, user.organizationId, organizations, projects]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleClientSelect = (project: Project) => {
        setView({ type: 'project', projectId: project.id, tab: 'assessments' });
        setIsDropdownOpen(false);
    }
    
    return (
        <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 h-16 flex-shrink-0">
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gradient-core text-white font-bold text-sm">
                        {activeOrg?.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-white">{activeOrg?.name}</span>
                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <div className="p-3 border-b border-slate-700">
                           <p className="text-xs text-slate-400">Viewing as {user.role.includes('consultant') ? 'Consultant' : 'Client'}</p>
                           <p className="font-semibold text-white">{activeOrg?.name}</p>
                        </div>
                        <ul className="py-2">
                          {isConsultant && (
                            <>
                              <li 
                                className="px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center cursor-pointer"
                                onClick={() => { setView({ type: 'dashboard' }); setIsDropdownOpen(false); }}
                              >
                                <DashboardIcon className="h-5 w-5 mr-3" />
                                <span>Aurelius Risk Partners Dashboard</span>
                              </li>
                              <li className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500">
                                Client Engagements
                              </li>
                              {linkedClients.map(client => {
                                  const clientProject = projects.find(p => p.organizationId === client.id);
                                  if (!clientProject) return null;
                                  return (
                                    <li 
                                      key={client.id}
                                      className="px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center justify-between cursor-pointer"
                                      onClick={() => handleClientSelect(clientProject)}
                                    >
                                      <span>{client.name}</span>
                                      {activeOrg?.id === client.id && <CheckCircleIcon className="h-5 w-5 text-blue-400" />}
                                    </li>
                                  )
                              })}
                            </>
                          )}
                          {!isConsultant && (
                            <li 
                                className="px-3 py-2 text-sm text-slate-300 flex items-center cursor-pointer"
                                onClick={() => { setView({ type: 'dashboard' }); setIsDropdownOpen(false); }}
                            >
                               <DashboardIcon className="h-5 w-5 mr-3" />
                               <span>{activeOrg?.name} Dashboard</span>
                            </li>
                          )}
                        </ul>
                    </div>
                )}
            </div>
            <div>
                {/* Actions like search, notifications etc. can go here */}
            </div>
        </header>
    )
}

export default Header;