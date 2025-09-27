import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Handle WebContainer-specific errors
    if (error.message.includes('WebContainer') || error.message.includes('SharedArrayBuffer')) {
      console.warn('WebContainer compatibility issue detected:', error.message);
    }
    
    // Suppress hydration warnings in development
    if (process.env.NODE_ENV === 'development' && 
        (error.message.includes('Hydration') || error.message.includes('hydration'))) {
      console.warn('Hydration mismatch suppressed:', error.message);
      return;
    }
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        resetError={this.resetError} 
      />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
}

function DefaultErrorFallback({ error, errorInfo: _, resetError }: DefaultErrorFallbackProps) {
  const isWebContainerError = error?.message.includes('WebContainer') || error?.message.includes('SharedArrayBuffer');
  const isHydrationError = error?.message.includes('Hydration') || error?.message.includes('hydration');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isWebContainerError ? 'WebContainer Error' : 
             isHydrationError ? 'Rendering Issue' : 
             'Something went wrong'}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isWebContainerError ? 
              'WebContainer features may not be fully supported in this environment.' :
             isHydrationError ?
              'A rendering mismatch occurred. This is usually harmless.' :
              'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          
          {isWebContainerError && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-left">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Troubleshooting:</h4>
              <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Ensure your browser supports SharedArrayBuffer</li>
                <li>• Try using Chrome or Firefox with HTTPS</li>
                <li>• Check if cross-origin isolation is enabled</li>
              </ul>
            </div>
          )}
          
          {error && !isHydrationError && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack.split('\n').slice(0, 5).join('\n')}`}
              </pre>
            </details>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={resetError}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export { DefaultErrorFallback };