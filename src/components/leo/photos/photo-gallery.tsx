'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Camera,
  CheckCircle2,
  Circle,
  ImagePlus,
  Loader2,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  downscaleImage,
  groupByMonth,
  type PhotoEntry,
} from '@/lib/leo';
import { PawMark } from '../brand/paw-mark';
import { PhotoImage } from './photo-image';
import { PhotoViewer } from './photo-viewer';
import { cn } from '@/lib/utils';

type View = 'months' | 'all' | 'faves';

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
  const profile = useLeoStore((s) => s.profile);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);

  const [view, setView] = useState<View>('months');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const usedTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of photos) (p.tags ?? []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [photos]);

  const filtered = useMemo(() => {
    let list = photos;
    if (tagFilter.length)
      list = list.filter((p) =>
        (p.tags ?? []).some((t) => tagFilter.includes(t)),
      );
    if (view === 'faves') list = list.filter((p) => p.favourite);
    return list;
  }, [photos, tagFilter, view]);

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

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onTileClick(p: PhotoEntry) {
    if (selectMode) toggleSelect(p.id);
    else setViewerId(p.id);
  }

  async function shareSelected() {
    const picked = photos.filter((p) => selected.has(p.id));
    if (!picked.length) return;
    const files = picked.map(
      (p, i) =>
        new File([p.bytes], `leo-${i + 1}.${p.type.split('/')[1] || 'jpg'}`, {
          type: p.type,
        }),
    );
    const nav = navigator as Navigator & {
      canShare?: (d: { files: File[] }) => boolean;
    };
    if (nav.canShare?.({ files }) && navigator.share) {
      try {
        await navigator.share({
          files,
          title: `${profile?.name ?? 'Leo'} photos`,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      for (const f of files) {
        const url = URL.createObjectURL(f);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast({
        title: 'Downloaded',
        description: `${files.length} photo(s) saved.`,
      });
    }
  }

  const albums = useMemo(
    () => groupByMonth(filtered, profile?.birth),
    [filtered, profile?.birth],
  );
  const dayGroups = useMemo(() => {
    const groups: { day: string; items: PhotoEntry[] }[] = [];
    for (const p of filtered) {
      const key = dayKey(p.takenAt);
      const last = groups[groups.length - 1];
      if (last && last.day === key) last.items.push(p);
      else groups.push({ day: key, items: [p] });
    }
    return groups;
  }, [filtered]);

  function Tile({ p }: { p: PhotoEntry }) {
    const isSel = selected.has(p.id);
    return (
      <button
        type="button"
        onClick={() => onTileClick(p)}
        className="relative aspect-square overflow-hidden rounded-xl border border-ink-300/40"
      >
        <PhotoImage
          bytes={p.bytes}
          type={p.type}
          className="h-full w-full object-cover transition-transform active:scale-95"
        />
        {p.favourite && (
          <Star className="absolute right-1 top-1 h-4 w-4 fill-gold-400 text-gold-400 drop-shadow" />
        )}
        {selectMode && (
          <span className="absolute inset-0 flex items-start justify-start bg-black/20 p-1">
            {isSel ? (
              <CheckCircle2 className="h-6 w-6 fill-aegean-500 text-white" />
            ) : (
              <Circle className="h-6 w-6 text-white/90" />
            )}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          size="lg"
          className="min-h-12 bg-ink-700 text-base hover:bg-ink-800"
        >
          {busy ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Camera className="mr-2 h-5 w-5" />
          )}
          Add photos
        </Button>
        <Button
          onClick={() => {
            setSelectMode((s) => !s);
            setSelected(new Set());
          }}
          size="lg"
          variant="outline"
          className="min-h-12 border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
        >
          {selectMode ? 'Done' : 'Select'}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Backup reminder */}
      <Link
        href={'/leo/settings' as Route}
        className="flex items-start gap-2 rounded-xl border border-aegean-200 bg-aegean-50/60 p-3 text-xs text-ink-600"
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-aegean-600" />
        Photos sync between your phones — but keep your{' '}
        <span className="font-medium">originals</span> safe too. Tap to export a
        backup in Settings.
      </Link>

      {/* View tabs */}
      <div className="grid grid-flow-col gap-1 rounded-lg bg-parchment-100 p-1">
        {(
          [
            ['months', 'Months'],
            ['all', 'All'],
            ['faves', '★ Favourites'],
          ] as [View, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              'rounded-md py-2 text-sm font-medium transition-colors',
              view === v
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {usedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {usedTags.map((t) => {
            const on = tagFilter.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setTagFilter((prev) =>
                    on ? prev.filter((x) => x !== t) : [...prev, t],
                  )
                }
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                  on
                    ? 'border-ink-700 bg-ink-700 text-parchment-50'
                    : 'border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100',
                )}
              >
                #{t}
              </button>
            );
          })}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-gold-200 bg-parchment-50 p-8 text-center">
          <PawMark className="h-14 w-14 text-gold-500" />
          <p className="text-sm text-ink-600">
            A photo a day — watch Leo grow. Tap{' '}
            <span className="font-medium">Add photos</span> to begin.
          </p>
          <ImagePlus className="h-5 w-5 text-gold-500" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-500">
          No photos match.
        </p>
      ) : view === 'months' ? (
        albums.map((album) => (
          <section key={album.key}>
            <h3 className="mb-1.5 font-display text-base font-semibold text-ink-900">
              {profile?.name ?? 'Leo'} — {album.label}
              <span className="ml-1 text-xs font-normal text-ink-400">
                · {album.items.length}
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {album.items.map((p) => (
                <Tile key={p.id} p={p} />
              ))}
            </div>
          </section>
        ))
      ) : view === 'all' ? (
        dayGroups.map(({ day, items }) => (
          <section key={day}>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {day}
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {items.map((p) => (
                <Tile key={p.id} p={p} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((p) => (
            <Tile key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Selection action bar */}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex max-w-md items-center gap-2 px-4">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-ink-300/50 bg-white/95 p-2 shadow-lg backdrop-blur">
            <span className="pl-2 text-sm font-medium text-ink-700">
              {selected.size} selected
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={shareSelected}
              disabled={selected.size === 0}
              className="bg-ink-700 hover:bg-ink-800"
            >
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      )}

      <PhotoViewer
        photoId={viewerId}
        onClose={() => setViewerId(null)}
        onNavigate={setViewerId}
      />
    </div>
  );
}
