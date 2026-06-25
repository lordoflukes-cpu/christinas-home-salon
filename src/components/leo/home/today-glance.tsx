'use client';

import { Droplets, Milk, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeoStore, useNow, sleepDuration, formatElapsed } from '@/lib/leo';

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function TodayGlance() {
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const now = useNow(60_000);
  const since = startOfDay(now);

  const feedsToday = feeds.filter((f) => f.startedAt >= since).length;
  const nappiesToday = diapers.filter((d) => d.changedAt >= since).length;
  const sleepMs = sleeps
    .filter((s) => (s.endedAt ?? now) >= since)
    .reduce((sum, s) => {
      const start = Math.max(s.startedAt, since);
      const end = s.endedAt ?? now;
      return sum + Math.max(0, end - start);
    }, 0);

  const items = [
    {
      icon: Milk,
      label: 'feeds',
      value: String(feedsToday),
      tint: 'text-rose-500',
    },
    {
      icon: Droplets,
      label: 'nappies',
      value: String(nappiesToday),
      tint: 'text-aegean-500',
    },
    {
      icon: Moon,
      label: 'sleep',
      value: sleepMs > 0 ? formatElapsed(sleepMs) : '—',
      tint: 'text-night-600',
    },
  ];

  return (
    <Card className="border-cream-200 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-400">
        Today at a glance
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {items.map(({ icon: Icon, label, value, tint }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon className={`h-5 w-5 ${tint}`} />
            <span className="font-display text-lg font-semibold text-night-900">
              {value}
            </span>
            <span className="text-[11px] text-sage-500">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
