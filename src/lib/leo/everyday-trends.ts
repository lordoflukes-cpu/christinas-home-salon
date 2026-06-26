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
  feeds: number;
  wet: number;
  dirty: number;
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
    out.push({ dayStart, sleepMs: 0, feeds: 0, wet: 0, dirty: 0 });
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
    // Add the overlap of [start,end) with each day window it touches.
    let cursor = startOfDay(Math.max(start, firstStart));
    while (cursor < end && cursor < lastEnd) {
      const winStart = cursor;
      const winEnd = cursor + DAY;
      const overlap = Math.min(end, winEnd) - Math.max(start, winStart);
      const idx = indexByStart.get(winStart);
      if (idx != null && overlap > 0) out[idx].sleepMs += overlap;
      cursor = winEnd;
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
