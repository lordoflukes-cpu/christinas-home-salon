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
import type { MedicalEntry } from '@/lib/leo';

const schema = z.object({
  title: z.string().min(1, 'Give it a title').max(80),
  atLocal: z.string().min(1, 'Pick a date & time'),
  location: z.string().max(120).optional(),
  note: z.string().max(400).optional(),
});
type FormValues = z.infer<typeof schema>;

export function MedicalForm({
  entry,
  onDone,
}: {
  entry?: MedicalEntry;
  onDone: () => void;
}) {
  const createMedical = useLeoStore((s) => s.createMedical);
  const editMedical = useLeoStore((s) => s.editMedical);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title ?? '',
      atLocal: toDatetimeLocal(entry?.at ?? Date.now()),
      location: entry?.location,
      note: entry?.note,
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        kind: 'appointment' as const,
        title: values.title.trim(),
        at: fromDatetimeLocal(values.atLocal),
        location: values.location?.trim() || undefined,
        note: values.note?.trim() || undefined,
      };
      if (entry) await editMedical(entry.id, base);
      else await createMedical(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Appointment</Label>
        <Input
          id="title"
          placeholder="e.g. Health visitor check"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="atLocal">Date &amp; time</Label>
        <Input id="atLocal" type="datetime-local" {...register('atLocal')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          placeholder="e.g. GP surgery"
          {...register('location')}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" rows={2} {...register('note')} />
      </div>
      <Button
        type="submit"
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {entry ? 'Save changes' : 'Save appointment'}
      </Button>
    </form>
  );
}
