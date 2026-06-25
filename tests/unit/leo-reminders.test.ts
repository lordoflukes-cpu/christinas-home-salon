import { describe, it, expect } from 'vitest';
import {
  computeReminders,
  nextDailyTime,
  DEFAULT_REMINDER_PREFS,
  type ReminderPrefs,
} from '@/lib/leo/reminders';
import type { FeedEntry, MedicalEntry, SleepEntry } from '@/lib/leo/types';

const ON: ReminderPrefs = { ...DEFAULT_REMINDER_PREFS, enabled: true };
const NOW = new Date(2026, 5, 25, 12, 0, 0).getTime();

function feed(startedAt: number, extra: Partial<FeedEntry> = {}): FeedEntry {
  return {
    id: 'f' + startedAt,
    type: 'breast',
    startedAt,
    side: 'L',
    createdAt: startedAt,
    updatedAt: startedAt,
    ...extra,
  };
}

describe('computeReminders', () => {
  it('schedules nothing when disabled', () => {
    expect(
      computeReminders({
        prefs: DEFAULT_REMINDER_PREFS,
        feeds: [feed(NOW)],
        medical: [],
        activeSleep: null,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('schedules a feed reminder feedHours after the last feed', () => {
    const r = computeReminders({
      prefs: { ...ON, vitd: false },
      feeds: [feed(NOW - 60_000), feed(NOW)],
      medical: [],
      activeSleep: null,
      now: NOW,
    });
    const fr = r.find((x) => x.key === 'feed');
    expect(fr).toBeTruthy();
    expect(fr!.fireAt).toBe(NOW + 3 * 3_600_000);
  });

  it('uses endedAt for the feed baseline when present', () => {
    const ended = NOW + 5 * 60_000;
    const r = computeReminders({
      prefs: { ...ON, vitd: false },
      feeds: [feed(NOW, { endedAt: ended })],
      medical: [],
      activeSleep: null,
      now: NOW,
    });
    expect(r.find((x) => x.key === 'feed')!.fireAt).toBe(ended + 3 * 3_600_000);
  });

  it('reminds before an upcoming appointment but skips done/past ones', () => {
    const med: MedicalEntry[] = [
      {
        id: 'm1',
        at: NOW + 6 * 3_600_000,
        kind: 'vaccination',
        title: '8-week jabs',
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: 'm2',
        at: NOW + 6 * 3_600_000,
        kind: 'appointment',
        title: 'Done one',
        done: true,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ];
    const r = computeReminders({
      prefs: { ...ON, vitd: false, feed: false },
      feeds: [],
      medical: med,
      activeSleep: null,
      now: NOW,
    });
    expect(r.map((x) => x.key)).toEqual(['med-m1']);
    expect(r[0].fireAt).toBe(NOW + 6 * 3_600_000 - 120 * 60_000);
  });

  it('schedules a long-nap nudge only for a running sleep', () => {
    const active: SleepEntry = {
      id: 's1',
      startedAt: NOW,
      createdAt: NOW,
      updatedAt: NOW,
    };
    const r = computeReminders({
      prefs: { ...ON, vitd: false, feed: false },
      feeds: [],
      medical: [],
      activeSleep: active,
      now: NOW,
    });
    expect(r.find((x) => x.key === 'sleep')!.fireAt).toBe(NOW + 3 * 3_600_000);
  });

  it('drops reminders whose time has already passed', () => {
    // last feed long ago → feed reminder is in the past → filtered out
    const r = computeReminders({
      prefs: { ...ON, vitd: false },
      feeds: [feed(NOW - 10 * 3_600_000)],
      medical: [],
      activeSleep: null,
      now: NOW,
    });
    expect(r.find((x) => x.key === 'feed')).toBeUndefined();
  });
});

describe('nextDailyTime', () => {
  it('returns today if the time is still ahead', () => {
    const t = nextDailyTime('15:00', NOW); // NOW is 12:00
    expect(new Date(t).getHours()).toBe(15);
    expect(t).toBeGreaterThan(NOW);
    expect(t - NOW).toBe(3 * 3_600_000);
  });

  it('rolls to tomorrow if the time has passed', () => {
    const t = nextDailyTime('09:00', NOW); // NOW is 12:00
    expect(t).toBeGreaterThan(NOW);
    expect(t - NOW).toBe(21 * 3_600_000);
  });
});
