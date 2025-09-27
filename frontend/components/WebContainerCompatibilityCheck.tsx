/**
 * WebContainer Compatibility Check Component
 * Provides browser compatibility checks and user guidance
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  feature: string;
  message: string;
  recommendation?: string;
  fixable?: boolean;
}

interface CompatibilityState {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  loading: boolean;
}

export const WebContainerCompatibilityCheck: React.FC<{
  onCompatibilityChange?: (isCompatible: boolean) => void;
  showDetails?: boolean;
  className?: string;
}> = ({ onCompatibilityChange, showDetails = true, className = '' }) => {
  const [state, setState] = useState<CompatibilityState>({
    isCompatible: false,
    issues: [],
    loading: true
  });

  useEffect(() => {
    const checkCompatibility = () => {
      const issues: CompatibilityIssue[] = [];

      // Check if running in browser
      if (typeof window === 'undefined') {
        issues.push({
          type: 'error',
          feature: 'Browser Environment',
          message: 'Not running in browser environment',
          recommendation: 'This component requires a browser environment'
        });
      }

      // Check SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined') {
        issues.push({
          type: 'error',
          feature: 'SharedArrayBuffer',
          message: 'SharedArrayBuffer not available',
          recommendation: 'Ensure COEP header is set to "credentialless" and COOP header is set to "same-origin"',
          fixable: true
        });
      }

      // Check HTTPS requirement
      if (typeof window !== 'undefined' && 
          window.location && 
          window.location.protocol !== 'https:' && 
          window.location.hostname !== 'localhost') {
        issues.push({
          type: 'error',
          feature: 'HTTPS',
          message: 'HTTPS required for WebContainer functionality',
          recommendation: 'Use HTTPS for production deployment'
        });
      }

      // Check Web Workers
      if (typeof Worker === 'undefined') {
        issues.push({
          type: 'error',
          feature: 'Web Workers',
          message: 'Web Workers not available',
          recommendation: 'Use a modern browser that supports Web Workers'
        });
      }

      // Check WebAssembly
      if (typeof WebAssembly === 'undefined') {
        issues.push({
          type: 'error',
          feature: 'WebAssembly',
          message: 'WebAssembly not available',
          recommendation: 'Use a modern browser that supports WebAssembly'
        });
      }

      // Check cross-origin isolation
      if (typeof window !== 'undefined') {
        try {
          // This will throw if not cross-origin isolated
          new SharedArrayBuffer(1);
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('SharedArrayBuffer')) {
            issues.push({
              type: 'warning',
              feature: 'Cross-Origin Isolation',
              message: 'Cross-origin isolation may not be properly configured',
              recommendation: 'Ensure proper COEP and COOP headers are set',
              fixable: true
            });
          }
        }
      }

      // Check for third-party cookie restrictions
      if (typeof window !== 'undefined' && window.location.hostname.includes('webcontainer.io')) {
        issues.push({
          type: 'info',
          feature: 'Third-Party Cookies',
          message: 'Running in WebContainer environment',
          recommendation: 'Ensure third-party cookies are enabled for optimal experience'
        });
      }

      const isCompatible = !issues.some(issue => issue.type === 'error');

      setState({
        isCompatible,
        issues,
        loading: false
      });

      onCompatibilityChange?.(isCompatible);
    };

    // Add a small delay to prevent hydration issues
    const timer = setTimeout(checkCompatibility, 100);
    
    return () => clearTimeout(timer);
  }, [onCompatibilityChange]);

  if (state.loading) {
    return (
      <div className={`p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span className="text-sm">Checking WebContainer compatibility...</span>
        </div>
      </div>
    );
  }

  const errorCount = state.issues.filter(issue => issue.type === 'error').length;
  const warningCount = state.issues.filter(issue => issue.type === 'warning').length;

  return (
    <div className={`p-4 border rounded-lg ${
      state.isCompatible 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    } ${className}`} suppressHydrationWarning>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {state.isCompatible ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${
            state.isCompatible 
              ? 'text-green-800 dark:text-green-300'
              : 'text-red-800 dark:text-red-300'
          }`}>
            {state.isCompatible 
              ? 'WebContainer Compatible' 
              : 'Compatibility Issues Detected'}
          </h3>
          
          <p className={`mt-1 text-sm ${
            state.isCompatible 
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {state.isCompatible
              ? 'Your browser supports all WebContainer features.'
              : `${errorCount} error${errorCount !== 1 ? 's' : ''} and ${warningCount} warning${warningCount !== 1 ? 's' : ''} found.`}
          </p>

          {showDetails && state.issues.length > 0 && (
            <div className="mt-3 space-y-2">
              {state.issues.map((issue, index) => (
                <div key={index} className={`p-2 rounded-md text-xs ${
                  issue.type === 'error' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : issue.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      {issue.type === 'error' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Info className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{issue.feature}</div>
                      <div className="mt-1">{issue.message}</div>
                      {issue.recommendation && (
                        <div className="mt-1 font-medium">
                          💡 {issue.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!state.isCompatible && (
            <div className="mt-3">
              <a 
                href="https://webcontainer.io/guides/browser-support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                View browser support guide
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebContainerCompatibilityCheck;