'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, formatDateTime } from '@/lib/leo';
import { PhotoImage } from './photo-image';

export function PhotoViewer({
  photoId,
  onClose,
  onNavigate,
}: {
  photoId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const photos = useLeoStore((s) => s.photos);
  const profile = useLeoStore((s) => s.profile);
  const editPhoto = useLeoStore((s) => s.editPhoto);
  const removePhoto = useLeoStore((s) => s.removePhoto);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();

  const index = photos.findIndex((p) => p.id === photoId);
  const photo = index >= 0 ? photos[index] : null;
  const [caption, setCaption] = useState('');

  useEffect(() => {
    setCaption(photo?.caption ?? '');
  }, [photo?.id, photo?.caption]);

  if (!photo) return null;

  const prev = index < photos.length - 1 ? photos[index + 1] : null;
  const next = index > 0 ? photos[index - 1] : null;
  const isHero = profile?.heroPhotoId === photo.id;

  async function saveCaption() {
    if (!photo) return;
    if (caption.trim() !== (photo.caption ?? ''))
      await editPhoto(photo.id, { caption: caption.trim() || undefined });
  }

  async function setHero() {
    if (!profile || !photo) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, updatedAt, ...rest } = profile;
    await editProfile({ ...rest, heroPhotoId: isHero ? undefined : photo.id });
    toast({ title: isHero ? 'Removed as cover' : 'Set as cover 🦁' });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night-950/95 backdrop-blur">
      <div className="flex items-center justify-between p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-6 w-6 text-white" />
        </Button>
        <p className="text-xs text-gold-200">{formatDateTime(photo.takenAt)}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={setHero}
          aria-label="Set as cover"
        >
          <Star
            className={`h-6 w-6 ${isHero ? 'fill-gold-400 text-gold-400' : 'text-white'}`}
          />
        </Button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
        <PhotoImage
          bytes={photo.bytes}
          type={photo.type}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
        {prev && (
          <button
            type="button"
            onClick={() => onNavigate(prev.id)}
            className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {next && (
          <button
            type="button"
            onClick={() => onNavigate(next.id)}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="space-y-2 p-3">
        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={saveCaption}
          placeholder="Add a caption…"
          className="border-night-700 bg-night-900 text-white placeholder:text-night-300"
        />
        <Button
          variant="ghost"
          onClick={async () => {
            await removePhoto(photo.id);
            if (next) onNavigate(next.id);
            else if (prev) onNavigate(prev.id);
            else onClose();
          }}
          className="w-full text-rose-300 hover:bg-rose-950/40 hover:text-rose-200"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete photo
        </Button>
      </div>
    </div>
  );
}
