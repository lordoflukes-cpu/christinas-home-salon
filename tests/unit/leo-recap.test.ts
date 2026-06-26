import { describe, it, expect } from 'vitest';
import {
  monthWindow,
  listMonths,
  deriveRecap,
  effectiveRecap,
  RECAP_FIELDS,
} from '@/lib/leo/recap';
import type {
  GrowthEntry,
  JournalEntry,
  MilestoneEntry,
  MonthlyRecap,
  PhotoEntry,
} from '@/lib/leo/types';

const BIRTH = new Date(2026, 5, 24, 22, 54).getTime(); // 24 Jun 2026

function addMonths(ms: number, n: number) {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}
const inMonth = (idx: number, dayOffset = 1) =>
  addMonths(BIRTH, idx - 1) + dayOffset * 86_400_000;

const growth = (measuredAt: number, weightGrams: number): GrowthEntry => ({
  id: 'g' + measuredAt,
  measuredAt,
  weightGrams,
  createdAt: 0,
  updatedAt: 0,
});
const milestone = (p: Partial<MilestoneEntry>): MilestoneEntry => ({
  id: 'm' + (p.achievedAt ?? 0),
  achievedAt: inMonth(1),
  title: 'A milestone',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});
const journal = (p: Partial<JournalEntry>): JournalEntry => ({
  id: 'j' + (p.writtenAt ?? 0),
  writtenAt: inMonth(1),
  body: 'text',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});
const photo = (p: Partial<PhotoEntry>): PhotoEntry => ({
  id: 'p' + (p.takenAt ?? 0),
  takenAt: inMonth(1),
  bytes: new ArrayBuffer(2),
  type: 'image/jpeg',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});

describe('monthWindow / listMonths', () => {
  it('month 1 starts at birth and spans one calendar month', () => {
    const w = monthWindow(BIRTH, 1);
    expect(w.start).toBe(BIRTH);
    expect(w.end).toBe(addMonths(BIRTH, 1));
  });
  it('lists newest month first and includes the current month', () => {
    const now = addMonths(BIRTH, 2) + 5 * 86_400_000; // partway into month 3
    const months = listMonths(BIRTH, now);
    expect(months[0]).toBe(3);
    expect(months[months.length - 1]).toBe(1);
  });
  it('always has at least month 1', () => {
    expect(listMonths(BIRTH, BIRTH + 1000)).toEqual([1]);
  });
});

describe('deriveRecap', () => {
  const sources = {
    birth: BIRTH,
    growth: [growth(inMonth(1, 10), 4200), growth(inMonth(1, 20), 4600)],
    milestones: [
      milestone({
        achievedAt: inMonth(1, 12),
        title: 'First smile',
        category: 'social',
        emotion: 'funny',
        location: 'Home',
        whoThere: 'Nanny',
      }),
    ],
    journal: [
      journal({
        writtenAt: inMonth(1, 14),
        category: 'message',
        author: 'Daddy',
        body: 'Welcome little lion.',
      }),
      journal({
        writtenAt: inMonth(1, 15),
        category: 'message',
        author: 'Mummy',
        body: 'My whole heart.',
      }),
      journal({
        writtenAt: inMonth(1, 16),
        category: 'hard',
        body: 'The colic nights were tough.',
      }),
    ],
    photos: [
      photo({ takenAt: inMonth(1, 5) }),
      photo({ id: 'fav', takenAt: inMonth(1, 9), favourite: true }),
    ],
  };

  it('derives weight, skill, messages, places, people and best photo', () => {
    const r = deriveRecap(1, sources);
    expect(r.weight).toContain('kg'); // latest weight ≤ end → 4.6 kg
    expect(r.weight).toContain('4.6');
    expect(r.newSkill).toContain('First smile');
    expect(r.messageFromDad).toBe('Welcome little lion.');
    expect(r.messageFromMum).toBe('My whole heart.');
    expect(r.hardest).toContain('colic');
    expect(r.placesVisited).toBe('Home');
    expect(r.peopleMet).toBe('Nanny');
    expect(r.bestPhotoId).toBe('fav'); // favourite beats latest
  });

  it('returns empty fields for a month with no data', () => {
    const r = deriveRecap(5, sources);
    expect(r.newSkill).toBeUndefined();
    expect(r.bestPhotoId).toBeUndefined();
    // weight carries forward the last known measurement before the window end
    expect(r.weight).toContain('kg');
  });
});

describe('effectiveRecap', () => {
  it('lets saved overrides win over auto values', () => {
    const auto = { newSkill: 'Rolled over', funniest: 'auto funny' };
    const saved = {
      id: 'm1',
      monthIndex: 1,
      newSkill: 'Held a rattle',
      favouriteThing: 'Bath time',
      createdAt: 0,
      updatedAt: 0,
    } as MonthlyRecap;
    const eff = effectiveRecap(auto, saved);
    expect(eff.newSkill).toBe('Held a rattle'); // override wins
    expect(eff.funniest).toBe('auto funny'); // falls back to auto
    expect(eff.favouriteThing).toBe('Bath time'); // manual-only field
  });

  it('covers every recap field key', () => {
    const eff = effectiveRecap({}, undefined);
    for (const f of RECAP_FIELDS) {
      expect(f.key in eff).toBe(true);
    }
  });
});
