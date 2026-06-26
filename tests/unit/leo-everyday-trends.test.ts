import { describe, it, expect } from 'vitest';
import {
  dailySeries,
  hourlySeries,
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

describe('dailySeries — night/day sleep split', () => {
  it('splits a midnight-spanning sleep into night and (later) day', () => {
    // 22:00 today → 08:00 tomorrow. But we only have up to NOW(15:00) today,
    // so use a fully-past night: 22:00 two days ago → 08:00 yesterday.
    const twoNightsAgo = startOfNow - 2 * DAY + 22 * HOUR; // 22:00
    const endNextMorning = startOfNow - 1 * DAY + 8 * HOUR; // 08:00 yesterday
    const series = dailySeries(
      { feeds: [], diapers: [], sleeps: [sleep(twoNightsAgo, endNextMorning)] },
      7,
      NOW,
    );
    const yesterday = series[5];
    // Yesterday 00:00–08:00: night [00:00,07:00)=7h, day [07:00,08:00)=1h.
    expect(yesterday.nightSleepMs).toBe(7 * HOUR);
    expect(yesterday.daySleepMs).toBe(1 * HOUR);
    expect(yesterday.sleepMs).toBe(8 * HOUR);
  });

  it('classifies an afternoon nap entirely as day sleep', () => {
    const napStart = startOfNow + 13 * HOUR; // 13:00 today
    const series = dailySeries(
      { feeds: [], diapers: [], sleeps: [sleep(napStart, napStart + HOUR)] },
      7,
      NOW,
    );
    expect(series[6].daySleepMs).toBe(HOUR);
    expect(series[6].nightSleepMs).toBe(0);
  });
});

describe('hourlySeries', () => {
  it('returns 24 zeroed buckets for an empty day', () => {
    const hours = hourlySeries(
      { feeds: [], diapers: [], sleeps: [] },
      startOfNow,
      NOW,
    );
    expect(hours).toHaveLength(24);
    expect(hours.every((h, i) => h.hour === i && h.sleepMs === 0)).toBe(true);
  });

  it('buckets feeds and nappies by their local hour', () => {
    const hours = hourlySeries(
      {
        feeds: [feed(startOfNow + 9 * HOUR)],
        diapers: [diaper(startOfNow + 9 * HOUR + 600_000, 'both')],
        sleeps: [],
      },
      startOfNow,
      NOW,
    );
    expect(hours[9].feeds).toBe(1);
    expect(hours[9].wet).toBe(1);
    expect(hours[9].dirty).toBe(1);
  });

  it('spreads a sleep across the hours it covers', () => {
    const start = startOfNow + 1 * HOUR + 30 * 60_000; // 01:30
    const end = startOfNow + 3 * HOUR; // 03:00
    const hours = hourlySeries(
      { feeds: [], diapers: [], sleeps: [sleep(start, end)] },
      startOfNow,
      NOW,
    );
    expect(hours[1].sleepMs).toBe(30 * 60_000); // 01:30–02:00
    expect(hours[2].sleepMs).toBe(HOUR); // 02:00–03:00
    expect(hours[3].sleepMs).toBe(0);
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
