'use client';

import { useState } from 'react';
import { Droplets, Milk, Moon, Pencil, Trash2 } from 'lucide-react';
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
import type { FeedEntry, DiaperEntry, SleepEntry } from '@/lib/leo';

type AnyEntry =
  | { kind: 'feed'; entry: FeedEntry }
  | { kind: 'diaper'; entry: DiaperEntry }
  | { kind: 'sleep'; entry: SleepEntry };

const ICONS = { feed: Milk, diaper: Droplets, sleep: Moon } as const;

export function LogItem({
  item,
  onEdit,
  onDelete,
}: {
  item: AnyEntry;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const Icon = ICONS[item.kind];
  const { time, title, subtitle } = describe(item);

  return (
    <div className="flex items-center gap-3 border-b border-cream-200 py-3 last:border-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-sage-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sage-900">{title}</p>
        <p className="text-xs text-sage-500">
          {time}
          {subtitle ? ` · ${subtitle}` : ''}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4 text-sage-500" />
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

function describe(item: AnyEntry): {
  time: string;
  title: string;
  subtitle?: string;
} {
  if (item.kind === 'feed') {
    const f = item.entry;
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
    const d = item.entry;
    const label =
      d.type === 'both' ? 'Wet + dirty' : d.type === 'wet' ? 'Wet' : 'Dirty';
    return { time: formatClock(d.changedAt), title: `Nappy — ${label}` };
  }
  const s = item.entry;
  const title = s.endedAt ? 'Sleep' : 'Asleep (ongoing)';
  return {
    time: formatClock(s.startedAt),
    title,
    subtitle: formatElapsed(sleepDuration(s)),
  };
}
