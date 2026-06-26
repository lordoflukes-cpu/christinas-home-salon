import { describe, it, expect } from 'vitest';
import { buildSlideshow } from '@/lib/leo/slideshow';
import type { TimelineSources } from '@/lib/leo/timeline';
import type {
  BabyProfile,
  JournalEntry,
  MilestoneEntry,
  PhotoEntry,
} from '@/lib/leo/types';

const DAY = 86_400_000;
const BIRTH = new Date(2026, 0, 1).getTime();
const NOW = BIRTH + 200 * DAY;

function photo(id: string, dayOffset: number, favourite = false): PhotoEntry {
  const at = BIRTH + dayOffset * DAY;
  return {
    id,
    takenAt: at,
    bytes: new ArrayBuffer(0),
    type: 'image/jpeg',
    favourite,
    createdAt: at,
    updatedAt: at,
  };
}

function emptySources(over: Partial<TimelineSources>): TimelineSources {
  return {
    profile: null,
    milestones: [],
    journal: [],
    voices: [],
    photos: [],
    growth: [],
    sizes: [],
    medical: [],
    events: [],
    feeds: [],
    diapers: [],
    sleeps: [],
    now: NOW,
    ...over,
  };
}

const profile: BabyProfile = {
  id: 'leo',
  name: 'Leo',
  birth: BIRTH,
  updatedAt: BIRTH,
};

describe('buildSlideshow', () => {
  it('returns photo moments in chronological order (oldest first)', () => {
    const slides = buildSlideshow(
      emptySources({ profile, photos: [photo('b', 3), photo('a', 1)] }),
    );
    expect(slides.map((s) => s.photoId)).toEqual(['a', 'b']);
    expect(slides[0].at).toBeLessThan(slides[1].at);
  });

  it('dedupes a shared photo and keeps the richest caption (milestone over gallery)', () => {
    const milestone: MilestoneEntry = {
      id: 'm1',
      achievedAt: BIRTH + 3 * DAY,
      title: 'First smile',
      photoId: 'b',
      createdAt: BIRTH,
      updatedAt: BIRTH,
    };
    const slides = buildSlideshow(
      emptySources({
        profile,
        photos: [photo('b', 3)],
        milestones: [milestone],
      }),
    );
    expect(slides).toHaveLength(1);
    expect(slides[0].photoId).toBe('b');
    expect(slides[0].title).toBe('First smile'); // not the bare "Photo"
  });

  it('pulls photos from milestones and journal entries too', () => {
    const milestone: MilestoneEntry = {
      id: 'm1',
      achievedAt: BIRTH + 5 * DAY,
      title: 'First smile',
      photoId: 'm-photo',
      createdAt: BIRTH,
      updatedAt: BIRTH,
    };
    const journalEntry: JournalEntry = {
      id: 'j1',
      writtenAt: BIRTH + 2 * DAY,
      title: 'A little note',
      body: 'hello',
      photoId: 'j-photo',
      createdAt: BIRTH,
      updatedAt: BIRTH,
    };
    const slides = buildSlideshow(
      emptySources({
        profile,
        milestones: [milestone],
        journal: [journalEntry],
      }),
    );
    expect(slides.map((s) => s.photoId)).toEqual(['j-photo', 'm-photo']);
  });

  it('favouritesOnly keeps only starred photos', () => {
    const slides = buildSlideshow(
      emptySources({
        profile,
        photos: [photo('a', 1, false), photo('b', 3, true)],
      }),
      { favouritesOnly: true },
    );
    expect(slides.map((s) => s.photoId)).toEqual(['b']);
  });

  it('is empty when there are no photos', () => {
    expect(buildSlideshow(emptySources({ profile }))).toEqual([]);
  });
});
