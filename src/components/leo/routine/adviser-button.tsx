'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  useLeoStore,
  useNow,
  aiTask,
  buildContext,
  askLeo,
  type AiSources,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import {
  AiResultSheet,
  type AiResultState,
} from '@/components/leo/ai/ai-result-sheet';

const TASK = aiTask('right-now')!;

/**
 * "What might help right now?" — builds the live right-now context and asks
 * Leo, showing the answer in the shared AI result sheet. Used both at the top
 * of the Routine tab and inside a live settling session.
 */
export function AdviserButton({ compact = false }: { compact?: boolean }) {
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
  const now = useNow(60_000);

  const [result, setResult] = useState<AiResultState | null>(null);

  async function run() {
    setResult({ task: TASK, loading: true });
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
    const context = buildContext('right-now', sources);
    const res = await askLeo('right-now', context);
    setResult({
      task: TASK,
      loading: false,
      text: res.text,
      error: res.error,
      notConfigured: res.notConfigured,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-gold-300 bg-gold-50 font-medium text-gold-800 transition-colors hover:bg-gold-100 active:scale-[0.99]',
          compact
            ? 'w-full justify-center px-3 py-2 text-sm'
            : 'w-full px-4 py-3 text-left',
        )}
      >
        <Sparkles className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        <span className={compact ? '' : 'flex-1'}>
          What might help right now?
        </span>
      </button>
      <AiResultSheet state={result} onClose={() => setResult(null)} />
    </>
  );
}
