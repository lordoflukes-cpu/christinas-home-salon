'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { FeedForm } from './forms/feed-form';
import { DiaperForm } from './forms/diaper-form';
import { SleepControls } from './forms/sleep-controls';
import type { FeedEntry, DiaperEntry, SleepEntry } from '@/lib/leo';

export type QuickAddKind = 'feed' | 'diaper' | 'sleep';

export interface QuickAddState {
  kind: QuickAddKind;
  entry?: FeedEntry | DiaperEntry | SleepEntry;
}

const TITLES: Record<QuickAddKind, { title: string; description: string }> = {
  feed: {
    title: 'Log a feed',
    description: 'Breast or bottle — adjust the time if needed.',
  },
  diaper: { title: 'Log a nappy', description: 'Wet, dirty, or both.' },
  sleep: {
    title: 'Log sleep',
    description: 'Record when Leo fell asleep and woke.',
  },
};

export function QuickAddSheet({
  state,
  onClose,
}: {
  state: QuickAddState | null;
  onClose: () => void;
}) {
  const open = state !== null;
  const meta = state ? TITLES[state.kind] : null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-cream-200">
        {state && meta && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="font-display text-xl text-sage-900">
                {meta.title}
              </SheetTitle>
              <SheetDescription>{meta.description}</SheetDescription>
            </SheetHeader>
            {state.kind === 'feed' && (
              <FeedForm
                entry={state.entry as FeedEntry | undefined}
                onDone={onClose}
              />
            )}
            {state.kind === 'diaper' && (
              <DiaperForm
                entry={state.entry as DiaperEntry | undefined}
                onDone={onClose}
              />
            )}
            {state.kind === 'sleep' && (
              <SleepControls
                entry={state.entry as SleepEntry | undefined}
                onDone={onClose}
              />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
