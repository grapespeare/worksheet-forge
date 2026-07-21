import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { usePWA } from './PWAProvider';

const DISMISS_KEY = 'worksheet-forge-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = window.innerWidth < 1024;
  return isMobileUA || isSmallScreen;
}

function wasRecentlyDismissed(): boolean {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) return false;
    const dismissedTime = parseInt(dismissedAt, 10);
    return Date.now() - dismissedTime < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch {
    // localStorage not available
  }
}

export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if installable, not installed, on mobile, and not recently dismissed
    if (
      isInstallable &&
      !isInstalled &&
      isMobileDevice() &&
      !wasRecentlyDismissed()
    ) {
      // Small delay so it slides up after page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      // User declined via the browser prompt, keep banner
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-2"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-border-medium px-4 py-3 flex items-center gap-3 max-w-md mx-auto">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img
                src="/icon-192x192.png"
                alt="Worksheet Forge"
                className="w-12 h-12 rounded-xl"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-ink truncate">
                Install Worksheet Forge
              </p>
              <p className="text-[12px] text-ink-secondary leading-tight">
                Add to home screen for quick access
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:bg-accent-hover active:scale-[0.97] transition-all duration-150"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-ink-tertiary hover:text-ink hover:bg-canvas-dark rounded-lg transition-all duration-150"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
