'use client';

import { useState } from 'react';
import { Droplets, Milk, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeoStore, formatDuration } from '@/lib/leo';
import { AgeCard } from './cards/age-card';
import { SinceLastCard } from './cards/since-last-card';
import { SleepStatusCard } from './cards/sleep-status-card';
import { QuickAddSheet, type QuickAddState } from './quick-add-sheet';

export function Dashboard() {
  const hydrated = useLeoStore((s) => s.hydrated);
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return <SetupPrompt />;
  }

  const lastFeed = feeds[0] ?? null;
  const lastDiaper = diapers[0] ?? null;

  const feedDetail = lastFeed
    ? lastFeed.type === 'breast'
      ? `${lastFeed.side === 'L' ? 'left' : 'right'}${lastFeed.durationMin ? `, ${formatDuration(lastFeed.durationMin)}` : ''}`
      : `${lastFeed.amountMl ?? '?'}ml ${lastFeed.contents ?? ''}`.trim()
    : undefined;

  return (
    <div className="space-y-4">
      <AgeCard />

      <SinceLastCard
        label="Last feed"
        icon={Milk}
        lastAt={lastFeed?.startedAt ?? null}
        detail={feedDetail}
        accent="rose"
      />
      <SinceLastCard
        label="Last nappy"
        icon={Droplets}
        lastAt={lastDiaper?.changedAt ?? null}
        detail={lastDiaper?.type}
        accent="sage"
      />

      <SleepStatusCard />

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          onClick={() => setQuickAdd({ kind: 'feed' })}
          size="lg"
          className="min-h-14 bg-rose-500 text-base hover:bg-rose-600"
        >
          <Milk className="mr-2 h-5 w-5" /> Feed
        </Button>
        <Button
          onClick={() => setQuickAdd({ kind: 'diaper' })}
          size="lg"
          variant="outline"
          className="min-h-14 border-sage-300 text-base text-sage-700 hover:bg-sage-50"
        >
          <Droplets className="mr-2 h-5 w-5" /> Nappy
        </Button>
      </div>

      <QuickAddSheet state={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}

function SetupPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Plus className="h-7 w-7" />
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold text-sage-900">
          Welcome 💙
        </h2>
        <p className="mt-1 text-sm text-sage-600">
          Add Leo&apos;s details to get started — it only takes a moment.
        </p>
      </div>
      <Button
        asChild
        size="lg"
        className="min-h-12 bg-rose-500 hover:bg-rose-600"
      >
        <a href="/leo/settings">Set up Leo&apos;s profile</a>
      </Button>
    </div>
  );
}
