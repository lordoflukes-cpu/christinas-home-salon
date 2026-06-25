'use client';

import { motion } from 'framer-motion';
import { useLeoStore } from '@/lib/leo';
import { PhotoImage } from './photos/photo-image';

/** Bundled banner photos, one per section (overridden by user backdrops). */
const DEFAULT_BANNERS = [
  '/leo/art/lion-and-cub.jpg',
  '/leo/art/acacia-night.webp',
  '/leo/art/family-sunset.jpg',
  '/leo/art/family-pride.jpg',
  '/leo/art/savanna-night.jpg',
];

/**
 * A photographic banner titling each section. Uses a user "backdrop" photo if
 * one has been added (picked by index), otherwise a bundled lion/savanna image.
 */
export function SectionBanner({
  title,
  subtitle,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  index?: number;
}) {
  const photos = useLeoStore((s) => s.photos);
  const backdrops = photos.filter((p) => p.role === 'backdrop');
  const backdrop = backdrops.length
    ? backdrops[index % backdrops.length]
    : null;
  const fallback = DEFAULT_BANNERS[index % DEFAULT_BANNERS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="leo-frame relative mb-1 h-28 overflow-hidden rounded-2xl bg-ink-950 shadow-md"
    >
      {backdrop ? (
        <PhotoImage
          bytes={backdrop.bytes}
          type={backdrop.type}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallback}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
        <h1 className="font-serif text-3xl font-semibold leading-none tracking-wide text-parchment-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 font-hand text-base leading-none text-gold-200">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
