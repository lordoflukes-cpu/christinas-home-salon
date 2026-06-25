'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNow, elapsedSince, formatElapsed, formatClock } from '@/lib/leo';
import { cn } from '@/lib/utils';

interface SinceLastCardProps {
  label: string;
  icon: LucideIcon;
  /** Timestamp of the last event, or null if none yet. */
  lastAt: number | null;
  detail?: string;
  accent?: 'rose' | 'aegean';
}

const ACCENTS = {
  rose: { icon: 'text-rose-500', chip: 'bg-rose-100 text-rose-600' },
  aegean: { icon: 'text-aegean-500', chip: 'bg-aegean-100 text-aegean-600' },
} as const;

export function SinceLastCard({
  label,
  icon: Icon,
  lastAt,
  detail,
  accent = 'rose',
}: SinceLastCardProps) {
  const now = useNow();
  const a = ACCENTS[accent];

  return (
    <Card className="flex h-full flex-col gap-2 border-ink-300/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-ink-600">
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full',
            a.chip,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      {lastAt == null ? (
        <p className="text-base font-semibold text-ink-400">No entries yet</p>
      ) : (
        <>
          <p className="font-display text-2xl font-semibold text-ink-900">
            {formatElapsed(elapsedSince(lastAt, now))}{' '}
            <span className="text-sm font-normal text-ink-500">ago</span>
          </p>
          <p className="text-xs text-ink-500">
            {formatClock(lastAt)}
            {detail ? ` · ${detail}` : ''}
          </p>
        </>
      )}
    </Card>
  );
}
