import React from 'react';
import { clsx } from 'clsx';

export interface ErrorStateProps {
  title?: string;
  message: string;
  error?: Error;
  retry?: () => void;
  className?: string;
  showDetails?: boolean;
}

/**
 * Error State component for displaying error messages
 * Provides clear error information and recovery actions
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  retry,
  className,
  showDetails = false,
}) => {
  const [showFullError, setShowFullError] = React.useState(false);

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 text-red-500 dark:text-red-400">
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      {showDetails && error && (
        <div className="mb-4 w-full max-w-md">
          <button
            onClick={() => setShowFullError(!showFullError)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            {showFullError ? 'Hide' : 'Show'} error details
          </button>
          {showFullError && (
            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs overflow-x-auto">
              {error.stack || error.message}
            </pre>
          )}
        </div>
      )}
      
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
