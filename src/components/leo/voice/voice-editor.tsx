'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, Mic, RotateCcw, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useLeoStore,
  useVoiceRecorder,
  useVoiceUrl,
  formatAudioDuration,
  toDatetimeLocal,
  fromDatetimeLocal,
  VOICE_CATEGORIES,
} from '@/lib/leo';
import type { VoiceEntry, VoiceCategory } from '@/lib/leo';
import { cn } from '@/lib/utils';
import { ChipGroup } from '../forms/event-form';

const AUTHORS = ['Daddy', 'Mummy'];
const SOFT_LIMIT_MS = 3 * 60_000; // gentle nudge past ~3 minutes

export function VoiceEditor({
  entry,
  initialCategory,
  onDone,
}: {
  entry?: VoiceEntry;
  initialCategory?: VoiceCategory;
  onDone: () => void;
}) {
  const addVoice = useLeoStore((s) => s.addVoice);
  const editVoice = useLeoStore((s) => s.editVoice);
  const recorder = useVoiceRecorder();

  const editing = !!entry;

  const [title, setTitle] = useState(entry?.title ?? '');
  const [transcript, setTranscript] = useState(entry?.transcript ?? '');
  const [category, setCategory] = useState<VoiceCategory | ''>(
    entry?.category ?? initialCategory ?? '',
  );
  const [author, setAuthor] = useState(entry?.author ?? '');
  const [favourite, setFavourite] = useState(entry?.favourite ?? false);
  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.recordedAt ?? Date.now()),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stream the live transcript into the editable field while recording.
  useEffect(() => {
    if (!editing && recorder.transcript) setTranscript(recorder.transcript);
  }, [recorder.transcript, editing]);

  const existingBlob = useMemo(
    () =>
      entry
        ? new Blob([entry.bytes], { type: entry.type || 'audio/webm' })
        : null,
    [entry],
  );
  const playbackBlob = editing ? existingBlob : recorder.blob;
  const audioUrl = useVoiceUrl(playbackBlob);

  const durationMs = editing ? entry?.durationMs : recorder.durationMs;
  const overLimit = !editing && recorder.durationMs > SOFT_LIMIT_MS;

  async function submit() {
    setError(null);
    if (!editing && !recorder.blob) {
      return setError('Record a moment first.');
    }
    setBusy(true);
    try {
      const meta = {
        recordedAt: fromDatetimeLocal(atLocal),
        durationMs,
        title: title.trim() || undefined,
        transcript: transcript.trim() || undefined,
        category: category || undefined,
        author: author || undefined,
        favourite: favourite || undefined,
      };
      if (entry) {
        await editVoice(entry.id, meta);
      } else if (recorder.blob) {
        await addVoice(recorder.blob, meta);
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-h-[78vh] space-y-4 overflow-y-auto pb-2">
      {/* Recorder (new entries only) */}
      {!editing && (
        <div className="rounded-2xl border border-ink-300/40 bg-parchment-50 p-4 text-center">
          {recorder.state === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => void recorder.start()}
                aria-label="Start recording"
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform active:scale-90"
              >
                <Mic className="h-9 w-9" />
              </button>
              <p className="mt-3 text-sm text-ink-600">
                Tap to record a moment
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {recorder.supportsTranscription
                  ? 'Speech will be transcribed automatically'
                  : 'Audio records; type the words below'}
              </p>
            </>
          )}

          {recorder.state === 'recording' && (
            <>
              <button
                type="button"
                onClick={() => recorder.stop()}
                aria-label="Stop recording"
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-4 ring-rose-300/60 transition-transform active:scale-90"
              >
                <span className="absolute h-20 w-20 animate-ping rounded-full bg-rose-400/40" />
                <Square className="h-8 w-8 fill-current" />
              </button>
              <p className="mt-3 font-display text-2xl tabular-nums text-ink-900">
                {formatAudioDuration(recorder.durationMs)}
              </p>
              <p className="text-xs text-rose-600">Recording… tap to stop</p>
              {overLimit && (
                <p className="mt-1 text-xs text-amber-600">
                  That&apos;s a long one — shorter notes stay easy to keep &amp;
                  sync.
                </p>
              )}
            </>
          )}

          {recorder.state === 'recorded' && (
            <>
              <p className="font-display text-lg text-ink-900">
                {formatAudioDuration(recorder.durationMs)} recorded ✨
              </p>
              {audioUrl && (
                <audio controls src={audioUrl} className="mt-2 w-full" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => recorder.reset()}
                className="mt-2 text-ink-500"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" /> Re-record
              </Button>
            </>
          )}

          {recorder.error && (
            <p className="mt-2 text-xs text-destructive">{recorder.error}</p>
          )}
        </div>
      )}

      {/* Existing audio (editing) */}
      {editing && audioUrl && (
        <div className="rounded-2xl border border-ink-300/40 bg-parchment-50 p-3 text-center">
          <p className="text-xs text-ink-500">
            {formatAudioDuration(entry?.durationMs)}
          </p>
          <audio controls src={audioUrl} className="mt-1 w-full" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>What is this?</Label>
        <ChipGroup
          options={VOICE_CATEGORIES.map((c) => ({
            value: c.category,
            label: `${c.emoji} ${c.label}`,
          }))}
          value={category}
          onChange={(v) => setCategory(v as VoiceCategory)}
          clearable
        />
      </div>

      <div className="space-y-1.5">
        <Label>Title (optional)</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Leo's first proper coo"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Transcript</Label>
        <Textarea
          rows={4}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="What was said (auto-filled where possible — edit freely)…"
          className="font-serif text-base leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Recorded by</Label>
        <ChipGroup
          options={AUTHORS.map((a) => ({ value: a, label: a }))}
          value={author}
          onChange={setAuthor}
          clearable
        />
      </div>

      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input
          type="datetime-local"
          value={atLocal}
          onChange={(e) => setAtLocal(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => setFavourite((f) => !f)}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors',
          favourite
            ? 'border-rose-300 bg-rose-50 text-rose-600'
            : 'border-ink-300 bg-parchment-50 text-ink-600 hover:bg-parchment-100',
        )}
      >
        <Heart className={cn('h-4 w-4', favourite && 'fill-current')} />
        {favourite ? 'A favourite' : 'Mark as favourite'}
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        onClick={submit}
        disabled={busy || recorder.state === 'recording'}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {editing ? 'Save changes' : 'Save to the time capsule'}
      </Button>
    </div>
  );
}
