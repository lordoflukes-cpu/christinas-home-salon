import { describe, it, expect } from 'vitest';
import { weightGainPerWeek, percentileTrend } from '@/lib/leo/growth-insights';
import type { GrowthEntry } from '@/lib/leo/types';

const BIRTH = new Date(2026, 5, 24).getTime();
const WEEK = 7 * 86_400_000;

const g = (measuredAt: number, weightGrams?: number): GrowthEntry => ({
  id: 'g' + measuredAt,
  measuredAt,
  weightGrams,
  createdAt: 0,
  updatedAt: 0,
});

describe('weightGainPerWeek', () => {
  it('computes grams/week between the last two weights', () => {
    const out = weightGainPerWeek([g(BIRTH, 3000), g(BIRTH + 2 * WEEK, 3400)]);
    expect(out?.gramsPerWeek).toBe(200);
    expect(out?.text).toContain('200 g/week');
  });
  it('returns null with fewer than two weights', () => {
    expect(weightGainPerWeek([g(BIRTH, 3000)])).toBeNull();
  });
});

describe('percentileTrend', () => {
  it('returns a percentile + steady/up/down with friendly text', () => {
    const trend = percentileTrend('weight', BIRTH, [
      g(BIRTH, 3300),
      g(BIRTH + 4 * WEEK, 4500),
    ]);
    expect(trend).not.toBeNull();
    expect(trend!.pct).toBeGreaterThan(0);
    expect(['up', 'down', 'steady']).toContain(trend!.direction);
    expect(trend!.text).toMatch(/centile/);
  });
  it('is null without measurements', () => {
    expect(percentileTrend('weight', BIRTH, [])).toBeNull();
  });
});
