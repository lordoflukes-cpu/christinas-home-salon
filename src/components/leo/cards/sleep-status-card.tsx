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
      if (activeSleep) {
        await stopSleepTimer(activeSleep.id);
      } else {
        await startSleepTimer();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-sage-100 bg-sage-50 p-5">
      {activeSleep ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-sage-700">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Asleep now</span>
          </div>
          <p className="font-display text-4xl font-semibold tabular-nums text-sage-900">
            {formatElapsed(sleepDuration(activeSleep, now))}
          </p>
          <p className="text-xs text-sage-500">
            since {formatClock(activeSleep.startedAt)}
          </p>
          <Button
            onClick={toggle}
            disabled={busy}
            size="lg"
            className="min-h-14 w-full bg-sage-600 text-base hover:bg-sage-700"
          >
            <Sun className="mr-2 h-5 w-5" /> Woke up
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-sage-600">
            <Moon className="h-5 w-5" />
            <span className="font-medium">Sleep</span>
          </div>
          <p className="text-sm text-sage-500">
            {lastCompleted
              ? `Last slept ${formatElapsed(sleepDuration(lastCompleted))}`
              : 'No sleeps logged yet'}
          </p>
          <Button
            onClick={toggle}
            disabled={busy}
            size="lg"
            className="min-h-14 w-full bg-sage-600 text-base hover:bg-sage-700"
          >
            <Moon className="mr-2 h-5 w-5" /> Start sleep
          </Button>
        </div>
      )}
    </Card>
  );
}
