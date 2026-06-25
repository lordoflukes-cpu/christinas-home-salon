'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Milk } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeoStore, formatDuration } from '@/lib/leo';
import { LeoHero } from './brand/leo-hero';
import { LionCrest } from './brand/lion-crest';
import { SinceLastCard } from './cards/since-last-card';
import { SleepStatusCard } from './cards/sleep-status-card';
import { QuickAddSheet, type QuickAddState } from './quick-add-sheet';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const hydrated = useLeoStore((s) => s.hydrated);
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[5/4] w-full rounded-3xl" />
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
      <LeoHero />

      <div className="grid grid-cols-2 gap-3">
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}>
          <SinceLastCard
            label="Last feed"
            icon={Milk}
            lastAt={lastFeed?.startedAt ?? null}
            detail={feedDetail}
            accent="rose"
          />
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.12 }}>
          <SinceLastCard
            label="Last nappy"
            icon={Droplets}
            lastAt={lastDiaper?.changedAt ?? null}
            detail={lastDiaper?.type}
            accent="aegean"
          />
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.18 }}>
        <SleepStatusCard />
      </motion.div>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="grid grid-cols-2 gap-3 pt-1"
      >
        <Button
          onClick={() => setQuickAdd({ kind: 'feed' })}
          size="lg"
          className="min-h-14 bg-rose-500 text-base shadow-sm hover:bg-rose-600"
        >
          <Milk className="mr-2 h-5 w-5" /> Feed
        </Button>
        <Button
          onClick={() => setQuickAdd({ kind: 'diaper' })}
          size="lg"
          variant="outline"
          className="min-h-14 border-aegean-300 bg-white text-base text-aegean-700 hover:bg-aegean-50"
        >
          <Droplets className="mr-2 h-5 w-5" /> Nappy
        </Button>
      </motion.div>

      <QuickAddSheet state={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}

function SetupPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold-200 bg-cream-50 p-8 text-center shadow-sm">
      <LionCrest className="h-24 w-24" />
      <div>
        <h2 className="font-display text-2xl font-semibold text-night-900">
          Welcome, little lion 🦁
        </h2>
        <p className="mt-1 text-sm text-sage-600">
          Add Leo&apos;s details to begin — it only takes a moment.
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
