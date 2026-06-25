'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeoStore, useNow, formatAge, ageInDays } from '@/lib/leo';
import { Starfield } from '../decor/starfield';
import { LionCrest } from './lion-crest';

/**
 * Dashboard hero. Shows a warm illustrated lion-cub scene by default; if a
 * photo is dropped in at /public/leo/leo-hero.jpg it is used instead (and
 * cached offline by the service worker). Overlays Leo's name + age.
 */
export function LeoHero() {
  const profile = useLeoStore((s) => s.profile);
  const now = useNow(60_000);
  const [hasPhoto, setHasPhoto] = useState(true);

  if (!profile) return null;

  const age = formatAge(profile.birth, now);
  const days = ageInDays(profile.birth, now);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-gold-200 shadow-sm"
    >
      {/* Illustrated scene (default / fallback) */}
      <div className="relative aspect-[5/4] w-full bg-gradient-to-b from-aegean-200 via-gold-100 to-cream-100">
        <Starfield className="opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-cream-200/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.15,
              type: 'spring',
              stiffness: 120,
              damping: 14,
            }}
            className="w-[56%] max-w-[220px] drop-shadow-md"
          >
            <LionCrest className="h-auto w-full" />
          </motion.div>
        </div>

        {/* Optional real photo on top */}
        {hasPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/leo/leo-hero.jpg"
            alt={`${profile.name} the little lion`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setHasPhoto(false)}
          />
        )}

        {/* Name + age scrim */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-900/70 via-night-900/25 to-transparent px-5 pb-4 pt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-bold leading-none text-white drop-shadow">
                {profile.name}
              </p>
              <p className="mt-1 text-sm font-medium text-gold-100 drop-shadow">
                {age}
              </p>
            </div>
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-night-800 shadow-sm">
              {days === 0 ? 'Day one 🌟' : `Day ${days}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
