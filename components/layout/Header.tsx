import React from 'react';
import type { User } from '../../types';
import NotificationPanel from '../ui/NotificationPanel';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-8 py-3 flex items-center justify-between">
      <div>
        {/* Breadcrumbs or Title can go here */}
      </div>
      <div className="flex items-center space-x-4">
        <NotificationPanel />
        <div className="flex items-center space-x-3">
            <img src={user.avatarUrl} alt="User Avatar" className="h-9 w-9 rounded-full" />
            <div>
                <p className="font-semibold text-sm text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role.replace(/_/g, ' ')}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
