import React from 'react';
import type { User } from '../../types';
import NotificationPanel from '../ui/NotificationPanel';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="flex-shrink-0 glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h1 className="text-heading text-lg font-semibold">GRCora</h1>
            <p className="text-muted text-xs">Governance • Risk • Compliance</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <NotificationPanel />
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center border-2 border-primary-400/20">
            <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-subheading text-sm font-medium">{user.name}</p>
            <p className="text-muted text-xs">{user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
