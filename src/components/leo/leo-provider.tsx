'use client';

import { useEffect } from 'react';
import { useLeoStore } from '@/lib/leo';

/**
 * Hydrates the Leo store from IndexedDB on mount (client-only ⇒ SSR-safe)
 * and registers the service worker in production builds only (a SW that
 * caches `/_next` chunks breaks dev HMR).
 */
export function LeoProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useLeoStore((s) => s.hydrate);

  useEffect(() => {
    hydrate().catch((err) => console.error('Leo: failed to load data', err));
  }, [hydrate]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/leo/sw.js', { scope: '/leo' })
        .catch((err) =>
          console.error('Leo: service worker registration failed', err),
        );
    }
  }, []);

  return <>{children}</>;
}
