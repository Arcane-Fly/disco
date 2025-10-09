import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setupTokenRefresh, stopTokenRefresh } from '../lib/auth/tokenRefresh';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const response = await fetch('/api/v1/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        
        // Setup automatic token refresh if we have a valid token
        if (data.token) {
          setupTokenRefresh(
            data.token,
            (newToken: string) => {
              // Update token when refreshed
              setToken(newToken);
              console.log('🔄 Token refreshed and updated in auth context');
            },
            () => {
              // Logout on refresh failure
              console.error('❌ Token refresh failed, logging out');
              logout();
            }
          );
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = () => {
    window.location.href = '/api/v1/auth/github';
  };

  const logout = async () => {
    try {
      // Stop token refresh
      stopTokenRefresh();
      
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setToken(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTokenRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};