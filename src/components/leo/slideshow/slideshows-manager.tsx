'use client';

import { useState } from 'react';
import {
  Clapperboard,
  Pencil,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, type SlideshowConfig } from '@/lib/leo';
import { SlideshowPlayer } from './slideshow-player';
import { SlideshowBuilder } from './slideshow-builder';

/**
 * Lists Leo's story (the default auto slideshow) plus any saved custom
 * slideshows, with play / edit / delete and a "New slideshow" builder.
 */
export function SlideshowsManager() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();

  const shows = profile?.slideshowPrefs?.shows ?? [];

  // `'default'` plays the auto story; a config plays that custom show.
  const [play, setPlay] = useState<SlideshowConfig | 'default' | null>(null);
  const [builder, setBuilder] = useState<{
    editing: SlideshowConfig | null;
  } | null>(null);

  async function remove(id: string) {
    if (!profile) return;
    const next = shows.filter((s) => s.id !== id);
    const { id: _id, updatedAt: _u, ...rest } = profile;
    await editProfile({
      ...rest,
      slideshowPrefs: { ...(profile.slideshowPrefs ?? {}), shows: next },
    });
    toast({ title: 'Slideshow deleted' });
  }

  return (
    <Card className="border-ink-300/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clapperboard className="h-4 w-4 text-gold-600" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Slideshows
        </h2>
      </div>

      <ul className="space-y-1.5">
        {/* Default auto story */}
        <li>
          <button
            type="button"
            onClick={() => setPlay('default')}
            className="flex w-full items-center gap-3 rounded-xl border border-gold-300/60 bg-gradient-to-br from-ink-900 to-ink-800 px-3 py-2.5 text-left active:scale-[0.99]"
          >
            <Play className="h-5 w-5 shrink-0 fill-gold-300 text-gold-300" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-gold-100">
                {profile?.name ?? 'Leo'}’s story
              </span>
              <span className="block text-xs text-gold-200/70">
                Every photo, oldest to newest
              </span>
            </span>
            <Sparkles className="h-4 w-4 shrink-0 text-gold-300/80" />
          </button>
        </li>

        {/* Saved custom slideshows */}
        {shows.map((s) => (
          <li key={s.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPlay(s)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-ink-300/40 bg-parchment-50/70 px-3 py-2.5 text-left hover:bg-parchment-100 active:scale-[0.99]"
            >
              <Play className="h-5 w-5 shrink-0 fill-ink-700 text-ink-700" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink-900">
                  {s.name}
                </span>
                <span className="block text-xs text-ink-500">
                  {s.select.mode === 'manual'
                    ? `${s.select.photoIds?.length ?? 0} photos`
                    : s.select.mode === 'favourites'
                      ? 'Favourites'
                      : 'All photos'}
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-label="Edit"
              onClick={() => setBuilder({ editing: s })}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-parchment-100 active:scale-90"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Delete"
              onClick={() => void remove(s.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 active:scale-90"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setBuilder({ editing: null })}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 py-2.5 text-sm font-medium text-ink-600 hover:bg-parchment-100 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" /> New slideshow
      </button>

      {play && (
        <SlideshowPlayer
          config={play === 'default' ? undefined : play}
          onClose={() => setPlay(null)}
        />
      )}
      {builder && (
        <SlideshowBuilder
          editing={builder.editing}
          onClose={() => setBuilder(null)}
        />
      )}
    </Card>
  );
}
