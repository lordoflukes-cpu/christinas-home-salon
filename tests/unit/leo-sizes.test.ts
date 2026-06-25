import { describe, it, expect } from 'vitest';
import {
  suggestNappySize,
  suggestClothingSize,
  suggestSize,
  currentSize,
  nappyNearlyOutgrown,
} from '@/lib/leo/sizes';
import type { SizeEntry } from '@/lib/leo/types';

const size = (
  kind: SizeEntry['kind'],
  label: string,
  startedAt: number,
): SizeEntry => ({
  id: `${kind}-${startedAt}`,
  kind,
  size: label,
  startedAt,
  createdAt: 0,
  updatedAt: 0,
});

describe('nappy size suggestion', () => {
  it('picks the smallest size that still fits the weight', () => {
    expect(suggestNappySize(4000)).toBe('Size 1'); // ≤5kg
    expect(suggestNappySize(5500)).toBe('Size 2'); // >5kg
    expect(suggestNappySize(9500)).toBe('Size 3'); // 6–10kg band
    expect(suggestNappySize(12000)).toBe('Size 4'); // >10kg → Size 4 (≤14)
  });
  it('returns null without a weight', () => {
    expect(suggestNappySize(undefined)).toBeNull();
  });
});

describe('clothing size suggestion', () => {
  it('uses weight bands first', () => {
    expect(suggestClothingSize(3000)).toBe('First size'); // ≤3.4kg
    expect(suggestClothingSize(5000)).toBe('0–3 months'); // ≤6.4kg
  });
  it('falls back to age when no weight', () => {
    expect(suggestClothingSize(undefined, 10)).toBe('Up to 1 month');
    expect(suggestClothingSize(undefined, 120)).toBe('3–6 months');
  });
  it('shoe has no suggestion', () => {
    expect(suggestSize('shoe', 5000, 30)).toBeNull();
  });
});

describe('currentSize', () => {
  it('returns the most recently started size for a kind', () => {
    const sizes = [
      size('nappy', 'Size 1', 1000),
      size('nappy', 'Size 2', 5000),
      size('clothing', '0–3 months', 4000),
    ];
    expect(currentSize(sizes, 'nappy')?.size).toBe('Size 2');
    expect(currentSize(sizes, 'clothing')?.size).toBe('0–3 months');
    expect(currentSize(sizes, 'shoe')).toBeUndefined();
  });
});

describe('nappyNearlyOutgrown', () => {
  it('flags when weight nears the size max', () => {
    expect(nappyNearlyOutgrown('Size 1', 4800)).toBe(true); // max 5kg
    expect(nappyNearlyOutgrown('Size 1', 3000)).toBe(false);
    expect(nappyNearlyOutgrown(undefined, 4800)).toBeNull();
  });
});
