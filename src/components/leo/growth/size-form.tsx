'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useLeoStore,
  toDatetimeLocal,
  fromDatetimeLocal,
  SIZE_OPTIONS,
} from '@/lib/leo';
import type { SizeEntry, SizeKind } from '@/lib/leo';
import { Segmented } from '../forms/feed-form';
import { ChipGroup } from '../forms/event-form';

export function SizeForm({
  kind: initialKind = 'clothing',
  entry,
  suggestion,
  onDone,
}: {
  kind?: SizeKind;
  entry?: SizeEntry;
  suggestion?: string | null;
  onDone: () => void;
}) {
  const createSize = useLeoStore((s) => s.createSize);
  const editSize = useLeoStore((s) => s.editSize);

  const [kind, setKind] = useState<SizeKind>(entry?.kind ?? initialKind);
  const [size, setSize] = useState(entry?.size ?? '');
  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.startedAt ?? Date.now()),
  );
  const [note, setNote] = useState(entry?.note ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!size.trim()) return setError('Pick or type a size.');
    setBusy(true);
    try {
      const data = {
        kind,
        size: size.trim(),
        startedAt: fromDatetimeLocal(atLocal),
        note: note.trim() || undefined,
      };
      if (entry) await editSize(entry.id, data);
      else await createSize(data);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Segmented
          value={kind}
          onChange={(v) => {
            setKind(v as SizeKind);
            setSize('');
          }}
          options={[
            { value: 'clothing', label: '👕 Clothing' },
            { value: 'nappy', label: '🧷 Nappy' },
            { value: 'shoe', label: '👟 Shoe' },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Size</Label>
        <ChipGroup
          options={SIZE_OPTIONS[kind].map((s) => ({ value: s, label: s }))}
          value={size}
          onChange={setSize}
          clearable
        />
        <Input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="…or type it"
        />
        {suggestion && !entry && (
          <button
            type="button"
            onClick={() => setSize(suggestion)}
            className="text-xs font-medium text-aegean-700 underline"
          >
            Use suggested: {suggestion}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Started wearing</Label>
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
          placeholder="e.g. roomy, a bit snug…"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {entry ? 'Save changes' : 'Save size'}
      </Button>
    </div>
  );
}
