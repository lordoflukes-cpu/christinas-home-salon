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
} from '@/lib/leo';
import type { MilestoneEntry, MilestoneCategory, Emotion } from '@/lib/leo';
import { ChipGroup } from '../forms/event-form';
import { PhotoImage } from '../photos/photo-image';

const CATEGORIES: {
  value: MilestoneCategory;
  label: string;
  suggestions: string[];
}[] = [
  {
    value: 'physical',
    label: '💪 Physical',
    suggestions: [
      'First smile',
      'Held head up',
      'Rolled over',
      'Sat up',
      'Crawled',
      'First steps',
      'First tooth',
    ],
  },
  {
    value: 'sounds',
    label: '🗣️ Sounds',
    suggestions: ['First coo', 'First laugh', 'First babble', 'First word'],
  },
  {
    value: 'feeding',
    label: '🍼 Feeding',
    suggestions: [
      'First bottle',
      'First solid food',
      'Favourite food',
      'Held own bottle',
    ],
  },
  {
    value: 'sleep',
    label: '😴 Sleep',
    suggestions: ['First full night', 'Nap routine', 'Own room'],
  },
  {
    value: 'social',
    label: '🤗 Social',
    suggestions: [
      'First family cuddle',
      'First trip out',
      'Met grandparents',
      'First playdate',
    ],
  },
  {
    value: 'funny',
    label: '😂 Funny',
    suggestions: [
      'First weird face',
      'Nappy disaster',
      'Funny noise',
      'Epic blowout',
    ],
  },
  {
    value: 'big',
    label: '🎉 Big life moment',
    suggestions: [
      'First Christmas',
      'First birthday',
      'First holiday',
      'First haircut',
    ],
  },
];

const EMOTIONS: { value: Emotion; label: string }[] = [
  { value: 'proud', label: '🦁 Proud' },
  { value: 'funny', label: '😂 Funny' },
  { value: 'scary', label: '😬 Scary' },
  { value: 'beautiful', label: '🥹 Beautiful' },
  { value: 'chaotic', label: '🌪️ Chaotic' },
];

export function MilestoneForm({
  entry,
  onDone,
}: {
  entry?: MilestoneEntry;
  onDone: () => void;
}) {
  const createMilestone = useLeoStore((s) => s.createMilestone);
  const editMilestone = useLeoStore((s) => s.editMilestone);
  const addPhoto = useLeoStore((s) => s.addPhoto);
  const photos = useLeoStore((s) => s.photos);
  const fileRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<MilestoneCategory | ''>(
    entry?.category ?? '',
  );
  const [title, setTitle] = useState(entry?.title ?? '');
  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.achievedAt ?? Date.now()),
  );
  const [note, setNote] = useState(entry?.note ?? '');
  const [noteChristina, setNoteChristina] = useState(
    entry?.noteFromChristina ?? '',
  );
  const [whoThere, setWhoThere] = useState(entry?.whoThere ?? '');
  const [location, setLocation] = useState(entry?.location ?? '');
  const [emotion, setEmotion] = useState<Emotion | ''>(entry?.emotion ?? '');
  const [photoId, setPhotoId] = useState<string | undefined>(entry?.photoId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions =
    CATEGORIES.find((c) => c.value === category)?.suggestions ?? [];
  const photo = photos.find((p) => p.id === photoId);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    const { blob } = await downscaleImage(file, 1600, 0.82);
    const entry = await addPhoto(blob, { takenAt: Date.now() });
    setPhotoId(entry.id);
  }

  async function submit() {
    setError(null);
    if (!title.trim()) return setError('What happened?');
    setBusy(true);
    try {
      const data = {
        title: title.trim(),
        achievedAt: fromDatetimeLocal(atLocal),
        category: category || undefined,
        note: note.trim() || undefined,
        noteFromChristina: noteChristina.trim() || undefined,
        whoThere: whoThere.trim() || undefined,
        location: location.trim() || undefined,
        emotion: emotion || undefined,
        photoId,
      };
      if (entry) await editMilestone(entry.id, data);
      else await createMilestone(data);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-h-[75vh] space-y-4 overflow-y-auto pb-2">
      <div className="space-y-1.5">
        <Label>Category</Label>
        <ChipGroup
          options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          value={category}
          onChange={(v) => setCategory(v as MilestoneCategory)}
          clearable
        />
      </div>

      {suggestions.length > 0 && !entry && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTitle(s)}
              className="rounded-full border border-ink-300/50 px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:bg-parchment-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Milestone</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="First smile"
        />
      </div>

      <div className="space-y-1.5">
        <Label>When</Label>
        <Input
          type="datetime-local"
          value={atLocal}
          onChange={(e) => setAtLocal(e.target.value)}
        />
      </div>

      {/* Photo */}
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
        <Label>Note from you</Label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How it felt…"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Note from Christina</Label>
        <Textarea
          rows={2}
          value={noteChristina}
          onChange={(e) => setNoteChristina(e.target.value)}
          placeholder="Mummy's words…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Who was there</Label>
          <Input
            value={whoThere}
            onChange={(e) => setWhoThere(e.target.value)}
            placeholder="e.g. Mummy & Daddy"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. home"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>How did it feel?</Label>
        <ChipGroup
          options={EMOTIONS}
          value={emotion}
          onChange={(v) => setEmotion(v as Emotion)}
          clearable
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {entry ? 'Save changes' : 'Save milestone'}
      </Button>
    </div>
  );
}
