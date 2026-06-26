/**
 * Everyday trends — PURE day-by-day aggregation for the Timeline "Everyday"
 * section's visual (unit tested). Derives from the feeds/nappies/sleep the
 * parents already log; no new store.
 *
 * Reuses the same day-window logic as `summariseDay` (src/lib/leo/summary.ts):
 * a sleep span is counted against each day it overlaps, clamped to that day.
 */
import type { DiaperEntry, FeedEntry, SleepEntry } from './types';
import { startOfDay } from './summary';

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** "Night" sleep is local time in [19:00, 07:00); the rest counts as day naps. */
export const NIGHT_START_HOUR = 19;
export const NIGHT_END_HOUR = 7;

export function isNightHour(hour: number): boolean {
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export interface EverydayInput {
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
}

/** One calendar day's everyday totals. */
export interface DayStat {
  /** Local start-of-day epoch ms (the bucket key). */
  dayStart: number;
  sleepMs: number;
  /** Sleep in night hours [19:00,07:00). Always set by `dailySeries`. */
  nightSleepMs?: number;
  /** Sleep in day hours (the rest). Always set by `dailySeries`. */
  daySleepMs?: number;
  feeds: number;
  wet: number;
  dirty: number;
}

/** Start of the local hour containing `ms`. */
function startOfHour(ms: number): number {
  const d = new Date(ms);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

export type TrendMetric = 'sleep' | 'feeds' | 'nappies';
export type TrendDir = 'up' | 'down' | 'steady';

/** Total nappies for a day (wet + dirty; a "both" counts once to each). */
export function nappyTotal(d: DayStat): number {
  return d.wet + d.dirty;
}

/**
 * Per-day totals for the last `days` days, oldest → newest, including empty
 * days (so the chart has a continuous axis). Sleep that crosses midnight is
 * split across the days it touches.
 */
export function dailySeries(
  input: EverydayInput,
  days: number,
  now: number,
): DayStat[] {
  const today = startOfDay(now);
  const out: DayStat[] = [];
  const indexByStart = new Map<number, number>();

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = today - i * DAY;
    indexByStart.set(dayStart, out.length);
    out.push({
      dayStart,
      sleepMs: 0,
      nightSleepMs: 0,
      daySleepMs: 0,
      feeds: 0,
      wet: 0,
      dirty: 0,
    });
  }

  const firstStart = out[0]?.dayStart ?? today;
  const lastEnd = today + DAY;

  for (const f of input.feeds) {
    const k = startOfDay(f.startedAt);
    const idx = indexByStart.get(k);
    if (idx != null) out[idx].feeds += 1;
  }

  for (const d of input.diapers) {
    const k = startOfDay(d.changedAt);
    const idx = indexByStart.get(k);
    if (idx == null) continue;
    if (d.type === 'wet' || d.type === 'both') out[idx].wet += 1;
    if (d.type === 'dirty' || d.type === 'both') out[idx].dirty += 1;
  }

  for (const s of input.sleeps) {
    const start = s.startedAt;
    const end = s.endedAt ?? now;
    if (end <= firstStart || start >= lastEnd) continue;
    // Walk the span hour-by-hour so each chunk lands in the right day AND is
    // classified night vs day by the local hour it falls in.
    let cursor = Math.max(start, firstStart);
    const stop = Math.min(end, lastEnd);
    while (cursor < stop) {
      const chunkEnd = Math.min(stop, startOfHour(cursor) + HOUR);
      const overlap = chunkEnd - cursor;
      const idx = indexByStart.get(startOfDay(cursor));
      if (idx != null && overlap > 0) {
        out[idx].sleepMs += overlap;
        if (isNightHour(new Date(cursor).getHours())) {
          out[idx].nightSleepMs = (out[idx].nightSleepMs ?? 0) + overlap;
        } else {
          out[idx].daySleepMs = (out[idx].daySleepMs ?? 0) + overlap;
        }
      }
      cursor = chunkEnd;
    }
  }

  return out;
}

export interface HourStat {
  /** 0–23 local hour. */
  hour: number;
  sleepMs: number;
  feeds: number;
  wet: number;
  dirty: number;
}

/**
 * 24 per-hour buckets for a single calendar day (`dayStart` = local midnight).
 * Powers the Day view's hourly timeline. Sleep is clamped to each hour; feeds
 * and nappies are bucketed by their timestamp's local hour.
 */
export function hourlySeries(
  input: EverydayInput,
  dayStart: number,
  now: number,
): HourStat[] {
  const out: HourStat[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sleepMs: 0,
    feeds: 0,
    wet: 0,
    dirty: 0,
  }));
  const dayEnd = dayStart + DAY;

  for (const f of input.feeds) {
    if (f.startedAt >= dayStart && f.startedAt < dayEnd) {
      out[new Date(f.startedAt).getHours()].feeds += 1;
    }
  }

  for (const d of input.diapers) {
    if (d.changedAt < dayStart || d.changedAt >= dayEnd) continue;
    const h = new Date(d.changedAt).getHours();
    if (d.type === 'wet' || d.type === 'both') out[h].wet += 1;
    if (d.type === 'dirty' || d.type === 'both') out[h].dirty += 1;
  }

  for (const s of input.sleeps) {
    const start = Math.max(s.startedAt, dayStart);
    const end = Math.min(s.endedAt ?? now, dayEnd);
    if (end <= start) continue;
    let cursor = start;
    while (cursor < end) {
      const chunkEnd = Math.min(end, startOfHour(cursor) + HOUR);
      out[new Date(cursor).getHours()].sleepMs += chunkEnd - cursor;
      cursor = chunkEnd;
    }
  }

  return out;
}

