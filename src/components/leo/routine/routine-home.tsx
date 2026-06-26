'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ChevronDown, HeartHandshake } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  formatElapsed,
  formatClock,
  routineTypeConfig,
  templateSteps,
  ROUTINE_TYPES,
  type RoutineSession,
  type RoutineSessionType,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { RoutineBuilder } from './routine-builder';
import { SessionSheet } from './session-sheet';
import { SessionDetail } from './session-detail';
import { HandoverSheet } from './handover-sheet';
import { AdviserButton } from './adviser-button';

function outcomeBadge(s: RoutineSession): { text: string; cls: string } | null {
  if (s.endedAt == null)
    return { text: 'On now', cls: 'bg-gold-100 text-gold-700' };
  if (s.settled === true)
    return { text: 'Settled', cls: 'bg-emerald-50 text-emerald-700' };
  if (s.settled === false)
    return { text: 'Unsettled', cls: 'bg-rose-50 text-rose-600' };
  return null;
}

export function RoutineHome() {
  const profile = useLeoStore((s) => s.profile);
  const sessions = useLeoStore((s) => s.routineSessions);
  const createRoutineSession = useLeoStore((s) => s.createRoutineSession);
  const now = useNow(30_000);
  const router = useRouter();
  const params = useSearchParams();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RoutineSession | null>(null);
  const [handover, setHandover] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const startedFromQuery = useRef(false);

  async function startSession(type: RoutineSessionType) {
    const steps = templateSteps(type).map((name) => ({ name, done: false }));
    const entry = await createRoutineSession({
      type,
      startedAt: Date.now(),
      steps: steps.length ? steps : undefined,
    });
    setActiveId(entry.id);
  }

  // Home shortcut: /leo/routine?unsettled=1 opens a settling session at once.
  useEffect(() => {
    if (startedFromQuery.current) return;
    if (params.get('unsettled') === '1') {
      startedFromQuery.current = true;
      void startSession('settling');
      router.replace('/leo/routine');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const openSession = sessions.find((s) => s.endedAt == null);
  const recent = sessions.slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Big unsettled button */}
      <motion.button
        type="button"
        onClick={() => void startSession('settling')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-parchment-50 p-4 text-left shadow-sm transition-colors hover:from-rose-100 active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <HeartHandshake className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-display text-lg text-ink-900">
            Leo is unsettled
          </span>
          <span className="block text-sm text-ink-500">
            Start settling — log what you try, see what works
          </span>
        </span>
      </motion.button>

      {/* AI adviser */}
      <AdviserButton />

      {/* On now */}
      {openSession && (
        <button
          type="button"
          onClick={() => setActiveId(openSession.id)}
          className="flex w-full items-center gap-3 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-left active:scale-[0.99]"
        >
          <span className="text-xl">
            {routineTypeConfig(openSession.type).emoji}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-ink-900">
              {routineTypeConfig(openSession.type).label} in progress
            </span>
            <span className="block text-xs text-ink-500">
              Started {formatElapsed(Math.max(0, now - openSession.startedAt))}{' '}
              ago · tap to continue
            </span>
          </span>
        </button>
      )}

      {/* Start a routine */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Start a routine
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ROUTINE_TYPES.filter((t) => t.type !== 'settling').map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => void startSession(t.type)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-ink-300/40 bg-parchment-50/80 py-3 transition-colors hover:bg-parchment-100 active:scale-95"
            >
              <span className="text-2xl" aria-hidden>
                {t.emoji}
              </span>
              <span className="text-xs font-medium text-ink-700">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Handover */}
      <button
        type="button"
        onClick={() => setHandover(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-ink-300/40 bg-parchment-50/80 px-4 py-3 text-left transition-colors hover:bg-parchment-100"
      >
        <ArrowLeftRight className="h-5 w-5 text-aegean-600" />
        <span className="flex-1">
          <span className="block text-sm font-medium text-ink-900">
            Handover
          </span>
          <span className="block text-xs text-ink-500">
            Quick summary for whoever takes over
          </span>
        </span>
      </button>

      {/* Recent sessions */}
      {recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Recent sessions
          </p>
          <ul className="space-y-1.5">
            {recent.map((s) => {
              const cfg = routineTypeConfig(s.type);
              const badge = outcomeBadge(s);
              const worked = (s.methods ?? [])
                .filter((m) => m.result === 'worked' || m.result === 'helped')
                .map((m) => m.method);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() =>
                      s.endedAt == null ? setActiveId(s.id) : setDetail(s)
                    }
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-300/40 bg-parchment-50/70 px-3 py-2.5 text-left transition-colors hover:bg-parchment-100"
                  >
                    <span className="text-lg" aria-hidden>
                      {cfg.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink-900">
                        {cfg.label}
                        <span className="ml-2 text-xs font-normal text-ink-400">
                          {formatClock(s.startedAt)}
                        </span>
                      </span>
                      {worked.length > 0 && (
                        <span className="block truncate text-xs text-emerald-700">
                          Worked: {worked.join(', ')}
                        </span>
                      )}
                    </span>
                    {badge && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                          badge.cls,
                        )}
                      >
                        {badge.text}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!profile && (
        <Card className="border-ink-300/40 p-4 text-center text-sm text-ink-600">
          Add Leo&apos;s details in Settings to get the most from the routine
          logger.
        </Card>
      )}

      {/* Reference & notes (the original routine config) */}
      <div className="rounded-2xl border border-ink-300/40 bg-parchment-50/40">
        <button
          type="button"
          onClick={() => setShowReference((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span>
            <span className="block font-display text-base text-ink-900">
              Reference &amp; notes
            </span>
            <span className="block text-xs text-ink-500">
              Morning/bedtime steps, cues, and what works
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-ink-400 transition-transform',
              showReference && 'rotate-180',
            )}
          />
        </button>
        {showReference && (
          <div className="px-4 pb-4">
            <RoutineBuilder />
          </div>
        )}
      </div>

      <SessionSheet sessionId={activeId} onClose={() => setActiveId(null)} />
      <SessionDetail session={detail} onClose={() => setDetail(null)} />
      <HandoverSheet open={handover} onClose={() => setHandover(false)} />
    </div>
  );
}
