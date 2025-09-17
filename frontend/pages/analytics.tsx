/**
 * Analytics Dashboard Page
 * 
 * Privacy-first analytics dashboard with comprehensive insights
 */

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AnalyticsDashboard from '../modules/analytics/AnalyticsDashboard';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <div className="container mx-auto py-8">
          <AnalyticsDashboard />
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}