'use client';

import { useState } from 'react';
import {
  Activity,
  Droplets,
  Frown,
  Milk,
  Moon,
  Pencil,
  Pill,
  Smile,
  Thermometer,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  formatClock,
  formatDuration,
  formatElapsed,
  sleepDuration,
} from '@/lib/leo';
import type {
  FeedEntry,
  DiaperEntry,
  SleepEntry,
  LeoEvent,
  EventKind,
} from '@/lib/leo';
import { cn } from '@/lib/utils';

export type LogKind = 'feed' | 'diaper' | 'sleep' | EventKind;

export interface LogEntryItem {
  kind: LogKind;
  entry: FeedEntry | DiaperEntry | SleepEntry | LeoEvent;
}

const ICONS: Record<LogKind, typeof Milk> = {
  feed: Milk,
  diaper: Droplets,
  sleep: Moon,
  cry: Frown,
  temperature: Thermometer,
  medication: Pill,
  symptom: Activity,
  mood: Smile,
};

const CHIPS: Record<LogKind, string> = {
  feed: 'bg-rose-100 text-rose-600',
  diaper: 'bg-aegean-100 text-aegean-600',
  sleep: 'bg-night-100 text-night-700',
  cry: 'bg-rose-100 text-rose-600',
  temperature: 'bg-orange-100 text-orange-600',
  medication: 'bg-aegean-100 text-aegean-600',
  symptom: 'bg-emerald-100 text-emerald-600',
  mood: 'bg-gold-100 text-gold-700',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function LogItem({
  item,
  onEdit,
  onDelete,
}: {
  item: LogEntryItem;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const Icon = ICONS[item.kind];
  const { time, title, subtitle } = describe(item);

  return (
    <div className="flex items-center gap-3 border-b border-ink-300/40 py-3 last:border-0">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          CHIPS[item.kind],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sage-900">{title}</p>
        <p className="text-xs text-ink-500">
          {time}
          {subtitle ? ` · ${subtitle}` : ''}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4 text-ink-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setConfirmOpen(true)}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4 text-rose-500" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                await onDelete();
                setConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function describe(item: LogEntryItem): {
  time: string;
  title: string;
  subtitle?: string;
} {
  if (item.kind === 'feed') {
    const f = item.entry as FeedEntry;
    const title =
      f.type === 'breast'
        ? `Breast feed${f.side ? ` (${f.side === 'L' ? 'left' : 'right'})` : ''}`
        : `Bottle ${f.amountMl ?? '?'}ml`;
    const subtitle =
      f.type === 'breast'
        ? f.durationMin
          ? formatDuration(f.durationMin)
          : undefined
        : f.contents;
    return { time: formatClock(f.startedAt), title, subtitle };
  }
  if (item.kind === 'diaper') {
    const d = item.entry as DiaperEntry;
    const label =
      d.type === 'both' ? 'Wet + dirty' : d.type === 'wet' ? 'Wet' : 'Dirty';
    return {
      time: formatClock(d.changedAt),
      title: `Nappy — ${label}`,
      subtitle: d.color?.toLowerCase(),
    };
  }
  if (item.kind === 'sleep') {
    const s = item.entry as SleepEntry;
    const title = s.endedAt ? 'Sleep' : 'Asleep (ongoing)';
    const dur = formatElapsed(sleepDuration(s));
    return {
      time: formatClock(s.startedAt),
      title,
      subtitle: s.quality ? `${dur} · ${s.quality}` : dur,
    };
  }

  // Events
  const e = item.entry as LeoEvent;
  switch (item.kind) {
    case 'mood':
      return { time: formatClock(e.at), title: `Mood — ${cap(e.mood ?? '')}` };
    case 'cry': {
      const bits = [e.reason, e.durationMin ? `${e.durationMin} min` : null]
        .filter(Boolean)
        .join(' · ');
      return {
        time: formatClock(e.at),
        title: 'Crying',
        subtitle: bits || undefined,
      };
    }
    case 'temperature':
      return {
        time: formatClock(e.at),
        title: `Temperature ${e.tempC ?? '?'}°C`,
        subtitle: e.tempMethod,
      };
    case 'medication':
      return {
        time: formatClock(e.at),
        title: e.medName || 'Medication',
        subtitle: [e.dose, e.reason].filter(Boolean).join(' · ') || undefined,
      };
    case 'symptom':
      return {
        time: formatClock(e.at),
        title: `Symptom — ${e.symptom ?? ''}`.trim(),
        subtitle: e.severity,
      };
    default:
      return { time: formatClock(e.at), title: 'Note' };
  }
}
