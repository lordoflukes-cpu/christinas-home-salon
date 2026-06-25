import { describe, it, expect } from 'vitest';
import {
  summariseDay,
  formatHourRange,
  startOfDay,
  type DayInput,
} from '@/lib/leo/summary';
import type {
  FeedEntry,
  DiaperEntry,
  SleepEntry,
  LeoEvent,
} from '@/lib/leo/types';

const NOW = new Date(2026, 5, 25, 21, 0).getTime(); // 25 Jun 2026, 9pm

const feed = (h: number): FeedEntry => {
  const at = new Date(2026, 5, 25, h).getTime();
  return {
    id: 'f' + h,
    type: 'breast',
    startedAt: at,
    createdAt: at,
    updatedAt: at,
  };
};
const nappy = (h: number, type: DiaperEntry['type']): DiaperEntry => {
  const at = new Date(2026, 5, 25, h).getTime();
  return {
    id: 'd' + h + type,
    type,
    changedAt: at,
    createdAt: at,
    updatedAt: at,
  };
};
const cry = (h: number): LeoEvent => {
  const at = new Date(2026, 5, 25, h).getTime();
  return { id: 'c' + h, kind: 'cry', at, createdAt: at, updatedAt: at };
};

const base: DayInput = {
  feeds: [],
  diapers: [],
  sleeps: [],
  events: [],
  now: NOW,
  name: 'Leo',
};

describe('summariseDay', () => {
  it('counts feeds, wet/dirty (both counts as each), and sleep', () => {
    const sleep: SleepEntry = {
      id: 's1',
      startedAt: new Date(2026, 5, 25, 1).getTime(),
      endedAt: new Date(2026, 5, 25, 4).getTime(), // 3h
      createdAt: 0,
      updatedAt: 0,
    };
    const s = summariseDay({
      ...base,
      feeds: [feed(6), feed(9), feed(12)],
      diapers: [nappy(6, 'wet'), nappy(9, 'dirty'), nappy(12, 'both')],
      sleeps: [sleep],
    });
    expect(s.feeds).toBe(3);
    expect(s.wet).toBe(2); // wet + both
    expect(s.dirty).toBe(2); // dirty + both
    expect(s.sleepMs).toBe(3 * 3_600_000);
    expect(s.narrative).toContain('3 feeds');
    expect(s.narrative).toContain('2 wet and 2 dirty nappies');
    expect(s.narrative).toContain('3h');
  });

  it('finds the most unsettled 2-hour window', () => {
    const s = summariseDay({ ...base, events: [cry(19), cry(20)] });
    expect(s.unsettledWindow).toEqual({ startHour: 19, endHour: 21 });
    expect(s.narrative).toContain('between 7–9pm');
  });

  it('ignores a single isolated fuss (needs at least two)', () => {
    const s = summariseDay({ ...base, events: [cry(19)] });
    expect(s.unsettledWindow).toBeNull();
  });

  it('handles an empty day', () => {
    expect(summariseDay(base).narrative).toBe('Nothing logged yet today.');
  });

  it('only counts entries from today', () => {
    const yesterday = new Date(2026, 5, 24, 10).getTime();
    const s = summariseDay({
      ...base,
      feeds: [
        {
          id: 'old',
          type: 'breast',
          startedAt: yesterday,
          createdAt: 0,
          updatedAt: 0,
        },
      ],
    });
    expect(s.feeds).toBe(0);
  });
});

describe('formatHourRange', () => {
  it('drops the meridiem on the start when it matches', () => {
    expect(formatHourRange(19, 21)).toBe('7–9pm');
  });
  it('keeps both when crossing noon', () => {
    expect(formatHourRange(11, 13)).toBe('11am–1pm');
  });
});

describe('startOfDay', () => {
  it('zeroes the time', () => {
    expect(startOfDay(NOW)).toBe(new Date(2026, 5, 25, 0, 0, 0, 0).getTime());
  });
});
