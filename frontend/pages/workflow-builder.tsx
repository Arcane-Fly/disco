/**
 * Advanced Workflow Builder Page
 * 
 * Integrates the comprehensive workflow builder with analytics and real-time features
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DemoBanner from '../components/DemoBanner';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export default function WorkflowBuilderPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute demoMode={true}>
      <Layout>
        <ErrorBoundary>
          {/* Demo Banner for unauthenticated users */}
          {!user && (
            <div className="p-6 pb-0">
              <DemoBanner 
                title="Workflow Builder"
                description="This is a demo version of the workflow builder with limited functionality."
              />
            </div>
          )}
          <div className="h-screen">
            <WorkflowBuilder />
          </div>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}