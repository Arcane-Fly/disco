import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}