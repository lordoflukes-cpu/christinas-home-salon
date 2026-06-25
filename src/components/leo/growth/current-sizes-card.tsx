'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useLeoStore,
  useNow,
  ageInDays,
  currentSize,
  suggestSize,
  nappyNearlyOutgrown,
  daysInSize,
} from '@/lib/leo';
import type { SizeKind } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { SizeForm } from './size-form';

const KINDS: { kind: SizeKind; emoji: string; label: string }[] = [
  { kind: 'clothing', emoji: '👕', label: 'Clothing' },
  { kind: 'nappy', emoji: '🧷', label: 'Nappy' },
  { kind: 'shoe', emoji: '👟', label: 'Shoe' },
];

export function CurrentSizesCard() {
  const sizes = useLeoStore((s) => s.sizes);
  const growth = useLeoStore((s) => s.growth);
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);

  const [sheet, setSheet] = useState<{
    kind: SizeKind;
    suggestion: string | null;
  } | null>(null);

  const latestWeight =
    [...growth]
      .filter((g) => g.weightGrams != null)
      .sort((a, b) => b.measuredAt - a.measuredAt)[0]?.weightGrams ??
    profile?.birthWeightGrams;
  const ageDays = profile ? ageInDays(profile.birth, now) : undefined;

  return (
    <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-parchment-50 p-4">
      <h2 className="mb-2 font-display text-lg font-semibold text-ink-900">
        What is Leo wearing?
      </h2>
      <div className="space-y-2">
        {KINDS.map(({ kind, emoji, label }) => {
          const cur = currentSize(sizes, kind);
          const suggestion = suggestSize(kind, latestWeight, ageDays);
          const outgrown =
            kind === 'nappy'
              ? nappyNearlyOutgrown(cur?.size, latestWeight)
              : null;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setSheet({ kind, suggestion })}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-200/60 bg-white/70 p-3 text-left transition-colors hover:bg-white"
            >
              <span className="text-xl">{emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  {label}
                </p>
                {cur ? (
                  <p className="font-display text-lg font-semibold text-ink-900">
                    {cur.size}
                    <span className="ml-1 text-xs font-normal text-ink-500">
                      · {daysInSize(cur.startedAt, now)}d in
                    </span>
                  </p>
                ) : (
                  <p className="font-display text-lg font-semibold text-ink-400">
                    Not set
                  </p>
                )}
                {outgrown ? (
                  <p className="text-xs text-rose-600">
                    Might be nearly outgrown — size up soon?
                  </p>
                ) : suggestion && (!cur || cur.size !== suggestion) ? (
                  <p className="text-xs text-aegean-700">
                    Suggested from weight: {suggestion}
                  </p>
                ) : null}
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-400" />
            </button>
          );
        })}
      </div>

      <Sheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              Update size
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          {sheet && (
            <SizeForm
              kind={sheet.kind}
              suggestion={sheet.suggestion}
              onDone={() => setSheet(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
