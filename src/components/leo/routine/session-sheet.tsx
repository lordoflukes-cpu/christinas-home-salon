'use client';

import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  useLeoStore,
  useNow,
  formatElapsed,
  routineTypeConfig,
  templateSteps,
  CONTEXT_TAGS,
  SLEEP_CUES,
  HUNGER_CUES,
  WIND_SIGNS,
  SETTLING_METHODS,
  METHOD_RESULTS,
  PUT_DOWN_KINDS,
  CONFIDENCE_LEVELS,
  type RoutineSession,
  type RoutineMethod,
  type PutDownAttempt,
  type MethodResult,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { AdviserButton } from './adviser-button';

/** Multi-select chip row (toggles membership of a string[]). */
function ChipToggle({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[13px] font-medium transition-colors active:scale-95',
              active
                ? 'border-gold-500 bg-gold-100 text-gold-800'
                : 'border-ink-300 bg-parchment-50 text-ink-600 hover:bg-parchment-100',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Collapsible({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-ink-300/40 bg-parchment-50/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink-700"
      >
        <span>
          {label}
          {count > 0 && (
            <span className="ml-1 rounded-full bg-gold-100 px-1.5 text-xs text-gold-700">
              {count}
            </span>
          )}
        </span>
        <span className="text-ink-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function SessionSheet({
  sessionId,
  onClose,
}: {
  sessionId: string | null;
  onClose: () => void;
}) {
  const sessions = useLeoStore((s) => s.routineSessions);
  const editRoutineSession = useLeoStore((s) => s.editRoutineSession);
  const now = useNow(30_000);

  const [draft, setDraft] = useState<RoutineSession | null>(null);

  // Seed the local draft once when the sheet opens for a session.
  useEffect(() => {
    if (!sessionId) {
      setDraft(null);
      return;
    }
    const found = sessions.find((s) => s.id === sessionId);
    if (found && (!draft || draft.id !== sessionId)) setDraft(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessions]);

  if (!sessionId || !draft) {
    return (
      <Sheet open={!!sessionId} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="border-ink-300/40" />
      </Sheet>
    );
  }

  const cfg = routineTypeConfig(draft.type);
  const steps = draft.steps ?? [];

  // Apply a patch to the local draft and persist (autosave — survives close).
  function patch(p: Partial<RoutineSession>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
    void editRoutineSession(draft!.id, p);
  }

  function toggleIn(
    key: 'contextTags' | 'sleepCues' | 'hungerCues' | 'windSigns',
    value: string,
  ) {
    const cur = draft![key] ?? [];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    patch({ [key]: next } as Partial<RoutineSession>);
  }

  function toggleStep(i: number) {
    const next = steps.map((s, idx) =>
      idx === i
        ? { ...s, done: !s.done, at: !s.done ? Date.now() : undefined }
        : s,
    );
    patch({ steps: next });
  }

  function setMethodResult(method: string, result: MethodResult) {
    const existing = draft!.methods ?? [];
    const idx = existing.findIndex((m) => m.method === method);
    let next: RoutineMethod[];
    if (idx >= 0) {
      next = existing.map((m, i) => (i === idx ? { ...m, result } : m));
    } else {
      next = [...existing, { method, result, at: Date.now() }];
    }
    patch({ methods: next });
  }

  function addPutDown(kind: PutDownAttempt['kind'], result: 'stayed' | 'woke') {
    const next = [...(draft!.putDowns ?? []), { kind, result, at: Date.now() }];
    patch({ putDowns: next });
  }

  function end() {
    patch({ endedAt: Date.now() });
    onClose();
  }

  const elapsed = formatElapsed(Math.max(0, now - draft.startedAt));
  const isEnded = draft.endedAt != null;

  const methodResultOf = (method: string): MethodResult | undefined =>
    draft.methods?.find((m) => m.method === method)?.result;

  // Methods already tried but not in the default grid (custom-resumed sessions).
  const triedMethods = draft.methods?.map((m) => m.method) ?? [];
  const methodOptions = Array.from(
    new Set([...SETTLING_METHODS, ...triedMethods]),
  );

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto border-ink-300/40"
      >
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink-900">
            <span aria-hidden>{cfg.emoji}</span> {cfg.label}
            <span className="ml-auto text-sm font-normal text-ink-400">
              {isEnded ? 'Ended' : elapsed}
            </span>
          </SheetTitle>
          <SheetDescription>
            Tap as you go — it saves automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {!isEnded && <AdviserButton compact />}

          {/* Context (collapsible to keep it fast) */}
          <Collapsible
            label="Before — context & cues"
            count={
              (draft.contextTags?.length ?? 0) +
              (draft.sleepCues?.length ?? 0) +
              (draft.hungerCues?.length ?? 0) +
              (draft.windSigns?.length ?? 0)
            }
          >
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Context
                </p>
                <ChipToggle
                  options={CONTEXT_TAGS}
                  selected={draft.contextTags ?? []}
                  onToggle={(v) => toggleIn('contextTags', v)}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Sleep cues
                </p>
                <ChipToggle
                  options={SLEEP_CUES}
                  selected={draft.sleepCues ?? []}
                  onToggle={(v) => toggleIn('sleepCues', v)}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Hunger cues
                </p>
                <ChipToggle
                  options={HUNGER_CUES}
                  selected={draft.hungerCues ?? []}
                  onToggle={(v) => toggleIn('hungerCues', v)}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Wind signs
                </p>
                <ChipToggle
                  options={WIND_SIGNS}
                  selected={draft.windSigns ?? []}
                  onToggle={(v) => toggleIn('windSigns', v)}
                />
              </div>
            </div>
          </Collapsible>

          {/* Steps */}
          {steps.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Steps
              </p>
              <ul className="space-y-1">
                {steps.map((step, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggleStep(i)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors active:scale-[0.99]',
                        step.done
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-ink-300/50 bg-parchment-50 text-ink-700',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          step.done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-ink-300',
                        )}
                      >
                        {step.done && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className={step.done ? 'line-through' : ''}>
                        {step.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Methods tried + scoring */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              What did you try?
            </p>
            <div className="space-y-2">
              {methodOptions.map((method) => {
                const chosen = methodResultOf(method);
                const tried = chosen != null;
                return (
                  <div
                    key={method}
                    className={cn(
                      'rounded-xl border px-3 py-2',
                      tried
                        ? 'border-gold-300 bg-gold-50/60'
                        : 'border-ink-300/40 bg-parchment-50/60',
                    )}
                  >
                    <p className="text-sm font-medium text-ink-800">{method}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {METHOD_RESULTS.map((r) => (
                        <button
                          key={r.result}
                          type="button"
                          onClick={() => setMethodResult(method, r.result)}
                          className={cn(
                            'rounded-full border px-2 py-1 text-xs font-medium transition-colors active:scale-95',
                            chosen === r.result
                              ? 'border-ink-700 bg-ink-700 text-parchment-50'
                              : 'border-ink-300 bg-white text-ink-600 hover:bg-parchment-100',
                          )}
                        >
                          {r.emoji} {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Put-down attempts */}
          <Collapsible
            label="Put-down attempts"
            count={draft.putDowns?.length ?? 0}
          >
            <div className="space-y-2">
              {PUT_DOWN_KINDS.map((k) => (
                <div
                  key={k.kind}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink-300/40 bg-parchment-50 px-3 py-2"
                >
                  <span className="text-sm text-ink-700">{k.label}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => addPutDown(k.kind, 'stayed')}
                      className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 active:scale-95"
                    >
                      Stayed
                    </button>
                    <button
                      type="button"
                      onClick={() => addPutDown(k.kind, 'woke')}
                      className="rounded-full border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 active:scale-95"
                    >
                      Woke
                    </button>
                  </div>
                </div>
              ))}
              {(draft.putDowns?.length ?? 0) > 0 && (
                <p className="text-xs text-ink-500">
                  {draft
                    .putDowns!.map(
                      (p) =>
                        `${PUT_DOWN_KINDS.find((k) => k.kind === p.kind)?.label ?? p.kind} → ${p.result}`,
                    )
                    .join(' · ')}
                </p>
              )}
            </div>
          </Collapsible>

          {/* Outcome */}
          <div className="rounded-xl border border-ink-300/40 bg-parchment-50/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              How did it go?
            </p>
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => patch({ settled: true })}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium active:scale-[0.99]',
                  draft.settled === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-ink-300 bg-white text-ink-600',
                )}
              >
                Settled 💚
              </button>
              <button
                type="button"
                onClick={() => patch({ settled: false })}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium active:scale-[0.99]',
                  draft.settled === false
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-ink-300 bg-white text-ink-600',
                )}
              >
                Not settled
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {CONFIDENCE_LEVELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => patch({ confidence: c.value })}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors active:scale-95',
                    draft.confidence === c.value
                      ? 'border-ink-700 bg-ink-700 text-parchment-50'
                      : 'border-ink-300 bg-white text-ink-600 hover:bg-parchment-100',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <textarea
              value={draft.note ?? ''}
              onChange={(e) => patch({ note: e.target.value })}
              placeholder="Anything to remember for next time…"
              rows={2}
              className="mt-2 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-gold-400"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="flex-1 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
            >
              {isEnded ? 'Close' : 'Pause'}
            </Button>
            {!isEnded && (
              <Button
                onClick={end}
                size="lg"
                className="flex-1 bg-ink-700 hover:bg-ink-800"
              >
                <Plus className="mr-1 h-4 w-4 rotate-45" /> End routine
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
