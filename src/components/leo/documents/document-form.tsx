'use client';

import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
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
import { ChipGroup } from '../forms/event-form';

const CATEGORIES = ['Letter', 'Prescription', 'Report', 'Result', 'Other'];

export function DocumentForm({ onDone }: { onDone: () => void }) {
  const addDocument = useLeoStore((s) => s.addDocument);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Letter');
  const [atLocal, setAtLocal] = useState(toDatetimeLocal(Date.now()));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
  }

  async function submit() {
    setError(null);
    if (!file) return setError('Choose a file (photo or PDF).');
    if (!title.trim()) return setError('Give it a title.');
    setBusy(true);
    try {
      // Shrink images; keep PDFs (and anything else) as-is.
      const blob: Blob = file.type.startsWith('image/')
        ? (await downscaleImage(file, 1800, 0.85)).blob
        : file;
      await addDocument(blob, {
        title: title.trim(),
        category,
        name: file.name,
        at: fromDatetimeLocal(atLocal),
        note: note.trim() || undefined,
      });
      onDone();
    } catch {
      setError('Could not save that file.');
    } finally {
      setBusy(false);
    }
  }

  const sizeKb = file ? Math.round(file.size / 1024) : 0;

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <Button
        type="button"
        onClick={() => fileRef.current?.click()}
        variant="outline"
        size="lg"
        className="min-h-12 w-full justify-start"
      >
        <FileUp className="mr-2 h-5 w-5" />
        {file ? `${file.name} (${sizeKb} KB)` : 'Choose photo or PDF'}
      </Button>

      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Discharge letter"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <ChipGroup
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={setCategory}
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

      <div className="space-y-1.5">
        <Label>Note (optional)</Label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        Save document
      </Button>
    </div>
  );
}
