'use client';

import { useEffect, useRef, useState } from 'react';
import { Milk, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'leo-bottle-prep-endAt';
const WINDOW_MS = 2 * 60 * 60 * 1000; // NHS: use a made-up feed within ~2 hours

/** Countdown as `h:mm:ss` (or `m:ss` under an hour). */
function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * A small, device-local kitchen timer. Tap to start a 2-hour "use by" countdown
 * for a freshly made-up bottle. Purely in-app — it never sends a notification
 * and is intentionally not synced between phones (it's a transient timer).
 */
export function BottlePrepTimer() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore any running timer on mount.
  useEffect(() => {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) {
      const v = parseInt(raw, 10);
      if (!Number.isNaN(v)) setEndAt(v);
    }
  }, []);

  // Tick every second only while a timer is set.
  useEffect(() => {
    if (endAt == null) return;
    tick.current = setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [endAt]);

  function start() {
    const end = Date.now() + WINDOW_MS;
    window.localStorage.setItem(STORAGE_KEY, String(end));
    setNowMs(Date.now());
    setEndAt(end);
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    setEndAt(null);
  }

  if (endAt == null) {
    return (
      <button
        type="button"
        onClick={start}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-300 bg-parchment-50 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-parchment-100"
      >
        <Milk className="h-4 w-4 text-aegean-600" />
        Start bottle-prep timer
      </button>
    );
  }

  const remaining = endAt - nowMs;
  const expired = remaining <= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2.5',
        expired
          ? 'border-rose-300 bg-rose-50'
          : 'border-aegean-200 bg-aegean-50',
      )}
    >
      <Milk
        className={cn(
          'h-5 w-5 shrink-0',
          expired ? 'text-rose-500' : 'text-aegean-600',
        )}
      />
      <div className="min-w-0 flex-1">
        {expired ? (
          <>
            <p className="text-sm font-medium text-rose-700">
              Make a fresh bottle
            </p>
            <p className="text-xs text-rose-600">
              The 2-hour window has passed.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-ink-900">
              Use within {formatCountdown(remaining)}
            </p>
            <p className="text-xs text-ink-500">Bottle prepared</p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={reset}
        aria-label="Reset bottle timer"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-white/60 hover:text-ink-700"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
