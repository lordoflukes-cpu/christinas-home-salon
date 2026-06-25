'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useLeoStore,
  downscaleImage,
  toDatetimeLocal,
  fromDatetimeLocal,
  PROMPTS,
  promptByCategory,
} from '@/lib/leo';
import type { JournalEntry, JournalCategory } from '@/lib/leo';
import { ChipGroup } from '../forms/event-form';
import { PhotoImage } from '../photos/photo-image';

const AUTHORS = ['Daddy', 'Mummy'];

export function JournalEditor({
  entry,
  initialCategory,
  onDone,
}: {
  entry?: JournalEntry;
  initialCategory?: JournalCategory;
  onDone: () => void;
}) {
  const createJournal = useLeoStore((s) => s.createJournal);
  const editJournal = useLeoStore((s) => s.editJournal);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const photos = useLeoStore((s) => s.photos);
  const fileRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<JournalCategory | ''>(
    entry?.category ?? initialCategory ?? '',
  );
  const [author, setAuthor] = useState(entry?.author ?? '');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.writtenAt ?? Date.now()),
  );
  const [photoId, setPhotoId] = useState<string | undefined>(entry?.photoId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePrompt = promptByCategory(category || undefined);
  const photo = photos.find((p) => p.id === photoId);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    const { blob } = await downscaleImage(file, 1600, 0.82);
    const created = await addPhoto(blob, { takenAt: Date.now() });
    setPhotoId(created.id);
  }

  async function submit() {
    setError(null);
    if (!body.trim()) return setError('Write a little something.');
    setBusy(true);
    try {
      const data = {
        title: title.trim() || undefined,
        body: body.trim(),
        writtenAt: fromDatetimeLocal(atLocal),
        author: author || undefined,
        category: category || undefined,
        photoId,
      };
      if (entry) await editJournal(entry.id, data);
      else await createJournal(data);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-h-[78vh] space-y-4 overflow-y-auto pb-2">
      <div className="space-y-1.5">
        <Label>Prompt</Label>
        <ChipGroup
          options={PROMPTS.map((p) => ({ value: p.category, label: p.label }))}
          value={category}
          onChange={(v) => setCategory(v as JournalCategory)}
          clearable
        />
        {activePrompt && (
          <p className="pt-1 font-serif text-[15px] italic text-ink-600">
            {activePrompt.prompt}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>From</Label>
        <ChipGroup
          options={AUTHORS.map((a) => ({ value: a, label: a }))}
          value={author}
          onChange={setAuthor}
          clearable
        />
      </div>

      <div className="space-y-1.5">
        <Label>Title (optional)</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A little note…"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Dear Leo…</Label>
        <Textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={activePrompt?.example ?? 'Today you…'}
          className="font-serif text-base leading-relaxed"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Photo (optional)</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickPhoto(e.target.files?.[0])}
        />
        {photo ? (
          <div className="relative w-fit">
            <PhotoImage
              bytes={photo.bytes}
              type={photo.type}
              className="h-28 w-28 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setPhotoId(undefined)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="min-h-12 w-full justify-start"
          >
            <ImagePlus className="mr-2 h-5 w-5" /> Add a photo
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input
          type="datetime-local"
          value={atLocal}
          onChange={(e) => setAtLocal(e.target.value)}
        />
      </div>

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        Save entry
      </Button>
    </div>
  );
}
