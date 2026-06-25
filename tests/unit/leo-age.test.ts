import { describe, it, expect } from 'vitest';
import {
  ageInDays,
  formatAge,
  formatElapsed,
  formatDuration,
  sleepDuration,
  formatISODateSafe,
} from '@/lib/leo/age';
import type { SleepEntry } from '@/lib/leo/types';

const BIRTH = new Date(2026, 5, 24, 22, 50).getTime(); // 24 Jun 2026, 10:50pm local

describe('ageInDays', () => {
  it('is 0 on the day of birth (even hours later)', () => {
    const ref = new Date(2026, 5, 24, 23, 59).getTime();
    expect(ageInDays(BIRTH, ref)).toBe(0);
  });

  it('is 1 the next calendar day', () => {
    const ref = new Date(2026, 5, 25, 8, 0).getTime();
    expect(ageInDays(BIRTH, ref)).toBe(1);
  });

  it('counts whole calendar days regardless of time of day', () => {
    const ref = new Date(2026, 5, 27, 1, 0).getTime();
    expect(ageInDays(BIRTH, ref)).toBe(3);
  });

  it('never returns negative for a future birth', () => {
    const ref = new Date(2026, 5, 20, 0, 0).getTime();
    expect(ageInDays(BIRTH, ref)).toBe(0);
  });
});

describe('formatAge', () => {
  it('says "Born today" on day 0', () => {
    expect(formatAge(BIRTH, new Date(2026, 5, 24, 23, 0).getTime())).toBe(
      'Born today',
    );
  });

  it('says "1 day old" on day 1', () => {
    expect(formatAge(BIRTH, new Date(2026, 5, 25, 9, 0).getTime())).toBe(
      '1 day old',
    );
  });

  it('uses days under two weeks', () => {
    expect(formatAge(BIRTH, new Date(2026, 5, 30, 9, 0).getTime())).toBe(
      '6 days old',
    );
  });

  it('switches to weeks at 14 days', () => {
    expect(formatAge(BIRTH, new Date(2026, 6, 8, 9, 0).getTime())).toBe(
      '2 weeks old',
    );
  });

  it('shows weeks + days', () => {
    expect(formatAge(BIRTH, new Date(2026, 6, 10, 9, 0).getTime())).toBe(
      '2 weeks, 2 days old',
    );
  });
});

describe('formatElapsed', () => {
  it('shows "just now" under a minute', () => {
    expect(formatElapsed(30_000)).toBe('just now');
  });
  it('shows minutes', () => {
    expect(formatElapsed(45 * 60_000)).toBe('45m');
  });
  it('shows hours and minutes', () => {
    expect(formatElapsed((2 * 60 + 15) * 60_000)).toBe('2h 15m');
  });
  it('shows whole hours without minutes', () => {
    expect(formatElapsed(3 * 60 * 60_000)).toBe('3h');
  });
  it('shows days and hours', () => {
    expect(formatElapsed(25 * 60 * 60_000)).toBe('1d 1h');
  });
});

describe('formatDuration', () => {
  it('shows minutes', () => {
    expect(formatDuration(12)).toBe('12 min');
  });
  it('shows hours and minutes', () => {
    expect(formatDuration(65)).toBe('1 hr 5 min');
  });
});

describe('sleepDuration', () => {
  const base: SleepEntry = {
    id: 's1',
    startedAt: 1000,
    createdAt: 1000,
    updatedAt: 1000,
  };

  it('uses endedAt when present', () => {
    expect(sleepDuration({ ...base, endedAt: 1000 + 60_000 })).toBe(60_000);
  });

  it('uses ref for an ongoing sleep', () => {
    expect(sleepDuration(base, 1000 + 120_000)).toBe(120_000);
  });
});

describe('formatISODateSafe', () => {
  it('formats local date without UTC drift', () => {
    const ts = new Date(2026, 5, 24, 23, 30).getTime();
    expect(formatISODateSafe(ts)).toBe('2026-06-24');
  });
});
