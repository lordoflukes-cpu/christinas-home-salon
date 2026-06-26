'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import {
  Activity,
  Droplets,
  Frown,
  HeartHandshake,
  Images,
  Milk,
  Pill,
  Smile,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import type { QuickAddKind } from './quick-add-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useLeoStore,
  useNow,
  formatDuration,
  ageBadges,
  ageCelebration,
} from '@/lib/leo';
import { LeoHero } from './brand/leo-hero';
import { PawMark } from './brand/paw-mark';
import { SinceLastCard } from './cards/since-last-card';
import { FeedStatusCard } from './cards/feed-status-card';
import { SleepStatusCard } from './cards/sleep-status-card';
import { TodayGlance } from './home/today-glance';
import { AgendaCard } from './home/agenda-card';
import { DailyBriefingCard } from './home/daily-briefing-card';
import { PhotoImage } from './photos/photo-image';
import { VoiceRecordButton } from './voice/voice-record-button';
import { QuickAddSheet, type QuickAddState } from './quick-add-sheet';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const QUICK_LOG: {
  kind: QuickAddKind;
  label: string;
  icon: typeof Smile;
  tint: string;
}[] = [
  { kind: 'mood', label: 'Mood', icon: Smile, tint: 'text-gold-600' },
  { kind: 'cry', label: 'Crying', icon: Frown, tint: 'text-rose-500' },
  {
    kind: 'temperature',
    label: 'Temp',
    icon: Thermometer,
    tint: 'text-orange-500',
  },
  { kind: 'medication', label: 'Meds', icon: Pill, tint: 'text-aegean-600' },
  {
    kind: 'symptom',
    label: 'Symptom',
    icon: Activity,
    tint: 'text-emerald-600',
  },
];

export function Dashboard() {
  const hydrated = useLeoStore((s) => s.hydrated);
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const photos = useLeoStore((s) => s.photos);
  const now = useNow(60_000);
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
  const celebration = ageCelebration(profile.birth, now);
  const badges = ageBadges(profile.birth, now);

  const feedDetail = lastFeed
    ? lastFeed.type === 'breast'
      ? `${lastFeed.side === 'L' ? 'left' : 'right'}${lastFeed.durationMin ? `, ${formatDuration(lastFeed.durationMin)}` : ''}`
      : `${lastFeed.amountMl ?? '?'}ml ${lastFeed.contents ?? ''}`.trim()
    : undefined;

  return (
    <div className="space-y-4">
      <LeoHero />

      {celebration && (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-gold-300 bg-gold-50 px-4 py-3 text-center font-display text-lg font-semibold text-gold-800"
        >
          {celebration}
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full bg-parchment-100 px-3 py-1 text-xs font-medium text-ink-600"
          >
            {b}
          </span>
        ))}
      </div>

      <DailyBriefingCard />
      <AgendaCard />
      <TodayGlance />

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

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.16 }}>
        <FeedStatusCard />
      </motion.div>

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
          className="min-h-14 bg-ink-700 text-base shadow-sm hover:bg-ink-800"
        >
          <Milk className="mr-2 h-5 w-5" /> Feed
        </Button>
        <Button
          onClick={() => setQuickAdd({ kind: 'diaper' })}
          size="lg"
          variant="outline"
          className="min-h-14 border-ink-300 bg-parchment-50 text-base text-ink-700 hover:bg-parchment-100"
        >
          <Droplets className="mr-2 h-5 w-5" /> Nappy
        </Button>
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.28 }}>
        <Card className="border-ink-300/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Quick log
          </p>
          <div className="grid grid-cols-5 gap-1">
            {QUICK_LOG.map(({ kind, label, icon: Icon, tint }) => (
              <button
                key={kind}
                type="button"
                onClick={() => setQuickAdd({ kind })}
                className="flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-parchment-100"
              >
                <Icon className={`h-6 w-6 ${tint}`} />
                <span className="text-[11px] font-medium text-ink-600">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.29 }}>
        <Link href={'/leo/routine?unsettled=1' as Route}>
          <Card className="flex items-center gap-3 border-rose-200 bg-gradient-to-br from-rose-50 to-parchment-50 p-3 transition-colors hover:from-rose-100">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-display text-base text-ink-900">
                Leo is unsettled
              </p>
              <p className="text-xs text-ink-500">
                Start settling · log what you try
              </p>
            </div>
          </Card>
        </Link>
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }}>
        <VoiceRecordButton />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.32 }}>
        <Link href={'/leo/ask' as Route}>
          <Card className="flex items-center gap-3 border-gold-300/60 bg-gradient-to-br from-gold-50 to-parchment-50 p-3 transition-colors hover:from-gold-100">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-display text-base text-ink-900">Ask Leo</p>
              <p className="text-xs text-ink-500">
                Make sense of the day · summaries, notes &amp; more
              </p>
            </div>
          </Card>
        </Link>
      </motion.div>

      {photos.length > 0 && (
        <Link href={'/leo/memories' as Route}>
          <Card className="flex items-center gap-3 border-ink-300/40 p-3 transition-colors hover:bg-parchment-50">
            <div className="flex -space-x-2">
              {photos.slice(0, 3).map((p) => (
                <PhotoImage
                  key={p.id}
                  bytes={p.bytes}
                  type={p.type}
                  className="h-12 w-12 rounded-xl border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">Memories</p>
              <p className="text-xs text-ink-500">
                {photos.length} photo{photos.length > 1 ? 's' : ''} · tap to
                view
              </p>
            </div>
            <Images className="h-5 w-5 text-gold-500" />
          </Card>
        </Link>
      )}

      <QuickAddSheet state={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}

function SetupPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold-200 bg-parchment-50 p-8 text-center shadow-sm">
      <PawMark className="h-16 w-16 text-gold-500" />
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Welcome, little lion 🦁
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Add Leo&apos;s details to begin — it only takes a moment.
        </p>
      </div>
      <Button
        asChild
        size="lg"
        className="min-h-12 bg-ink-700 hover:bg-ink-800"
      >
        <a href="/leo/settings">Set up Leo&apos;s profile</a>
      </Button>
    </div>
  );
}
