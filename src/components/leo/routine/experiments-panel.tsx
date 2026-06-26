'use client';

import { useState } from 'react';
import { ChevronDown, FlaskConical, Plus, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GreekKey } from '../decor/greek-key';
import { useLeoStore, type Experiment, type ExperimentStatus } from '@/lib/leo';

const STATUS_META: Record<
  ExperimentStatus,
  { label: string; emoji: string; cls: string }
> = {
  running: { label: 'Running', emoji: '⏳', cls: 'bg-gold-100 text-gold-700' },
  worked: {
    label: 'Worked',
    emoji: '💚',
    cls: 'bg-emerald-50 text-emerald-700',
  },
  mixed: { label: 'Mixed', emoji: '🤔', cls: 'bg-aegean-50 text-aegean-700' },
  didnt: { label: "Didn't work", emoji: '🚫', cls: 'bg-rose-50 text-rose-600' },
  abandoned: {
    label: 'Stopped',
    emoji: '🛑',
    cls: 'bg-parchment-200 text-ink-500',
  },
};

const CONCLUSIONS: ExperimentStatus[] = [
  'worked',
  'mixed',
  'didnt',
  'abandoned',
];

const DAY = 86_400_000;

function dayCount(e: Experiment, now: number): number {
  return Math.max(1, Math.ceil(((e.endedAt ?? now) - e.startedAt) / DAY));
}

/**
 * Experiments — a deliberate "let's try X for a few days" tracker, so guesswork
 * about what helps Leo becomes something the parents can look back on.
 */
export function ExperimentsPanel() {
  const experiments = useLeoStore((s) => s.experiments);
  const removeExperiment = useLeoStore((s) => s.removeExperiment);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [concluding, setConcluding] = useState<Experiment | null>(null);

  const now = Date.now();
  const running = experiments.filter((e) => e.status === 'running').length;

  // Running first, then by recency.
  const ordered = [...experiments].sort((a, b) => {
    const ar = a.status === 'running' ? 1 : 0;
    const br = b.status === 'running' ? 1 : 0;
    return br - ar || b.startedAt - a.startedAt;
  });

  return (
    <div className="rounded-2xl border border-ink-300/40 bg-parchment-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-aegean-600" />
          <span>
            <span className="block font-display text-base text-ink-900">
              Experiments
            </span>
            <span className="block text-xs text-ink-500">
              {experiments.length
                ? `${running} running · ${experiments.length} total`
                : 'Try something for a few days and see if it helps'}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-ink-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="space-y-2 px-4 pb-4">
          {ordered.map((e) => {
            const meta = STATUS_META[e.status];
            return (
              <div
                key={e.id}
                className="rounded-xl border border-ink-300/40 bg-parchment-50/70 px-3 py-2.5"
              >
                <div className="flex items-start gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-900">
                      {e.title}
                    </span>
                    {e.hypothesis && (
                      <span className="block text-xs text-ink-500">
                        {e.hypothesis}
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] text-ink-400">
                      Day {dayCount(e, now)}
                      {e.days ? ` of ${e.days}` : ''}
                      {e.outcome ? ` · ${e.outcome}` : ''}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      meta.cls,
                    )}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => void removeExperiment(e.id)}
                    aria-label={`Delete ${e.title}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {e.status === 'running' && (
                  <button
                    type="button"
                    onClick={() => setConcluding(e)}
                    className="mt-2 w-full rounded-lg border border-ink-300/50 bg-parchment-50 py-1.5 text-xs font-medium text-ink-700 hover:bg-parchment-100"
                  >
                    How did it go?
                  </button>
                )}
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={() => setCreating(true)}
            className="min-h-11 w-full border-dashed border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
          >
            <Plus className="mr-2 h-4 w-4" /> New experiment
          </Button>
        </div>
      )}

      <NewExperimentSheet open={creating} onClose={() => setCreating(false)} />
      <ConcludeSheet
        experiment={concluding}
        onClose={() => setConcluding(null)}
      />
    </div>
  );
}

function NewExperimentSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createExperiment = useLeoStore((s) => s.createExperiment);
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [days, setDays] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const n = parseInt(days, 10);
      await createExperiment({
        title: title.trim(),
        hypothesis: hypothesis.trim() || undefined,
        startedAt: Date.now(),
        days: !Number.isNaN(n) && n > 0 ? n : undefined,
        status: 'running',
      });
      setTitle('');
      setHypothesis('');
      setDays('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-ink-300/40">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl text-ink-900">
            New experiment
          </SheetTitle>
          <SheetDescription>
            Something to try for a few days. You’ll record how it went — this
            just organises what you observe, it isn’t medical advice.
          </SheetDescription>
          <GreekKey className="mt-2 h-2 w-24" />
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ex-title" className="text-xs text-ink-500">
              What are you trying?
            </Label>
            <Input
              id="ex-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dream feed at 10pm"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ex-hyp" className="text-xs text-ink-500">
              Why? (optional)
            </Label>
            <Input
              id="ex-hyp"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Might help him sleep a longer stretch"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ex-days" className="text-xs text-ink-500">
              For how many days? (optional)
            </Label>
            <Input
              id="ex-days"
              type="number"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="5"
              className="mt-1 w-28"
            />
          </div>

          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving || !title.trim()}
            className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
          >
            Start experiment
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ConcludeSheet({
  experiment,
  onClose,
}: {
  experiment: Experiment | null;
  onClose: () => void;
}) {
  const editExperiment = useLeoStore((s) => s.editExperiment);
  const [outcome, setOutcome] = useState('');
  const [saving, setSaving] = useState(false);

  async function conclude(status: ExperimentStatus) {
    if (!experiment) return;
    setSaving(true);
    try {
      await editExperiment(experiment.id, {
        status,
        outcome: outcome.trim() || undefined,
        endedAt: Date.now(),
      });
      setOutcome('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={experiment !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-ink-300/40">
        {experiment && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="font-display text-xl text-ink-900">
                How did it go?
              </SheetTitle>
              <SheetDescription>{experiment.title}</SheetDescription>
              <GreekKey className="mt-2 h-2 w-24" />
            </SheetHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ex-outcome" className="text-xs text-ink-500">
                  What did you notice? (optional)
                </Label>
                <Textarea
                  id="ex-outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  rows={3}
                  placeholder="Slept a 5-hour stretch on nights 3–5."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CONCLUSIONS.map((status) => {
                  const meta = STATUS_META[status];
                  return (
                    <Button
                      key={status}
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void conclude(status)}
                      className="min-h-12 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
                    >
                      {meta.emoji} {meta.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
