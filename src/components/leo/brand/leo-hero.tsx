'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useNow,
  formatAge,
  ageInDays,
  downscaleImage,
} from '@/lib/leo';
import { PhotoImage } from '../photos/photo-image';
import { NightSky } from '../decor/night-meadow';
import { PawMark } from './paw-mark';

/**
 * Dashboard hero — an engraved frame holding Leo's cover photo. With no photo
 * yet it shows an elegant starry frame with a one-tap "Add Leo's photo".
 */
export function LeoHero() {
  const profile = useLeoStore((s) => s.profile);
  const photos = useLeoStore((s) => s.photos);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fileFailed, setFileFailed] = useState(false);
  const now = useNow(60_000);

  if (!profile) return null;

  const age = formatAge(profile.birth, now);
  const days = ageInDays(profile.birth, now);
  const coverPhoto = profile.heroPhotoId
    ? photos.find((p) => p.id === profile.heroPhotoId)
    : null;

  async function handleFile(file: File) {
    if (!profile || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const { blob, w, h } = await downscaleImage(file);
      const entry = await addPhoto(blob, {
        takenAt: file.lastModified || Date.now(),
        w,
        h,
      });
      const { id, updatedAt, ...rest } = profile;
      void id;
      void updatedAt;
      await editProfile({ ...rest, heroPhotoId: entry.id });
      toast({
        title: 'Lovely 🦁',
        description: `${profile.name}'s photo is set.`,
      });
    } catch {
      toast({
        title: 'Could not add photo',
        description: 'Please try another image.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="leo-frame overflow-hidden rounded-[1.7rem] bg-bark-500 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.8)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Starry backdrop inside the frame */}
        <NightSky className="absolute inset-0" />

        {/* Cover photo / dropped-in file */}
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
            alt={`${profile.name}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFileFailed(true)}
          />
        )}

        {/* Empty-state prompt (no cartoon) */}
        {!coverPhoto && fileFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <PawMark className="h-12 w-12 text-gold-300/70" />
            <p className="font-hand text-xl text-parchment-100 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
              Add a photo of Leo
            </p>
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              size="lg"
              className="min-h-12 bg-gold-400 text-base font-semibold text-ink-950 hover:bg-gold-300"
            >
              {busy ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Camera className="mr-2 h-5 w-5" />
              )}
              Add Leo&apos;s photo
            </Button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

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
