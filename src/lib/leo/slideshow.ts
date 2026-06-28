/**
 * Slideshow sequence — PURE selection logic (unit tested).
 *
 * Turns everything logged about Leo into an ordered run of photo "slides" for
 * the cinematic timeline player: every photo-bearing moment (the birth hero,
 * milestones, journal entries, gallery shots), in chronological order, one per
 * photo. Built on top of `buildTimeline` so it inherits the same sources and
 * never needs its own store/schema. No React — safe to unit test.
 */
import {
  buildTimeline,
  type TimelineItem,
  type TimelineSources,
} from './timeline';
import type { SlideshowSelect } from './types';

export interface Slide {
  photoId: string;
  /** When the moment happened (epoch ms) — slides run oldest → newest. */
  at: number;
  title: string;
  subtitle?: string;
  emoji?: string;
}

export interface SlideshowOptions {
  /** Only include photos marked as favourites (back-compat shorthand). */
  favouritesOnly?: boolean;
  /** Which photos to include. Overrides `favouritesOnly` when given. */
  select?: SlideshowSelect;
  /** 'chrono' (default) keeps oldest→newest; 'manual' keeps the pick order. */
  order?: 'chrono' | 'manual';
}

/**
 * How "rich" a timeline item is as a caption for a shared photo — lower wins.
 * A milestone/journal/anchor describes the moment better than a bare gallery
 * "Photo", so when several items point at the same photo we keep the best one.
 */
function captionRank(item: TimelineItem): number {
  if (item.anchor) return 0;
  if (item.id.startsWith('milestone-')) return 1;
  if (item.id.startsWith('journal-')) return 2;
  return 3; // gallery photo / other
}

/**
 * Build the ordered slide run. One slide per photo (deduped across milestones /
 * journal / gallery that share an image), chronological, optionally favourites
 * only.
 */
export function buildSlideshow(
  sources: TimelineSources,
  opts: SlideshowOptions = {},
): Slide[] {
  const photoById = new Map(sources.photos.map((p) => [p.id, p]));

  // Best (richest-captioned) timeline item per photo id.
  const best = new Map<string, TimelineItem>();
  for (const item of buildTimeline(sources, 'all')) {
    if (!item.photoId || item.upcoming) continue;
    const current = best.get(item.photoId);
    if (!current || captionRank(item) < captionRank(current)) {
      best.set(item.photoId, item);
    }
  }

  // A slide from a timeline item (the richest caption), or — for hand-picked
  // gallery photos with no timeline item — straight from the PhotoEntry.
  const slideFor = (photoId: string): Slide | null => {
    const item = best.get(photoId);
    if (item) {
      return {
        photoId,
        at: item.at,
        title: item.title,
        subtitle: item.subtitle,
        emoji: item.emoji,
      };
    }
    const photo = photoById.get(photoId);
    if (!photo) return null;
    return { photoId, at: photo.takenAt, title: 'Photo' };
  };

  const select: SlideshowSelect =
    opts.select ??
    (opts.favouritesOnly ? { mode: 'favourites' } : { mode: 'all' });

  let ids: string[];
  if (select.mode === 'manual') {
    // Keep any picked photo that's renderable (a timeline item or a gallery photo).
    ids = (select.photoIds ?? []).filter(
      (id) => best.has(id) || photoById.has(id),
    );
  } else {
    // All photo-bearing timeline moments (milestones / journal / gallery / hero).
    ids = Array.from(best.keys());
    if (select.mode === 'favourites') {
      ids = ids.filter((id) => photoById.get(id)?.favourite);
    } else if (select.mode === 'filter') {
      ids = ids.filter((id) => {
        const p = photoById.get(id);
        if (!p) return false;
        if (
          select.tags?.length &&
          !select.tags.some((t) => p.tags?.includes(t))
        )
          return false;
        if (select.from != null && p.takenAt < select.from) return false;
        if (select.to != null && p.takenAt > select.to) return false;
        return true;
      });
    }
  }

  const slides = ids.map(slideFor).filter((s): s is Slide => s !== null);

  if (opts.order === 'manual' && select.mode === 'manual') {
    const orderIndex = new Map(
      (select.photoIds ?? []).map((id, i) => [id, i] as const),
    );
    slides.sort(
      (a, b) =>
        (orderIndex.get(a.photoId) ?? 0) - (orderIndex.get(b.photoId) ?? 0),
    );
  } else {
    slides.sort((a, b) => a.at - b.at);
  }
  return slides;
}
