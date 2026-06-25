/**
 * "Today Summary" — pure day aggregation for the dashboard (unit tested).
 *
 * Produces the counts and a friendly narrative line, e.g.
 * "Leo slept 13h 20m today, had 7 feeds, 5 wet nappies and 3 dirty nappies,
 *  and seemed most unsettled between 7–9pm."
 */
import type { DiaperEntry, FeedEntry, LeoEvent, SleepEntry } from './types';
import { formatElapsed } from './age';

export interface DaySummary {
  sleepMs: number;
  feeds: number;
  wet: number;
  dirty: number;
  /** Peak 2-hour window of fussiness, or null if nothing notable. */
  unsettledWindow: { startHour: number; endHour: number } | null;
  narrative: string;
}

export interface DayInput {
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  events: LeoEvent[];
  now: number;
  name?: string;
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Format a 24h hour as a short 12h label, e.g. 7→"7am", 19→"7pm", 0→"12am". */
export function formatHour(h: number): string {
  const hour = ((h % 24) + 24) % 24;
  const period = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}${period}`;
}

/** "7–9pm" (drops the am/pm on the start when it matches the end). */
export function formatHourRange(startHour: number, endHour: number): string {
  const startPeriod = startHour % 24 < 12 ? 'am' : 'pm';
  const endPeriod = endHour % 24 < 12 ? 'am' : 'pm';
  const start =
    startPeriod === endPeriod
      ? formatHour(startHour).replace(/[ap]m$/, '')
      : formatHour(startHour);
  return `${start}–${formatHour(endHour)}`;
}

function plural(n: number, one: string, many = one + 's'): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function summariseDay(input: DayInput): DaySummary {
  const { feeds, diapers, sleeps, events, now } = input;
  const name = input.name?.trim() || 'Leo';
  const since = startOfDay(now);

  const feedsToday = feeds.filter((f) => f.startedAt >= since).length;

  const napsToday = diapers.filter((d) => d.changedAt >= since);
  const wet = napsToday.filter(
    (d) => d.type === 'wet' || d.type === 'both',
  ).length;
  const dirty = napsToday.filter(
    (d) => d.type === 'dirty' || d.type === 'both',
  ).length;

  const sleepMs = sleeps
    .filter((s) => (s.endedAt ?? now) >= since)
    .reduce((sum, s) => {
      const start = Math.max(s.startedAt, since);
      const end = s.endedAt ?? now;
      return sum + Math.max(0, end - start);
    }, 0);

  // Fussiness: cry events + unsettled/fussy moods today, bucketed by hour.
  const fussyTimes = events
    .filter((e) => e.at >= since)
    .filter(
      (e) =>
        e.kind === 'cry' ||
        (e.kind === 'mood' && (e.mood === 'unsettled' || e.mood === 'fussy')),
    )
    .map((e) => new Date(e.at).getHours());

  const unsettledWindow = peakWindow(fussyTimes);

  // --- Narrative ----------------------------------------------------------
  const parts: string[] = [];
  if (sleepMs > 0) parts.push(`slept ${formatElapsed(sleepMs)}`);
  if (feedsToday > 0) parts.push(`had ${plural(feedsToday, 'feed')}`);
  const nappyBits: string[] = [];
  if (wet > 0) nappyBits.push(`${wet} wet`);
  if (dirty > 0) nappyBits.push(`${dirty} dirty`);
  if (nappyBits.length)
    parts.push(
      `${nappyBits.join(' and ')} ${dirty + wet === 1 ? 'nappy' : 'nappies'}`,
    );

  const unsettledClause = unsettledWindow
    ? `seemed most unsettled between ${formatHourRange(
        unsettledWindow.startHour,
        unsettledWindow.endHour,
      )}`
    : null;

  let narrative: string;
  if (parts.length === 0 && !unsettledClause) {
    narrative = `Nothing logged yet today.`;
  } else if (parts.length === 0) {
    narrative = `${name} ${unsettledClause} today.`;
  } else {
    narrative = `${name} ${joinWithCommas(parts)} today`;
    if (unsettledClause) narrative += `, and ${unsettledClause}`;
    narrative += '.';
  }

  return { sleepMs, feeds: feedsToday, wet, dirty, unsettledWindow, narrative };
}

/** Find the 2-hour window with the most fussy events (needs at least 2). */
function peakWindow(
  hours: number[],
): { startHour: number; endHour: number } | null {
  if (hours.length < 2) return null;
  const buckets = new Array(24).fill(0);
  for (const h of hours) buckets[h]++;
  let bestStart = 0;
  let bestCount = 0;
  for (let h = 0; h < 23; h++) {
    const count = buckets[h] + buckets[h + 1];
    if (count > bestCount) {
      bestCount = count;
      bestStart = h;
    }
  }
  if (bestCount < 2) return null;
  return { startHour: bestStart, endHour: bestStart + 2 };
}

function joinWithCommas(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
