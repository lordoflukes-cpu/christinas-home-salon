import { describe, it, expect } from 'vitest';
import { ttsCacheKey } from '@/lib/leo/tts';

describe('ttsCacheKey', () => {
  it('is stable for the same text', () => {
    expect(ttsCacheKey('Time for a feed')).toBe(ttsCacheKey('Time for a feed'));
  });

  it('ignores surrounding whitespace', () => {
    expect(ttsCacheKey('  Goodnight Leo  ')).toBe(ttsCacheKey('Goodnight Leo'));
  });

  it('differs for different text', () => {
    expect(ttsCacheKey('Bottle is warm')).not.toBe(ttsCacheKey('Nappy change'));
  });

  it('is carried by the voice cache version prefix', () => {
    expect(ttsCacheKey('hello')).toMatch(/^v1:/);
  });
});
