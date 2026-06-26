'use client';

import { useMemo } from 'react';
import { Milk } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  buildTimeline,
  startOfDay,
  type TimelineItem,
} from '@/lib/leo';
import { TimelineRow } from './timeline-item';
import { EverydayTrends } from './everyday-trends';

const DAY = 86_400_000;

function dayHeading(dayStart: number, todayStart: number): string {
  if (dayStart === todayStart) return 'Today';
  if (dayStart === todayStart - DAY) return 'Yesterday';
  return new Date(dayStart).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

interface DayGroup {
  key: number;
  label: string;
  items: TimelineItem[];
}

/**
 * The "Everyday" section of the Timeline: the day/week/month trends visual on
 * top, then the feeds/nappies/sleep log grouped by day. All on-device.
 */
export function EverydayView() {
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

  const items = useMemo(
    () =>
      buildTimeline(
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
        'everyday',
      ),
    [
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
    ],
  );

  const groups = useMemo<DayGroup[]>(() => {
    const out: DayGroup[] = [];
    const todayStart = startOfDay(now);
    for (const item of items) {
      const key = startOfDay(item.at);
      let g = out[out.length - 1];
      if (!g || g.key !== key) {
        g = { key, label: dayHeading(key, todayStart), items: [] };
        out.push(g);
      }
      g.items.push(item);
    }
    return out;
  }, [items, now]);

  let rendered = 0;
  const total = items.length;

  return (
    <div className="space-y-5">
      <EverydayTrends />

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-2 border-ink-300/40 bg-parchment-50 p-8 text-center">
          <Milk className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-ink-600">
            Feeds, nappies and sleep you log will appear here, with trends
            building up over the days and weeks.
          </p>
        </Card>
      ) : (
        groups.map((g) => (
          <section key={g.key}>
            <h2 className="mb-2 font-display text-lg text-ink-900">
              {g.label}
            </h2>
            <ul>
              {g.items.map((item) => {
                rendered += 1;
                return (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    isLast={rendered === total}
                  />
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
