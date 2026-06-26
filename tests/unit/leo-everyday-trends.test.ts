import { describe, it, expect } from 'vitest';
import {
  dailySeries,
  rangeSummary,
  nappyTotal,
  dayMetricValue,
} from '@/lib/leo/everyday-trends';
import type { FeedEntry, DiaperEntry, SleepEntry } from '@/lib/leo/types';

const DAY = 86_400_000;
const HOUR = 3_600_000;
// A fixed "now" mid-afternoon so day windows are unambiguous.
const NOW = new Date(2026, 5, 25, 15, 0, 0).getTime(); // Thu 25 Jun 2026, 15:00

function feed(startedAt: number): FeedEntry {
  return {
    id: `f${startedAt}`,
    type: 'bottle',
    startedAt,
    amountMl: 90,
    createdAt: startedAt,
    updatedAt: startedAt,
  };
}
function diaper(changedAt: number, type: DiaperEntry['type']): DiaperEntry {
  return {
    id: `d${changedAt}-${type}`,
    changedAt,
    type,
    createdAt: changedAt,
    updatedAt: changedAt,
  };
}
function sleep(startedAt: number, endedAt?: number): SleepEntry {
  return {
    id: `s${startedAt}`,
    startedAt,
    endedAt,
    createdAt: startedAt,
    updatedAt: startedAt,
  };
}

const startOfNow = (() => {
  const d = new Date(NOW);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

describe('dailySeries', () => {
  it('returns one continuous bucket per day, oldest first, including empty days', () => {
    const series = dailySeries({ feeds: [], diapers: [], sleeps: [] }, 7, NOW);
    expect(series).toHaveLength(7);
    expect(series[6].dayStart).toBe(startOfNow); // last = today
    expect(series[0].dayStart).toBe(startOfNow - 6 * DAY);
    expect(series.every((d) => d.feeds === 0 && d.sleepMs === 0)).toBe(true);
  });

  it('buckets feeds and nappies into the right day', () => {
    const series = dailySeries(
      {
        feeds: [feed(NOW), feed(NOW - 2 * HOUR), feed(NOW - DAY)],
        diapers: [
          diaper(NOW, 'wet'),
          diaper(NOW, 'both'),
          diaper(NOW - DAY, 'dirty'),
        ],
        sleeps: [],
      },
      7,
      NOW,
    );
    const today = series[6];
    const yesterday = series[5];
    expect(today.feeds).toBe(2);
    expect(today.wet).toBe(2); // wet + both
    expect(today.dirty).toBe(1); // both
    expect(nappyTotal(today)).toBe(3);
    expect(yesterday.feeds).toBe(1);
    expect(yesterday.dirty).toBe(1);
  });

  it('splits a sleep that crosses midnight across both days', () => {
    // 23:00 yesterday → 01:00 today = 1h each side of midnight.
    const start = startOfNow - 1 * HOUR; // 23:00 yesterday
    const end = startOfNow + 1 * HOUR; // 01:00 today
    const series = dailySeries(
      { feeds: [], diapers: [], sleeps: [sleep(start, end)] },
      7,
      NOW,
    );
    expect(series[5].sleepMs).toBe(HOUR); // yesterday
    expect(series[6].sleepMs).toBe(HOUR); // today
  });

  it('counts an in-progress sleep up to now', () => {
    const series = dailySeries(
      { feeds: [], diapers: [], sleeps: [sleep(NOW - 2 * HOUR)] },
      7,
      NOW,
    );
    expect(series[6].sleepMs).toBe(2 * HOUR);
  });

  it('ignores entries outside the window', () => {
    const series = dailySeries(
      { feeds: [feed(NOW - 30 * DAY)], diapers: [], sleeps: [] },
      7,
      NOW,
    );
    expect(series.reduce((a, d) => a + d.feeds, 0)).toBe(0);
  });
});

describe('rangeSummary', () => {
  it('averages each metric across the window', () => {
    const series = dailySeries(
      {
        feeds: [feed(NOW), feed(NOW - DAY)],
        diapers: [diaper(NOW, 'wet'), diaper(NOW - DAY, 'dirty')],
        sleeps: [sleep(NOW - 2 * HOUR)],
      },
      2,
      NOW,
    );
    const sum = rangeSummary(series);
    expect(sum.days).toBe(2);
    expect(sum.feeds.avg).toBe(1); // 2 feeds / 2 days
    expect(sum.nappies.avg).toBe(1); // 2 nappies / 2 days
  });

  it('reports an up/down/steady trend vs the previous window', () => {
    const cur = [
      { dayStart: 0, sleepMs: 10 * HOUR, feeds: 8, wet: 5, dirty: 3 },
    ];
    const less = [
      { dayStart: 0, sleepMs: 5 * HOUR, feeds: 4, wet: 2, dirty: 1 },
    ];
    const up = rangeSummary(cur, less);
    expect(up.sleep.dir).toBe('up');
    expect(up.feeds.dir).toBe('up');
    expect(up.feeds.delta).toBe(4);

    const down = rangeSummary(less, cur);
    expect(down.sleep.dir).toBe('down');

    const steady = rangeSummary(cur, cur);
    expect(steady.sleep.dir).toBe('steady');
    expect(steady.feeds.dir).toBe('steady');
  });
});

describe('dayMetricValue', () => {
  it('returns the right number per metric', () => {
    const d = { dayStart: 0, sleepMs: 3 * HOUR, feeds: 6, wet: 4, dirty: 2 };
    expect(dayMetricValue(d, 'sleep')).toBe(3 * HOUR);
    expect(dayMetricValue(d, 'feeds')).toBe(6);
    expect(dayMetricValue(d, 'nappies')).toBe(6);
  });
});
