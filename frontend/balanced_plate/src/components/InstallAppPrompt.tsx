import React from 'react';
import { Download, Share, X } from 'lucide-react';
import useInstallPrompt from '@/hooks/useInstallPrompt';

/**
 * Bottom banner offering to install the app. Renders nothing unless the browser has
 * actually told us the app is installable (or we are on iOS, where the install has to
 * be done by hand), so it never nags a user who cannot act on it.
 */
const InstallAppPrompt: React.FC = () => {
  const { canInstall, needsIOSInstructions, dismissed, promptInstall, dismiss } =
    useInstallPrompt();

  if (dismissed || (!canInstall && !needsIOSInstructions)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4">
      <div className="flex items-start gap-3">
        <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Install NutriLens</p>
          {canInstall ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add it to your home screen for faster scans and offline access.
            </p>
          ) : (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs leading-relaxed text-muted-foreground">
              Tap <Share className="inline h-3.5 w-3.5" /> Share, then
              <span className="font-medium text-foreground">Add to Home Screen</span>.
            </p>
          )}

          {canInstall && (
            <button
              onClick={() => void promptInstall()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Install app
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallAppPrompt;
