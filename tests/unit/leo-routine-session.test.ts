import { describe, it, expect } from 'vitest';
import {
  buildHandover,
  sessionDuration,
  templateSteps,
  methodResultMeta,
  workedMethods,
} from '@/lib/leo/routine-session';
import {
  SESSION_TEMPLATES,
  ROUTINE_TYPES,
  SETTLING_METHODS,
  METHOD_RESULTS,
  CONTEXT_TAGS,
  SLEEP_CUES,
  HUNGER_CUES,
  WIND_SIGNS,
} from '@/lib/leo/routine-templates';
import type {
  BabyProfile,
  DiaperEntry,
  FeedEntry,
  RoutineSession,
  SleepEntry,
} from '@/lib/leo';

const NOW = new Date(2026, 6, 1, 14, 0).getTime();
const HOUR = 3_600_000;

const profile: BabyProfile = {
  id: 'leo',
  name: 'Leo',
  birth: new Date(2026, 5, 24).getTime(),
  updatedAt: 0,
};

function session(over: Partial<RoutineSession>): RoutineSession {
  return {
    id: 's1',
    type: 'settling',
    startedAt: NOW - HOUR,
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

describe('templateSteps', () => {
  it('returns the bedtime/nap steps and empty for settling', () => {
    expect(templateSteps('bedtime')).toEqual(SESSION_TEMPLATES.bedtime);
    expect(templateSteps('bedtime').length).toBeGreaterThan(3);
    expect(templateSteps('nap')[0]).toBe('Notice sleepy cue');
    expect(templateSteps('settling')).toEqual([]);
  });
});

describe('sessionDuration', () => {
  it('uses now for an open session and endedAt for a closed one', () => {
    expect(sessionDuration(session({ startedAt: NOW - HOUR }), NOW)).toBe(HOUR);
    expect(
      sessionDuration(
        session({ startedAt: NOW - 2 * HOUR, endedAt: NOW - HOUR }),
        NOW,
      ),
    ).toBe(HOUR);
  });
});

describe('methodResultMeta + workedMethods', () => {
  it('maps positivity and filters worked/helped methods', () => {
    expect(methodResultMeta('worked').positivity).toBe(2);
    expect(methodResultMeta('made_worse').positivity).toBeLessThan(0);
    const s = session({
      methods: [
        { method: 'Shoulder cuddle', result: 'worked' },
        { method: 'Dummy', result: 'made_worse' },
        { method: 'White noise', result: 'helped' },
      ],
    });
    expect(workedMethods(s)).toEqual(['Shoulder cuddle', 'White noise']);
  });
});

describe('buildHandover', () => {
  const feeds: FeedEntry[] = [
    {
      id: 'f1',
      type: 'bottle',
      startedAt: NOW - 30 * 60_000,
      amountMl: 90,
      contents: 'formula',
      createdAt: 0,
      updatedAt: 0,
    },
  ];
  const diapers: DiaperEntry[] = [
    {
      id: 'd1',
      type: 'wet',
      changedAt: NOW - 20 * 60_000,
      createdAt: 0,
      updatedAt: 0,
    },
  ];
  const sleeps: SleepEntry[] = [
    {
      id: 'sl1',
      startedAt: NOW - 3 * HOUR,
      endedAt: NOW - 2 * HOUR,
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('includes last feed/nappy/sleep and last session worked methods', () => {
    const sessions = [
      session({
        methods: [
          { method: 'Shoulder cuddle', result: 'worked' },
          { method: 'Dummy', result: 'no_effect' },
        ],
        settled: true,
        settleMinutes: 12,
      }),
    ];
    const text = buildHandover({
      sessions,
      feeds,
      diapers,
      sleeps,
      now: NOW,
      profile,
    });
    expect(text).toContain('Leo — handover');
    expect(text).toContain('Last feed:');
    expect(text).toContain('Last nappy:');
    expect(text).toContain('What worked: Shoulder cuddle');
    expect(text).toContain('settled');
  });

  it('reflects an empty state', () => {
    const text = buildHandover({
      sessions: [],
      feeds: [],
      diapers: [],
      sleeps: [],
      now: NOW,
      profile,
    });
    expect(text).toContain('Nothing logged yet');
  });
});

describe('vocabularies', () => {
  it('are non-empty and unique', () => {
    const lists = [
      ROUTINE_TYPES.map((t) => t.type),
      SETTLING_METHODS,
      METHOD_RESULTS.map((r) => r.result),
      CONTEXT_TAGS,
      SLEEP_CUES,
      HUNGER_CUES,
      WIND_SIGNS,
    ];
    for (const list of lists) {
      expect(list.length).toBeGreaterThan(0);
      expect(new Set(list).size).toBe(list.length);
    }
  });
});
