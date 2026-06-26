/**
 * Routine intelligence — PURE review + suggestion layer (unit tested).
 *
 * Turns the settling/nap/bedtime sessions the parents already log into two
 * things they can act on without any AI or network:
 *   - `weeklyReview`  — how the last 7 days went vs the week before.
 *   - `bestRoutineNow` — a deterministic "what's worked at about this time"
 *      suggestion, so there's always a useful, free, offline answer even when
 *      Ask Leo (the AI adviser) isn't set up or there's no signal.
 *
 * It only organises what was logged — it never makes a medical decision.
 */
import type { RoutineSession, RoutineSessionType } from './types';
import { methodStats, type MethodStat } from './routine-insights';
import { routineTypeConfig } from './routine-templates';

const DAY = 86_400_000;

/** Smallest distance between two clock hours, wrapping past midnight (0–12). */
function hourDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 24 - d);
}

export interface WeeklyReviewType {
  type: RoutineSessionType;
  label: string;
  emoji: string;
  count: number;
}

export interface WeeklyReview {
  from: number;
  to: number;
  /** Sessions started within the window. */
  count: number;
  /** Of those, how many have a settled/not-settled outcome recorded. */
  withOutcome: number;
  settledCount: number;
  /** settledCount / withOutcome (0 when nothing has an outcome yet). */
  settledRate: number;
  /** Average minutes-to-settle across settled sessions that recorded it. */
  avgSettleMinutes?: number;
  /** Best-performing settling methods this week. */
  topMethods: MethodStat[];
  /** Session counts per type, busiest first. */
  byType: WeeklyReviewType[];
  /** Up to two clock-hours where unsettled/settling sessions cluster. */
  fussiestHours: number[];
  /** The previous 7 days, for a gentle "vs last week". */
  prev?: { count: number; settledRate: number };
}

function reviewWindow(
  sessions: RoutineSession[],
  from: number,
  to: number,
): { count: number; withOutcome: number; settledCount: number } {
  const inWin = sessions.filter((s) => s.startedAt >= from && s.startedAt < to);
  const withOutcome = inWin.filter((s) => s.settled != null);
  const settledCount = withOutcome.filter((s) => s.settled === true).length;
  return { count: inWin.length, withOutcome: withOutcome.length, settledCount };
}

/** Summarise the last 7 days of routine sessions (vs the week before). */
export function weeklyReview(
  sessions: RoutineSession[],
  now: number,
): WeeklyReview {
  const from = now - 7 * DAY;
  const week = sessions.filter(
    (s) => s.startedAt >= from && s.startedAt <= now,
  );

  const withOutcome = week.filter((s) => s.settled != null);
  const settled = withOutcome.filter((s) => s.settled === true);
  const settleMins = settled
    .map((s) => s.settleMinutes)
    .filter((m): m is number => m != null);
  const avgSettleMinutes = settleMins.length
    ? Math.round(settleMins.reduce((a, b) => a + b, 0) / settleMins.length)
    : undefined;

  // Counts per type, busiest first.
  const typeCounts = new Map<RoutineSessionType, number>();
  for (const s of week)
    typeCounts.set(s.type, (typeCounts.get(s.type) ?? 0) + 1);
  const byType: WeeklyReviewType[] = Array.from(typeCounts.entries())
    .map(([type, count]) => {
      const cfg = routineTypeConfig(type);
      return { type, label: cfg.label, emoji: cfg.emoji, count };
    })
    .sort((a, b) => b.count - a.count);

  // Hours where settling / unsettled sessions cluster.
  const hourCounts = new Array<number>(24).fill(0);
  for (const s of week) {
    if (s.type === 'settling' || s.settled === false) {
      hourCounts[new Date(s.startedAt).getHours()]++;
    }
  }
  const fussiestHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((h) => h.hour);

  const prevWin = reviewWindow(sessions, now - 14 * DAY, from);

  return {
    from,
    to: now,
    count: week.length,
    withOutcome: withOutcome.length,
    settledCount: settled.length,
    settledRate: withOutcome.length ? settled.length / withOutcome.length : 0,
    avgSettleMinutes,
    topMethods: methodStats(week, { minTried: 1 }).slice(0, 5),
    byType,
    fussiestHours,
    prev: prevWin.count
      ? {
          count: prevWin.count,
          settledRate: prevWin.withOutcome
            ? prevWin.settledCount / prevWin.withOutcome
            : 0,
        }
      : undefined,
  };
}

export interface BestRoutineNow {
  hour: number;
  /** Where the suggestion came from. */
  basis: 'time' | 'overall' | 'none';
  /** How many sessions the suggestion is drawn from. */
  basedOnSessions: number;
  /** Best methods to try, strongest first (success rate > 0 only). */
  methods: MethodStat[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * A deterministic "what's worked at about this time" suggestion. Prefers
 * sessions started within ±`windowHours` of the current clock-hour; if there's
 * too little there, it falls back to what's worked overall. Pure + offline.
 */
export function bestRoutineNow(
  sessions: RoutineSession[],
  now: number,
  opts: { windowHours?: number; limit?: number } = {},
): BestRoutineNow {
  const { windowHours = 2, limit = 3 } = opts;
  const hour = new Date(now).getHours();

  const near = sessions.filter(
    (s) =>
      s.endedAt != null &&
      hourDistance(new Date(s.startedAt).getHours(), hour) <= windowHours,
  );

  const pick = (
    pool: RoutineSession[],
    basis: 'time' | 'overall',
  ): BestRoutineNow | null => {
    const stats = methodStats(pool, { minTried: 1 }).filter(
      (m) => m.successRate > 0,
    );
    if (!stats.length) return null;
    const methods = stats.slice(0, limit);
    const triedTotal = methods.reduce((a, m) => a + m.tried, 0);
    const confidence: BestRoutineNow['confidence'] =
      triedTotal >= 6 ? 'high' : triedTotal >= 3 ? 'medium' : 'low';
    return { hour, basis, basedOnSessions: pool.length, methods, confidence };
  };

  return (
    pick(near, 'time') ??
    pick(
      sessions.filter((s) => s.endedAt != null),
      'overall',
    ) ?? {
      hour,
      basis: 'none',
      basedOnSessions: 0,
      methods: [],
      confidence: 'low',
    }
  );
}
