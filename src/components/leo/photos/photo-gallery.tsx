'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, downscaleImage } from '@/lib/leo';
import type { PhotoEntry } from '@/lib/leo';
import { PawMark } from '../brand/paw-mark';
import { PhotoImage } from './photo-image';
import { PhotoViewer } from './photo-viewer';

function dayKey(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PhotoGallery() {
  const photos = useLeoStore((s) => s.photos);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const { blob, w, h } = await downscaleImage(file);
        const takenAt = file.lastModified || Date.now();
        await addPhoto(blob, { takenAt, w, h });
      }
      toast({ title: 'Saved 📸', description: 'Lovely.' });
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

  // Group newest-first into day sections.
  const groups: { day: string; items: PhotoEntry[] }[] = [];
  for (const p of photos) {
    const key = dayKey(p.takenAt);
    const last = groups[groups.length - 1];
    if (last && last.day === key) last.items.push(p);
    else groups.push({ day: key, items: [p] });
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {busy ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Camera className="mr-2 h-5 w-5" />
        )}
        Add photos
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-gold-200 bg-parchment-50 p-8 text-center">
          <PawMark className="h-14 w-14 text-gold-500" />
          <p className="text-sm text-ink-600">
            A photo a day — watch Leo grow. Tap{' '}
            <span className="font-medium">Add photos</span> to begin.
          </p>
          <ImagePlus className="h-5 w-5 text-gold-500" />
        </div>
      ) : (
        groups.map(({ day, items }) => (
          <section key={day}>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {day}
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setViewerId(p.id)}
                  className="relative aspect-square overflow-hidden rounded-xl border border-ink-300/40"
                >
                  <PhotoImage
                    bytes={p.bytes}
                    type={p.type}
                    className="h-full w-full object-cover transition-transform active:scale-95"
                  />
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      <PhotoViewer
        photoId={viewerId}
        onClose={() => setViewerId(null)}
        onNavigate={setViewerId}
      />
    </div>
  );
}
