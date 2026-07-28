import { useCallback, useEffect, useState } from 'react';

/**
 * Chrome fires `beforeinstallprompt` instead of showing its own install dialog, and
 * the event is only useful if you keep it: calling `prompt()` later is what actually
 * opens the install sheet. With no listener the browser just parks a small icon in the
 * address bar, which is why nothing appears to happen on a correctly configured PWA.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'nutrilens_install_prompt_dismissed';

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari does not implement display-mode, it sets this instead.
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent);

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [dismissed, setDismissed] = useState<boolean>(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Stops the mini-infobar so our own UI is the only thing the user sees.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // The event is single use — Chrome will fire a fresh one if the user declines.
    setDeferredPrompt(null);
    if (outcome === 'accepted') setInstalled(true);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  }, []);

  // Safari never fires `beforeinstallprompt`, so iOS users need the manual steps
  // rather than a button that cannot do anything.
  const needsIOSInstructions = isIOS() && !installed;

  return {
    canInstall: !!deferredPrompt && !installed,
    needsIOSInstructions,
    installed,
    dismissed,
    promptInstall,
    dismiss,
  };
};

export default useInstallPrompt;
