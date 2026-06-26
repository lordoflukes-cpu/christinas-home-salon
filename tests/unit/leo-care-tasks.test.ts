import { describe, it, expect } from 'vitest';
import {
  CARE_TASK_PRESETS,
  careDueState,
  careEmoji,
  nextCareDue,
  presetToCareTask,
} from '@/lib/leo/care-tasks';
import type { CareTask } from '@/lib/leo/types';

const DAY = 86_400_000;

function task(partial: Partial<CareTask>): CareTask {
  return {
    id: 't',
    kind: 'custom',
    label: 'Task',
    cadence: 'daily',
    enabled: true,
    anchorAt: 0,
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

// A fixed local reference: noon on a known day.
const NOON = new Date(2026, 5, 24, 12, 0, 0, 0).getTime();

describe('nextCareDue', () => {
  it('everyN repeats intervalDays after the last completion', () => {
    const t = task({
      cadence: 'everyN',
      intervalDays: 14,
      lastDoneAt: NOON,
    });
    expect(nextCareDue(t, NOON)).toBe(NOON + 14 * DAY);
  });

  it('everyN counts from the anchor when never done', () => {
    const t = task({ cadence: 'everyN', intervalDays: 7, anchorAt: NOON });
    expect(nextCareDue(t, NOON)).toBe(NOON + 7 * DAY);
  });

  it('daily rolls to the next day after completion at its time', () => {
    const t = task({ cadence: 'daily', timeHHMM: '20:00', lastDoneAt: NOON });
    const due = nextCareDue(t, NOON);
    const d = new Date(due);
    expect(d.getHours()).toBe(20);
    // done at noon today → due 8pm the same evening (after noon)
    expect(due).toBeGreaterThan(NOON);
    expect(due - NOON).toBeLessThan(DAY);
  });

  it('weekly lands on the configured weekday', () => {
    // weekday 2 = Tuesday
    const t = task({ cadence: 'weekly', weekday: 2, timeHHMM: '07:00' });
    const due = nextCareDue(t, NOON);
    expect(new Date(due).getDay()).toBe(2);
    expect(new Date(due).getHours()).toBe(7);
  });
});

describe('careDueState', () => {
  it('is overdue when the due time has passed', () => {
    const t = task({
      cadence: 'everyN',
      intervalDays: 1,
      lastDoneAt: NOON - 3 * DAY,
    });
    expect(careDueState(t, NOON)).toBe('overdue');
  });

  it('is later when the next occurrence is well in the future', () => {
    const t = task({
      cadence: 'everyN',
      intervalDays: 30,
      lastDoneAt: NOON,
    });
    expect(careDueState(t, NOON)).toBe('later');
  });
});

describe('presets', () => {
  it('offers the six built-in tasks, all starting disabled', () => {
    expect(CARE_TASK_PRESETS).toHaveLength(6);
    const seeded = CARE_TASK_PRESETS.map((p) => presetToCareTask(p, NOON));
    expect(seeded.every((t) => t.enabled === false)).toBe(true);
    expect(seeded.every((t) => t.anchorAt === NOON)).toBe(true);
  });

  it('careEmoji falls back to a bell for custom tasks', () => {
    expect(careEmoji('binDay')).toBe('🗑️');
    expect(careEmoji('custom')).toBe('🔔');
  });
});
