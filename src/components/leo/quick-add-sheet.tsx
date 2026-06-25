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
import { EventForm } from './forms/event-form';
import { GreekKey } from './decor/greek-key';
import type {
  FeedEntry,
  DiaperEntry,
  SleepEntry,
  LeoEvent,
  EventKind,
} from '@/lib/leo';

export type QuickAddKind = 'feed' | 'diaper' | 'sleep' | EventKind;

export interface QuickAddState {
  kind: QuickAddKind;
  entry?: FeedEntry | DiaperEntry | SleepEntry | LeoEvent;
}

const EVENT_KINDS: EventKind[] = [
  'cry',
  'temperature',
  'medication',
  'symptom',
  'mood',
];

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
  mood: { title: 'Log mood', description: 'How is Leo right now?' },
  cry: {
    title: 'Log crying',
    description: 'Note a fussy spell and a possible reason.',
  },
  temperature: {
    title: 'Log temperature',
    description: "Record Leo's temperature.",
  },
  medication: {
    title: 'Log medication',
    description: 'What was given, the dose, and why.',
  },
  symptom: {
    title: 'Log a symptom',
    description: 'Anything you want to keep an eye on.',
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
      <SheetContent side="bottom" className="border-ink-300/40">
        {state && meta && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="font-display text-xl text-ink-900">
                {meta.title}
              </SheetTitle>
              <SheetDescription>{meta.description}</SheetDescription>
              <GreekKey className="mt-2 h-2 w-24" />
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
            {EVENT_KINDS.includes(state.kind as EventKind) && (
              <EventForm
                kind={state.kind as EventKind}
                entry={state.entry as LeoEvent | undefined}
                onDone={onClose}
              />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
