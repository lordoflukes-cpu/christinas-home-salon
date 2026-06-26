'use client';

import { useState } from 'react';
import { ChevronDown, BookMarked, Play, Plus, Trash2 } from 'lucide-react';
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
import {
  useLeoStore,
  routineTypeConfig,
  templateSteps,
  ROUTINE_TYPES,
  type RoutineSessionType,
} from '@/lib/leo';

/**
 * Saved routines — reusable named flows (e.g. "Our bedtime"). Starting one
 * pre-fills a fresh session's steps so a good routine is one tap away.
 */
export function SavedRoutinesPanel({
  onOpenSession,
}: {
  onOpenSession: (sessionId: string) => void;
}) {
  const saved = useLeoStore((s) => s.savedRoutines);
  const createRoutineSession = useLeoStore((s) => s.createRoutineSession);
  const removeSavedRoutine = useLeoStore((s) => s.removeSavedRoutine);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function start(id: string) {
    const routine = saved.find((r) => r.id === id);
    if (!routine) return;
    const steps = routine.steps.map((name) => ({ name, done: false }));
    const entry = await createRoutineSession({
      type: routine.type,
      startedAt: Date.now(),
      steps: steps.length ? steps : undefined,
      note: routine.note,
    });
    onOpenSession(entry.id);
  }

  return (
    <div className="rounded-2xl border border-ink-300/40 bg-parchment-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-gold-600" />
          <span>
            <span className="block font-display text-base text-ink-900">
              Saved routines
            </span>
            <span className="block text-xs text-ink-500">
              {saved.length
                ? `${saved.length} saved · tap to start one`
                : 'Save a routine that works, reuse it in one tap'}
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
          {saved.map((r) => {
            const cfg = routineTypeConfig(r.type);
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-ink-300/40 bg-parchment-50/70 px-3 py-2.5"
              >
                <span className="text-lg" aria-hidden>
                  {cfg.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {r.name}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {r.steps.length} step{r.steps.length === 1 ? '' : 's'} ·{' '}
                    {cfg.label}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void start(r.id)}
                  className="flex h-9 items-center gap-1 rounded-full bg-ink-700 px-3 text-xs font-medium text-white hover:bg-ink-800"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
                <button
                  type="button"
                  onClick={() => void removeSavedRoutine(r.id)}
                  aria-label={`Delete ${r.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={() => setCreating(true)}
            className="min-h-11 w-full border-dashed border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
          >
            <Plus className="mr-2 h-4 w-4" /> New saved routine
          </Button>
        </div>
      )}

      <NewSavedRoutineSheet
        open={creating}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}

function NewSavedRoutineSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createSavedRoutine = useLeoStore((s) => s.createSavedRoutine);
  const [name, setName] = useState('');
  const [type, setType] = useState<RoutineSessionType>('bedtime');
  const [stepsText, setStepsText] = useState(
    templateSteps('bedtime').join('\n'),
  );
  const [methodsText, setMethodsText] = useState('');
  const [saving, setSaving] = useState(false);

  function chooseType(t: RoutineSessionType) {
    setType(t);
    // Prefill steps from the template only if the box is still untouched/empty.
    const tmpl = templateSteps(t).join('\n');
    setStepsText((cur) =>
      cur.trim() === '' ||
      ROUTINE_TYPES.some((rt) => templateSteps(rt.type).join('\n') === cur)
        ? tmpl
        : cur,
    );
  }

  async function save() {
    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name.trim() || steps.length === 0) return;
    setSaving(true);
    try {
      const methods = methodsText
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      await createSavedRoutine({
        name: name.trim(),
        type,
        steps,
        methods: methods.length ? methods : undefined,
      });
      setName('');
      setMethodsText('');
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
            New saved routine
          </SheetTitle>
          <SheetDescription>
            Give it a name and the steps. Start it any time to log a session
            with these steps ready to tick off.
          </SheetDescription>
          <GreekKey className="mt-2 h-2 w-24" />
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sr-name" className="text-xs text-ink-500">
              Name
            </Label>
            <Input
              id="sr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Our bedtime wind-down"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-ink-500">Type</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ROUTINE_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => chooseType(t.type)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    type === t.type
                      ? 'bg-ink-700 text-white'
                      : 'bg-parchment-100 text-ink-600 hover:bg-parchment-200',
                  )}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="sr-steps" className="text-xs text-ink-500">
              Steps (one per line)
            </Label>
            <Textarea
              id="sr-steps"
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              rows={6}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sr-methods" className="text-xs text-ink-500">
              Settling methods to try (optional, comma-separated)
            </Label>
            <Input
              id="sr-methods"
              value={methodsText}
              onChange={(e) => setMethodsText(e.target.value)}
              placeholder="White noise, Rocking, Dummy"
              className="mt-1"
            />
          </div>

          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving || !name.trim() || stepsText.trim() === ''}
            className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
          >
            Save routine
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
