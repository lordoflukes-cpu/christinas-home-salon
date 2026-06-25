import { describe, it, expect } from 'vitest';
import {
  PROMPTS,
  promptOfTheDay,
  promptByCategory,
} from '@/lib/leo/journal-prompts';

const DAY = 86_400_000;

describe('journal prompts', () => {
  it('has the six prompt categories', () => {
    expect(PROMPTS.map((p) => p.category)).toEqual([
      'funny',
      'sweet',
      'hard',
      'grateful',
      'learned',
      'message',
    ]);
  });

  it('promptOfTheDay is stable within a day and rotates daily', () => {
    const t = 100 * DAY + 5_000_000; // mid-day
    const same = promptOfTheDay(t);
    expect(promptOfTheDay(t + 1000)).toBe(same);
    // next day → next prompt in rotation
    const next = promptOfTheDay(t + DAY);
    expect(next).toBe(PROMPTS[(100 + 1) % PROMPTS.length]);
  });

  it('looks prompts up by category', () => {
    expect(promptByCategory('message')?.label).toContain('Message to Leo');
    expect(promptByCategory(undefined)).toBeUndefined();
  });
});
