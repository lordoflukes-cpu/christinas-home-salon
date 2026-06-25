'use client';

import { useEffect, useState } from 'react';
import { Share, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

const DISMISS_KEY = 'leo-install-dismissed';

/** A gentle "Add to Home Screen" hint for iOS Safari (no native prompt event). */
export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    const dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setShow(isIOS && !standalone && !dismissed);
  }, []);

  if (!show) return null;

  return (
    <Card className="relative border-rose-100 bg-rose-50 p-4 text-sm text-sage-700">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-sage-400"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1');
          setShow(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-medium text-sage-900">Add Leo to your home screen</p>
      <p className="mt-1 flex flex-wrap items-center gap-1">
        Tap <Share className="inline h-4 w-4" /> then{' '}
        <span className="inline-flex items-center gap-1">
          <Plus className="inline h-4 w-4" /> Add to Home Screen
        </span>{' '}
        to open Leo like an app — even offline.
      </p>
    </Card>
  );
}
