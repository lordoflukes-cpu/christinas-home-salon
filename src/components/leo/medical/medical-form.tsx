'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLeoStore, toDatetimeLocal, fromDatetimeLocal } from '@/lib/leo';
import type { MedicalEntry, MedicalKind } from '@/lib/leo';
import { ChipGroup } from '../forms/event-form';

const WHO = ['Midwife', 'Health visitor', 'GP', 'Hospital', 'Other'];

const TITLES: Record<string, { save: string; titleLabel: string }> = {
  appointment: { save: 'Save appointment', titleLabel: 'Appointment' },
  vaccination: { save: 'Save vaccination', titleLabel: 'Vaccine' },
  note: { save: 'Save note', titleLabel: 'Title' },
};

export function MedicalForm({
  kind = 'appointment',
  entry,
  defaultTitle,
  scheduleId,
  onDone,
}: {
  kind?: MedicalKind;
  entry?: MedicalEntry;
  defaultTitle?: string;
  scheduleId?: string;
  onDone: () => void;
}) {
  const createMedical = useLeoStore((s) => s.createMedical);
  const editMedical = useLeoStore((s) => s.editMedical);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const k = entry?.kind ?? kind;
  const meta = TITLES[k] ?? TITLES.appointment;

  const [title, setTitle] = useState(entry?.title ?? defaultTitle ?? '');
  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.at ?? Date.now()),
  );
  const [category, setCategory] = useState(entry?.category ?? '');
  const [location, setLocation] = useState(entry?.location ?? '');
  const [batch, setBatch] = useState(entry?.batch ?? '');
  const [reaction, setReaction] = useState(entry?.reaction ?? '');
  const [note, setNote] = useState(entry?.note ?? '');

  async function submit() {
    setError(null);
    if (!title.trim()) return setError('Give it a title.');
    setBusy(true);
    try {
      const data = {
        kind: k,
        title: title.trim(),
        at: fromDatetimeLocal(atLocal),
        scheduleId: entry?.scheduleId ?? scheduleId,
        category: k === 'appointment' && category ? category : undefined,
        location:
          k === 'appointment' && location.trim() ? location.trim() : undefined,
        batch: k === 'vaccination' && batch.trim() ? batch.trim() : undefined,
        reaction:
          k === 'vaccination' && reaction.trim() ? reaction.trim() : undefined,
        note: note.trim() || undefined,
        done: k === 'vaccination' ? true : entry?.done,
      };
      if (entry) await editMedical(entry.id, data);
      else await createMedical(data);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {k === 'appointment' && (
        <div className="space-y-1.5">
          <Label>Who</Label>
          <ChipGroup
            options={WHO.map((w) => ({ value: w, label: w }))}
            value={category}
            onChange={(v) => {
              setCategory(v);
              if (v && v !== 'Other' && !title.trim())
                setTitle(`${v} appointment`);
            }}
            clearable
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="med-title">{meta.titleLabel}</Label>
        <Input
          id="med-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            k === 'note' ? 'e.g. 6-week check notes' : 'e.g. Health visitor'
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="med-at">Date &amp; time</Label>
        <Input
          id="med-at"
          type="datetime-local"
          value={atLocal}
          onChange={(e) => setAtLocal(e.target.value)}
        />
      </div>

      {k === 'appointment' && (
        <div className="space-y-1.5">
          <Label htmlFor="med-loc">Location (optional)</Label>
          <Input
            id="med-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. GP surgery"
          />
        </div>
      )}

      {k === 'vaccination' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="med-batch">Batch no. (optional)</Label>
            <Input
              id="med-batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med-reaction">Reaction (optional)</Label>
            <Input
              id="med-reaction"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              placeholder="e.g. none"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="med-note">
          {k === 'note' ? 'Notes' : 'Note (optional)'}
        </Label>
        <Textarea
          id="med-note"
          rows={k === 'note' ? 5 : 2}
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
        {entry ? 'Save changes' : meta.save}
      </Button>
    </div>
  );
}
