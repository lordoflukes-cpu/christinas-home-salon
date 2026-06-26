import { describe, it, expect } from 'vitest';
import { weeklyReview, bestRoutineNow } from '@/lib/leo/routine-review';
import type { RoutineSession, MethodResult } from '@/lib/leo/types';

const DAY = 86_400_000;
const NOW = new Date(2026, 5, 25, 20, 0, 0).getTime(); // Thu 20:00

let seq = 0;
function session(
  startedAt: number,
  extra: Partial<RoutineSession> = {},
): RoutineSession {
  seq += 1;
  return {
    id: `s${seq}`,
    type: 'settling',
    startedAt,
    endedAt: startedAt + 30 * 60_000,
    createdAt: startedAt,
    updatedAt: startedAt,
    ...extra,
  };
}

function method(name: string, result: MethodResult) {
  return { method: name, result };
}

describe('weeklyReview', () => {
  it('counts only sessions inside the 7-day window', () => {
    const r = weeklyReview(
      [
        session(NOW - 1 * DAY),
        session(NOW - 6 * DAY),
        session(NOW - 9 * DAY), // outside
      ],
      NOW,
    );
    expect(r.count).toBe(2);
  });

  it('computes settled rate and average settle minutes over outcomes', () => {
    const r = weeklyReview(
      [
        session(NOW - 1 * DAY, { settled: true, settleMinutes: 10 }),
        session(NOW - 2 * DAY, { settled: true, settleMinutes: 20 }),
        session(NOW - 3 * DAY, { settled: false }),
        session(NOW - 4 * DAY, { settled: undefined }), // no outcome
      ],
      NOW,
    );
    expect(r.withOutcome).toBe(3);
    expect(r.settledCount).toBe(2);
    expect(r.settledRate).toBeCloseTo(2 / 3, 5);
    expect(r.avgSettleMinutes).toBe(15);
  });

  it('ranks methods by success and surfaces them as topMethods', () => {
    const r = weeklyReview(
      [
        session(NOW - 1 * DAY, {
          methods: [method('Rocking', 'worked'), method('Dummy', 'made_worse')],
        }),
        session(NOW - 2 * DAY, { methods: [method('Rocking', 'worked')] }),
      ],
      NOW,
    );
    expect(r.topMethods[0].method).toBe('Rocking');
    expect(r.topMethods[0].successRate).toBe(1);
  });

  it('identifies the fussiest clock-hours', () => {
    const at = (daysAgo: number, h: number) => {
      const d = new Date(NOW - daysAgo * DAY);
      d.setHours(h, 0, 0, 0);
      return d.getTime();
    };
    const r = weeklyReview(
      [
        session(at(1, 2), { type: 'settling' }),
        session(at(2, 2), { type: 'settling' }),
        session(at(3, 15), { type: 'nap', settled: true }), // not fussy
      ],
      NOW,
    );
    expect(r.fussiestHours[0]).toBe(2);
  });

  it('includes a previous-week comparison when there is prior data', () => {
    const r = weeklyReview(
      [
        session(NOW - 1 * DAY, { settled: true }),
        session(NOW - 10 * DAY, { settled: false }),
      ],
      NOW,
    );
    expect(r.prev?.count).toBe(1);
    expect(r.prev?.settledRate).toBe(0);
  });
});

describe('bestRoutineNow', () => {
  it('prefers methods from sessions around the current time of day', () => {
    const sameHour = (daysAgo: number) => {
      const d = new Date(NOW - daysAgo * DAY);
      d.setHours(20, 0, 0, 0); // matches NOW hour
      return d.getTime();
    };
    const r = bestRoutineNow(
      [
        session(sameHour(1), { methods: [method('White noise', 'worked')] }),
        session(sameHour(2), { methods: [method('White noise', 'worked')] }),
      ],
      NOW,
    );
    expect(r.basis).toBe('time');
    expect(r.methods[0].method).toBe('White noise');
  });

  it('falls back to overall winners when nothing is near this hour', () => {
    const farHour = (daysAgo: number) => {
      const d = new Date(NOW - daysAgo * DAY);
      d.setHours(6, 0, 0, 0); // far from 20:00
      return d.getTime();
    };
    const r = bestRoutineNow(
      [session(farHour(1), { methods: [method('Rocking', 'worked')] })],
      NOW,
    );
    expect(r.basis).toBe('overall');
    expect(r.methods[0].method).toBe('Rocking');
  });

  it('reports a none basis when there is nothing useful', () => {
    const r = bestRoutineNow([], NOW);
    expect(r.basis).toBe('none');
    expect(r.methods).toHaveLength(0);
  });

  it('never suggests a method that only ever made things worse', () => {
    const sameHour = new Date(NOW).getTime();
    const r = bestRoutineNow(
      [session(sameHour, { methods: [method('Dummy', 'made_worse')] })],
      NOW,
    );
    expect(r.methods.find((m) => m.method === 'Dummy')).toBeUndefined();
  });
});
