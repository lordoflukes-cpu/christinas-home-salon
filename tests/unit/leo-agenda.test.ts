import { describe, it, expect } from 'vitest';
import { buildAgenda, relativeDue } from '@/lib/leo/agenda';
import { DEFAULT_REMINDER_PREFS } from '@/lib/leo/reminders';
import type {
  CareTask,
  FeedEntry,
  MedicalEntry,
  ReminderPrefs,
} from '@/lib/leo';

const HOUR = 3_600_000;
const NOW = new Date(2026, 5, 24, 12, 0, 0, 0).getTime();

const prefs: ReminderPrefs = { ...DEFAULT_REMINDER_PREFS, enabled: true };

const feed = (startedAt: number): FeedEntry => ({
  id: 'f',
  type: 'breast',
  startedAt,
  createdAt: 0,
  updatedAt: 0,
});

const med = (partial: Partial<MedicalEntry>): MedicalEntry => ({
  id: 'm' + Math.round(partial.at ?? 0),
  at: NOW,
  kind: 'appointment',
  title: 'GP check',
  createdAt: 0,
  updatedAt: 0,
  ...partial,
});

const care = (partial: Partial<CareTask>): CareTask => ({
  id: 'c',
  kind: 'binDay',
  label: 'Bin day',
  cadence: 'everyN',
  intervalDays: 1,
  enabled: true,
  anchorAt: NOW,
  createdAt: 0,
  updatedAt: 0,
  ...partial,
});

const base = {
  prefs,
  feeds: [] as FeedEntry[],
  medical: [] as MedicalEntry[],
  activeSleep: null,
  careTasks: [] as CareTask[],
  now: NOW,
};

describe('buildAgenda', () => {
  it('mixes sources and sorts by due time', () => {
    const items = buildAgenda({
      ...base,
      feeds: [feed(NOW - 2 * HOUR)], // due in ~1h (feedHours 3)
      medical: [med({ at: NOW + 5 * HOUR, title: 'Midwife' })],
    });
    const keys = items.map((i) => i.key);
    expect(keys).toContain('feed');
    expect(keys.some((k) => k.startsWith('med-'))).toBe(true);
    // sorted ascending by dueAt
    for (let i = 1; i < items.length; i++) {
      expect(items[i].dueAt).toBeGreaterThanOrEqual(items[i - 1].dueAt);
    }
  });

  it('flags overdue items', () => {
    const items = buildAgenda({
      ...base,
      medical: [
        med({ at: NOW - HOUR, title: 'Overdue jab', kind: 'vaccination' }),
      ],
    });
    const item = items.find((i) => i.title === 'Overdue jab');
    expect(item?.overdue).toBe(true);
    expect(item?.emoji).toBe('💉');
  });

  it('respects the feed toggle (hides the kind entirely)', () => {
    const withFeed = buildAgenda({ ...base, feeds: [feed(NOW - 4 * HOUR)] });
    expect(withFeed.some((i) => i.key === 'feed')).toBe(true);

    const noFeed = buildAgenda({
      ...base,
      prefs: { ...prefs, feed: false },
      feeds: [feed(NOW - 4 * HOUR)],
    });
    expect(noFeed.some((i) => i.key === 'feed')).toBe(false);
  });

  it('omits done medical and far-future items beyond the window', () => {
    const items = buildAgenda({
      ...base,
      medical: [
        med({ at: NOW + HOUR, title: 'Soon', done: true }),
        med({ at: NOW + 10 * 86_400_000, title: 'Far away' }),
      ],
    });
    expect(items.find((i) => i.title === 'Soon')).toBeUndefined();
    expect(items.find((i) => i.title === 'Far away')).toBeUndefined();
  });

  it('includes enabled care tasks and skips disabled ones', () => {
    const items = buildAgenda({
      ...base,
      careTasks: [
        care({ id: 'on', enabled: true, lastDoneAt: NOW - 2 * 86_400_000 }),
        care({ id: 'off', enabled: false }),
      ],
    });
    expect(items.some((i) => i.careTaskId === 'on')).toBe(true);
    expect(items.some((i) => i.careTaskId === 'off')).toBe(false);
    expect(items.find((i) => i.careTaskId === 'on')?.source).toBe('care');
  });
});

describe('relativeDue', () => {
  it('describes past, near and far times', () => {
    expect(relativeDue(NOW - HOUR, NOW)).toBe('overdue');
    expect(relativeDue(NOW + 30 * 60_000, NOW)).toBe('in 30 min');
    expect(relativeDue(NOW + 3 * HOUR, NOW)).toBe('in 3h');
  });
});
