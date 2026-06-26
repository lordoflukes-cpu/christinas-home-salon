'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Droplets, Milk, Moon, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeoStore, useNow, summariseDay, formatElapsed } from '@/lib/leo';

/**
 * Today-at-a-glance. By default it links through to the Timeline's "Everyday"
 * section (trends + the full feeds/nappies/sleep log). Pass `linkToEveryday=
 * {false}` when it's already rendered inside that section.
 */
export function TodayGlance({
  linkToEveryday = true,
}: {
  linkToEveryday?: boolean;
}) {
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

  const body = (
    <>
      <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Today at a glance
        {linkToEveryday && (
          <span className="ml-auto flex items-center gap-0.5 text-[11px] font-medium normal-case text-gold-700">
            See trends <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
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
    </>
  );

  if (!linkToEveryday) {
    return <Card className="border-ink-300/40 p-4">{body}</Card>;
  }

  return (
    <Card className="border-ink-300/40 p-0 transition-colors hover:bg-parchment-50">
      <Link
        href={'/leo/timeline?view=everyday' as Route}
        className="block p-4 active:scale-[0.99]"
      >
        {body}
      </Link>
    </Card>
  );
}
