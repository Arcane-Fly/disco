import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  demoMode?: boolean;
  demoComponent?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/', 
  demoMode = false,
  demoComponent 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only set redirect flag if demo mode is disabled AND user is not authenticated
    if (!loading && !user && !demoMode) {
      setShouldRedirect(true);
    } else {
      setShouldRedirect(false);
    }
  }, [user, loading, demoMode]);

  useEffect(() => {
    // Separate effect for actual redirection to avoid conflicts
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // If demo mode is enabled, always show content (regardless of auth state)
  if (demoMode) {
    return <>{demoComponent || children}</>;
  }

  // If authenticated, show full content
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated and demo mode is disabled, show nothing (redirect will happen)
  return null;
}