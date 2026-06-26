'use client';

import { useState } from 'react';
import { ChevronDown, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useLeoStore,
  useNow,
  bestRoutineNow,
  weeklyReview,
  methodStats,
  type RoutineSession,
} from '@/lib/leo';

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const HOUR_LABEL = (h: number) => {
  const am = h < 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${am ? 'am' : 'pm'}`;
};

/**
 * A deterministic "what's worked at about this time" card — always a useful,
 * free, offline answer, complementing the AI adviser. Hidden until there's
 * something worth suggesting.
 */
export function BestNowCard() {
  const sessions = useLeoStore((s) => s.routineSessions);
  const now = useNow(60_000);
  const best = bestRoutineNow(sessions, now);

  if (best.basis === 'none' || best.methods.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-parchment-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-emerald-600" />
        <span className="font-display text-base text-ink-900">
          Best for right now
        </span>
      </div>
      <p className="mb-3 text-xs text-ink-500">
        {best.basis === 'time'
          ? `What’s settled Leo around ${HOUR_LABEL(best.hour)} before`
          : 'What’s worked best overall so far'}
        {' · '}
        {best.confidence === 'high'
          ? 'a clear pattern'
          : best.confidence === 'medium'
            ? 'an early pattern'
            : 'just a hint so far'}
      </p>
      <ul className="space-y-1.5">
        {best.methods.map((m) => (
          <li key={m.method} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-ink-900">{m.method}</span>
            <span className="text-xs text-emerald-700">
              {pct(m.successRate)} ({m.wins}/{m.tried})
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-ink-400">
        From what you’ve logged — not medical advice.
      </p>
    </div>
  );
}

function Bar({ rate }: { rate: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-parchment-200">
      <div
        className={cn(
          'h-full rounded-full',
          rate >= 0.66
            ? 'bg-emerald-500'
            : rate >= 0.33
              ? 'bg-gold-400'
              : 'bg-rose-300',
        )}
        style={{ width: `${Math.max(6, Math.round(rate * 100))}%` }}
      />
    </div>
  );
}

function deltaLabel(now: number, prev?: number): string | null {
  if (prev == null) return null;
  const diff = Math.round((now - prev) * 100);
  if (diff === 0) return 'same as last week';
  return `${diff > 0 ? '+' : ''}${diff}% vs last week`;
}

/**
 * Collapsible "This week & what's working" — the weekly review plus the
 * all-time success-rate table. Pure data; no AI, no network.
 */
export function WeeklyInsights() {
  const sessions = useLeoStore((s) => s.routineSessions);
  const now = useNow(60_000);
  const [open, setOpen] = useState(false);

  if (sessions.length === 0) return null;

  const review = weeklyReview(sessions, now);
  const allTime = methodStats(sessions, { minTried: 2 }).slice(0, 6);
  const delta = deltaLabel(review.settledRate, review.prev?.settledRate);

  return (
    <div className="rounded-2xl border border-ink-300/40 bg-parchment-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-aegean-600" />
          <span>
            <span className="block font-display text-base text-ink-900">
              This week &amp; what’s working
            </span>
            <span className="block text-xs text-ink-500">
              {review.count} session{review.count === 1 ? '' : 's'} ·{' '}
              {review.withOutcome > 0
                ? `${pct(review.settledRate)} settled`
                : 'settling patterns'}
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
        <div className="space-y-4 px-4 pb-4">
          {/* Week summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Sessions" value={String(review.count)} />
            <Stat
              label="Settled"
              value={review.withOutcome > 0 ? pct(review.settledRate) : '—'}
              hint={delta ?? undefined}
            />
            <Stat
              label="Avg settle"
              value={
                review.avgSettleMinutes != null
                  ? `${review.avgSettleMinutes}m`
                  : '—'
              }
            />
          </div>

          {review.fussiestHours.length > 0 && (
            <p className="rounded-xl bg-parchment-100/70 px-3 py-2 text-xs text-ink-600">
              <span className="font-medium text-ink-800">Fussiest around</span>{' '}
              {review.fussiestHours.map((h) => HOUR_LABEL(h)).join(' & ')} —
              worth being ready a little before.
            </p>
          )}

          {review.byType.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {review.byType.map((t) => (
                <span
                  key={t.type}
                  className="rounded-full bg-parchment-100 px-2.5 py-1 text-xs text-ink-600"
                >
                  {t.emoji} {t.label} ·{' '}
                  <span className="font-medium text-ink-800">{t.count}</span>
                </span>
              ))}
            </div>
          )}

          {/* All-time what's working */}
          {allTime.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                What’s worked best (all time)
              </p>
              <ul className="space-y-2">
                {allTime.map((m) => (
                  <li key={m.method} className="space-y-1">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-ink-900">
                        {m.method}
                      </span>
                      <span className="text-xs text-ink-500">
                        {pct(m.successRate)} · {m.wins}/{m.tried}
                      </span>
                    </div>
                    <Bar rate={m.successRate} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-xs text-ink-500">
              <Sparkles className="h-4 w-4 text-gold-500" />
              Log a few settling methods and their results — patterns appear
              here once a method’s been tried a couple of times.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-ink-200/50 bg-parchment-50/70 px-2 py-2.5">
      <div className="font-display text-xl text-ink-900">{value}</div>
      <div className="text-[11px] text-ink-500">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-aegean-600">{hint}</div>}
    </div>
  );
}

/** Re-export the session type for callers that want it alongside the panels. */
export type { RoutineSession };
