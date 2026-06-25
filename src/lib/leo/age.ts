/**
 * Age + elapsed-time helpers for the Leo tracker.
 *
 * Uses native `Date` and the project clock (`now()`) so tests can control time.
 */
import { now } from '@/lib/time/clock';
import type { SleepEntry } from './types';

const MS_PER_DAY = 86_400_000;

function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole days old, compared by local calendar day (DST-safe). */
export function ageInDays(
  birth: number,
  ref: number = now().getTime(),
): number {
  const days = Math.round(
    (startOfLocalDay(ref) - startOfLocalDay(birth)) / MS_PER_DAY,
  );
  return Math.max(0, days);
}

/** Friendly age label: "Born today" / "1 day old" / "3 days old". */
export function formatAge(
  birth: number,
  ref: number = now().getTime(),
): string {
  const days = ageInDays(birth, ref);
  if (days === 0) return 'Born today';
  if (days === 1) return '1 day old';
  if (days < 14) return `${days} days old`;
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;
  const weekLabel = weeks === 1 ? '1 week' : `${weeks} weeks`;
  if (remDays === 0) return `${weekLabel} old`;
  const dayLabel = remDays === 1 ? '1 day' : `${remDays} days`;
  return `${weekLabel}, ${dayLabel} old`;
}

/** Milliseconds elapsed since a timestamp. */
export function elapsedSince(
  ts: number,
  ref: number = now().getTime(),
): number {
  return Math.max(0, ref - ts);
}

/** Compact elapsed label: "just now" / "45m" / "2h 15m" / "1d 3h". */
export function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return 'just now';
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

/** Duration label from a minute count: "12 min" / "1 hr 5 min". */
export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  const hrLabel = `${hours} hr`;
  return minutes > 0 ? `${hrLabel} ${minutes} min` : hrLabel;
}

/** Wall-clock time of a timestamp, en-GB, e.g. "10:50 pm". */
export function formatClock(ts: number): string {
  return new Date(ts)
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
}

/** Short date + time, e.g. "Wed 25 Jun, 10:50 pm". */
export function formatDateTime(ts: number): string {
  const date = new Date(ts).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${date}, ${formatClock(ts)}`;
}

/** Duration of a sleep in ms (uses `ref` for a still-running sleep). */
export function sleepDuration(
  sleep: SleepEntry,
  ref: number = now().getTime(),
): number {
  return Math.max(0, (sleep.endedAt ?? ref) - sleep.startedAt);
}

/** Convert epoch ms to a value for `<input type="datetime-local">`. */
export function toDatetimeLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse a `<input type="datetime-local">` value to epoch ms. */
export function fromDatetimeLocal(value: string): number {
  return new Date(value).getTime();
}

/** Local YYYY-MM-DD for filenames (avoids UTC off-by-one of toISOString). */
export function formatISODateSafe(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
