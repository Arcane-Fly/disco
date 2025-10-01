/**
 * Modern Card Component - Updated with new theme system
 */

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive' | 'neon';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4', 
  lg: 'p-6'
};

const variantClasses = {
  default: 'bg-[color-mix(in_oklab,var(--bg-secondary)_92%,var(--bg-primary)_8%)] border border-border-moderate shadow-elev-2 transition-all duration-200',
  outlined: 'bg-bg-secondary border-2 border-border-strong',
  elevated: 'bg-bg-elevated border border-border-moderate shadow-elev-3',
  interactive: 'bg-[color-mix(in_oklab,var(--bg-secondary)_92%,var(--bg-primary)_8%)] border border-border-moderate shadow-elev-2 transition-all duration-200 hover:shadow-elev-3 hover:shadow-glow-mixed hover:-translate-y-0.5 cursor-pointer',
  neon: 'bg-[color-mix(in_oklab,var(--bg-secondary)_92%,var(--bg-primary)_8%)] border border-border-moderate shadow-[var(--shadow-2),inset_0_0_0_1px_color-mix(in_oklab,var(--brand-cyan)_18%,transparent)] transition-all duration-200'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const classes = `
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      rounded-xl
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';