'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Heart,
  Images,
} from 'lucide-react';
import {
  useLeoStore,
  buildSlideshow,
  formatAge,
  type AiSources,
  type Slide,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { SlideImage } from './slide-image';
import { StarryStage } from './starry-stage';

const SLIDE_MS = 5200;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

function longDate(at: number): string {
  return new Date(at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Full-screen, cinematic slideshow of Leo's photo moments over a living starry
 * sky. Autoplays with gentle crossfades + Ken-Burns; tap/swipe/keys to steer.
 * Rendered as an overlay (above the shell + nav) so it's fully immersive.
 */
export function SlideshowPlayer({ onClose }: { onClose: () => void }) {
  const profile = useLeoStore((s) => s.profile);
  const milestones = useLeoStore((s) => s.milestones);
  const journal = useLeoStore((s) => s.journal);
  const voices = useLeoStore((s) => s.voices);
  const photos = useLeoStore((s) => s.photos);
  const growth = useLeoStore((s) => s.growth);
  const sizes = useLeoStore((s) => s.sizes);
  const medical = useLeoStore((s) => s.medical);
  const events = useLeoStore((s) => s.events);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);

  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  const photoById = useMemo(() => {
    const m = new Map<string, (typeof photos)[number]>();
    for (const p of photos) m.set(p.id, p);
    return m;
  }, [photos]);

  const slides: Slide[] = useMemo(() => {
    const sources = {
      profile,
      milestones,
      journal,
      voices,
      photos,
      growth,
      sizes,
      medical,
      events,
      feeds,
      diapers,
      sleeps,
      now: Date.now(),
    } as unknown as AiSources;
    return buildSlideshow(sources, { favouritesOnly });
  }, [
    profile,
    milestones,
    journal,
    voices,
    photos,
    growth,
    sizes,
    medical,
    events,
    feeds,
    diapers,
    sleeps,
    favouritesOnly,
  ]);

  const count = slides.length;
  const safeIndex = count ? index % count : 0;
  const slide = slides[safeIndex];

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!count) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  // Reset to the first slide if the set shrinks (e.g. favourites toggle).
  useEffect(() => {
    setIndex(0);
  }, [favouritesOnly]);

  // Autoplay timer.
  useEffect(() => {
    if (!playing || count <= 1) return;
    const id = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(id);
  }, [playing, count, safeIndex, go]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const photo = slide ? photoById.get(slide.photoId) : undefined;

  return (
    <div
      role="dialog"
      aria-label="Leo's story slideshow"
      className="fixed inset-0 z-[60] select-none overflow-hidden bg-ink-950 text-parchment-50"
    >
      <StarryStage />

      {count === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <Images className="h-10 w-10 text-gold-300" />
          <p className="max-w-xs text-sm text-parchment-200">
            {favouritesOnly
              ? 'No favourite photos yet — tap the heart to show all, or star a few in Memories.'
              : 'Add a few photos in Memories and Leo’s story will play here. 🦁'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-full border border-parchment-50/30 px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-2">
            {slides.map((s, i) => (
              <span
                key={s.photoId}
                className="h-1 flex-1 overflow-hidden rounded-full bg-parchment-50/20"
              >
                <motion.span
                  className="block h-full bg-gold-300"
                  initial={false}
                  animate={{
                    width:
                      i < safeIndex ? '100%' : i === safeIndex ? '100%' : '0%',
                  }}
                  transition={
                    i === safeIndex && playing
                      ? { duration: SLIDE_MS / 1000, ease: 'linear' }
                      : { duration: 0 }
                  }
                  // Re-key so the fill restarts cleanly each time this slide shows.
                  key={`${i}-${safeIndex}-${playing}`}
                />
              </span>
            ))}
          </div>

          {/* Crossfading photo */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={safeIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.99 }}
              transition={{
                duration: reduceMotion ? 0.25 : 0.9,
                ease: 'easeInOut',
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1);
                else if (info.offset.x > 70) go(-1);
              }}
            >
              {photo && (
                <SlideImage
                  bytes={photo.bytes}
                  type={photo.type}
                  index={safeIndex}
                  paused={!playing}
                  reduceMotion={reduceMotion}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tap zones: left = back, centre = play/pause, right = forward */}
          <div className="absolute inset-0 z-10 flex">
            <button
              type="button"
              aria-label="Previous"
              className="h-full w-1/3"
              onClick={() => go(-1)}
            />
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              className="h-full w-1/3"
              onClick={() => setPlaying((p) => !p)}
            />
            <button
              type="button"
              aria-label="Next"
              className="h-full w-1/3"
              onClick={() => go(1)}
            />
          </div>

          {/* Caption */}
          {slide && (
            <motion.div
              key={`cap-${safeIndex}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-950/85 to-transparent px-6 pb-24 pt-16 text-center"
            >
              <p className="font-display text-2xl text-parchment-50 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
                {slide.emoji ? `${slide.emoji} ` : ''}
                {slide.title}
              </p>
              {slide.subtitle && (
                <p className="mx-auto mt-1 max-w-md text-sm text-parchment-200/90">
                  {slide.subtitle}
                </p>
              )}
              <p className="mt-1.5 font-hand text-base text-gold-200">
                {profile ? `${formatAge(profile.birth, slide.at)} · ` : ''}
                {longDate(slide.at)}
              </p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="rounded-full p-2 text-parchment-100 active:scale-90"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg active:scale-90"
            >
              {playing ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7 translate-x-0.5" />
              )}
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="rounded-full p-2 text-parchment-100 active:scale-90"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </>
      )}

      {/* Top bar: title, favourites toggle, close (always available) */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3 pt-5">
        <span className="rounded-full bg-ink-950/40 px-3 py-1 font-serif text-sm text-parchment-100 backdrop-blur-sm">
          {profile?.name ?? 'Leo'}’s story
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Favourites only"
            aria-pressed={favouritesOnly}
            onClick={() => setFavouritesOnly((v) => !v)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/40 backdrop-blur-sm active:scale-90',
              favouritesOnly ? 'text-rose-400' : 'text-parchment-100',
            )}
          >
            <Heart
              className="h-5 w-5"
              fill={favouritesOnly ? 'currentColor' : 'none'}
            />
          </button>
          <button
            type="button"
            aria-label="Close slideshow"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/40 text-parchment-100 backdrop-blur-sm active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
