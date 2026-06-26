'use client';

import { Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  useLeoStore,
  useNow,
  formatDateTime,
  formatElapsed,
  routineTypeConfig,
  methodResultMeta,
  sessionDuration,
  PUT_DOWN_KINDS,
  type RoutineSession,
} from '@/lib/leo';

function Tags({ label, values }: { label: string; values?: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <p className="text-sm text-ink-600">
      <span className="font-medium text-ink-700">{label}:</span>{' '}
      {values.join(', ')}
    </p>
  );
}

export function SessionDetail({
  session,
  onClose,
}: {
  session: RoutineSession | null;
  onClose: () => void;
}) {
  const removeRoutineSession = useLeoStore((s) => s.removeRoutineSession);
  const now = useNow(60_000);

  if (!session) {
    return (
      <Sheet open={false} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="border-ink-300/40" />
      </Sheet>
    );
  }

  const cfg = routineTypeConfig(session.type);
  const doneSteps = (session.steps ?? []).filter((s) => s.done);

  async function remove() {
    await removeRoutineSession(session!.id);
    onClose();
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto border-ink-300/40"
      >
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-ink-900">
            <span aria-hidden>{cfg.emoji}</span> {cfg.label}
          </SheetTitle>
          <SheetDescription>
            {formatDateTime(session.startedAt)} ·{' '}
            {formatElapsed(sessionDuration(session, now))}
            {session.endedAt == null && ' · still going'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Tags label="Context" values={session.contextTags} />
            <Tags label="Sleep cues" values={session.sleepCues} />
            <Tags label="Hunger cues" values={session.hungerCues} />
            <Tags label="Wind" values={session.windSigns} />
          </div>

          {doneSteps.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Steps done
              </p>
              <p className="text-sm text-ink-700">
                {doneSteps.map((s) => s.name).join(' → ')}
              </p>
            </div>
          )}

          {(session.methods?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                What was tried
              </p>
              <ul className="space-y-1">
                {session.methods!.map((m, i) => {
                  const meta = methodResultMeta(m.result);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-parchment-50 px-3 py-1.5 text-sm"
                    >
                      <span className="text-ink-700">{m.method}</span>
                      <span className="text-ink-500">
                        {meta.emoji} {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {(session.putDowns?.length ?? 0) > 0 && (
            <p className="text-sm text-ink-600">
              <span className="font-medium text-ink-700">Put-downs:</span>{' '}
              {session
                .putDowns!.map(
                  (p) =>
                    `${
                      PUT_DOWN_KINDS.find((k) => k.kind === p.kind)?.label ??
                      p.kind
                    } → ${p.result}`,
                )
                .join(' · ')}
            </p>
          )}

          {session.settled != null && (
            <p className="text-sm text-ink-700">
              <span className="font-medium">Outcome:</span>{' '}
              {session.settled ? 'Settled 💚' : 'Not settled'}
              {session.settleMinutes != null &&
                ` · ${session.settleMinutes} min to settle`}
            </p>
          )}

          {session.note?.trim() && (
            <p className="rounded-lg bg-gold-50 px-3 py-2 text-sm text-ink-700">
              {session.note}
            </p>
          )}

          <Button
            onClick={remove}
            variant="outline"
            className="mt-2 w-full border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete session
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
