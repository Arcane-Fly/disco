/**
 * Analytics Dashboard Page
 * 
 * Privacy-first analytics dashboard with comprehensive insights
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DemoBanner from '../components/DemoBanner';
import AnalyticsDashboard from '../modules/analytics/AnalyticsDashboard';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export default function AnalyticsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute demoMode={true}>
      <Layout>
        <ErrorBoundary>
          <div className="container mx-auto py-8">
            {/* Demo Banner for unauthenticated users */}
            {!user && (
              <DemoBanner 
                title="Analytics"
                description="This is a demo version of the analytics dashboard with sample data."
              />
            )}
            <AnalyticsDashboard />
          </div>
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}