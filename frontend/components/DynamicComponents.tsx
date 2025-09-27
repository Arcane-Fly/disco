/**
 * Dynamic imports for heavy components
 * Improves initial load time by lazy loading complex components
 */
import dynamic from 'next/dynamic';

// Analytics Dashboard - Heavy component with charts
export const AnalyticsDashboard = dynamic(() => 
  import('../modules/analytics/AnalyticsDashboard').then(mod => ({ 
    default: mod.AnalyticsDashboard 
  })), {
  loading: () => <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>,
  ssr: false
});

// Workflow Builder - Complex drag-and-drop component  
export const WorkflowBuilder = dynamic(() => 
  import('../components/workflow/WorkflowBuilder'), {
  loading: () => <div className="flex items-center justify-center p-8">
    <div className="animate-pulse bg-gray-200 rounded h-96 w-full"></div>
  </div>,
  ssr: false
});

// Create a default export object
const DynamicComponents = {
  AnalyticsDashboard,
  WorkflowBuilder,
};

export default DynamicComponents;