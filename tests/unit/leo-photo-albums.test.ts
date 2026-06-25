import { describe, it, expect } from 'vitest';
import {
  monthOfLife,
  monthAlbumLabel,
  groupByMonth,
} from '@/lib/leo/photo-albums';
import type { PhotoEntry } from '@/lib/leo/types';

const BIRTH = new Date(2026, 5, 24).getTime(); // 24 Jun 2026

const photo = (takenAt: number): PhotoEntry => ({
  id: 'p' + takenAt,
  takenAt,
  bytes: new ArrayBuffer(1),
  type: 'image/jpeg',
  createdAt: 0,
  updatedAt: 0,
});

describe('month-of-life albums', () => {
  it('labels by month of life', () => {
    expect(monthAlbumLabel(BIRTH, new Date(2026, 5, 30).getTime())).toBe(
      'Month 1',
    );
    expect(monthAlbumLabel(BIRTH, new Date(2026, 7, 1).getTime())).toBe(
      'Month 2',
    );
  });

  it('clamps photos before birth to month 0', () => {
    expect(monthOfLife(BIRTH, new Date(2026, 4, 1).getTime())).toBe(0);
  });

  it('groups newest month first, newest photo first', () => {
    const albums = groupByMonth(
      [
        photo(new Date(2026, 5, 25).getTime()), // month 1
        photo(new Date(2026, 7, 10).getTime()), // month 2
        photo(new Date(2026, 7, 20).getTime()), // month 2
      ],
      BIRTH,
    );
    expect(albums.map((a) => a.label)).toEqual(['Month 2', 'Month 1']);
    expect(albums[0].items).toHaveLength(2);
    expect(albums[0].items[0].takenAt).toBeGreaterThan(
      albums[0].items[1].takenAt,
    );
  });

  it('falls back to a single album without a birth date', () => {
    const albums = groupByMonth([photo(1000)], undefined);
    expect(albums).toHaveLength(1);
    expect(albums[0].label).toBe('All photos');
  });
});
