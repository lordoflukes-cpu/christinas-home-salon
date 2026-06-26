'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useLeoStore,
  useNow,
  useSpeechInput,
  AI_TASKS,
  buildContext,
  askLeo,
  type AiTask,
  type AiSources,
} from '@/lib/leo';
import { AiResultSheet, type AiResultState } from './ai-result-sheet';

export function AskLeo() {
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

  const [result, setResult] = useState<AiResultState | null>(null);
  const [question, setQuestion] = useState('');

  function sources(): AiSources {
    return {
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
  }

  async function run(task: AiTask, q?: string, viaVoice = false) {
    setResult({ task, loading: true });
    const context = buildContext(task.key, sources(), { question: q });
    const patwah =
      voicePrefs?.enabled && task.key !== 'doctor-notes'
        ? voicePrefs.patwahStrength
        : undefined;
    const res = await askLeo(task.key, context, q, patwah);
    setResult({
      task,
      loading: false,
      text: res.text,
      error: res.error,
      notConfigured: res.notConfigured,
      autoSpeak: viaVoice || !!voicePrefs?.autoSpeakAnswers,
    });
  }

  const speech = useSpeechInput((text) => {
    setQuestion(text);
    const qt = AI_TASKS.find((t) => t.needsQuestion);
    if (qt) void run(qt, text, true);
  });

  function onCard(task: AiTask) {
    if (task.needsQuestion) {
      const q = question.trim();
      if (!q) return;
      void run(task, q);
    } else {
      void run(task);
    }
  }

  const questionTask = AI_TASKS.find((t) => t.needsQuestion);
  const cards = AI_TASKS.filter((t) => !t.needsQuestion);

  if (!profile) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Add Leo&apos;s details in Settings first — then Ask Leo can make sense
        of everything you log.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600">
        Ask Leo reads what you’ve logged and helps you make sense of it — your
        photos never leave this device.
      </p>

      {/* Ask a question */}
      {questionTask && (
        <Card className="border-gold-200 bg-parchment-50 p-3">
          <label
            htmlFor="ask-leo-q"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-400"
          >
            {questionTask.emoji} Ask a question
          </label>
          <div className="flex gap-2">
            <input
              id="ask-leo-q"
              value={speech.listening ? speech.transcript : question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCard(questionTask);
              }}
              placeholder={
                speech.listening ? 'Listening…' : 'When did Leo first smile?'
              }
              className="min-h-11 flex-1 rounded-xl border border-ink-300 bg-white px-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-gold-400"
            />
            {speech.supported && (
              <Button
                type="button"
                onClick={() =>
                  speech.listening ? speech.stop() : speech.start()
                }
                size="lg"
                variant="outline"
                aria-label={
                  speech.listening ? 'Stop listening' : 'Ask by voice'
                }
                className={cn(
                  'min-h-11 shrink-0 border-ink-300',
                  speech.listening
                    ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-600'
                    : 'bg-parchment-50 text-ink-700 hover:bg-parchment-100',
                )}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onCard(questionTask)}
              disabled={!question.trim()}
              size="lg"
              className="min-h-11 shrink-0 bg-ink-700 hover:bg-ink-800"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {speech.error && (
            <p className="mt-1.5 text-xs text-rose-500">{speech.error}</p>
          )}
        </Card>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((task, i) => (
          <motion.button
            key={task.key}
            type="button"
            onClick={() => onCard(task)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex flex-col gap-1 rounded-2xl border border-ink-300/40 bg-parchment-50/80 p-4 text-left transition-colors hover:bg-parchment-100 active:scale-[0.98]"
          >
            <span className="text-2xl" aria-hidden>
              {task.emoji}
            </span>
            <span className="font-display text-base leading-tight text-ink-900">
              {task.label}
            </span>
            <span className="text-xs leading-snug text-ink-500">
              {task.description}
            </span>
          </motion.button>
        ))}
      </div>

      <p className="px-1 pt-1 text-center text-xs text-ink-400">
        Ask Leo organises what you’ve logged — it doesn’t give medical advice or
        diagnose. For health concerns, contact your GP, health visitor, or 111.
      </p>

      <AiResultSheet state={result} onClose={() => setResult(null)} />
    </div>
  );
}
