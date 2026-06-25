'use client';

import { useState } from 'react';
import { ChevronDown, Ruler } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NAPPY_SIZES, UK_CLOTHING_SIZES } from '@/lib/leo';
import { cn } from '@/lib/utils';

const kg = (g: number) => (g / 1000).toFixed(g % 1000 === 0 ? 0 : 1);

export function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-ink-300/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2"
      >
        <Ruler className="h-5 w-5 text-aegean-500" />
        <span className="flex-1 text-left font-display text-base font-semibold text-ink-900">
          UK size guide
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-ink-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Nappies (by weight)
            </p>
            <div className="space-y-0.5">
              {NAPPY_SIZES.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between border-b border-ink-200/50 py-1 last:border-0"
                >
                  <span className="text-ink-800">{s.label}</span>
                  <span className="text-ink-500">
                    {kg(s.minG)}–{kg(s.maxG)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Clothing (up to weight)
            </p>
            <div className="space-y-0.5">
              {UK_CLOTHING_SIZES.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between border-b border-ink-200/50 py-1 last:border-0"
                >
                  <span className="text-ink-800">{s.label}</span>
                  <span className="text-ink-500">up to {kg(s.maxG)} kg</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-400">
            Guidance only — brands vary. Always go by what fits Leo.
          </p>
        </div>
      )}
    </Card>
  );
}
