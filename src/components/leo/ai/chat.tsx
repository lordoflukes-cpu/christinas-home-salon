'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Loader2,
  Sparkles,
  Trash2,
  Brain,
  Undo2,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
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
  recallMemories,
  distilMemories,
  type AiSources,
  type ChatMessage,
  type MemoryOp,
  type NewMemory,
} from '@/lib/leo';

/** How many recent turns we send to the model (history is fully persisted). */
const SEND_WINDOW = 16;

const QUICK_PROMPTS = [
  'How’s Leo doing this week?',
  'What might help settle him right now?',
  'Summarise today',
  'Any gentle patterns I should know?',
];

/** A memory the AI just saved on its own — shown as an undoable chip. */
interface RememberedChip {
  id: string;
  text: string;
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
  const memories = useLeoStore((s) => s.memories);
  const chatMessages = useLeoStore((s) => s.chatMessages);
  const voicePrefs = useLeoStore((s) => s.profile?.voicePrefs);
  const addChatTurn = useLeoStore((s) => s.addChatTurn);
  const clearChatStore = useLeoStore((s) => s.clearChat);
  const createMemory = useLeoStore((s) => s.createMemory);
  const editMemory = useLeoStore((s) => s.editMemory);
  const removeMemory = useLeoStore((s) => s.removeMemory);
  const touchMemories = useLeoStore((s) => s.touchMemories);
  const now = useNow(3_600_000);

