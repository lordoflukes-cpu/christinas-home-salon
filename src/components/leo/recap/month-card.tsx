'use client';

import { useMemo, useState } from 'react';
import { Pencil, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  deriveRecap,
  effectiveRecap,
  monthWindow,
  useLeoStore,
  useSpeaker,
  RECAP_FIELDS,
  type RecapSources,
} from '@/lib/leo';
import type { MonthlyRecap, PhotoEntry } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { PhotoImage } from '../photos/photo-image';
import { RecapEditor } from './recap-editor';

function monthRangeLabel(start: number, end: number): string {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  // `end` is exclusive (start of next month) — show the last included day.
  return `${fmt(start)} – ${fmt(end - 86_400_000)}`;
}

export function MonthCard({
  monthIndex,
  babyName,
  sources,
  saved,
  photos,
}: {
  monthIndex: number;
  babyName: string;
  sources: RecapSources;
  saved: MonthlyRecap | undefined;
  photos: PhotoEntry[];
}) {
  const [open, setOpen] = useState(false);
  const voicePrefs = useLeoStore((s) => s.profile?.voicePrefs);
  const { speak } = useSpeaker();
  const canSpeak = !!voicePrefs?.enabled && voicePrefs.speakRecaps;

  const auto = useMemo(
    () => deriveRecap(monthIndex, sources),
    [monthIndex, sources],
  );
  const eff = useMemo(() => effectiveRecap(auto, saved), [auto, saved]);
  const { start, end } = monthWindow(sources.birth, monthIndex);

  function speakRecap() {
    const parts = [`${babyName}, Month ${monthIndex}.`];
    for (const f of RECAP_FIELDS) {
      const value = eff[f.key];
      if (value) parts.push(`${f.label}: ${value}.`);
    }
    void speak(parts.join(' '));
  }

  const bestPhoto = eff.bestPhotoId
    ? photos.find((p) => p.id === eff.bestPhotoId)
    : undefined;
  const monthPhotos = photos.filter(
    (p) => p.takenAt >= start && p.takenAt < end,
  );

  return (
    <Card className="overflow-hidden border-ink-300/40 bg-gradient-to-br from-parchment-50 to-white">
      <div className="flex items-start justify-between gap-2 p-4 pb-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            {babyName} — Month {monthIndex}
          </h2>
          <p className="font-hand text-base text-gold-700">
            {monthRangeLabel(start, end)}
          </p>
        </div>
        <div className="recap-print-hide flex shrink-0 items-center">
          {canSpeak && (
            <Button
              variant="ghost"
              size="icon"
              onClick={speakRecap}
              aria-label={`Hear Month ${monthIndex} recap`}
            >
              <Volume2 className="h-4 w-4 text-gold-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label={`Edit Month ${monthIndex}`}
          >
            <Pencil className="h-4 w-4 text-ink-500" />
          </Button>
        </div>
      </div>

      <GreekKey className="mx-4 h-2 w-24 text-gold-400" />

      {bestPhoto && (
        <PhotoImage
          bytes={bestPhoto.bytes}
          type={bestPhoto.type}
          className="mt-3 max-h-72 w-full object-cover"
        />
      )}

      <dl className="space-y-2.5 p-4">
        {RECAP_FIELDS.map((f) => {
          const value = eff[f.key];
          return (
            <div key={f.key}>
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                <span>{f.emoji}</span> {f.label}
              </dt>
              <dd
                className={
                  value
                    ? 'mt-0.5 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink-900'
                    : 'recap-print-hide mt-0.5 text-sm italic text-ink-300'
                }
              >
                {value ?? 'Tap edit to add…'}
              </dd>
            </div>
          );
        })}
      </dl>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[94vh] overflow-y-auto border-ink-300/40"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {babyName} — Month {monthIndex}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <RecapEditor
            monthIndex={monthIndex}
            saved={saved}
            auto={auto}
            monthPhotos={monthPhotos}
            onDone={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </Card>
  );
}
