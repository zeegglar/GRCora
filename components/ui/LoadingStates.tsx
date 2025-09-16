import React from 'react';

// Skeleton loader for tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => (
  <div className="glass-card rounded-lg overflow-hidden">
    <div className="bg-slate-800/50 p-4">
      <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse"></div>
    </div>
    <div className="divide-y divide-slate-700/50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-slate-700 rounded animate-pulse ${
                j === 0 ? 'w-1/6' : j === 1 ? 'w-1/3' : 'w-1/4'
              }`}
              style={{ animationDelay: `${(i * columns + j) * 100}ms` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Skeleton loader for cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-2/3 mb-3"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}> = ({ size = 'md', text, className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <span className="text-slate-400">{text}</span>}
    </div>
  );
};

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...'
}) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="mb-4">
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-slate-400 text-lg">{message}</p>
    </div>
  </div>
);

// Button loading state
export const ButtonLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`relative ${className} ${
      (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    )}
    <span className={isLoading ? 'invisible' : 'visible'}>
      {children}
    </span>
  </button>
);

// Content placeholder
export const ContentPlaceholder: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => (
  <div className="text-center py-12">
    {icon && (
      <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
    {action}
  </div>
);

// Progress bar
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}> = ({ progress, className = '', showPercentage = true }) => (
  <div className={`w-full ${className}`}>
    <div className="flex justify-between items-center mb-1">
      {showPercentage && (
        <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  </div>
);

// Pulse loading effect for text
export const TextPlaceholder: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-slate-700 rounded animate-pulse ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
        style={{ animationDelay: `${i * 100}ms` }}
      ></div>
    ))}
  </div>
);

export default {
  TableSkeleton,
  CardSkeleton,
  LoadingSpinner,
  PageLoading,
  ButtonLoading,
  ContentPlaceholder,
  ProgressBar,
  TextPlaceholder
};