import { describe, it, expect } from 'vitest';
import {
  formatAudioDuration,
  VOICE_CATEGORIES,
  voiceCategory,
} from '@/lib/leo/voice';
import type { VoiceCategory } from '@/lib/leo/types';

describe('formatAudioDuration', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatAudioDuration(0)).toBe('0:00');
    expect(formatAudioDuration(5_000)).toBe('0:05');
    expect(formatAudioDuration(42_000)).toBe('0:42');
    expect(formatAudioDuration(75_000)).toBe('1:15');
    expect(formatAudioDuration(600_000)).toBe('10:00');
  });
  it('handles undefined / negative gracefully', () => {
    expect(formatAudioDuration(undefined)).toBe('0:00');
    expect(formatAudioDuration(-5_000)).toBe('0:00');
  });
  it('rounds to the nearest second', () => {
    expect(formatAudioDuration(1_400)).toBe('0:01');
    expect(formatAudioDuration(1_600)).toBe('0:02');
  });
});

describe('VOICE_CATEGORIES', () => {
  it('covers the five tags exactly once with label + emoji', () => {
    const cats = VOICE_CATEGORIES.map((c) => c.category);
    const expected: VoiceCategory[] = [
      'funny',
      'proud',
      'emotional',
      'message',
      'firstSound',
    ];
    expect(new Set(cats).size).toBe(cats.length);
    expect([...cats].sort()).toEqual([...expected].sort());
    for (const c of VOICE_CATEGORIES) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.emoji.length).toBeGreaterThan(0);
    }
  });

  it('voiceCategory looks up by value and is null for none/unknown', () => {
    expect(voiceCategory('firstSound')?.label).toBe('First sound');
    expect(voiceCategory(undefined)).toBeNull();
    expect(voiceCategory('nope' as VoiceCategory)).toBeNull();
  });
});
