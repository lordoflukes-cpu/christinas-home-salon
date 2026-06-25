'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { CalendarClock, Pill } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeoStore, useNow, formatDateTime } from '@/lib/leo';

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function NextUp() {
  const medical = useLeoStore((s) => s.medical);
  const now = useNow(60_000);

  const nextAppt = medical
    .filter((m) => m.kind === 'appointment' && m.at >= startOfDay(now))
    .sort((a, b) => a.at - b.at)[0];

  const vitaminToday = medical.find(
    (m) =>
      m.kind === 'medication' &&
      m.title === 'Vitamin D' &&
      startOfDay(m.at) === startOfDay(now),
  );

  if (!nextAppt && vitaminToday) return null;

  return (
    <Link href={'/leo/health' as Route}>
      <Card className="flex items-center gap-3 border-aegean-200 bg-aegean-50 p-4 transition-colors hover:bg-aegean-100">
        {nextAppt ? (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aegean-100 text-aegean-700">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-aegean-700">Next up</p>
              <p className="truncate font-medium text-ink-900">
                {nextAppt.title}
              </p>
              <p className="truncate text-xs text-ink-500">
                {formatDateTime(nextAppt.at)}
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <Pill className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gold-700">Reminder</p>
              <p className="font-medium text-ink-900">Vitamin D drop today</p>
              <p className="text-xs text-ink-500">Tap to mark it given</p>
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}
