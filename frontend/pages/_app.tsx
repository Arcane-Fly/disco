import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ui/ThemeContext';
import { ToastProvider } from '../contexts/ui/ToastContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { HydrationSafeWrapper } from '../components/ui/HydrationSafeWrapper';
import '../styles/globals.css';

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