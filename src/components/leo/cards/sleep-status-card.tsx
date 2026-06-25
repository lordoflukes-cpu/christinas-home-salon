'use client';

import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useLeoStore,
  useNow,
  sleepDuration,
  formatElapsed,
  formatClock,
} from '@/lib/leo';
import { Starfield } from '../decor/starfield';
import { CancerConstellation } from '../decor/cancer-constellation';

export function SleepStatusCard() {
  const now = useNow(1000);
  const activeSleep = useLeoStore((s) => s.activeSleep);
  const sleeps = useLeoStore((s) => s.sleeps);
  const startSleepTimer = useLeoStore((s) => s.startSleepTimer);
  const stopSleepTimer = useLeoStore((s) => s.stopSleepTimer);
  const [busy, setBusy] = useState(false);

  const lastCompleted = sleeps.find((s) => s.endedAt != null);

  async function toggle() {
    setBusy(true);
    try {
      if (activeSleep) await stopSleepTimer(activeSleep.id);
      else await startSleepTimer();
    } finally {
      setBusy(false);
    }
  }

  if (activeSleep) {
    return (
      <Card className="relative overflow-hidden border-ink-800 bg-gradient-to-br from-ink-900 to-bark-900 p-5">
        <Starfield />
        <CancerConstellation className="absolute right-3 top-2 h-16 w-16 opacity-90" />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-gold-200">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Asleep now</span>
          </div>
          <p className="font-display text-5xl font-semibold tabular-nums text-gold-100 [text-shadow:0_0_18px_rgba(236,205,104,0.45)]">
            {formatElapsed(sleepDuration(activeSleep, now))}
          </p>
          <p className="text-xs text-parchment-300">
            since {formatClock(activeSleep.startedAt)}
          </p>
          <Button
            onClick={toggle}
            disabled={busy}
            size="lg"
            className="min-h-14 w-full bg-gold-400 text-base font-semibold text-ink-900 hover:bg-gold-300"
          >
            <Sun className="mr-2 h-5 w-5" /> Woke up
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-ink-300/40 bg-parchment-50 p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-ink-700">
          <Moon className="h-5 w-5 text-gold-600" />
          <span className="font-serif text-lg font-semibold">Sleep</span>
        </div>
        <p className="text-sm text-ink-500">
          {lastCompleted
            ? `Last slept ${formatElapsed(sleepDuration(lastCompleted))}`
            : 'No sleeps logged yet'}
        </p>
        <Button
          onClick={toggle}
          disabled={busy}
          size="lg"
          className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
        >
          <Moon className="mr-2 h-5 w-5" /> Start sleep
        </Button>
      </div>
    </Card>
  );
}
