/**
 * Dynamic imports for heavy components with hydration safety
 * Improves initial load time by lazy loading complex components
 * Prevents hydration mismatches in WebContainer environments
 */
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

// Loading component with hydration safety
const HydrationSafeLoading: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full bg-gray-50 dark:bg-gray-800 rounded animate-pulse" />;
  }

  return (
    <div className="flex items-center justify-center p-8" suppressHydrationWarning>
      {minimal ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-96 w-full" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading component...</div>
        </div>
      )}
    </div>
  );
};

// Analytics Dashboard - Heavy component with charts
export const AnalyticsDashboard = dynamic(() => 
  import('../modules/analytics/AnalyticsDashboard').then(mod => ({ 
    default: mod.AnalyticsDashboard 
  })), {
  loading: () => <HydrationSafeLoading />,
  ssr: false
});

// Workflow Builder - Complex drag-and-drop component with WebContainer integration
export const WorkflowBuilder = dynamic(() => 
  import('../components/workflow/WorkflowBuilder'), {
  loading: () => <HydrationSafeLoading minimal />,
  ssr: false
});

// Canvas Grid - WebContainer-compatible canvas component (available as direct import)
// Note: CanvasGrid is used directly in WorkflowBuilder, not as dynamic import to avoid conflicts

// Create a default export object
const DynamicComponents = {
  AnalyticsDashboard,
  WorkflowBuilder,
};

export default DynamicComponents;