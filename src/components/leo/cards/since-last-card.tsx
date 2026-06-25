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
  accent?: 'rose' | 'sage';
}

export function SinceLastCard({
  label,
  icon: Icon,
  lastAt,
  detail,
  accent = 'rose',
}: SinceLastCardProps) {
  const now = useNow();
  const iconColor = accent === 'rose' ? 'text-rose-500' : 'text-sage-500';

  return (
    <Card className="flex flex-col gap-1 border-cream-200 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-sage-600">
        <Icon className={cn('h-4 w-4', iconColor)} />
        {label}
      </div>
      {lastAt == null ? (
        <p className="text-lg font-semibold text-sage-400">No entries yet</p>
      ) : (
        <>
          <p className="text-2xl font-semibold text-sage-900">
            {formatElapsed(elapsedSince(lastAt, now))}{' '}
            <span className="text-sm font-normal text-sage-500">ago</span>
          </p>
          <p className="text-xs text-sage-500">
            at {formatClock(lastAt)}
            {detail ? ` · ${detail}` : ''}
          </p>
        </>
      )}
    </Card>
  );
}
