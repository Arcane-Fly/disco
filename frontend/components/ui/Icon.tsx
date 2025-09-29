import React from 'react';
import * as Icons from 'lucide-react';

// Hydration-safe icon component that prevents SSR mismatches
interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  fallback = null 
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Return fallback during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        suppressHydrationWarning
      >
        {fallback || (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M9,9h6v6H9z"/>
          </svg>
        )}
      </div>
    );
  }

  const IconComponent = Icons[name] as React.ComponentType<{
    size?: number;
    className?: string;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        suppressHydrationWarning
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
    );
  }

  return (
    <IconComponent 
      size={size} 
      className={className}
    />
  );
};

// Specific commonly used icons with hydration safety
export const SafeGithubIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return <Icon name="Github" className={className} size={size} />;
};

export const SafeCodeIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return <Icon name="Code2" className={className} size={size} />;
};

export const SafeTerminalIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return <Icon name="Terminal" className={className} size={size} />;
};

export const SafeBarChartIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return <Icon name="BarChart3" className={className} size={size} />;
};

export default Icon;