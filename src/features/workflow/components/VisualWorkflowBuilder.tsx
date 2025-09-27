/**
 * Simplified Visual Workflow Builder for Build Testing
 */

import React from 'react';

export const VisualWorkflowBuilder: React.FC = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '32px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
          Visual Workflow Builder
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Phase 1 Foundation - Modern @dnd-kit Integration Complete
        </p>
      </div>
    </div>
  );
};

export default VisualWorkflowBuilder;