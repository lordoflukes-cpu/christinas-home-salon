'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Mic, Volume2, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useLeoStore,
  useNow,
  useSpeechInput,
  useSpeaker,
  chatContext,
  chatWithLeo,
  type AiSources,
  type ChatMessage,
} from '@/lib/leo';

const STORE_KEY = 'leo:chat-thread';
const MAX_TURNS = 16;

const QUICK_PROMPTS = [
  'How’s Leo doing this week?',
  'What might help settle him right now?',
  'Summarise today',
  'Any gentle patterns I should know?',
];

function loadThread(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as ChatMessage[]).slice(-MAX_TURNS)
      : [];
  } catch {
    return [];
  }
}

export function Chat() {
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(loadThread());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify(messages.slice(-MAX_TURNS)),
      );
    } catch {
      /* storage unavailable */
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const canSpeak = !!voicePrefs?.enabled && voicePrefs.speakAi;
  const autoSpeak = canSpeak && !!voicePrefs?.autoSpeakAnswers;

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;
      setError(null);
      setInput('');
      const next = [
        ...messages,
        { role: 'user' as const, content: text },
      ].slice(-MAX_TURNS);
      setMessages(next);
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
        now,
      };
      const patwah = voicePrefs?.enabled
        ? voicePrefs.patwahStrength
        : undefined;
      const res = await chatWithLeo(next, chatContext(sources), patwah);
      setPending(false);

      if (res.notConfigured) {
        setNotConfigured(true);
        return;
      }
      if (res.error || !res.text) {
        setError(res.error ?? 'Leo had trouble replying.');
        return;
      }
      setMessages((prev) =>
        [...prev, { role: 'assistant' as const, content: res.text! }].slice(
          -MAX_TURNS,
        ),
      );
      if (autoSpeak) void speak(res.text);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      messages,
      pending,
      profile,
      feeds,
      diapers,
      sleeps,
      events,
      now,
      voicePrefs,
    ],
  );

  const speech = useSpeechInput((heard) => void send(heard));

  function clearThread() {
    setMessages([]);
    setError(null);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (!profile) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Add Leo&apos;s details in Settings first — then you can chat about how
        he&apos;s doing.
      </Card>
    );
  }

  if (notConfigured) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Chat with Leo needs the AI key set up on the server. Once it&apos;s
        added, you can talk here about feeds, sleep, routines and how he&apos;s
        getting on.
      </Card>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      <p className="mb-3 text-sm text-ink-600">
        Chat about how Leo’s doing — feeds, sleep, routines, patterns. He reads
        what you’ve logged (never your photos) and organises it; he doesn’t give
        medical advice.
      </p>

      {/* Thread */}
      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void send(q)}
                  className="rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-sm font-medium text-gold-800 transition-colors hover:bg-gold-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'flex',
              m.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed',
                m.role === 'user'
                  ? 'bg-ink-700 text-parchment-50'
                  : 'border border-ink-300/40 bg-parchment-50 text-ink-800',
              )}
            >
              {m.content}
              {m.role === 'assistant' && canSpeak && (
                <button
                  type="button"
                  onClick={() => void speak(m.content)}
                  disabled={speakStatus === 'loading'}
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium text-gold-700 hover:text-gold-800"
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
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-ink-300/40 bg-parchment-50 px-3.5 py-2.5 text-sm text-ink-500">
              <Sparkles className="h-4 w-4 animate-pulse text-gold-500" />
              Leo’s thinking…
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 mt-3 bg-gradient-to-t from-parchment-50 to-transparent pt-2">
        <div className="flex gap-2">
          <input
            value={speech.listening ? speech.transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void send(input);
            }}
            placeholder={speech.listening ? 'Listening…' : 'Ask Leo anything…'}
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
              aria-label={speech.listening ? 'Stop' : 'Speak'}
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
            onClick={() => void send(input)}
            disabled={!input.trim() || pending}
            size="lg"
            className="min-h-11 shrink-0 bg-ink-700 hover:bg-ink-800"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1">
          <span className="text-[11px] text-ink-400">
            Organises what you’ve logged · not medical advice
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearThread}
              className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-rose-500"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
