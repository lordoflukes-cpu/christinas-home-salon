/**
 * Routine-session helpers — pure + unit tested.
 *
 * `buildHandover` produces the "what's going on with Leo right now" summary one
 * parent hands to the other (or copies for a grandparent / sitter): last feed,
 * nappy and sleep, plus what the most recent settling session tried and what
 * worked. No diagnosis — it organises what was logged.
 */
import type {
  BabyProfile,
  DiaperEntry,
  FeedEntry,
  MethodResult,
  RoutineSession,
  SleepEntry,
} from './types';
import { formatClock, formatElapsed } from './age';
import {
  SESSION_TEMPLATES,
  METHOD_RESULTS,
  routineTypeConfig,
} from './routine-templates';
import type { RoutineSessionType } from './types';
import type { MethodResultConfig } from './routine-templates';

/** Duration of a session in ms (uses `now` while it's still open). */
export function sessionDuration(session: RoutineSession, now: number): number {
  return Math.max(0, (session.endedAt ?? now) - session.startedAt);
}

/** The starter step list for a session type (empty for settling/custom). */
export function templateSteps(type: RoutineSessionType): string[] {
  return SESSION_TEMPLATES[type] ?? [];
}

/** Display metadata for a method result (label/emoji/positivity). */
export function methodResultMeta(result: MethodResult): MethodResultConfig {
  return (
    METHOD_RESULTS.find((r) => r.result === result) ?? {
      result,
      label: result,
      emoji: '•',
      positivity: 0,
    }
  );
}

/** Methods from a session that worked or helped (positivity > 0). */
export function workedMethods(session: RoutineSession): string[] {
  return (session.methods ?? [])
    .filter((m) => methodResultMeta(m.result).positivity > 0)
    .map((m) => m.method);
}

function mostRecent<T>(list: T[], at: (item: T) => number): T | undefined {
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

function ago(ts: number | undefined, now: number): string {
  if (ts == null) return 'not logged';
  return `${formatClock(ts)} (${formatElapsed(Math.max(0, now - ts))} ago)`;
}

export interface HandoverInput {
  sessions: RoutineSession[];
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  now: number;
  profile?: BabyProfile | null;
}

/**
 * Build the multi-line parent-handover summary. Reflects an empty state
 * gracefully ("Nothing logged yet").
 */
export function buildHandover(input: HandoverInput): string {
  const { sessions, feeds, diapers, sleeps, now, profile } = input;
  const name = profile?.name?.trim() || 'Leo';

  const lastFeed = mostRecent(feeds, (f) => f.startedAt);
  const lastDiaper = mostRecent(diapers, (d) => d.changedAt);
  const lastSleep = mostRecent(sleeps, (s) => s.startedAt);
  const lastSession = mostRecent(sessions, (s) => s.startedAt);

  const lines: string[] = [`${name} — handover`, ''];

  lines.push(`Last feed: ${ago(lastFeed?.startedAt, now)}`);
  lines.push(`Last nappy: ${ago(lastDiaper?.changedAt, now)}`);

  if (lastSleep) {
    const sleepState = lastSleep.endedAt
      ? `slept, woke ${ago(lastSleep.endedAt, now)}`
      : `asleep since ${ago(lastSleep.startedAt, now)}`;
    lines.push(`Last sleep: ${sleepState}`);
  } else {
    lines.push('Last sleep: not logged');
  }

  if (lastSession) {
    lines.push('');
    const cfg = routineTypeConfig(lastSession.type);
    lines.push(
      `Last routine: ${cfg.label} (started ${ago(lastSession.startedAt, now)})`,
    );
    const tried = (lastSession.methods ?? []).map(
      (m) => `${m.method} — ${methodResultMeta(m.result).label}`,
    );
    if (tried.length) lines.push(`Tried: ${tried.join('; ')}`);
    const worked = workedMethods(lastSession);
    if (worked.length) lines.push(`What worked: ${worked.join(', ')}`);
    if (lastSession.settled != null) {
      lines.push(
        lastSession.settled
          ? `Outcome: settled${
              lastSession.settleMinutes != null
                ? ` in ${lastSession.settleMinutes} min`
                : ''
            }`
          : 'Outcome: not settled yet',
      );
    }
    if (lastSession.note?.trim())
      lines.push(`Note: ${lastSession.note.trim()}`);
  }

  // Likely-next-need: a gentle hint, never medical.
  if (lastFeed) {
    const sinceFeedH = (now - lastFeed.startedAt) / 3_600_000;
    if (sinceFeedH >= 2.5) {
      lines.push('');
      lines.push('Next likely need: probably due a feed soon.');
    }
  }

  const hasAnything = lastFeed || lastDiaper || lastSleep || lastSession;
  if (!hasAnything) {
    return `${name} — handover\n\nNothing logged yet.`;
  }

  return lines.join('\n');
}