  const { speak, status: speakStatus } = useSpeaker();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remembered, setRemembered] = useState<RememberedChip[]>([]);
  const [pendingHealth, setPendingHealth] = useState<MemoryOp[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  // The thread is the persisted, synced chat history (the Second Brain's log).
  const messages: ChatMessage[] = chatMessages
    .filter((m) => !m.summary)
    .map((m): ChatMessage => ({ role: m.role, content: m.content }));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages.length, pending]);

  const canSpeak = !!voicePrefs?.enabled && voicePrefs.speakAi;
  const autoSpeak = canSpeak && !!voicePrefs?.autoSpeakAnswers;

  const buildSources = useCallback(
    (): AiSources => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      profile,
      medical,
      events,
      feeds,
      diapers,
      sleeps,
      routineSessions,
      memories,
      now,
    ],
  );

  /** After an exchange, quietly distil durable memories (best-effort). */
  const curate = useCallback(
    async (thread: ChatMessage[]) => {
      const res = await distilMemories(thread, memories);
      if (!res.memories?.length) return;
      const fresh: RememberedChip[] = [];
      const health: MemoryOp[] = [];
      for (const op of res.memories) {
        if (op.op === 'NOOP' || !op.text || !op.category) continue;
        if (
          op.healthCritical ||
          op.category === 'health' ||
          op.category === 'allergy'
        ) {
          health.push(op);
          continue;
        }
        // Non-health: the AI owns these — save now, surface with undo.
        const entry: NewMemory = {
          text: op.text,
          category: op.category,
          tags: op.tags ?? [],
          importance: op.importance ?? 5,
          trust: 0.9,
          source: 'chat',
          pinned: false,
          useCount: 0,
        };
        if (
          op.op === 'UPDATE' &&
          op.id &&
          memories.some((m) => m.id === op.id)
        ) {
          await editMemory(op.id, {
            text: op.text,
            category: op.category,
            tags: op.tags ?? [],
            importance: op.importance ?? 5,
          });
          fresh.push({ id: op.id, text: op.text });
        } else {
          const saved = await createMemory(entry);
          fresh.push({ id: saved.id, text: saved.text });
        }
      }
      if (fresh.length)
        setRemembered((prev) => [...fresh, ...prev].slice(0, 4));
      if (health.length) setPendingHealth((prev) => [...health, ...prev]);
    },
    [memories, createMemory, editMemory],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;
      setError(null);
      setInput('');

      await addChatTurn({ threadId: 'main', role: 'user', content: text });
      const thread: ChatMessage[] = [
        ...messages,
        { role: 'user' as const, content: text },
      ].slice(-SEND_WINDOW);
      setPending(true);

      const sources = buildSources();
      const { block, ids } = recallMemories(memories, text, now);
      const patwah = voicePrefs?.enabled
        ? voicePrefs.patwahStrength
        : undefined;
      const res = await chatWithLeo(
        thread,
        chatContext(sources),
        patwah,
        block,
      );
      if (ids.length) void touchMemories(ids);
      setPending(false);

      if (res.notConfigured) {
        setNotConfigured(true);
        return;
      }
      if (res.error || !res.text) {
        setError(res.error ?? 'Leo had trouble replying.');
        return;
      }
      await addChatTurn({
        threadId: 'main',
        role: 'assistant',
        content: res.text,
      });
      if (autoSpeak) void speak(res.text);
      // Learn from the exchange in the background — never blocks the reply.
      void curate([...thread, { role: 'assistant', content: res.text }]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      messages,
      pending,
      memories,
      now,
      voicePrefs,
      autoSpeak,
      buildSources,
      addChatTurn,
      touchMemories,
      curate,
    ],
  );

  const speech = useSpeechInput((heard) => void send(heard));

  async function undoRemembered(chip: RememberedChip) {
    setRemembered((prev) => prev.filter((c) => c.id !== chip.id));
    await removeMemory(chip.id);
  }

  async function confirmHealth(op: MemoryOp) {
    setPendingHealth((prev) => prev.filter((o) => o !== op));
    if (!op.text || !op.category) return;
    await createMemory({
      text: op.text,
      category: op.category === 'allergy' ? 'allergy' : 'health',
      tags: op.tags ?? [],
      importance: Math.max(op.importance ?? 8, 8),
      trust: 1,
      source: 'chat',
      pinned: true,
      useCount: 0,
    });
  }

  function dismissHealth(op: MemoryOp) {
    setPendingHealth((prev) => prev.filter((o) => o !== op));
  }

  async function clearThread() {
    setError(null);
    setRemembered([]);
    setPendingHealth([]);
    await clearChatStore();
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
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm text-ink-600">
          Chat about how Leo’s doing — feeds, sleep, routines, patterns. He
          remembers across chats, reads what you’ve logged (never your photos),
          and doesn’t give medical advice.
        </p>
        <Link
          href={'/leo/brain' as never}
          className="flex shrink-0 items-center gap-1 rounded-full border border-gold-300 bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-800 hover:bg-gold-100"
        >
          <Brain className="h-3.5 w-3.5" /> Memory
        </Link>
      </div>

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

        {/* Health-critical memories — confirmed before Leo keeps them */}
        {pendingHealth.map((op, i) => (
          <div
            key={`h${i}`}
            className="rounded-xl border border-rose-300 bg-rose-50/70 p-3 text-sm"
          >
            <p className="flex items-center gap-1.5 font-medium text-rose-700">
              <Brain className="h-4 w-4" /> Add this to Leo’s memory?
            </p>
            <p className="mt-1 text-ink-700">{op.text}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-rose-500">
              {op.category === 'allergy' ? 'Allergy' : 'Health'} · kept &amp;
              pinned
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => void confirmHealth(op)}
                className="h-8 bg-rose-600 hover:bg-rose-700"
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => dismissHealth(op)}
                className="h-8 border-ink-300"
              >
                <X className="mr-1 h-3.5 w-3.5" /> Not now
              </Button>
            </div>
          </div>
        ))}

        {/* "Leo remembered…" — auto-saved, undoable */}
        {remembered.map((chip) => (
          <div
            key={chip.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-gold-300/60 bg-gold-50/60 px-3 py-2 text-xs text-ink-600"
          >
            <span className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-gold-600" />
              Leo remembered: <span className="text-ink-800">{chip.text}</span>
            </span>
            <button
              type="button"
              onClick={() => void undoRemembered(chip)}
              className="flex shrink-0 items-center gap-1 text-ink-400 hover:text-rose-500"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
          </div>
        ))}

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
            Remembers &amp; organises what you’ve logged · not medical advice
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => void clearThread()}
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
