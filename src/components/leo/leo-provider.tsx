'use client';

import { useEffect } from 'react';
import { useLeoStore } from '@/lib/leo';
import { computeReminders, DEFAULT_REMINDER_PREFS } from '@/lib/leo/reminders';
import {
  isPushConfigured,
  pushScheduledReminders,
  scheduleLocalNotifications,
  notificationPermission,
} from '@/lib/leo/notifications';

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

  // Keep the cloud reminder schedule in step with the data + preferences.
  // Debounced so a burst of edits results in a single write.
  useEffect(() => {
    if (!isPushConfigured()) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const recompute = () => {
      const s = useLeoStore.getState();
      if (!s.hydrated) return;
      const prefs = s.profile?.reminders ?? DEFAULT_REMINDER_PREFS;
      const reminders = computeReminders({
        prefs,
        feeds: s.feeds,
        medical: s.medical,
        activeSleep: s.activeSleep,
        now: Date.now(),
      });
      void pushScheduledReminders(reminders);
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(recompute, 2000);
    };
    const unsub = useLeoStore.subscribe(schedule);
    schedule();
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, []);

  // On-device (foreground) reminders when the cloud pipeline isn't configured.
  // These fire while Leo is open; closed-app delivery is the push path above.
  useEffect(() => {
    if (isPushConfigured()) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancel: (() => void) | null = null;
    const recompute = () => {
      const s = useLeoStore.getState();
      if (!s.hydrated) return;
      const prefs = s.profile?.reminders ?? DEFAULT_REMINDER_PREFS;
      cancel?.();
      cancel = null;
      if (!prefs.enabled || notificationPermission() !== 'granted') return;
      const reminders = computeReminders({
        prefs,
        feeds: s.feeds,
        medical: s.medical,
        activeSleep: s.activeSleep,
        now: Date.now(),
      });
      cancel = scheduleLocalNotifications(reminders, Date.now());
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(recompute, 2000);
    };
    const unsub = useLeoStore.subscribe(schedule);
    schedule();
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
      cancel?.();
    };
  }, []);

  return <>{children}</>;
}
