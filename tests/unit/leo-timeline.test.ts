import { describe, it, expect } from 'vitest';
import { buildTimeline, lifeAnchors } from '@/lib/leo/timeline';
import type {
  BabyProfile,
  MilestoneEntry,
  PhotoEntry,
  TimelineSources,
} from '@/lib/leo';

const BIRTH = new Date(2026, 5, 24, 22, 54).getTime(); // 24 Jun 2026
const DAY = 86_400_000;

function addMonths(ms: number, n: number) {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

const profile: BabyProfile = {
  id: 'leo',
  name: 'Leo',
  birth: BIRTH,
  birthPlace: 'Lewisham Hospital',
  updatedAt: 0,
};

function emptySources(now: number): TimelineSources {
  return {
    profile,
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
    now,
  };
}

describe('lifeAnchors', () => {
  it('includes Born with the first Christmas after birth', () => {
    const now = addMonths(BIRTH, 7); // 7 months in
    const anchors = lifeAnchors(BIRTH, now);
    const ids = anchors.map((a) => a.id);
    expect(ids).toContain('anchor-born');
    const xmas = anchors.find((a) => a.id === 'anchor-christmas');
    expect(new Date(xmas!.at).getMonth()).toBe(11); // December
    expect(new Date(xmas!.at).getDate()).toBe(25);
    expect(new Date(xmas!.at).getFullYear()).toBe(2026);
  });

  it('shows reached anchors plus exactly one upcoming', () => {
    const now = BIRTH + 10 * DAY; // First week reached; First month upcoming
    const anchors = lifeAnchors(BIRTH, now);
    const upcoming = anchors.filter((a) => a.upcoming);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].id).toBe('anchor-month');
    // born + first week are reached and not upcoming
    expect(anchors.find((a) => a.id === 'anchor-born')?.upcoming).toBeFalsy();
    expect(anchors.find((a) => a.id === 'anchor-week')?.upcoming).toBeFalsy();
  });

  it('first birthday is one year after birth', () => {
    const birthday = lifeAnchors(BIRTH, addMonths(BIRTH, 13)).find(
      (a) => a.id === 'anchor-birthday',
    );
    expect(birthday?.at).toBe(addMonths(BIRTH, 12));
  });
});

const milestone = (p: Partial<MilestoneEntry>): MilestoneEntry => ({
  id: 'm' + (p.achievedAt ?? 0),
  achievedAt: BIRTH + 30 * DAY,
  title: 'A milestone',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});
const photo = (p: Partial<PhotoEntry>): PhotoEntry => ({
  id: 'p' + (p.takenAt ?? 0),
  takenAt: BIRTH + 20 * DAY,
  bytes: new ArrayBuffer(2),
  type: 'image/jpeg',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});

describe('buildTimeline', () => {
  const now = addMonths(BIRTH, 3);

  it('sorts newest-first and tags the Born anchor', () => {
    const items = buildTimeline(emptySources(now), 'all');
    expect(items.length).toBeGreaterThan(0);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].at).toBeLessThanOrEqual(items[i - 1].at);
    }
    const born = items.find((i) => i.id === 'anchor-born');
    expect(born?.anchor).toBe(true);
    expect(born?.subtitle).toBe('Lewisham Hospital');
  });

  it('cross-tags a funny milestone and filters by category', () => {
    const src = {
      ...emptySources(now),
      milestones: [
        milestone({ title: 'Giggled in the bath', emotion: 'funny' }),
      ],
    };
    const funny = buildTimeline(src, 'funny');
    expect(funny.some((i) => i.title === 'Giggled in the bath')).toBe(true);
    // also shows under Milestones and Memories
    expect(
      buildTimeline(src, 'milestones').some(
        (i) => i.title === 'Giggled in the bath',
      ),
    ).toBe(true);
    expect(
      buildTimeline(src, 'memories').some(
        (i) => i.title === 'Giggled in the bath',
      ),
    ).toBe(true);
  });

  it('Highlights excludes everyday; Everyday includes feeds', () => {
    const src = {
      ...emptySources(now),
      feeds: [
        {
          id: 'f1',
          type: 'bottle' as const,
          startedAt: BIRTH + 5 * DAY,
          amountMl: 90,
          contents: 'formula' as const,
          createdAt: 0,
          updatedAt: 0,
        },
      ],
    };
    expect(
      buildTimeline(src, 'highlights').some((i) => i.id === 'feed-f1'),
    ).toBe(false);
    expect(buildTimeline(src, 'everyday').some((i) => i.id === 'feed-f1')).toBe(
      true,
    );
  });

  it('photos carry a photoId and the photos category', () => {
    const src = { ...emptySources(now), photos: [photo({ id: 'pic1' })] };
    const item = buildTimeline(src, 'photos').find(
      (i) => i.id === 'photo-pic1',
    );
    expect(item?.photoId).toBe('pic1');
    expect(item?.categories).toContain('photos');
  });
});
