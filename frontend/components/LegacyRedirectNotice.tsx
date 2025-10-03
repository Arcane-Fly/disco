import Link from 'next/link';
import { ArrowRight, History, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface LegacyRedirectNoticeProps {
  targetRoute: string;
  title?: string;
  description?: string;
  onContinue?: () => void;
}

const accentContainerClass = 'inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--brand-cyan)_12%,transparent)] text-brand-cyan shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--brand-cyan)_35%,transparent)]';
const codeChipClass = 'rounded-lg border border-border-subtle bg-[color-mix(in_oklab,var(--bg-secondary)_92%,transparent)] px-2 py-1 font-mono text-xs text-text-primary';

export function LegacyRedirectNotice({
  targetRoute,
  title = 'Classic interface loading',
  description = 'We are redirecting you to the legacy Disco experience while we finish rolling out the updated theme.',
  onContinue
}: LegacyRedirectNoticeProps) {
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = targetRoute;
    }
  };

  return (
    <Card
      variant="elevated"
      className="mx-auto max-w-xl space-y-6 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <span className={accentContainerClass}>
          <History className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
          Redirecting to <code className={codeChipClass}>{targetRoute}</code>
        </span>
        <Button
          variant="primary"
          className="gap-2"
          onClick={handleContinue}
        >
          Continue now
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Link
          href={targetRoute}
          className="text-xs text-brand-cyan underline underline-offset-4"
        >
          Open the classic interface manually
        </Link>
      </div>
    </Card>
  );
}
