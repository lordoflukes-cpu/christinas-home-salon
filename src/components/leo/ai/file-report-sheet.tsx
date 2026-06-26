'use client';

import { useCallback, useState } from 'react';
import {
  Mic,
  Send,
  Loader2,
  X,
  FileText,
  User,
  Stethoscope,
  BookOpen,
  Bell,
  NotebookPen,
  Star,
  Milk,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { GreekKey } from '../decor/greek-key';
import {
  useLeoStore,
  useSpeechInput,
  extractActions,
  actionArea,
  type ProposedAction,
  type FeedType,
} from '@/lib/leo';
import {
  DEFAULT_REMINDER_PREFS,
  type ReminderPrefs,
} from '@/lib/leo/reminders';

interface Reviewable extends ProposedAction {
  _id: number;
  keep: boolean;
}

const AREA_ICON: Record<string, typeof User> = {
  Profile: User,
  Health: Stethoscope,
  'Red book': BookOpen,
  Reminders: Bell,
  Journal: NotebookPen,
  Milestones: Star,
  'Daily log': Milk,
};

function whenMs(a: ProposedAction): number | undefined {
  if (!a.when) return undefined;
  const t = Date.parse(a.when);
  return Number.isNaN(t) ? undefined : t;
}

export function FileReportSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const createMedical = useLeoStore((s) => s.createMedical);
  const createEvent = useLeoStore((s) => s.createEvent);
  const createFeed = useLeoStore((s) => s.createFeed);
  const createDiaper = useLeoStore((s) => s.createDiaper);
  const startSleepTimer = useLeoStore((s) => s.startSleepTimer);
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
    const res = await extractActions(t);
    setLoading(false);
    if (res.notConfigured) {
      setError('Set up the AI key on the server to use this.');
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }
    if (!res.actions || res.actions.length === 0) {
      setError('Nothing to file there — try adding more detail.');
      return;
    }
    setReview(res.actions.map((a, i) => ({ ...a, _id: i, keep: true })));
  }, []);

  const speech = useSpeechInput((heard) =>
    setText((t) => `${t} ${heard}`.trim()),
  );

  async function saveSelected() {
    if (!review || !profile) return;
    const keep = review.filter((r) => r.keep);
    if (!keep.length) return;
    setSaving(true);
    const now = Date.now();

    try {
      // Profile + reminder edits merge into ONE editProfile (avoids overwrite).
      const merged = keep
        .filter((a) => a.type === 'profile')
        .reduce(
          (acc, a) => ({ ...acc, ...(a.fields ?? {}) }),
          {} as NonNullable<ProposedAction['fields']>,
        );
      // `birth` arrives as an ISO string but the profile stores epoch-ms.
      const { birth: birthStr, ...profileFields } = merged;
      let birthMs: number | undefined;
      if (typeof birthStr === 'string') {
        const t = Date.parse(birthStr);
        if (!Number.isNaN(t)) birthMs = t;
      }
      const reminderActions = keep.filter((a) => a.type === 'reminders');
      const hasProfile =
        Object.keys(profileFields).length > 0 || birthMs != null;
      const hasReminders = reminderActions.length > 0;

      if (hasProfile || hasReminders) {
        const { id: _id, updatedAt: _u, ...rest } = profile;
        let reminders: ReminderPrefs | undefined = rest.reminders;
        if (hasReminders) {
          const base: ReminderPrefs = rest.reminders ?? DEFAULT_REMINDER_PREFS;
          const patch: Partial<ReminderPrefs> = {};
          for (const a of reminderActions) {
            if (a.feedHours != null) {
              patch.feed = true;
              patch.feedHours = Math.round(a.feedHours);
            }
            if (a.sleepMaxHours != null) {
              patch.sleep = true;
              patch.sleepMaxHours = Math.round(a.sleepMaxHours);
            }
            if (a.vitdTime) {
              patch.vitd = true;
              patch.vitdTime = a.vitdTime;
            }
            if (a.quietStart && a.quietEnd) {
              patch.quiet = true;
              patch.quietStart = a.quietStart;
              patch.quietEnd = a.quietEnd;
            }
          }
          reminders = { ...base, ...patch };
        }
        await editProfile({
          ...rest,
          ...profileFields,
          ...(birthMs != null ? { birth: birthMs } : {}),
          reminders,
        });
      }

      // Everything else, one create per action.
      for (const a of keep) {
        // eslint-disable-next-line no-await-in-loop
        await applyOne(a, now);
      }

      toast({
        title: 'Filed for Leo 🦁',
        description: `${keep.length} ${keep.length === 1 ? 'thing' : 'things'} added.`,
      });
      close();
    } catch {
      setSaving(false);
      toast({
        title: 'Couldn’t save everything',
        description: 'Something went wrong — please try again.',
        variant: 'destructive',
      });
    }
  }

  function applyOne(a: ProposedAction, now: number): Promise<void> {
    switch (a.type) {
      case 'medical':
        return createMedical({
          kind: a.medicalKind ?? 'note',
          title: a.title ?? a.summary,
          at: whenMs(a) ?? now,
          category: a.category,
          note: a.note,
          batch: a.batch,
          reaction: a.reaction,
        });
      case 'event':
        return createEvent({
          kind:
            a.eventKind ??
            (a.symptom
              ? 'symptom'
              : a.tempC != null
                ? 'temperature'
                : a.medName
                  ? 'medication'
                  : 'mood'),
          at: whenMs(a) ?? now,
          symptom: a.symptom,
          severity: a.severity,
          tempC: a.tempC,
          medName: a.medName,
          dose: a.dose,
          mood: a.mood,
          note: a.note,
        });
      case 'feed': {
        const type: FeedType =
          a.feedType ?? (a.side || a.durationMin != null ? 'breast' : 'bottle');
        return createFeed({
          type,
          startedAt: now,
          amountMl: a.amountMl,
          contents: a.contents,
          side: a.side,
          durationMin: a.durationMin,
        });
      }
      case 'diaper':
        return createDiaper({
          changedAt: now,
          type: a.diaperType ?? 'wet',
          color: a.color,
        });
      case 'sleep':
        return startSleepTimer(now);
      case 'milestone':
        return createMilestone({
          achievedAt: whenMs(a) ?? now,
          title: a.title ?? a.summary,
          note: a.note,
        });
      case 'note':
        return createJournal({
          writtenAt: now,
          body: a.body ?? a.note ?? a.summary,
        });
      default:
        return Promise.resolve(); // profile + reminders handled above
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto border-ink-300/40"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl text-ink-900">
            File a note or report
          </SheetTitle>
          <SheetDescription>
            Paste red-book notes, a health-visitor report, or just type/say what
            happened. Leo sorts it into entries — you confirm before anything is
            saved.
          </SheetDescription>
          <GreekKey className="mt-2 h-2 w-24" />
        </SheetHeader>

        {!review && (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="e.g. 8-week check today: weight 5.2kg, had first set of jabs (no reaction). GP is Dr Patel. Bit of a rash on his cheek, mild."
              className="text-[15px]"
            />
            <div className="flex gap-2">
              {speech.supported && (
                <Button
                  type="button"
                  onClick={() =>
                    speech.listening ? speech.stop() : speech.start()
                  }
                  variant="outline"
                  className={cn(
                    'min-h-11 border-ink-300',
                    speech.listening
                      ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-600'
                      : 'bg-parchment-50 text-ink-700 hover:bg-parchment-100',
                  )}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {speech.listening ? 'Listening…' : 'Dictate'}
                </Button>
              )}
              <Button
                type="button"
                onClick={() => void parse(text)}
                disabled={!text.trim() || loading}
                className="min-h-11 flex-1 bg-ink-700 hover:bg-ink-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Read &amp; sort this
                  </>
                )}
              </Button>
            </div>
            {speech.error && (
              <p className="text-xs text-rose-500">{speech.error}</p>
            )}
            {error && <p className="text-sm text-rose-500">{error}</p>}
          </div>
        )}

        {review && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Tap to keep or remove, then save
            </p>
            {review.map((r) => {
              const area = actionArea(r);
              const Icon = AREA_ICON[area] ?? FileText;
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
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      r.keep
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-ink-100 text-ink-400',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-sm',
                        r.keep ? 'text-ink-900' : 'text-ink-400 line-through',
                      )}
                    >
                      {r.summary}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-ink-400">
                      {area}
                    </span>
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
                    aria-label={r.keep ? 'Remove' : 'Keep'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-parchment-100 hover:text-ink-700"
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
          Medicine names, doses and measurements are saved exactly as written —
          always double-check. Leo organises; it doesn’t give medical advice.
        </p>
      </SheetContent>
    </Sheet>
  );
}

/** A button that opens the file-a-report sheet — drop it anywhere. */
export function FileReportButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border border-aegean-200 bg-gradient-to-br from-aegean-50 to-parchment-50 p-3 text-left transition-colors hover:from-aegean-100',
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aegean-100 text-aegean-700">
          <FileText className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-display text-base text-ink-900">
            File a note or report
          </span>
          <span className="block text-xs text-ink-500">
            Paste red-book notes or a report — Leo files it for you
          </span>
        </span>
      </button>
      <FileReportSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
