'use client';

import { useCallback, useRef, useState } from 'react';

export type SpeakStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'error'
  | 'notConfigured';

/** Per-session cache: spoken text → object URL, so repeats don't re-hit the API. */
const audioCache = new Map<string, string>();

/**
 * Play Leo's voice for a line of text. Fetches MP3 from `/api/leo/voice`, caches
 * it for the session, and plays through one shared <audio>. Degrades gracefully
 * when the ElevenLabs key isn't configured (`status === 'notConfigured'`).
 */
export function useSpeaker() {
  const [status, setStatus] = useState<SpeakStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setStatus('idle');
  }, []);

  const speak = useCallback(async (text: string) => {
    const t = text.trim().slice(0, 600);
    if (!t) return;
    audioRef.current?.pause();

    try {
      setStatus('loading');
      let url = audioCache.get(t);
      if (!url) {
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
        url = URL.createObjectURL(blob);
        audioCache.set(t, url);
      }

      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.onended = () => setStatus('idle');
      audio.onerror = () => setStatus('error');
      await audio.play();
      setStatus('playing');
    } catch {
      setStatus('error');
    }
  }, []);

  return { speak, stop, status };
}
