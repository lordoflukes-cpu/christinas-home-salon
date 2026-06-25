'use client';

import { useState } from 'react';
import { Milk, Square } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useLeoStore,
  useNow,
  formatElapsed,
  formatClock,
  formatDuration,
} from '@/lib/leo';
import type { BreastSide } from '@/lib/leo';
import { cn } from '@/lib/utils';

/** Live breast-feed stopwatch: pick a side, start, and finish to log it. */
export function FeedStatusCard() {
  const now = useNow(1000);
  const activeFeed = useLeoStore((s) => s.activeFeed);
  const feeds = useLeoStore((s) => s.feeds);
  const startFeedTimer = useLeoStore((s) => s.startFeedTimer);
  const stopFeedTimer = useLeoStore((s) => s.stopFeedTimer);
  const [side, setSide] = useState<BreastSide>('L');
  const [busy, setBusy] = useState(false);

  const lastTimed = feeds.find((f) => f.type === 'breast' && f.durationMin);

  async function start() {
    setBusy(true);
    try {
      await startFeedTimer(side);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!activeFeed) return;
    setBusy(true);
    try {
      await stopFeedTimer(activeFeed.id);
    } finally {
      setBusy(false);
    }
  }

  if (activeFeed) {
    const sideLabel = activeFeed.side === 'R' ? 'Right' : 'Left';
    return (
      <Card className="relative overflow-hidden border-rose-300 bg-gradient-to-br from-rose-900 to-bark-900 p-5">
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-rose-100">
            <Milk className="h-5 w-5" />
            <span className="font-medium">Feeding now · {sideLabel}</span>
          </div>
          <p className="font-display text-5xl font-semibold tabular-nums text-rose-50 [text-shadow:0_0_18px_rgba(251,113,133,0.45)]">
            {formatElapsed(now - activeFeed.startedAt)}
          </p>
          <p className="text-xs text-rose-200">
            since {formatClock(activeFeed.startedAt)}
          </p>
          <Button
            onClick={finish}
            disabled={busy}
            size="lg"
            className="min-h-14 w-full bg-rose-100 text-base font-semibold text-rose-900 hover:bg-white"
          >
            <Square className="mr-2 h-4 w-4 fill-current" /> Finish feed
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-ink-300/40 bg-parchment-50 p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-ink-700">
          <Milk className="h-5 w-5 text-rose-500" />
          <span className="font-serif text-lg font-semibold">Feed timer</span>
        </div>
        <p className="text-sm text-ink-500">
          {lastTimed
            ? `Last breast feed ${formatDuration(lastTimed.durationMin as number)}`
            : 'Time a breast feed hands-free'}
        </p>
        <div className="grid w-full grid-flow-col gap-1 rounded-lg bg-parchment-100 p-1">
          {(['L', 'R'] as BreastSide[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={cn(
                'rounded-md py-2 text-sm font-medium transition-colors',
                side === s
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700',
              )}
            >
              {s === 'L' ? 'Left' : 'Right'}
            </button>
          ))}
        </div>
        <Button
          onClick={start}
          disabled={busy}
          size="lg"
          className="min-h-14 w-full bg-rose-600 text-base hover:bg-rose-700"
        >
          <Milk className="mr-2 h-5 w-5" /> Start feed
        </Button>
      </div>
    </Card>
  );
}
