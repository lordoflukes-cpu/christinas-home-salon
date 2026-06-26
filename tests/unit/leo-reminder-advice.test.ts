import { describe, it, expect } from 'vitest';
import { parseAdvice, cadenceSnapshot } from '@/lib/leo/reminder-advice';
import type {
  BabyProfile,
  FeedEntry,
  SleepEntry,
  GrowthEntry,
} from '@/lib/leo/types';

const HOUR = 3_600_000;
const DAY = 86_400_000;
const NOW = new Date(2026, 5, 25, 15, 0, 0).getTime();

describe('parseAdvice', () => {
  it('parses and clamps a clean advice object', () => {
    const a = parseAdvice(
      '{"feedHours":3.4,"sleepMaxHours":2,"vitdTime":"09:00","rationale":"Feeds ~3h apart."}',
    );
    expect(a?.feedHours).toBe(3); // rounded
    expect(a?.sleepMaxHours).toBe(2);
    expect(a?.vitdTime).toBe('09:00');
    expect(a?.rationale).toBeTruthy();
  });

  it('strips ```json fences', () => {
    const a = parseAdvice('```json\n{"feedHours":4,"rationale":"ok"}\n```');
    expect(a?.feedHours).toBe(4);
  });

  it('clamps out-of-range hours into the panel range', () => {
    const a = parseAdvice('{"feedHours":99,"rationale":"x"}');
    expect(a?.feedHours).toBe(12);
  });

  it('parses and clamps wake window + bedtime advice', () => {
    const a = parseAdvice(
      '{"wakeWindowMinutes":77.6,"bedtime":"19:00","rationale":"~75 min awake."}',
    );
    expect(a?.wakeWindowMinutes).toBe(78); // rounded
    expect(a?.bedtime).toBe('19:00');
  });

  it('clamps an over-long wake window down to the panel max', () => {
    const a = parseAdvice('{"wakeWindowMinutes":999,"rationale":"x"}');
    expect(a?.wakeWindowMinutes).toBe(240);
  });

  it('returns null without a rationale or on bad JSON', () => {
    expect(parseAdvice('{"feedHours":3}')).toBeNull();
    expect(parseAdvice('not json')).toBeNull();
  });
});

describe('cadenceSnapshot', () => {
  const profile: BabyProfile = {
    id: 'leo',
    name: 'Leo',
    birth: NOW - 60 * DAY,
    updatedAt: NOW,
  };
  function feed(at: number, type: FeedEntry['type'] = 'bottle'): FeedEntry {
    return { id: `f${at}`, type, startedAt: at, createdAt: at, updatedAt: at };
  }
  function sleep(start: number, end: number): SleepEntry {
    return {
      id: `s${start}`,
      startedAt: start,
      endedAt: end,
      createdAt: start,
      updatedAt: start,
    };
  }

  it('summarises age, weight, feed gap and feeding type', () => {
    const growth: GrowthEntry[] = [
      {
        id: 'g1',
        measuredAt: NOW - DAY,
        weightGrams: 5000,
        createdAt: 0,
        updatedAt: 0,
      },
    ];
    const feeds = [
      feed(NOW - 9 * HOUR, 'breast'),
      feed(NOW - 6 * HOUR, 'bottle'),
      feed(NOW - 3 * HOUR, 'bottle'),
    ];
    const text = cadenceSnapshot({
      profile,
      feeds,
      sleeps: [],
      growth,
      now: NOW,
    });
    expect(text).toContain('Age:');
    expect(text).toMatch(/weight/i);
    expect(text).toMatch(/gap between feeds/i);
    expect(text).toMatch(/mixed/i);
  });

  it('falls back to a gentle default when nothing is logged', () => {
    const text = cadenceSnapshot({
      profile: null,
      feeds: [],
      sleeps: [],
      growth: [],
      now: NOW,
    });
    expect(text).toMatch(/not much has been logged/i);
  });

  it('reports a night/day sleep split when sleep exists', () => {
    const sleeps = [sleep(NOW - 10 * HOUR, NOW - 8 * HOUR)];
    const text = cadenceSnapshot({
      profile,
      feeds: [],
      sleeps,
      growth: [],
      now: NOW,
    });
    expect(text).toMatch(/sleep per day/i);
  });
});
