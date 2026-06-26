import { describe, it, expect } from 'vitest';
import { briefingCacheKey, briefingDismissKey } from '@/lib/leo/briefing';

const D1 = new Date(2026, 6, 1, 7, 0).getTime();
const D1_LATER = new Date(2026, 6, 1, 23, 0).getTime();
const D2 = new Date(2026, 6, 2, 7, 0).getTime();

describe('briefing cache keys', () => {
  it('are stable within a day and change across days', () => {
    expect(briefingCacheKey(D1)).toBe(briefingCacheKey(D1_LATER));
    expect(briefingCacheKey(D1)).not.toBe(briefingCacheKey(D2));
    expect(briefingCacheKey(D1)).toContain('2026-07-01');
  });

  it('dismiss key is distinct from the cache key', () => {
    expect(briefingDismissKey(D1)).not.toBe(briefingCacheKey(D1));
    expect(briefingDismissKey(D1)).toContain('dismissed');
  });
});
