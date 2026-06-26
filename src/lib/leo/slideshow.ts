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

export interface Slide {
  photoId: string;
  /** When the moment happened (epoch ms) — slides run oldest → newest. */
  at: number;
  title: string;
  subtitle?: string;
  emoji?: string;
}

export interface SlideshowOptions {
  /** Only include photos marked as favourites. */
  favouritesOnly?: boolean;
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
  const favourites = new Set(
    sources.photos.filter((p) => p.favourite).map((p) => p.id),
  );

  // Best (richest-captioned) timeline item per photo id.
  const best = new Map<string, TimelineItem>();
  for (const item of buildTimeline(sources, 'all')) {
    if (!item.photoId || item.upcoming) continue;
    const current = best.get(item.photoId);
    if (!current || captionRank(item) < captionRank(current)) {
      best.set(item.photoId, item);
    }
  }

  let slides: Slide[] = Array.from(best.entries()).map(([photoId, item]) => ({
    photoId,
    at: item.at,
    title: item.title,
    subtitle: item.subtitle,
    emoji: item.emoji,
  }));

  if (opts.favouritesOnly) {
    slides = slides.filter((s) => favourites.has(s.photoId));
  }
  slides.sort((a, b) => a.at - b.at);
  return slides;
}
