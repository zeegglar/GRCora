import React, { useRef, useEffect, ReactNode } from 'react';

// Skip Link for keyboard navigation
export const SkipLink: React.FC<{ href: string; children: ReactNode }> = ({
  href,
  children
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:no-underline"
  >
    {children}
  </a>
);

// Accessible Modal with focus management
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';

      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';

        // Restore focus to the previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`glass-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 ${className}`}
        tabIndex={-1}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible Table with proper headings and navigation
export const AccessibleTable: React.FC<{
  caption: string;
  headers: string[];
  children: ReactNode;
  className?: string;
}> = ({ caption, headers, children, className = '' }) => (
  <div className={`glass-card rounded-lg overflow-hidden ${className}`}>
    <table className="w-full text-sm text-left text-slate-300" role="table">
      <caption className="sr-only">{caption}</caption>
      <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
        <tr role="row">
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className="px-6 py-3"
              role="columnheader"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {children}
      </tbody>
    </table>
  </div>
);

// Accessible Form Field with proper labeling
export const AccessibleFormField: React.FC<{
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
}> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  helpText,
  className = ''
}) => {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300 mb-2"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 text-slate-200 bg-slate-900/50 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-slate-700'}
        `}
      />

      {helpText && (
        <p id={helpId} className="mt-1 text-xs text-slate-400">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Button with proper states
export const AccessibleButton: React.FC<{
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
}> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <span className="inline-block animate-spin mr-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

// Accessible Status Badge
export const AccessibleStatusBadge: React.FC<{
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}> = ({ status, type = 'info', className = '' }) => {
  const typeClasses = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${typeClasses[type]}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
};

// Live Region for dynamic content announcements
export const LiveRegion: React.FC<{
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
}> = ({ message, politeness = 'polite' }) => (
  <div
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

export default {
  SkipLink,
  AccessibleModal,
  AccessibleTable,
  AccessibleFormField,
  AccessibleButton,
  AccessibleStatusBadge,
  LiveRegion
};