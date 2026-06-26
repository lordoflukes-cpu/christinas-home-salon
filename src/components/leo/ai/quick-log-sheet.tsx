'use client';

import { useCallback, useState } from 'react';
import {
  Mic,
  Send,
  Loader2,
  X,
  Milk,
  Droplets,
  Moon,
  Star,
  NotebookPen,
  Thermometer,
  Pill,
  Activity,
  Frown,
  Smile,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { GreekKey } from '../decor/greek-key';
import {
  useLeoStore,
  useSpeechInput,
  parseLog,
  type ParsedLogEntry,
  type FeedType,
} from '@/lib/leo';

/** A parsed entry plus whether it's still selected for saving. */
interface Reviewable extends ParsedLogEntry {
  _id: number;
  keep: boolean;
}

const KIND_ICON = {
  feed: Milk,
  diaper: Droplets,
  sleep: Moon,
  milestone: Star,
  note: NotebookPen,
} as const;

const EVENT_ICON = {
  temperature: Thermometer,
  medication: Pill,
  symptom: Activity,
  cry: Frown,
  mood: Smile,
} as const;

function iconFor(e: ParsedLogEntry) {
  if (e.kind === 'event' && e.eventKind) return EVENT_ICON[e.eventKind];
  return KIND_ICON[e.kind as keyof typeof KIND_ICON] ?? NotebookPen;
}

export function QuickLogSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createFeed = useLeoStore((s) => s.createFeed);
  const createDiaper = useLeoStore((s) => s.createDiaper);
  const startSleepTimer = useLeoStore((s) => s.startSleepTimer);
  const createEvent = useLeoStore((s) => s.createEvent);
  const createMilestone = useLeoStore((s) => s.createMilestone);
  const createJournal = useLeoStore((s) => s.createJournal);

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Reviewable[] | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = useCallback(() => {
    setText('');
    setLoading(false);
    setError(null);
    setReview(null);
    setSaving(false);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const parse = useCallback(async (value: string) => {
    const t = value.trim();
    if (!t) return;
    setLoading(true);
    setError(null);
    setReview(null);
    const res = await parseLog(t);
    setLoading(false);
    if (res.notConfigured) {
      setError(
        'Voice logging isn’t set up yet — add an Anthropic key to enable it.',
      );
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }
    if (!res.entries || res.entries.length === 0) {
      setError(
        'Nothing to log there — try saying what happened, e.g. “90ml of formula and a dirty nappy”.',
      );
      return;
    }
    setReview(res.entries.map((e, i) => ({ ...e, _id: i, keep: true })));
  }, []);

  const speech = useSpeechInput((heard) => {
    setText(heard);
    void parse(heard);
  });

  function writeEntry(e: ParsedLogEntry, now: number): Promise<void> {
    switch (e.kind) {
      case 'feed': {
        const type: FeedType =
          e.feedType ?? (e.side || e.durationMin != null ? 'breast' : 'bottle');
        return createFeed({
          type,
          startedAt: now,
          side: e.side,
          durationMin: e.durationMin,
          amountMl: e.amountMl,
          contents: e.contents,
          note: e.note,
        });
      }
      case 'diaper':
        return createDiaper({
          changedAt: now,
          type: e.diaperType ?? 'wet',
          color: e.color,
          note: e.note,
        });
      case 'sleep':
        return startSleepTimer(now);
      case 'event':
        return createEvent({
          kind: e.eventKind ?? 'mood',
          at: now,
          tempC: e.tempC,
          medName: e.medName,
          dose: e.dose,
          symptom: e.symptom,
          mood: e.mood,
          note: e.note,
        });
      case 'milestone':
        return createMilestone({
          achievedAt: now,
          title: e.title ?? e.summary,
          note: e.note,
        });
      case 'note':
        return createJournal({
          writtenAt: now,
          body: e.body ?? e.note ?? e.summary,
        });
      default:
        return Promise.resolve();
    }
  }

  async function saveSelected() {
    if (!review) return;
    const keep = review.filter((r) => r.keep);
    if (!keep.length) return;
    setSaving(true);
    const now = Date.now();
    try {
      for (const e of keep) {
        // eslint-disable-next-line no-await-in-loop
        await writeEntry(e, now);
      }
      toast({
        title: 'Logged 🦁',
        description:
          keep.length === 1
            ? keep[0].summary
            : `${keep.length} things saved to Leo’s log.`,
      });
      close();
    } catch {
      setSaving(false);
      toast({
        title: 'Couldn’t save',
        description: 'Something went wrong saving those. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent side="bottom" className="border-ink-300/40">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl text-ink-900">
            Say what happened
          </SheetTitle>
          <SheetDescription>
            Speak or type it in plain words — Leo sorts it into entries you
            confirm before anything is saved.
          </SheetDescription>
          <GreekKey className="mt-2 h-2 w-24" />
        </SheetHeader>

        <div className="flex gap-2">
          <input
            value={speech.listening ? speech.transcript : text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void parse(text);
            }}
            placeholder={
              speech.listening
                ? 'Listening…'
                : 'e.g. 90ml of formula and a dirty nappy'
            }
            className="min-h-11 flex-1 rounded-xl border border-ink-300 bg-white px-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-gold-400"
          />
          {speech.supported && (
            <Button
              type="button"
              onClick={() =>
                speech.listening ? speech.stop() : speech.start()
              }
              size="lg"
              variant="outline"
              aria-label={speech.listening ? 'Stop listening' : 'Log by voice'}
              className={cn(
                'min-h-11 shrink-0 border-ink-300',
                speech.listening
                  ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-600'
                  : 'bg-parchment-50 text-ink-700 hover:bg-parchment-100',
              )}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void parse(text)}
            disabled={!text.trim() || loading}
            size="lg"
            className="min-h-11 shrink-0 bg-ink-700 hover:bg-ink-800"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {speech.error && (
          <p className="mt-1.5 text-xs text-rose-500">{speech.error}</p>
        )}
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}

        {loading && (
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Making sense of that…
          </p>
        )}

        {review && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Tap to keep or remove, then save
            </p>
            {review.map((r) => {
              const Icon = iconFor(r);
              return (
                <div
                  key={r._id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
                    r.keep
                      ? 'border-gold-300/60 bg-parchment-50'
                      : 'border-ink-200/50 bg-parchment-100/40 opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      r.keep
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-ink-100 text-ink-400',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      r.keep ? 'text-ink-900' : 'text-ink-400 line-through',
                    )}
                  >
                    {r.summary}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setReview((prev) =>
                        prev
                          ? prev.map((x) =>
                              x._id === r._id ? { ...x, keep: !x.keep } : x,
                            )
                          : prev,
                      )
                    }
                    aria-label={
                      r.keep ? 'Remove this entry' : 'Keep this entry'
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-parchment-100 hover:text-ink-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReview(null);
                  setError(null);
                }}
                className="min-h-12 flex-1 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
              >
                Start over
              </Button>
              <Button
                type="button"
                onClick={() => void saveSelected()}
                disabled={saving || !review.some((r) => r.keep)}
                className="min-h-12 flex-1 bg-ink-700 hover:bg-ink-800"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `Save ${review.filter((r) => r.keep).length || ''}`.trim()
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-ink-400">
          For medicines, the dose and name are saved exactly as you say them —
          always double-check before giving anything.
        </p>
      </SheetContent>
    </Sheet>
  );
}
