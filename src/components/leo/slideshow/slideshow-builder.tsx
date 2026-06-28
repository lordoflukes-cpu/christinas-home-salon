'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, CheckCircle2, Circle, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useLeoStore,
  groupByMonth,
  type PhotoEntry,
  type SlideshowConfig,
  type SlideshowSelect,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { PhotoImage } from '../photos/photo-image';
import { TRACKS, SPEED_PRESETS, THEMES, DEFAULT_SLIDE_MS } from './tracks';

type Mode = 'all' | 'favourites' | 'manual';

/**
 * Build or edit a custom slideshow: name it, pick photos (all / favourites /
 * hand-picked, month-grouped), choose order, look and music. Saves the config
 * onto the synced profile (`slideshowPrefs.shows`).
 */
export function SlideshowBuilder({
  editing,
  onClose,
}: {
  editing: SlideshowConfig | null;
  onClose: () => void;
}) {
  const photos = useLeoStore((s) => s.photos);
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);

  const [name, setName] = useState(editing?.name ?? '');
  const [mode, setMode] = useState<Mode>(
    (editing?.select.mode as Mode) ?? 'all',
  );
  const [picked, setPicked] = useState<string[]>(
    editing?.select.mode === 'manual' ? (editing.select.photoIds ?? []) : [],
  );
  const [manualOrder, setManualOrder] = useState(editing?.order === 'manual');
  const [theme, setTheme] = useState(editing?.theme ?? 'night');
  const [slideMs, setSlideMs] = useState(editing?.slideMs ?? DEFAULT_SLIDE_MS);
  const [track, setTrack] = useState(editing?.track ?? '');
  const [mix, setMix] = useState(editing?.mix ?? false);
  const [favesOnly, setFavesOnly] = useState(false);

  const pickable = useMemo(
    () => (favesOnly ? photos.filter((p) => p.favourite) : photos),
    [photos, favesOnly],
  );
  const albums = useMemo(
    () => groupByMonth(pickable, profile?.birth),
    [pickable, profile?.birth],
  );

  function togglePick(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function save() {
    if (!profile) return;
    const select: SlideshowSelect =
      mode === 'manual' ? { mode: 'manual', photoIds: picked } : { mode };
    const config: SlideshowConfig = {
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim() || 'Untitled slideshow',
      select,
      order: mode === 'manual' && manualOrder ? 'manual' : 'chrono',
      track: track || undefined,
      mix: mix || undefined,
      theme,
      slideMs,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    const shows = (profile.slideshowPrefs?.shows ?? []).filter(
      (s) => s.id !== config.id,
    );
    const next = editing
      ? [...(profile.slideshowPrefs?.shows ?? [])].map((s) =>
          s.id === config.id ? config : s,
        )
      : [...shows, config];
    const { id: _id, updatedAt: _u, ...rest } = profile;
    await editProfile({
      ...rest,
      slideshowPrefs: { ...(profile.slideshowPrefs ?? {}), shows: next },
    });
    onClose();
  }

  const canSave = mode !== 'manual' || picked.length > 0;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-parchment-50 [touch-action:manipulation]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-300/40 bg-parchment-50 p-3">
        <Button variant="ghost" onClick={onClose} className="text-ink-600">
          Cancel
        </Button>
        <p className="font-display text-lg text-ink-900">
          {editing ? 'Edit slideshow' : 'New slideshow'}
        </p>
        <Button
          onClick={save}
          disabled={!canSave}
          className="bg-ink-700 hover:bg-ink-800"
        >
          Save
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 pb-24">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. First month, Christmas, Grandma’s visit"
          />
        </div>

        {/* Which photos */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Photos
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-parchment-100 p-1">
            {(
              [
                ['all', 'All'],
                ['favourites', '★ Favourites'],
                ['manual', 'Choose'],
              ] as [Mode, string][]
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md py-2 text-sm font-medium transition-colors',
                  mode === m
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Picker (manual) */}
        {mode === 'manual' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-600">
                {picked.length} selected
                {picked.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPicked([])}
                    className="ml-2 text-xs text-rose-500"
                  >
                    Clear
                  </button>
                )}
              </p>
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={favesOnly}
                  onChange={(e) => setFavesOnly(e.target.checked)}
                />
                Favourites only
              </label>
            </div>

            {picked.length > 1 && (
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={manualOrder}
                  onChange={(e) => setManualOrder(e.target.checked)}
                />
                Keep my picking order (otherwise oldest → newest)
              </label>
            )}

            {photos.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-500">
                No photos yet — add some in the Photos tab first.
              </p>
            ) : (
              albums.map((album) => (
                <section key={album.key}>
                  <h3 className="mb-1.5 mt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {album.label} · {album.items.length}
                  </h3>
                  <div className="grid grid-cols-4 gap-1">
                    {album.items.map((p: PhotoEntry) => {
                      const order = picked.indexOf(p.id);
                      const isSel = order >= 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePick(p.id)}
                          className="relative aspect-square overflow-hidden rounded-lg border border-ink-300/40"
                        >
                          <PhotoImage
                            bytes={p.bytes}
                            type={p.type}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-start justify-start bg-black/10 p-0.5">
                            {isSel ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-aegean-500 text-[11px] font-bold text-white">
                                {manualOrder ? order + 1 : ''}
                                {!manualOrder && (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </span>
                            ) : (
                              <Circle className="h-5 w-5 text-white/80" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* Look */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Backdrop
          </label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium',
                  theme === t.key
                    ? 'border-ink-700 bg-ink-700 text-parchment-50'
                    : 'border-ink-300 bg-parchment-50 text-ink-700',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Pace
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPEED_PRESETS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSlideMs(s.ms)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium',
                  slideMs === s.ms
                    ? 'border-ink-700 bg-ink-700 text-parchment-50'
                    : 'border-ink-300 bg-parchment-50 text-ink-700',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Music */}
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <Music className="h-3.5 w-3.5" /> Music
          </label>
          <div className="space-y-1.5 rounded-xl border border-ink-300/40 bg-parchment-50 p-2">
            <label className="flex items-center justify-between gap-2 px-1 py-1.5 text-sm">
              <span className="text-ink-700">Blend all songs</span>
              <input
                type="checkbox"
                checked={mix}
                onChange={(e) => setMix(e.target.checked)}
              />
            </label>
            <div className="max-h-52 overflow-y-auto">
              {TRACKS.map((t) => (
                <button
                  key={t.file}
                  type="button"
                  onClick={() => setTrack(t.file)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm',
                    track === t.file
                      ? 'bg-gold-100 text-ink-900'
                      : 'text-ink-700 hover:bg-parchment-100',
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {track === t.file && (
                      <Check className="h-4 w-4 text-gold-600" />
                    )}
                  </span>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
            {track && (
              <button
                type="button"
                onClick={() => setTrack('')}
                className="flex items-center gap-1 px-2 text-xs text-rose-500"
              >
                <X className="h-3 w-3" /> No starting song
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
