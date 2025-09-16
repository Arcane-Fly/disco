/**
 * Advanced Workflow Builder Page
 * 
 * Integrates the comprehensive workflow builder with analytics and real-time features
 */

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export default function WorkflowBuilderPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <div className="h-screen">
          <WorkflowBuilder />
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}