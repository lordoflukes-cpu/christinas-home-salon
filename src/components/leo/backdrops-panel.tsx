'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, downscaleImage } from '@/lib/leo';
import { PhotoImage } from './photos/photo-image';

/**
 * Lets the owner add real photos used as the starry section-banner backdrops
 * (e.g. savanna / lion art they own). Stored on-device like gallery photos but
 * tagged role:'backdrop'.
 */
export function BackdropsPanel() {
  const photos = useLeoStore((s) => s.photos);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const removePhoto = useLeoStore((s) => s.removePhoto);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const backdrops = photos.filter((p) => p.role === 'backdrop');

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const { blob, w, h } = await downscaleImage(file, 1920);
        await addPhoto(blob, {
          takenAt: file.lastModified || Date.now(),
          role: 'backdrop',
          w,
          h,
        });
      }
      toast({ title: 'Backdrop added' });
    } catch {
      toast({
        title: 'Could not add image',
        description: 'Please try another.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">
        Section backdrops
      </h2>
      <p className="mb-4 text-sm text-ink-600">
        Add your own photos (savanna, lions, or anything you love) to sit behind
        the section banners. They stay on this device.
      </p>

      {backdrops.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {backdrops.map((p) => (
            <div
              key={p.id}
              className="relative aspect-video overflow-hidden rounded-lg border border-ink-300/40"
            >
              <PhotoImage
                bytes={p.bytes}
                type={p.type}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label="Remove backdrop"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/70 text-parchment-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        size="lg"
        variant="outline"
        className="min-h-12 w-full justify-start"
      >
        {busy ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-5 w-5" />
        )}
        Add backdrop image
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </Card>
  );
}
