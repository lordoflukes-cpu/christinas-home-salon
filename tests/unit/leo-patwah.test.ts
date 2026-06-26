import { describe, it, expect } from 'vitest';
import {
  PATWAH_STRENGTHS,
  PATWAH_SAMPLE,
  patwahReminder,
  patwahStyleInstruction,
  medicationSpeech,
  agendaSpeech,
  type ReminderSpeechKind,
} from '@/lib/leo/patwah';
import type { AgendaItem } from '@/lib/leo';

const KINDS: ReminderSpeechKind[] = [
  'feed',
  'nappy',
  'sleepCue',
  'bedtime',
  'burping',
  'longNap',
  'weeklyPhoto',
  'dailyMemory',
  'unsettled',
];

const PATWAH_MARKERS = /\b(fi|yuh|gwaan|nyam|dung|deh|mek|si|wah|likkle)\b/i;

function agenda(over: Partial<AgendaItem>): AgendaItem {
  return {
    key: 'feed',
    dueAt: 0,
    overdue: false,
    title: 'Feed due',
    emoji: '🍼',
    source: 'reminder',
    ...over,
  };
}

describe('patwahReminder', () => {
  it('returns a non-empty phrase for every kind × strength', () => {
    for (const kind of KINDS) {
      for (const strength of PATWAH_STRENGTHS) {
        const phrase = patwahReminder(kind, strength, { seed: 0 });
        expect(phrase.length).toBeGreaterThan(0);
      }
    }
  });

  it('varies the phrase across seeds (feed has multiple variants)', () => {
    const a = patwahReminder('feed', 'medium', { seed: 0 });
    const b = patwahReminder('feed', 'medium', { seed: 1 });
    expect(a).not.toBe(b);
  });

  it('has a sample line per strength', () => {
    for (const strength of PATWAH_STRENGTHS) {
      expect(PATWAH_SAMPLE[strength].length).toBeGreaterThan(0);
    }
  });
});

describe('patwahStyleInstruction', () => {
  it('differs by strength and always keeps medical facts in clear English', () => {
    const seen = new Set<string>();
    for (const strength of PATWAH_STRENGTHS) {
      const instr = patwahStyleInstruction(strength);
      expect(instr.length).toBeGreaterThan(0);
      expect(instr.toLowerCase()).toContain('patois');
      // the safety carve-out is present at every strength
      expect(instr).toMatch(/medical|medication|dose/i);
      expect(instr).toMatch(/clear standard English/i);
      seen.add(instr);
    }
    expect(seen.size).toBe(PATWAH_STRENGTHS.length);
  });
});

describe('medicationSpeech — always clear English', () => {
  it('includes the dose and time verbatim and stays English', () => {
    const line = medicationSpeech({
      name: 'Calpol',
      dose: '2.5ml',
      time: '8:00pm',
    });
    expect(line).toContain('Calpol');
    expect(line).toContain('2.5ml');
    expect(line).toContain('8:00pm');
    expect(line).toContain('Check the label');
    expect(line).not.toMatch(PATWAH_MARKERS);
  });
});

describe('agendaSpeech', () => {
  it('routes a medical item to clear English (no Patois)', () => {
    const med = agenda({
      key: 'med-1',
      title: 'Medication: Calpol',
      subtitle: '2.5ml',
    });
    const vitd = agenda({
      key: 'vitd',
      title: 'Vitamin D',
      subtitle: undefined,
    });
    for (const strength of PATWAH_STRENGTHS) {
      const m = agendaSpeech(med, strength);
      expect(m).toContain('Calpol');
      expect(m).toContain('2.5ml');
      expect(m).not.toMatch(PATWAH_MARKERS);
      expect(agendaSpeech(vitd, strength)).not.toMatch(PATWAH_MARKERS);
    }
  });

  it('speaks a feed item in Patois (matches the reminder phrase)', () => {
    const feed = agenda({ key: 'feed' });
    expect(agendaSpeech(feed, 'medium', 0)).toBe(
      patwahReminder('feed', 'medium', { seed: 0 }),
    );
  });
});
