import React from 'react';
import { cn } from '../../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-b from-brand-cyan to-[#4dcce5] text-[#001018] hover:shadow-elev-2 hover:shadow-glow-cyan focus-visible:shadow-[0_0_0_3px_rgba(110,231,255,0.4)] transform hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-bg-secondary text-text-primary border border-border-strong hover:bg-bg-tertiary hover:border-brand-cyan hover:shadow-elev-1',
      outline: 'border-2 border-border-strong text-text-primary hover:bg-bg-interactive focus-visible:ring-brand-cyan',
      ghost: 'text-text-secondary hover:bg-bg-interactive hover:text-text-primary',
      destructive: 'bg-error text-white hover:bg-[color-mix(in_oklab,var(--error),black_15%)] hover:shadow-[0_0_0_2px_rgba(239,68,68,0.25)]'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };