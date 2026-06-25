'use client';

import { Droplets, Milk, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeoStore, useNow, summariseDay, formatElapsed } from '@/lib/leo';

export function TodayGlance() {
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const events = useLeoStore((s) => s.events);
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  const summary = summariseDay({
    feeds,
    diapers,
    sleeps,
    events,
    now,
    name: profile?.name,
  });

  const items = [
    {
      icon: Milk,
      label: 'feeds',
      value: String(summary.feeds),
      tint: 'text-rose-500',
    },
    {
      icon: Droplets,
      label: 'nappies',
      value: `${summary.wet}/${summary.dirty}`,
      sub: 'wet / dirty',
      tint: 'text-aegean-500',
    },
    {
      icon: Moon,
      label: 'sleep',
      value: summary.sleepMs > 0 ? formatElapsed(summary.sleepMs) : '—',
      tint: 'text-night-600',
    },
  ];

  return (
    <Card className="border-ink-300/40 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Today at a glance
      </p>

      <p className="mb-3 font-serif text-[15px] leading-relaxed text-ink-800">
        {summary.narrative}
      </p>

      <div className="grid grid-cols-3 gap-2 border-t border-ink-200/60 pt-3 text-center">
        {items.map(({ icon: Icon, label, value, sub, tint }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon className={`h-5 w-5 ${tint}`} />
            <span className="font-display text-lg font-semibold text-ink-900">
              {value}
            </span>
            <span className="text-[11px] text-ink-500">{sub ?? label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
