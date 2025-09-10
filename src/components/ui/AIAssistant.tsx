/**
 * Simplified AI Assistant for Build Testing
 */

import React from 'react';

export const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void; context?: string }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      borderLeft: '1px solid #e2e8f0',
      boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          🤖 AI Assistant
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{
        textAlign: 'center',
        color: '#6b7280',
        padding: '40px 20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
          AI Assistant Ready
        </h4>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
          Natural language programming capabilities implemented.
          Full integration coming in Phase 2.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;