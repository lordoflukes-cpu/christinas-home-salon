'use client';

import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeoStore, useNow, listMonths, type RecapSources } from '@/lib/leo';
import { MonthCard } from './month-card';

export function RecapBook() {
  const profile = useLeoStore((s) => s.profile);
  const growth = useLeoStore((s) => s.growth);
  const milestones = useLeoStore((s) => s.milestones);
  const journal = useLeoStore((s) => s.journal);
  const photos = useLeoStore((s) => s.photos);
  const recaps = useLeoStore((s) => s.recaps);
  const now = useNow(3_600_000);

  const sources: RecapSources | null = useMemo(
    () =>
      profile
        ? { birth: profile.birth, growth, milestones, journal, photos }
        : null,
    [profile, growth, milestones, journal, photos],
  );

  if (!profile || !sources) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Add Leo&apos;s birthday in Settings to start his monthly recap.
      </Card>
    );
  }

  const months = listMonths(profile.birth, now);
  const name = profile.name || 'Leo';

  return (
    <div className="recap-print space-y-4">
      <Card className="recap-print-hide flex items-center gap-3 border-gold-200 bg-gradient-to-br from-gold-50 to-parchment-50 p-4">
        <div className="flex-1">
          <p className="text-sm text-ink-700">
            A keepsake page for every month — auto-filled from what you log, and
            yours to make your own. One day, a printed book.
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="shrink-0 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </Card>

      {months.map((monthIndex) => (
        <MonthCard
          key={monthIndex}
          monthIndex={monthIndex}
          babyName={name}
          sources={sources}
          saved={recaps.find((r) => r.monthIndex === monthIndex)}
          photos={photos}
        />
      ))}
    </div>
  );
}
