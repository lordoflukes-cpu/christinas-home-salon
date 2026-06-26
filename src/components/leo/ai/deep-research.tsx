'use client';

import { useCallback, useState } from 'react';
import { Microscope, Loader2, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useLeoStore,
  useNow,
  useSpeaker,
  researchContext,
  researchLeo,
  recallMemories,
  type AiSources,
} from '@/lib/leo';

/**
 * "Deep research" — a thorough pass that reasons across everything Leo knows
 * (memories + summaries + health + routines + growth) and answers what's
 * important, what's going well, what's worth watching, and what might help.
 */
export function DeepResearch() {
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
  const memories = useLeoStore((s) => s.memories);
  const voicePrefs = useLeoStore((s) => s.profile?.voicePrefs);
  const touchMemories = useLeoStore((s) => s.touchMemories);
  const now = useNow(3_600_000);

  const { speak, status: speakStatus } = useSpeaker();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSpeak = !!voicePrefs?.enabled && voicePrefs.speakAi;

  const run = useCallback(async () => {
    if (pending) return;
    setError(null);
    setResult(null);
    setPending(true);
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
      memories,
      now,
    };
    const { block, ids } = recallMemories(
      memories,
      question || 'overall how is Leo doing',
      now,
    );
    const patwah = voicePrefs?.enabled ? voicePrefs.patwahStrength : undefined;
    const res = await researchLeo(
      question,
      researchContext(sources),
      block,
      patwah,
    );
    if (ids.length) void touchMemories(ids);
    setPending(false);
    if (res.error || !res.text) {
      setError(res.error ?? 'Couldn’t pull a research read together.');
      return;
    }
    setResult(res.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, question, memories, now, voicePrefs, profile, events, feeds]);

  if (!profile) return null;

  return (
    <Card className="border-ink-300/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
          <Microscope className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-ink-800">Deep research</span>
          <span className="block text-xs text-ink-500">
            A thorough look across everything Leo knows
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Optional: focus it (e.g. “his sleep lately”)"
            className="min-h-11 w-full rounded-xl border border-ink-300 bg-white px-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-gold-400"
          />
          <Button
            type="button"
            onClick={() => void run()}
            disabled={pending}
            className="w-full bg-ink-700 hover:bg-ink-800"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking it
                through…
              </>
            ) : (
              'Run deep research'
            )}
          </Button>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          {result && (
            <div className="rounded-xl border border-ink-300/40 bg-parchment-50 p-3">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800">
                {result}
              </p>
              {canSpeak && (
                <button
                  type="button"
                  onClick={() => void speak(result)}
                  disabled={speakStatus === 'loading'}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-gold-700 hover:text-gold-800"
                >
                  {speakStatus === 'loading' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  Hear it
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
