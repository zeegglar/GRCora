import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center text-sm font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    default: 'btn-primary',
    destructive: 'bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2',
    outline: 'btn-secondary',
    secondary: 'btn-secondary',
    ghost: 'hover:bg-slate-700/30 text-muted hover:text-subheading rounded-md px-3 py-2',
    link: 'text-primary-400 hover:text-primary-300 underline-offset-4 hover:underline'
  };

  const sizes = {
    default: '',
    sm: 'text-xs py-1 px-2',
    lg: 'text-base py-3 px-6',
    icon: 'p-2'
  };

  // Only add size classes for non-default variants that don't already include sizing
  const sizeClass = (variant === 'default' || variant === 'outline' || variant === 'secondary')
    ? sizes[size === 'default' ? 'sm' : size]
    : sizes[size];

  const classes = `${baseClasses} ${variants[variant]} ${sizeClass} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};