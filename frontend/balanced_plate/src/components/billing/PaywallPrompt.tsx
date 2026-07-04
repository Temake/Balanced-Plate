import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaywallPromptProps {
  title?: string;
  message?: string;
}

const PaywallPrompt: React.FC<PaywallPromptProps> = ({
  title = 'Upgrade to continue',
  message = 'This feature is available on Plus and Pro plans.',
}) => {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm opacity-80">{message}</p>
          </div>
        </div>
        <Button asChild size="sm" className="gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
          <Link to="/billing">
            <Sparkles className="h-4 w-4" />
            View plans
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PaywallPrompt;
