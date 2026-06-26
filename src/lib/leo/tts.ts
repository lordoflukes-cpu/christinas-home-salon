'use client';

import { useCallback, useRef, useState } from 'react';
import { getTtsAudio, putTtsAudio } from './repository';
import { useLeoStore } from './store';

export type SpeakStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'error'
  | 'notConfigured';

/**
 * Bump if the configured voice/model changes, to invalidate stale cached audio.
 * (The voice is otherwise locked to one consistent voice, so cached clips keep
 * sounding like Leo and never revert.)
 */
const VOICE_CACHE_VERSION = 'v1';

/** Deterministic cache key for a line of speech (pure — unit tested). */
export function ttsCacheKey(text: string): string {
  let h = 5381;
  const t = text.trim();
  for (let i = 0; i < t.length; i++) h = (h * 33) ^ t.charCodeAt(i);
  return `${VOICE_CACHE_VERSION}:${(h >>> 0).toString(36)}`;
}

/** In-memory object-URL cache for the session (keyed by cache key). */
const urlCache = new Map<string, string>();

/**
 * Play Leo's voice for a line of text. Order of preference, so the exact voice
 * stays consistent and spend stays low:
 *   1. in-memory URL (this session)
 *   2. persisted audio in IndexedDB (free, instant, works offline)
 *   3. ElevenLabs (only on a true cache miss) → then persist it
 * When nothing is available (no key / offline / quota) it stays silent —
 * there is deliberately NO robotic device-voice fallback.
 */
export function useSpeaker() {
  const [status, setStatus] = useState<SpeakStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setStatus('idle');
  }, []);

  const play = useCallback(async (url: string) => {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = url;
    // Honour the chosen playback speed (read at play time — no re-render sub).
    const rate = useLeoStore.getState().profile?.voicePrefs?.rate;
    audio.playbackRate = rate && rate >= 0.5 && rate <= 2 ? rate : 1;
    audio.onended = () => setStatus('idle');
    audio.onerror = () => setStatus('error');
    await audio.play();
    setStatus('playing');
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const t = text.trim().slice(0, 600);
      if (!t) return;
      audioRef.current?.pause();
      const key = ttsCacheKey(t);

      try {
        setStatus('loading');

        // 1. session memory
        const memUrl = urlCache.get(key);
        if (memUrl) {
          await play(memUrl);
          return;
        }

        // 2. persisted cache
        try {
          const cached = await getTtsAudio(key);
          if (cached) {
            const url = URL.createObjectURL(
              new Blob([cached.bytes], { type: cached.type }),
            );
            urlCache.set(key, url);
            await play(url);
            return;
          }
        } catch {
          /* cache unavailable — fall through to network */
        }

        // 3. generate via ElevenLabs, then persist
        const res = await fetch('/api/leo/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: t }),
        });
        if (res.status === 503) {
          setStatus('notConfigured');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const blob = await res.blob();
        try {
          const bytes = await blob.arrayBuffer();
          await putTtsAudio({
            key,
            bytes,
            type: blob.type || 'audio/mpeg',
            createdAt: Date.now(),
          });
        } catch {
          /* persistence is best-effort */
        }
        const url = URL.createObjectURL(blob);
        urlCache.set(key, url);
        await play(url);
      } catch {
        setStatus('error');
      }
    },
    [play],
  );

  return { speak, stop, status };
}
