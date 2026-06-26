'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { Sparkles, Clapperboard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  buildTimeline,
  ageInMonthsCalendar,
  TIMELINE_GROUPS,
  type TimelineFilter,
  type TimelineSegment,
  type TimelineItem,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { Segmented } from '../forms/feed-form';
import { TimelineRow } from './timeline-item';
import { EverydayView } from './everyday-view';
import { SlideshowPlayer } from '../slideshow/slideshow-player';

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function ageLabel(birth: number, ts: number): string {
  if (ts < birth) return 'Coming up';
  const months = ageInMonthsCalendar(birth, ts);
  if (months <= 0) return 'Newborn';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year' : `${years} years`;
}

interface Group {
  key: string;
  label: string;
  age: string;
  items: TimelineItem[];
}

const SEGMENT_OPTS = TIMELINE_GROUPS.map((g) => ({
  value: g.segment,
  label: g.label,
}));

/** Default sub-filter for each segment (first in its list). */
const DEFAULT_FILTER: Record<TimelineSegment, TimelineFilter> = {
  story: 'highlights',
  everyday: 'everyday',
  health: 'health',
};

export function TimelineView() {
  const profile = useLeoStore((s) => s.profile);
  const milestones = useLeoStore((s) => s.milestones);
  const journal = useLeoStore((s) => s.journal);
  const voices = useLeoStore((s) => s.voices);
  const photos = useLeoStore((s) => s.photos);
  const growth = useLeoStore((s) => s.growth);
  const sizes = useLeoStore((s) => s.sizes);
  const medical = useLeoStore((s) => s.medical);
  const events = useLeoStore((s) => s.events);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const now = useNow(3_600_000);
  const router = useRouter();
  const params = useSearchParams();

  const initialSegment: TimelineSegment =
    params.get('view') === 'everyday'
      ? 'everyday'
      : params.get('view') === 'health'
        ? 'health'
        : 'story';

  const [segment, setSegment] = useState<TimelineSegment>(initialSegment);
  const [filter, setFilter] = useState<TimelineFilter>(
    DEFAULT_FILTER[initialSegment],
  );
  const [playing, setPlaying] = useState(false);

  function chooseSegment(next: TimelineSegment) {
    setSegment(next);
    setFilter(DEFAULT_FILTER[next]);
  }

  const subFilters =
    TIMELINE_GROUPS.find((g) => g.segment === segment)?.filters ?? [];

  const items = useMemo(
    () =>
      segment === 'everyday'
        ? []
        : buildTimeline(
            {
              profile,
              milestones,
              journal,
              voices,
              photos,
              growth,
              sizes,
              medical,
              events,
              feeds,
              diapers,
              sleeps,
              now,
            },
            filter,
          ),
    [
      segment,
      profile,
      milestones,
      journal,
      voices,
      photos,
      growth,
      sizes,
      medical,
      events,
      feeds,
      diapers,
      sleeps,
      now,
      filter,
    ],
  );

  const groups = useMemo<Group[]>(() => {
    const birth = profile?.birth ?? 0;
    const out: Group[] = [];
    for (const item of items) {
      const key = monthKey(item.at);
      let g = out[out.length - 1];
      if (!g || g.key !== key) {
        g = {
          key,
          label: monthLabel(item.at),
          age: ageLabel(birth, item.at),
          items: [],
        };
        out.push(g);
      }
      g.items.push(item);
    }
    return out;
  }, [items, profile?.birth]);

  if (!profile) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Add Leo&apos;s birthday in Settings and his life timeline begins here.
      </Card>
    );
  }

  let rendered = 0;
  const total = items.length;

  return (
    <div className="space-y-4">
      {/* Top-level segments */}
      <Segmented
        value={segment}
        onChange={(v) => chooseSegment(v as TimelineSegment)}
        options={SEGMENT_OPTS}
      />

      {segment === 'story' && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-300/60 bg-gradient-to-br from-ink-900 to-ink-800 px-4 py-3 text-sm font-medium text-gold-100 shadow-sm transition-transform active:scale-[0.99]"
        >
          <Clapperboard className="h-5 w-5 text-gold-300" />
          Play slideshow
          <Sparkles className="h-4 w-4 text-gold-300/80" />
        </button>
      )}

      {playing && <SlideshowPlayer onClose={() => setPlaying(false)} />}

      {segment === 'everyday' ? (
        <EverydayView />
      ) : (
        <>
          {/* Slim secondary filters for the chosen segment */}
          {subFilters.length > 1 && (
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {subFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    filter === f.key
                      ? 'border-ink-700 bg-ink-700 text-parchment-50'
                      : 'border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {total === 0 ? (
            <Card className="flex flex-col items-center gap-2 border-gold-200 bg-parchment-50 p-8 text-center">
              <Sparkles className="h-8 w-8 text-gold-500" />
              <p className="text-sm text-ink-600">
                Nothing here yet for this filter. Log a milestone, photo or
                memory and it&apos;ll appear on Leo&apos;s timeline.
              </p>
            </Card>
          ) : (
            groups.map((g) => (
              <section key={g.key}>
                <div className="mb-2 flex items-baseline gap-2">
                  <h2 className="font-display text-xl text-ink-900">
                    {g.label}
                  </h2>
                  <span className="rounded-full bg-parchment-100 px-2 py-0.5 text-xs font-medium text-ink-500">
                    {g.age}
                  </span>
                </div>
                <ul>
                  {g.items.map((item) => {
                    rendered += 1;
                    const photo = item.photoId
                      ? photos.find((p) => p.id === item.photoId)
                      : undefined;
                    return (
                      <TimelineRow
                        key={item.id}
                        item={item}
                        photo={photo}
                        isLast={rendered === total}
                        onOpen={
                          item.href
                            ? () => router.push(item.href as Route)
                            : undefined
                        }
                      />
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}
