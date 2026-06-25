'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useLeoStore, ROUTINE_CATEGORIES } from '@/lib/leo';
import { RoutineSection } from './routine-section';

/** A warm at-a-glance summary of Leo's rhythm, above the editable sections. */
function RhythmOverview() {
  const routines = useLeoStore((s) => s.routines);

  const stats = useMemo(() => {
    const count = (cat: string) =>
      routines.filter((r) => r.category === cat).length;
    const bestSettling = routines
      .filter((r) => r.category === 'settling' && r.rating === 'works')
      .map((r) => r.text);
    return {
      morning: count('morning'),
      bedtime: count('bedtime'),
      settling: count('settling'),
      bestSettling,
      total: routines.length,
    };
  }, [routines]);

  if (stats.total === 0) {
    return (
      <Card className="border-ink-300/40 bg-parchment-50/70 p-5 text-center">
        <p className="text-3xl">🗓️</p>
        <h2 className="mt-1 font-display text-xl text-ink-900">
          Build Leo&rsquo;s rhythm
        </h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-ink-500">
          Capture the little routines, cues and tricks that work — so whoever is
          on duty (or grandparents, or a sitter) knows exactly what helps Leo
          settle.
        </p>
        <p className="mt-2 font-hand text-base text-gold-600">
          Tap a suggestion below to start ✨
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-ink-300/40 bg-parchment-50/70 p-4">
      <h2 className="font-display text-lg text-ink-900">Leo&rsquo;s rhythm</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-parchment-100/70 py-2">
          <p className="text-xl">🌅</p>
          <p className="font-display text-xl text-ink-900">{stats.morning}</p>
          <p className="text-[11px] text-ink-500">morning steps</p>
        </div>
        <div className="rounded-xl bg-parchment-100/70 py-2">
          <p className="text-xl">🌙</p>
          <p className="font-display text-xl text-ink-900">{stats.bedtime}</p>
          <p className="text-[11px] text-ink-500">bedtime steps</p>
        </div>
        <div className="rounded-xl bg-parchment-100/70 py-2">
          <p className="text-xl">🤱</p>
          <p className="font-display text-xl text-ink-900">{stats.settling}</p>
          <p className="text-[11px] text-ink-500">settling tricks</p>
        </div>
      </div>
      {stats.bestSettling.length > 0 && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span className="font-semibold">What works best:</span>{' '}
          {stats.bestSettling.join(', ')} 💚
        </p>
      )}
    </Card>
  );
}

/** The full routine builder — overview + every category section. */
export function RoutineBuilder() {
  return (
    <div className="space-y-4">
      <RhythmOverview />
      {ROUTINE_CATEGORIES.map((config) => (
        <RoutineSection key={config.category} config={config} />
      ))}
    </div>
  );
}
