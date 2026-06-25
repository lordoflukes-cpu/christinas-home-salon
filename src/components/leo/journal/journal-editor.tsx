'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLeoStore, toDatetimeLocal, fromDatetimeLocal } from '@/lib/leo';
import type { JournalEntry } from '@/lib/leo';

const schema = z.object({
  title: z.string().max(120).optional(),
  writtenAtLocal: z.string().min(1, 'Pick a date'),
  body: z.string().min(1, 'Write a little something').max(5000),
});
type FormValues = z.infer<typeof schema>;

export function JournalEditor({
  entry,
  onDone,
}: {
  entry?: JournalEntry;
  onDone: () => void;
}) {
  const createJournal = useLeoStore((s) => s.createJournal);
  const editJournal = useLeoStore((s) => s.editJournal);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title,
      writtenAtLocal: toDatetimeLocal(entry?.writtenAt ?? Date.now()),
      body: entry?.body ?? '',
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        title: values.title?.trim() || undefined,
        writtenAt: fromDatetimeLocal(values.writtenAtLocal),
        body: values.body.trim(),
      };
      if (entry) await editJournal(entry.id, base);
      else await createJournal(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="A little note to you…"
          {...register('title')}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="writtenAtLocal">Date</Label>
        <Input
          id="writtenAtLocal"
          type="datetime-local"
          {...register('writtenAtLocal')}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">Dear Leo…</Label>
        <Textarea
          id="body"
          rows={8}
          placeholder="Today you…"
          className="leading-relaxed"
          {...register('body')}
        />
        {errors.body && (
          <p className="text-xs text-destructive">{errors.body.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-rose-500 text-base hover:bg-rose-600"
      >
        {entry ? 'Save letter' : 'Save letter'}
      </Button>
    </form>
  );
}
