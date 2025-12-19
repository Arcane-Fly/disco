import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <Card variant="elevated" className="max-w-md w-full text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
            <Icon name="AlertTriangle" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-text-primary">404</h1>
            <h2 className="text-2xl font-semibold text-text-primary">Page Not Found</h2>
            <p className="text-sm text-text-secondary">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              <Icon name="Home" size={16} />
              <span>Go Home</span>
            </Button>
          </Link>
          <Link href="/app-dashboard">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Icon name="BarChart3" size={16} />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>
        
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary">
            If you believe this is an error, please{' '}
            <a href="https://github.com/Arcane-Fly/disco/issues" className="text-brand-cyan hover:underline">
              report it on GitHub
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
