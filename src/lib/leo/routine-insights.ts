/**
 * Routine insights — PURE aggregation over logged data (unit tested).
 *
 * Powers the "what might help right now?" adviser and (later) the daily
 * briefing / pattern watch. It only organises what was logged — it never
 * decides anything medical.
 */
import type {
  DiaperEntry,
  FeedEntry,
  LeoEvent,
  RoutineSession,
  SleepEntry,
} from './types';
import { workedMethods, methodResultMeta } from './routine-session';

const MIN = 60_000;

function latest<T>(list: T[], at: (item: T) => number): T | undefined {
  let best: T | undefined;
  let bestAt = -Infinity;
  for (const item of list) {
    const t = at(item);
    if (t > bestAt) {
      bestAt = t;
      best = item;
    }
  }
  return best;
}

const minsSince = (ts: number | undefined, now: number): number | undefined =>
  ts == null ? undefined : Math.max(0, Math.round((now - ts) / MIN));

export interface CurrentStateInput {
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  activeSleep: SleepEntry | null;
  events: LeoEvent[];
  sessions: RoutineSession[];
  now: number;
}

export interface CurrentState {
  minsSinceFeed?: number;
  minsSinceNappy?: number;
  /** Minutes since the last completed sleep ended. */
  minsSinceSleep?: number;
  isAsleep: boolean;
  /** Minutes awake (since last sleep ended); undefined if asleep/unknown. */
  awakeMins?: number;
  hourOfDay: number;
  /** Cues logged on the most recent (open or very recent) session. */
  recentCues: string[];
}

/** A snapshot of where Leo is right now, from the logs. */
export function currentState(input: CurrentStateInput): CurrentState {
  const { feeds, diapers, sleeps, activeSleep, events, sessions, now } = input;

  const lastFeed = latest(feeds, (f) => f.endedAt ?? f.startedAt);
  const lastNappy = latest(diapers, (d) => d.changedAt);
  const completedSleeps = sleeps.filter((s) => s.endedAt != null);
  const lastSleep = latest(completedSleeps, (s) => s.endedAt as number);

  const isAsleep = activeSleep != null && activeSleep.endedAt == null;
  const minsSinceSleep = minsSince(lastSleep?.endedAt, now);

  // Cues from the most recent session within ~2h (open sessions included).
  const recentSession = sessions
    .filter((s) => now - s.startedAt <= 2 * 60 * MIN)
    .sort((a, b) => b.startedAt - a.startedAt)[0];
  const recentCues = recentSession
    ? Array.from(
        new Set([
          ...(recentSession.sleepCues ?? []),
          ...(recentSession.hungerCues ?? []),
          ...(recentSession.contextTags ?? []),
          ...(recentSession.windSigns ?? []),
        ]),
      )
    : [];

  return {
    minsSinceFeed: minsSince(lastFeed?.endedAt ?? lastFeed?.startedAt, now),
    minsSinceNappy: minsSince(lastNappy?.changedAt, now),
    minsSinceSleep,
    isAsleep,
    awakeMins: isAsleep ? undefined : minsSinceSleep,
    hourOfDay: new Date(now).getHours(),
    recentCues,
  };
}

export interface MethodStat {
  method: string;
  tried: number;
  wins: number;
  /** wins / tried, 0..1. */
  successRate: number;
}

/**
 * Success rate per settling method across sessions. `contextTag` restricts to
 * sessions whose `contextTags` include it (e.g. only "Overtired" moments).
 * Sorted by success rate, then by how often it was tried.
 */
export function methodStats(
  sessions: RoutineSession[],
  opts: { contextTag?: string; minTried?: number } = {},
): MethodStat[] {
  const { contextTag, minTried = 1 } = opts;
  const relevant = contextTag
    ? sessions.filter((s) => (s.contextTags ?? []).includes(contextTag))
    : sessions;

  const byMethod = new Map<string, { tried: number; wins: number }>();
  for (const s of relevant) {
    for (const m of s.methods ?? []) {
      const cur = byMethod.get(m.method) ?? { tried: 0, wins: 0 };
      cur.tried++;
      if (methodResultMeta(m.result).positivity > 0) cur.wins++;
      byMethod.set(m.method, cur);
    }
  }

  return Array.from(byMethod.entries())
    .map(([method, { tried, wins }]) => ({
      method,
      tried,
      wins,
      successRate: tried ? wins / tried : 0,
    }))
    .filter((s) => s.tried >= minTried)
    .sort((a, b) => b.successRate - a.successRate || b.tried - a.tried);
}

export interface SimilarSession {
  session: RoutineSession;
  worked: string[];
}

/**
 * Past (ended) sessions started at a similar time of day to `now`, newest
 * first, each with the methods that worked. Powers "the last few times around
 * now, X settled him".
 */
export function similarPastSessions(
  sessions: RoutineSession[],
  now: number,
  opts: { windowHours?: number; limit?: number } = {},
): SimilarSession[] {
  const { windowHours = 2, limit = 5 } = opts;
  const hour = new Date(now).getHours();

  const hourDistance = (h: number) => {
    const d = Math.abs(h - hour);
    return Math.min(d, 24 - d); // wrap around midnight
  };

  return sessions
    .filter((s) => s.endedAt != null)
    .filter(
      (s) => hourDistance(new Date(s.startedAt).getHours()) <= windowHours,
    )
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit)
    .map((session) => ({ session, worked: workedMethods(session) }));
}
