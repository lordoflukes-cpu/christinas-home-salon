'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLeoStore, formatDateTime } from '@/lib/leo';
import type { SizeEntry, SizeKind } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { SizeForm } from './size-form';

const EMOJI: Record<SizeKind, string> = {
  clothing: '👕',
  nappy: '🧷',
  shoe: '👟',
};

export function SizesHistory() {
  const sizes = useLeoStore((s) => s.sizes);
  const removeSize = useLeoStore((s) => s.removeSize);
  const [editing, setEditing] = useState<SizeEntry | null>(null);

  if (sizes.length === 0) return null;

  return (
    <Card className="border-ink-300/40 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Size history
      </h3>
      <div>
        {sizes.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
          >
            <span className="text-lg">{EMOJI[s.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {s.size}
                {s.note ? (
                  <span className="font-normal text-ink-500"> · {s.note}</span>
                ) : null}
              </p>
              <p className="text-xs text-ink-500">
                from {formatDateTime(s.startedAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(s)}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4 text-ink-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSize(s.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ))}
      </div>

      <Sheet
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              Edit size
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          {editing && (
            <SizeForm entry={editing} onDone={() => setEditing(null)} />
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
