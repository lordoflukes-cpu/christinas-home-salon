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
      <Card className="relative overflow-hidden border-night-800 bg-gradient-to-br from-night-900 to-aegean-900 p-5">
        <Starfield />
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-gold-200">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Asleep now</span>
          </div>
          <p className="font-display text-5xl font-semibold tabular-nums text-gold-100 [text-shadow:0_0_18px_rgba(236,205,104,0.45)]">
            {formatElapsed(sleepDuration(activeSleep, now))}
          </p>
          <p className="text-xs text-aegean-200">
            since {formatClock(activeSleep.startedAt)}
          </p>
          <Button
            onClick={toggle}
            disabled={busy}
            size="lg"
            className="min-h-14 w-full bg-gold-400 text-base font-semibold text-night-900 hover:bg-gold-300"
          >
            <Sun className="mr-2 h-5 w-5" /> Woke up
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-night-100 bg-night-50 p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-night-700">
          <Moon className="h-5 w-5" />
          <span className="font-medium">Sleep</span>
        </div>
        <p className="text-sm text-night-400">
          {lastCompleted
            ? `Last slept ${formatElapsed(sleepDuration(lastCompleted))}`
            : 'No sleeps logged yet'}
        </p>
        <Button
          onClick={toggle}
          disabled={busy}
          size="lg"
          className="min-h-14 w-full bg-night-700 text-base hover:bg-night-800"
        >
          <Moon className="mr-2 h-5 w-5" /> Start sleep
        </Button>
      </div>
    </Card>
  );
}
