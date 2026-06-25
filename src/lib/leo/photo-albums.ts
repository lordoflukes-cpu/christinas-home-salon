/**
 * Photo organising helpers — month-of-life albums + preset tags. Pure/tested.
 */
import type { PhotoEntry } from './types';
import { ageInMonthsCalendar } from './age';

/** Suggested tags for quick, consistent tagging. */
export const PHOTO_TAGS = [
  'smile',
  'sleep',
  'family',
  'bath',
  'hospital',
  'firsts',
  'food',
  'outside',
];

/** Month-of-life index for a photo (0 = first month). Pre-birth clamps to 0. */
export function monthOfLife(birth: number, takenAt: number): number {
  return Math.max(0, ageInMonthsCalendar(birth, takenAt));
}

/** Album label, e.g. "Month 1". */
export function monthAlbumLabel(birth: number, takenAt: number): string {
  return `Month ${monthOfLife(birth, takenAt) + 1}`;
}

export interface MonthAlbum {
  key: number;
  label: string;
  items: PhotoEntry[];
}

/**
 * Group photos into month-of-life albums, newest month first, photos within a
 * month newest first. Needs the birth date; without it, returns a single album.
 */
export function groupByMonth(
  photos: PhotoEntry[],
  birth?: number,
): MonthAlbum[] {
  if (birth == null) {
    return photos.length
      ? [{ key: 0, label: 'All photos', items: photos }]
      : [];
  }
  const map = new Map<number, PhotoEntry[]>();
  for (const p of photos) {
    const m = monthOfLife(birth, p.takenAt);
    const list = map.get(m) ?? [];
    list.push(p);
    map.set(m, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([key, items]) => ({
      key,
      label: `Month ${key + 1}`,
      items: items.sort((a, b) => b.takenAt - a.takenAt),
    }));
}
