import { describe, it, expect } from 'vitest';
import {
  ageInWeeks,
  ageInMonthsCalendar,
  ageBadges,
  ageCelebration,
} from '@/lib/leo/age';

const BIRTH = new Date(2026, 5, 25, 22, 50).getTime(); // 25 Jun 2026

describe('age units', () => {
  it('counts whole weeks', () => {
    expect(ageInWeeks(BIRTH, new Date(2026, 6, 9, 9, 0).getTime())).toBe(2);
  });

  it('counts calendar months', () => {
    expect(
      ageInMonthsCalendar(BIRTH, new Date(2026, 8, 25, 9, 0).getTime()),
    ).toBe(3);
    // a day before the 3-month mark is still 2 months
    expect(
      ageInMonthsCalendar(BIRTH, new Date(2026, 8, 24, 9, 0).getTime()),
    ).toBe(2);
  });
});

describe('ageBadges', () => {
  it('shows days only in the first week', () => {
    expect(ageBadges(BIRTH, new Date(2026, 5, 28, 9, 0).getTime())).toEqual([
      '3 days',
    ]);
  });
  it('adds weeks and months as they accrue', () => {
    const badges = ageBadges(BIRTH, new Date(2026, 7, 25, 9, 0).getTime());
    expect(badges).toContain('2 months');
  });
});

describe('ageCelebration', () => {
  it('celebrates a monthiversary', () => {
    expect(ageCelebration(BIRTH, new Date(2026, 6, 25, 9, 0).getTime())).toBe(
      '1 month old today 🎂',
    );
  });
  it('celebrates the first birthday', () => {
    expect(ageCelebration(BIRTH, new Date(2027, 5, 25, 9, 0).getTime())).toBe(
      'Happy 1st birthday 🎂🦁',
    );
  });
  it('is null on a normal day', () => {
    expect(
      ageCelebration(BIRTH, new Date(2026, 6, 10, 9, 0).getTime()),
    ).toBeNull();
  });
});
