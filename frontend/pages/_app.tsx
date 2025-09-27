import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ui/ThemeContext';
import { ToastProvider } from '../contexts/ui/ToastContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import '../styles/globals.css';

// Hydration-safe wrapper component
const HydrationSafeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder content on server-side to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading Disco MCP...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <HydrationSafeWrapper>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <WebSocketProvider>
                <NotificationProvider>
                  <div suppressHydrationWarning>
                    <Component {...pageProps} />
                  </div>
                </NotificationProvider>
              </WebSocketProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </HydrationSafeWrapper>
    </ErrorBoundary>
  );
}