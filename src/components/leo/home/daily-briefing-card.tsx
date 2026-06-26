'use client';

import { useEffect, useState } from 'react';
import { Sunrise, Volume2, X, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useNow,
  useSpeaker,
  buildContext,
  askLeo,
  briefingCacheKey,
  briefingDismissKey,
  type AiSources,
} from '@/lib/leo';

type Status = 'idle' | 'loading' | 'error' | 'notConfigured';

/**
 * A gentle, once-a-day briefing on the Home screen. Generated on tap (never
 * automatically — no pings, no silent spend), cached for the day so re-opening
 * shows it instantly. Spoken in Patois when Leo's voice is on.
 */
export function DailyBriefingCard() {
  const profile = useLeoStore((s) => s.profile);
  const milestones = useLeoStore((s) => s.milestones);
  const journal = useLeoStore((s) => s.journal);
  const voices = useLeoStore((s) => s.voices);
  const photos = useLeoStore((s) => s.photos);
  const growth = useLeoStore((s) => s.growth);
  const sizes = useLeoStore((s) => s.sizes);
  const medical = useLeoStore((s) => s.medical);
  const events = useLeoStore((s) => s.events);
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const activeSleep = useLeoStore((s) => s.activeSleep);
  const routineSessions = useLeoStore((s) => s.routineSessions);
  const voicePrefs = useLeoStore((s) => s.profile?.voicePrefs);
  const now = useNow(3_600_000);

  const { speak, status: speakStatus } = useSpeaker();
  const { toast } = useToast();

  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  // Read today's cached briefing / dismissal once on mount.
  useEffect(() => {
    try {
      setText(localStorage.getItem(briefingCacheKey(Date.now())));
      setDismissed(
        localStorage.getItem(briefingDismissKey(Date.now())) === '1',
      );
    } catch {
      /* storage unavailable — card just won't persist */
    }
    setHydrated(true);
  }, []);

  if (!profile || !hydrated || dismissed) return null;

  const canSpeak = !!voicePrefs?.enabled && voicePrefs.speakAi;

  async function generate() {
    setStatus('loading');
    const sources: AiSources = {
      profile,
      milestones,
      journal,
      voices,
      photos,
      growth,
      sizes,
      medical,
      events,
      feeds,
      diapers,
      sleeps,
      activeSleep,
      routineSessions,
      now,
    };
    const context = buildContext('daily-briefing', sources);
    const patwah = voicePrefs?.enabled ? voicePrefs.patwahStrength : undefined;
    const res = await askLeo('daily-briefing', context, undefined, patwah);
    if (res.notConfigured) {
      setStatus('notConfigured');
      return;
    }
    if (res.error || !res.text) {
      setStatus('error');
      toast({
        title: 'Couldn’t load the briefing',
        description: res.error,
        variant: 'destructive',
      });
      return;
    }
    setText(res.text);
    setStatus('idle');
    try {
      localStorage.setItem(briefingCacheKey(Date.now()), res.text);
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(briefingDismissKey(Date.now()), '1');
    } catch {
      /* ignore */
    }
  }

  return (
    <Card className="border-gold-300/50 bg-gradient-to-br from-gold-50 to-parchment-50 p-4">
      <div className="mb-1 flex items-center gap-2">
        <Sunrise className="h-4 w-4 text-gold-600" />
        <h2 className="flex-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Leo’s briefing
        </h2>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss today’s briefing"
          className="text-ink-400 hover:text-ink-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {status === 'notConfigured' ? (
        <p className="text-sm text-ink-500">
          Set up Ask Leo to get a gentle daily briefing here.
        </p>
      ) : text ? (
        <>
          <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink-800">
            {text}
          </p>
          <div className="mt-2 flex items-center gap-3">
            {canSpeak && (
              <button
                type="button"
                onClick={() => void speak(text)}
                disabled={speakStatus === 'loading'}
                className="flex items-center gap-1 text-xs font-medium text-gold-700 hover:text-gold-800"
              >
                {speakStatus === 'loading' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
                Hear it
              </button>
            )}
            <button
              type="button"
              onClick={() => void generate()}
              disabled={status === 'loading'}
              className="flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-700"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void generate()}
          disabled={status === 'loading'}
          className="flex items-center gap-2 text-sm font-medium text-gold-700 hover:text-gold-800"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </>
          ) : (
            <>See today’s briefing →</>
          )}
        </button>
      )}
    </Card>
  );
}
