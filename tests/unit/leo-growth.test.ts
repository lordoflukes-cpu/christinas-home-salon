import { describe, it, expect } from 'vitest';
import {
  percentileForMeasurement,
  percentileCurve,
  ageInMonths,
} from '@/lib/leo/growth';
import { WHO_BOYS } from '@/lib/leo/who-data';

describe('WHO percentiles', () => {
  it('a measurement equal to the median is ~50th percentile', () => {
    const medianWeight0 = WHO_BOYS.weight[0][1]; // M at month 0 (kg)
    const p = percentileForMeasurement('weight', 0, medianWeight0);
    expect(p).toBeGreaterThan(49);
    expect(p).toBeLessThan(51);
  });

  it('round-trips: value on the P97 curve reads back as ~97th', () => {
    const curve = percentileCurve('weight', 97);
    const at6 = curve.find((c) => c.month === 6)!;
    const p = percentileForMeasurement('weight', 6, at6.value);
    expect(Math.round(p)).toBe(97);
  });

  it('P3 reads back as ~3rd for length', () => {
    const curve = percentileCurve('length', 3);
    const at12 = curve.find((c) => c.month === 12)!;
    const p = percentileForMeasurement('length', 12, at12.value);
    expect(Math.round(p)).toBe(3);
  });

  it('produces a full 0–24 month curve, ascending', () => {
    const curve = percentileCurve('weight', 50);
    expect(curve).toHaveLength(25);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].value).toBeGreaterThan(curve[i - 1].value);
    }
  });

  it('median weight curve matches known WHO values', () => {
    const curve = percentileCurve('weight', 50);
    expect(curve[0].value).toBeCloseTo(3.3464, 2); // birth
    expect(curve[12].value).toBeCloseTo(9.6479, 2); // 1 year
  });

  it('ageInMonths is ~6 for half a year', () => {
    const birth = new Date(2026, 0, 1).getTime();
    const at = new Date(2026, 6, 1).getTime();
    expect(ageInMonths(birth, at)).toBeGreaterThan(5.8);
    expect(ageInMonths(birth, at)).toBeLessThan(6.2);
  });
});
