'use client';

import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeoStore } from '@/lib/leo';
import { Segmented } from './forms/feed-form';
import { LogItem } from './log-item';
import { QuickAddSheet, type QuickAddState } from './quick-add-sheet';

type Filter = 'all' | 'feed' | 'diaper' | 'sleep';

interface Row {
  kind: 'feed' | 'diaper' | 'sleep';
  at: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: any;
}

export function LogList() {
  const hydrated = useLeoStore((s) => s.hydrated);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const removeFeed = useLeoStore((s) => s.removeFeed);
  const removeDiaper = useLeoStore((s) => s.removeDiaper);
  const removeSleep = useLeoStore((s) => s.removeSleep);

  const [filter, setFilter] = useState<Filter>('all');
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);

  const rows = useMemo<Row[]>(() => {
    const all: Row[] = [
      ...feeds.map((e) => ({
        kind: 'feed' as const,
        at: e.startedAt,
        entry: e,
      })),
      ...diapers.map((e) => ({
        kind: 'diaper' as const,
        at: e.changedAt,
        entry: e,
      })),
      ...sleeps.map((e) => ({
        kind: 'sleep' as const,
        at: e.startedAt,
        entry: e,
      })),
    ];
    const filtered =
      filter === 'all' ? all : all.filter((r) => r.kind === filter);
    return filtered.sort((a, b) => b.at - a.at);
  }, [feeds, diapers, sleeps, filter]);

  const grouped = useMemo(() => groupByDay(rows), [rows]);

  async function onDelete(row: Row) {
    if (row.kind === 'feed') await removeFeed(row.entry.id);
    else if (row.kind === 'diaper') await removeDiaper(row.entry.id);
    else await removeSleep(row.entry.id);
  }

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Segmented
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        options={[
          { value: 'all', label: 'All' },
          { value: 'feed', label: 'Feeds' },
          { value: 'diaper', label: 'Nappies' },
          { value: 'sleep', label: 'Sleep' },
        ]}
      />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-500">
          No entries yet.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ day, items }) => (
            <section key={day}>
              <h3 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                <Star className="h-3 w-3 fill-gold-300 text-gold-400" />
                {day}
              </h3>
              <div className="rounded-xl border border-ink-300/40 bg-white px-4">
                {items.map((row) => (
                  <LogItem
                    key={row.entry.id}
                    item={{ kind: row.kind, entry: row.entry } as never}
                    onEdit={() =>
                      setQuickAdd({ kind: row.kind, entry: row.entry })
                    }
                    onDelete={() => onDelete(row)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <QuickAddSheet state={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}

function groupByDay(rows: Row[]): { day: string; items: Row[] }[] {
  const map = new Map<string, Row[]>();
  for (const row of rows) {
    const key = new Date(row.at).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return Array.from(map, ([day, items]) => ({ day, items }));
}
