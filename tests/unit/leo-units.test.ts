import { describe, it, expect } from 'vitest';
import {
  gramsToLbOz,
  lbOzToGrams,
  gramsToLbOzParts,
  formatWeight,
  formatLength,
} from '@/lib/leo/units';

describe('weight units', () => {
  it('converts grams to lb/oz', () => {
    expect(gramsToLbOz(3400)).toBe('7 lb 8 oz');
    expect(gramsToLbOz(0)).toBe('0 lb 0 oz');
  });

  it('round-trips lb/oz ↔ grams within a gram or two', () => {
    const g = lbOzToGrams(7, 8);
    const { lb, oz } = gramsToLbOzParts(g);
    expect(lb).toBe(7);
    expect(oz).toBe(8);
  });

  it('formats a full weight label', () => {
    expect(formatWeight(3400)).toContain('kg');
    expect(formatWeight(3400)).toContain('7 lb 8 oz');
  });
});

describe('length units', () => {
  it('formats cm', () => {
    expect(formatLength(51)).toBe('51 cm');
    expect(formatLength(51.25)).toBe('51.3 cm');
  });
});
