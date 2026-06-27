'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, formatDateTime, PHOTO_TAGS } from '@/lib/leo';
import { PhotoImage } from './photo-image';
import { cn } from '@/lib/utils';

/** Epoch ms → value for an <input type="datetime-local"> (local time). */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setCaption(photo?.caption ?? '');
  }, [photo?.id, photo?.caption]);

  if (!photo || typeof document === 'undefined') return null;

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

  async function toggleFavourite() {
    if (!photo) return;
    await editPhoto(photo.id, { favourite: !photo.favourite });
  }

  async function changeDate(value: string) {
    if (!photo) return;
    const ms = new Date(value).getTime();
    if (!Number.isNaN(ms) && ms !== photo.takenAt) {
      await editPhoto(photo.id, { takenAt: ms });
      toast({
        title: 'Date updated',
        description: 'Timeline order updated 🦁',
      });
    }
  }

  async function toggleTag(tag: string) {
    if (!photo) return;
    const tags = photo.tags ?? [];
    const nextTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    await editPhoto(photo.id, { tags: nextTags.length ? nextTags : undefined });
  }

  async function doDelete() {
    if (!photo) return;
    await removePhoto(photo.id);
    setConfirmOpen(false);
    if (next) onNavigate(next.id);
    else if (prev) onNavigate(prev.id);
    else onClose();
  }

  const photoTags = photo.tags ?? [];
  const allTags = Array.from(new Set([...PHOTO_TAGS, ...photoTags]));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-night-950/95 backdrop-blur [touch-action:manipulation]">
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
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavourite}
            aria-label="Favourite"
          >
            <Heart
              className={`h-6 w-6 ${photo.favourite ? 'fill-rose-400 text-rose-400' : 'text-white'}`}
            />
          </Button>
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
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => {
            const on = photoTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                  on
                    ? 'border-gold-400 bg-gold-400 text-ink-900'
                    : 'border-night-700 text-night-200 hover:bg-night-800',
                )}
              >
                #{t}
              </button>
            );
          })}
        </div>

        {/* Date — drives timeline position + slideshow order */}
        <label className="flex items-center gap-2 rounded-xl border border-night-700 bg-night-900 px-3 py-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-gold-200" />
          <span className="shrink-0 text-xs text-night-200">Date</span>
          <input
            type="datetime-local"
            defaultValue={toLocalInput(photo.takenAt)}
            onChange={(e) => changeDate(e.target.value)}
            className="ml-auto bg-transparent text-right text-sm text-white [color-scheme:dark]"
          />
        </label>

        <Input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={saveCaption}
          placeholder="Add a caption…"
          className="border-night-700 bg-night-900 text-white placeholder:text-night-300"
        />
        <Button
          variant="ghost"
          onClick={() => setConfirmOpen(true)}
          className="w-full text-rose-300 hover:bg-rose-950/40 hover:text-rose-200"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete photo
        </Button>
      </div>

      {/* Inline confirm — lives inside the viewer (z-110) so it shows ABOVE the
          z-100 portal. A shadcn Dialog (z-50) would render behind it. */}
      {confirmOpen && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-ink-950/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-night-700 bg-night-900 p-5 text-center shadow-xl">
            <p className="font-display text-lg text-white">
              Delete this photo?
            </p>
            <p className="mt-1 text-sm text-night-200">
              It’ll be removed from the gallery, timeline and slideshow. This
              can’t be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 border-night-600 bg-transparent text-white hover:bg-night-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={doDelete}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
