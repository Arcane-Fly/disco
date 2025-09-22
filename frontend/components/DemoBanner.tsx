import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Github, Lock } from 'lucide-react';

interface DemoBannerProps {
  title: string;
  description: string;
}

export default function DemoBanner({ title, description }: DemoBannerProps) {
  const { login } = useAuth();

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      color: 'var(--white)',
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-lg)',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{ flexShrink: 0 }}>
          <Lock style={{ width: '32px', height: '32px', color: 'rgba(255, 255, 255, 0.9)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            marginBottom: 'var(--space-xs)',
            color: 'var(--white)'
          }}>
            {title} - Demo Mode
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            marginBottom: 'var(--space-md)',
            lineHeight: 1.5
          }}>
            {description} Sign in with GitHub to access full functionality and real data.
          </p>
          <button 
            onClick={login}
            className="btn btn-secondary"
            style={{ 
              background: 'var(--white)',
              color: 'var(--primary)',
              border: 'none'
            }}
          >
            <Github style={{ width: '20px', height: '20px' }} />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}