export interface MetricTrend {
  /** Average per day across the window. */
  avg: number;
  dir: TrendDir;
  /** Signed change vs the previous equal-length window (same unit as avg). */
  delta: number;
}

export interface RangeSummary {
  days: number;
  sleep: MetricTrend;
  feeds: MetricTrend;
  nappies: MetricTrend;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Direction of `cur` vs `prev`, with a small dead-zone so it reads "steady". */
function direction(cur: number, prev: number, epsilon: number): TrendDir {
  const diff = cur - prev;
  if (Math.abs(diff) <= epsilon) return 'steady';
  return diff > 0 ? 'up' : 'down';
}

/**
 * Averages for the window, each with a trend vs the previous equal-length
 * window when supplied. Mirrors the `prev`-delta idea in `weeklyReview`.
 */
export function rangeSummary(
  series: DayStat[],
  prev?: DayStat[],
): RangeSummary {
  const sleepAvg = avg(series.map((d) => d.sleepMs));
  const feedsAvg = avg(series.map((d) => d.feeds));
  const nappiesAvg = avg(series.map((d) => nappyTotal(d)));

  const prevSleep = prev ? avg(prev.map((d) => d.sleepMs)) : sleepAvg;
  const prevFeeds = prev ? avg(prev.map((d) => d.feeds)) : feedsAvg;
  const prevNappies = prev ? avg(prev.map((d) => nappyTotal(d))) : nappiesAvg;

  return {
    days: series.length,
    sleep: {
      avg: sleepAvg,
      delta: sleepAvg - prevSleep,
      // 15-minute dead-zone for "steady" sleep.
      dir: direction(sleepAvg, prevSleep, 15 * 60_000),
    },
    feeds: {
      avg: feedsAvg,
      delta: feedsAvg - prevFeeds,
      dir: direction(feedsAvg, prevFeeds, 0.5),
    },
    nappies: {
      avg: nappiesAvg,
      delta: nappiesAvg - prevNappies,
      dir: direction(nappiesAvg, prevNappies, 0.5),
    },
  };
}

/** The numeric value of a metric for one day (sleep in ms). */
export function dayMetricValue(d: DayStat, metric: TrendMetric): number {
  if (metric === 'sleep') return d.sleepMs;
  if (metric === 'feeds') return d.feeds;
  return nappyTotal(d);
}
