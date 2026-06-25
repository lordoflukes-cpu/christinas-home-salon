'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useNow,
  formatAge,
  ageInDays,
  downscaleImage,
} from '@/lib/leo';
import { PhotoImage } from '../photos/photo-image';

/**
 * Dashboard hero — an engraved frame. Shows Leo's cover photo if set, otherwise
 * a realistic charcoal lion-cub drawing, with a one-tap "Add Leo's photo".
 */
export function LeoHero() {
  const profile = useLeoStore((s) => s.profile);
  const photos = useLeoStore((s) => s.photos);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
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
      className="leo-frame overflow-hidden rounded-[1.7rem] bg-bark-500 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.85)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-950">
        {coverPhoto ? (
          <PhotoImage
            bytes={coverPhoto.bytes}
            type={coverPhoto.type}
            alt={profile.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {/* blurred fill so the cub portrait shows fully, never cropped */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leo/art/cub-portrait.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leo/art/cub-portrait.jpg"
              alt="A little lion cub"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </>
        )}

        <div className="leo-vignette pointer-events-none absolute inset-0" />

        {/* Add / change photo */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/65 px-3 py-1.5 text-xs font-medium text-parchment-50 backdrop-blur-sm transition active:scale-95"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {coverPhoto ? 'Change photo' : "Add Leo's photo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
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
