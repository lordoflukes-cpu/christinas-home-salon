'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeoStore, useNow, formatAge, ageInDays } from '@/lib/leo';
import { PhotoImage } from '../photos/photo-image';
import { SavannaScene, type SceneVariant } from '../decor/savanna-scene';
import { LionEngraving } from './lion-engraving';

function sceneForHour(hour: number): SceneVariant {
  if (hour >= 20 || hour < 5) return 'night';
  if (hour < 8) return 'dawn';
  if (hour < 17) return 'day';
  return 'dusk';
}

/**
 * Dashboard hero — a framed savanna diorama on a wood panel: a time-aware sky
 * (the Cancer constellation appears at night), a pride on the ridge, and Leo
 * the cub in front. A chosen cover photo / leo-hero.jpg takes over when set.
 */
export function LeoHero() {
  const profile = useLeoStore((s) => s.profile);
  const photos = useLeoStore((s) => s.photos);
  const now = useNow(60_000);
  const [fileFailed, setFileFailed] = useState(false);

  if (!profile) return null;

  const age = formatAge(profile.birth, now);
  const days = ageInDays(profile.birth, now);
  const variant = sceneForHour(new Date(now).getHours());
  const coverPhoto = profile.heroPhotoId
    ? photos.find((p) => p.id === profile.heroPhotoId)
    : null;
  const showArt = !coverPhoto && fileFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="leo-frame overflow-hidden rounded-[1.7rem] bg-bark-400 shadow-[0_10px_30px_-12px_rgba(44,32,19,0.7)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Illustrated savanna diorama (default) */}
        {!coverPhoto && (
          <SavannaScene variant={variant} className="absolute inset-0" />
        )}

        {/* Leo the cub in the foreground */}
        {showArt && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
            transition={{
              opacity: { duration: 0.7, delay: 0.25 },
              scale: { duration: 0.7, delay: 0.25 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.97 }}
            className="absolute inset-x-0 bottom-0 flex justify-center"
          >
            <LionEngraving className="w-[52%] max-w-[180px] drop-shadow-[0_8px_10px_rgba(20,12,8,0.55)]" />
          </motion.div>
        )}

        {/* Chosen cover photo / dropped-in file */}
        {coverPhoto && (
          <PhotoImage
            bytes={coverPhoto.bytes}
            type={coverPhoto.type}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!coverPhoto && !fileFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/leo/leo-hero.jpg"
            alt={`${profile.name} the little lion`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFileFailed(true)}
          />
        )}

        <div className="leo-vignette pointer-events-none absolute inset-0" />
      </div>

      {/* Engraved parchment nameplate */}
      <div className="relative bg-parchment-100 px-5 py-3 text-center">
        <div className="mx-auto mb-1.5 h-px w-24 bg-ink-400/50" />
        <p className="font-serif text-3xl font-semibold leading-none tracking-wide text-ink-900">
          {profile.name}
        </p>
        <p className="mt-1 font-hand text-lg leading-none text-ink-500">
          {age} · day {days}
        </p>
      </div>
    </motion.div>
  );
}
