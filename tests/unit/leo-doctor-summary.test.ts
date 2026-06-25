import { describe, it, expect } from 'vitest';
import { doctorSummary } from '@/lib/leo/doctor-summary';
import type { LeoEvent, FeedEntry, DiaperEntry } from '@/lib/leo/types';

const NOW = new Date(2026, 5, 29, 12, 0).getTime(); // Mon 29 Jun 2026
const DAY = 86_400_000;

const ev = (
  kind: LeoEvent['kind'],
  at: number,
  extra: Partial<LeoEvent> = {},
): LeoEvent => ({
  id: `${kind}-${at}`,
  kind,
  at,
  createdAt: at,
  updatedAt: at,
  ...extra,
});

const base = {
  events: [] as LeoEvent[],
  feeds: [] as FeedEntry[],
  diapers: [] as DiaperEntry[],
  sleeps: [],
  now: NOW,
  days: 7,
  name: 'Leo',
};

describe('doctorSummary', () => {
  it('summarises symptoms with count and onset', () => {
    const events = [
      ev('symptom', NOW - 7 * DAY, { symptom: 'Jitteriness' }),
      ev('symptom', NOW - 5 * DAY, { symptom: 'Jitteriness' }),
      ev('symptom', NOW - DAY, { symptom: 'Jitteriness' }),
    ];
    const out = doctorSummary({ ...base, events });
    expect(out).toContain('jitteriness noted 3×');
    expect(out).toContain('since Mon 22 Jun');
  });

  it('flags fever vs no fever', () => {
    expect(
      doctorSummary({
        ...base,
        events: [ev('temperature', NOW, { tempC: 38.4 })],
      }),
    ).toContain('fever recorded, up to 38.4°C');
    expect(
      doctorSummary({
        ...base,
        events: [ev('temperature', NOW, { tempC: 37 })],
      }),
    ).toContain('no fever (highest 37°C)');
  });

  it('reports feeding per day and medication tallies', () => {
    const feeds: FeedEntry[] = Array.from({ length: 14 }, (_, i) => ({
      id: 'f' + i,
      type: 'breast',
      startedAt: NOW - i * (DAY / 2),
      createdAt: 0,
      updatedAt: 0,
    }));
    const events = [
      ev('medication', NOW - DAY, { medName: 'Calpol' }),
      ev('medication', NOW, { medName: 'Calpol' }),
    ];
    const out = doctorSummary({ ...base, feeds, events });
    expect(out).toContain('about 2 feeds/day');
    expect(out).toContain('Calpol (2×)');
  });

  it('notes unusual nappy colours', () => {
    const diapers: DiaperEntry[] = [
      {
        id: 'd1',
        type: 'dirty',
        changedAt: NOW,
        color: 'Green',
        createdAt: 0,
        updatedAt: 0,
      },
    ];
    const out = doctorSummary({ ...base, diapers });
    expect(out).toContain('colours noted: green');
  });

  it('falls back gracefully with no data', () => {
    const out = doctorSummary(base);
    expect(out).toContain('Symptoms: none logged.');
    expect(out).toContain('Medication: none given.');
  });
});
