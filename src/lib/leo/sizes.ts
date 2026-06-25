/**
 * Sizes — UK reference tables + suggestions (pure, unit tested).
 *
 * Baby clothes/nappies are sized mostly by WEIGHT in the UK, so these power
 * "what should Leo be in?" hints from his latest weight. They're guidance only;
 * the actual recorded size is always a free field the owner can override.
 */
import type { SizeEntry, SizeKind } from './types';

const KG = 1000;

/** UK nappy sizes (Pampers-style), weight ranges in grams. Brands vary. */
export const NAPPY_SIZES: { label: string; minG: number; maxG: number }[] = [
  { label: 'Size 1', minG: 2 * KG, maxG: 5 * KG },
  { label: 'Size 2', minG: 4 * KG, maxG: 8 * KG },
  { label: 'Size 3', minG: 6 * KG, maxG: 10 * KG },
  { label: 'Size 4', minG: 9 * KG, maxG: 14 * KG },
  { label: 'Size 4+', minG: 10 * KG, maxG: 15 * KG },
  { label: 'Size 5', minG: 11 * KG, maxG: 16 * KG },
  { label: 'Size 6', minG: 13 * KG, maxG: 18 * KG },
];

/** UK clothing age bands with an upper weight guide (grams). */
export const UK_CLOTHING_SIZES: { label: string; maxG: number }[] = [
  { label: 'Tiny baby', maxG: 2.3 * KG },
  { label: 'First size', maxG: 3.4 * KG },
  { label: 'Up to 1 month', maxG: 4.5 * KG },
  { label: '0–3 months', maxG: 6.4 * KG },
  { label: '3–6 months', maxG: 8 * KG },
  { label: '6–9 months', maxG: 9 * KG },
  { label: '9–12 months', maxG: 10 * KG },
  { label: '12–18 months', maxG: 11.5 * KG },
  { label: '18–24 months', maxG: 13 * KG },
];

/** Common picks for the size form chips, per kind. */
export const SIZE_OPTIONS: Record<SizeKind, string[]> = {
  clothing: UK_CLOTHING_SIZES.map((s) => s.label),
  nappy: ['Newborn', ...NAPPY_SIZES.map((s) => s.label)],
  shoe: [
    'UK 0.5',
    'UK 1',
    'UK 1.5',
    'UK 2',
    'UK 2.5',
    'UK 3',
    'EU 16',
    'EU 17',
    'EU 18',
  ],
};

const DAY = 86_400_000;

/** Suggested nappy size for a weight — smallest size that still fits up to. */
export function suggestNappySize(weightGrams?: number): string | null {
  if (!weightGrams) return null;
  const hit = NAPPY_SIZES.find((s) => weightGrams <= s.maxG);
  return (hit ?? NAPPY_SIZES[NAPPY_SIZES.length - 1]).label;
}

/** Suggested clothing band, preferring weight; falls back to age in days. */
export function suggestClothingSize(
  weightGrams?: number,
  ageDays?: number,
): string | null {
  if (weightGrams) {
    const hit = UK_CLOTHING_SIZES.find((s) => weightGrams <= s.maxG);
    return (hit ?? UK_CLOTHING_SIZES[UK_CLOTHING_SIZES.length - 1]).label;
  }
  if (ageDays == null) return null;
  const months = ageDays / 30.4;
  if (months < 1) return 'Up to 1 month';
  if (months < 3) return '0–3 months';
  if (months < 6) return '3–6 months';
  if (months < 9) return '6–9 months';
  if (months < 12) return '9–12 months';
  if (months < 18) return '12–18 months';
  return '18–24 months';
}

export function suggestSize(
  kind: SizeKind,
  weightGrams?: number,
  ageDays?: number,
): string | null {
  if (kind === 'nappy') return suggestNappySize(weightGrams);
  if (kind === 'clothing') return suggestClothingSize(weightGrams, ageDays);
  return null; // shoe — manual
}

/** The current (most recently started) size for a kind. */
export function currentSize(
  sizes: SizeEntry[],
  kind: SizeKind,
): SizeEntry | undefined {
  return sizes
    .filter((s) => s.kind === kind)
    .reduce<
      SizeEntry | undefined
    >((best, s) => (!best || s.startedAt > best.startedAt ? s : best), undefined);
}

/**
 * Is the current nappy nearly outgrown? True when weight is within ~0.5kg of
 * the labelled size's max. Returns null when not assessable.
 */
export function nappyNearlyOutgrown(
  sizeLabel: string | undefined,
  weightGrams?: number,
): boolean | null {
  if (!sizeLabel || !weightGrams) return null;
  const band = NAPPY_SIZES.find((s) => s.label === sizeLabel);
  if (!band) return null;
  return weightGrams >= band.maxG - 0.5 * KG;
}

/** Days since a size was started. */
export function daysInSize(startedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - startedAt) / DAY));
}
