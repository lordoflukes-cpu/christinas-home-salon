import { describe, it, expect } from 'vitest';
import {
  currentState,
  methodStats,
  similarPastSessions,
} from '@/lib/leo/routine-insights';
import type {
  DiaperEntry,
  FeedEntry,
  RoutineSession,
  SleepEntry,
} from '@/lib/leo';

const NOW = new Date(2026, 6, 1, 20, 0).getTime(); // 8pm
const MIN = 60_000;
const HOUR = 3_600_000;

function feed(startedAt: number, endedAt?: number): FeedEntry {
  return {
    id: 'f' + startedAt,
    type: 'bottle',
    startedAt,
    endedAt,
    amountMl: 90,
    contents: 'formula',
    createdAt: 0,
    updatedAt: 0,
  };
}
function diaper(changedAt: number): DiaperEntry {
  return {
    id: 'd' + changedAt,
    type: 'wet',
    changedAt,
    createdAt: 0,
    updatedAt: 0,
  };
}
function sleep(startedAt: number, endedAt?: number): SleepEntry {
  return {
    id: 's' + startedAt,
    startedAt,
    endedAt,
    createdAt: 0,
    updatedAt: 0,
  };
}
function session(over: Partial<RoutineSession>): RoutineSession {
  return {
    id: 'r' + (over.startedAt ?? 0),
    type: 'settling',
    startedAt: NOW - HOUR,
    endedAt: NOW - 50 * MIN,
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

describe('currentState', () => {
  it('computes minutes-since, awake time and hour of day', () => {
    const st = currentState({
      feeds: [feed(NOW - 40 * MIN)],
      diapers: [diaper(NOW - 20 * MIN)],
      sleeps: [sleep(NOW - 3 * HOUR, NOW - 90 * MIN)],
      activeSleep: null,
      events: [],
      sessions: [],
      now: NOW,
    });
    expect(st.minsSinceFeed).toBe(40);
    expect(st.minsSinceNappy).toBe(20);
    expect(st.minsSinceSleep).toBe(90);
    expect(st.awakeMins).toBe(90);
    expect(st.isAsleep).toBe(false);
    expect(st.hourOfDay).toBe(20);
  });

  it('flags asleep and surfaces recent session cues', () => {
    const st = currentState({
      feeds: [],
      diapers: [],
      sleeps: [],
      activeSleep: sleep(NOW - 10 * MIN),
      events: [],
      sessions: [
        session({
          startedAt: NOW - 30 * MIN,
          sleepCues: ['Yawning'],
          contextTags: ['Overtired'],
        }),
      ],
      now: NOW,
    });
    expect(st.isAsleep).toBe(true);
    expect(st.awakeMins).toBeUndefined();
    expect(st.recentCues).toContain('Yawning');
    expect(st.recentCues).toContain('Overtired');
  });

  it('is safe with no data', () => {
    const st = currentState({
      feeds: [],
      diapers: [],
      sleeps: [],
      activeSleep: null,
      events: [],
      sessions: [],
      now: NOW,
    });
    expect(st.minsSinceFeed).toBeUndefined();
    expect(st.recentCues).toEqual([]);
  });
});

describe('methodStats', () => {
  const sessions = [
    session({
      contextTags: ['Overtired'],
      methods: [
        { method: 'Shoulder cuddle', result: 'worked' },
        { method: 'Dummy', result: 'made_worse' },
      ],
    }),
    session({
      contextTags: ['Overtired'],
      methods: [
        { method: 'Shoulder cuddle', result: 'helped' },
        { method: 'White noise', result: 'worked' },
      ],
    }),
    session({
      contextTags: ['Hungry'],
      methods: [{ method: 'Shoulder cuddle', result: 'no_effect' }],
    }),
  ];

  it('ranks by success rate', () => {
    const stats = methodStats(sessions);
    const cuddle = stats.find((s) => s.method === 'Shoulder cuddle')!;
    expect(cuddle.tried).toBe(3);
    expect(cuddle.wins).toBe(2);
    expect(stats[0].successRate).toBe(1); // White noise, 1/1
  });

  it('respects a context filter', () => {
    const stats = methodStats(sessions, { contextTag: 'Overtired' });
    const cuddle = stats.find((s) => s.method === 'Shoulder cuddle')!;
    expect(cuddle.tried).toBe(2); // the Hungry session is excluded
    expect(cuddle.wins).toBe(2);
  });
});

describe('similarPastSessions', () => {
  it('selects sessions near the same time of day and surfaces worked methods', () => {
    const nearby = session({
      startedAt: new Date(2026, 5, 30, 19, 30).getTime(), // ~same hour, prior day
      endedAt: new Date(2026, 5, 30, 19, 45).getTime(),
      methods: [{ method: 'White noise', result: 'worked' }],
    });
    const farAway = session({
      startedAt: new Date(2026, 5, 30, 8, 0).getTime(), // morning
      endedAt: new Date(2026, 5, 30, 8, 20).getTime(),
      methods: [{ method: 'Feed', result: 'worked' }],
    });
    const got = similarPastSessions([nearby, farAway], NOW, { windowHours: 2 });
    expect(got).toHaveLength(1);
    expect(got[0].worked).toContain('White noise');
  });
});
