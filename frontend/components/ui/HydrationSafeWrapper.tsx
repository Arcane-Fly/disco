import React, { useEffect, useState } from 'react';

interface HydrationSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Enhanced hydration-safe wrapper with better loading states
export const HydrationSafeWrapper: React.FC<HydrationSafeWrapperProps> = ({ 
  children, 
  fallback,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className={`hydration-loading ${className}`} suppressHydrationWarning>
        {fallback || (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className={className} suppressHydrationWarning>{children}</div>;
};

// Specialized wrapper for dynamic imports
export const DynamicComponentWrapper: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
}> = ({ children, loading = false }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-64 w-full flex items-center justify-center" suppressHydrationWarning>
        <div className="text-gray-500 dark:text-gray-400">Loading component...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default HydrationSafeWrapper;