'use client';

import { motion } from 'framer-motion';
import { useLeoStore } from '@/lib/leo';
import { NightSky } from './decor/night-meadow';
import { PhotoImage } from './photos/photo-image';

/**
 * A dark starry banner that titles each section. Uses a user "backdrop" photo
 * if one has been added (picked by index), otherwise the illustrated night sky.
 */
export function SectionBanner({
  title,
  subtitle,
  index = 0,
  showConstellation = true,
}: {
  title: string;
  subtitle?: string;
  index?: number;
  showConstellation?: boolean;
}) {
  const photos = useLeoStore((s) => s.photos);
  const backdrops = photos.filter((p) => p.role === 'backdrop');
  const backdrop = backdrops.length
    ? backdrops[index % backdrops.length]
    : null;

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
        <NightSky
          className="absolute inset-0"
          showConstellation={showConstellation}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
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
