import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

interface ErrorProps {
  statusCode?: number;
  error?: Error;
}

export default function Error({ statusCode, error }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    if (error) {
      console.error('Error page rendered:', error);
    }
  }, [error]);

  const title = statusCode === 404 
    ? 'Page Not Found' 
    : statusCode 
      ? `Error ${statusCode}` 
      : 'An Error Occurred';

  const message = statusCode === 404
    ? "The page you're looking for doesn't exist."
    : statusCode
      ? 'Something went wrong on our end.'
      : 'An unexpected error occurred.';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card variant="elevated" className="max-w-md w-full text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
            <Icon name="AlertCircle" size={40} />
          </div>
          <div className="space-y-2">
            {statusCode && <h1 className="text-4xl font-bold text-text-primary">{statusCode}</h1>}
            <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
            <p className="text-sm text-text-secondary">{message}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              <Icon name="Home" size={16} />
              <span>Go Home</span>
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            <Icon name="RefreshCw" size={16} />
            <span>Try Again</span>
          </Button>
        </div>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-4 bg-bg-tertiary rounded text-xs overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary">
            If this problem persists, please{' '}
            <a href="https://github.com/Arcane-Fly/disco/issues" className="text-brand-cyan hover:underline">
              report it on GitHub
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, error: err };
};
