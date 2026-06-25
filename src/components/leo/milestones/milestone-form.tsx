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
import type { MilestoneEntry } from '@/lib/leo';
import { cn } from '@/lib/utils';

const SUGGESTED = [
  'First smile',
  'First bath',
  'Gripped my finger',
  'First giggle',
  'Held head up',
  'Rolled over',
  'First tooth',
  'Sat up',
  'First word',
  'First steps',
  'Slept through the night',
  'First solid food',
];

const schema = z.object({
  title: z.string().min(1, 'What happened?').max(80),
  achievedAtLocal: z.string().min(1, 'Pick a date'),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function MilestoneForm({
  entry,
  onDone,
}: {
  entry?: MilestoneEntry;
  onDone: () => void;
}) {
  const createMilestone = useLeoStore((s) => s.createMilestone);
  const editMilestone = useLeoStore((s) => s.editMilestone);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title ?? '',
      achievedAtLocal: toDatetimeLocal(entry?.achievedAt ?? Date.now()),
      note: entry?.note,
    },
  });

  const title = watch('title');

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        title: values.title.trim(),
        achievedAt: fromDatetimeLocal(values.achievedAtLocal),
        note: values.note?.trim() || undefined,
      };
      if (entry) await editMilestone(entry.id, base);
      else await createMilestone(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!entry && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue('title', s, { shouldValidate: true })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                title === s
                  ? 'border-rose-400 bg-rose-100 text-rose-700'
                  : 'border-ink-300/50 text-ink-600 hover:bg-parchment-100',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Milestone</Label>
        <Input id="title" placeholder="First smile" {...register('title')} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="achievedAtLocal">When</Label>
        <Input
          id="achievedAtLocal"
          type="datetime-local"
          {...register('achievedAtLocal')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          rows={2}
          placeholder="How it felt, where you were…"
          {...register('note')}
        />
      </div>

      <Button
        type="submit"
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {entry ? 'Save changes' : 'Save milestone'}
      </Button>
    </form>
  );
}
