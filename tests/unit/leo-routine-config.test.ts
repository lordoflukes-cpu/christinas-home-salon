import { describe, it, expect } from 'vitest';
import { ROUTINE_CATEGORIES, routineConfig } from '@/lib/leo/routine-config';
import type { RoutineCategory } from '@/lib/leo/types';

describe('routine config', () => {
  it('covers all seven categories exactly once', () => {
    const cats = ROUTINE_CATEGORIES.map((c) => c.category);
    const expected: RoutineCategory[] = [
      'morning',
      'bedtime',
      'settling',
      'sleepCues',
      'hungerCues',
      'worked',
      'didntWork',
    ];
    expect(new Set(cats).size).toBe(cats.length);
    expect([...cats].sort()).toEqual([...expected].sort());
  });

  it('only the routine categories are ordered, only settling is rateable', () => {
    const ordered = ROUTINE_CATEGORIES.filter((c) => c.ordered).map(
      (c) => c.category,
    );
    const rateable = ROUTINE_CATEGORIES.filter((c) => c.rateable).map(
      (c) => c.category,
    );
    expect(ordered.sort()).toEqual(['bedtime', 'morning']);
    expect(rateable).toEqual(['settling']);
  });

  it('every category has a placeholder and a title', () => {
    for (const c of ROUTINE_CATEGORIES) {
      expect(c.placeholder.length).toBeGreaterThan(0);
      expect(c.title.length).toBeGreaterThan(0);
    }
  });

  it('routineConfig looks up by category and falls back to the first', () => {
    expect(routineConfig('bedtime').title).toBe('Bedtime routine');
    // unknown value falls back to the first entry rather than throwing
    expect(routineConfig('nope' as RoutineCategory)).toBe(
      ROUTINE_CATEGORIES[0],
    );
  });
});
