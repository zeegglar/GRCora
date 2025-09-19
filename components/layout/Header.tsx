import React, { useState } from 'react';
import type { User } from '../../types';
import NotificationPanel from '../ui/NotificationPanel';
import GRCAssistant from '../ai/GRCAssistant';
import { SparklesIcon } from '../ui/Icons';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: User;
  onLogoClick?: () => void;
}

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ user, onLogoClick }) => {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="flex-shrink-0 glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-heading text-lg font-semibold">GRCora</h1>
              <p className="text-muted text-xs">Governance • Risk • Compliance</p>
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-700/50 hover:bg-slate-600/50'
                : 'bg-slate-200/80 hover:bg-slate-300/80'
            }`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-amber-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-600" />
            )}
          </button>

          {/* Vision AI Assistant Button */}
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="relative p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 group"
            aria-label="Open Vision AI Assistant"
            title="Ask Vision AI"
          >
            <SparklesIcon className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </button>

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

      {/* AI Assistant Modal */}
      <GRCAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </>
  );
};

export default Header;
