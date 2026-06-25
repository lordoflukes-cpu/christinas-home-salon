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
import type { SleepEntry } from '@/lib/leo';

const schema = z
  .object({
    startedAtLocal: z.string().min(1, 'Pick a start time'),
    endedAtLocal: z.string().optional(),
    note: z.string().max(500).optional(),
  })
  .refine(
    (v) =>
      !v.endedAtLocal ||
      fromDatetimeLocal(v.endedAtLocal) >= fromDatetimeLocal(v.startedAtLocal),
    { path: ['endedAtLocal'], message: 'End must be after start' },
  );
type FormValues = z.infer<typeof schema>;

/** Manual sleep add / edit form (the dashboard start/stop lives in SleepStatusCard). */
export function SleepControls({
  entry,
  onDone,
}: {
  entry?: SleepEntry;
  onDone: () => void;
}) {
  const startSleepTimer = useLeoStore((s) => s.startSleepTimer);
  const editSleep = useLeoStore((s) => s.editSleep);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startedAtLocal: toDatetimeLocal(entry?.startedAt ?? Date.now()),
      endedAtLocal: entry?.endedAt ? toDatetimeLocal(entry.endedAt) : '',
      note: entry?.note,
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const startedAt = fromDatetimeLocal(values.startedAtLocal);
      const endedAt = values.endedAtLocal
        ? fromDatetimeLocal(values.endedAtLocal)
        : undefined;
      const note = values.note?.trim() || undefined;
      if (entry) {
        await editSleep(entry.id, { startedAt, endedAt, note });
      } else {
        // create via the timer, then patch end/note onto the new entry
        await startSleepTimer(startedAt);
        const created = useLeoStore.getState().activeSleep;
        if (created && (endedAt || note))
          await editSleep(created.id, { endedAt, note });
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="startedAtLocal">Fell asleep</Label>
        <Input
          id="startedAtLocal"
          type="datetime-local"
          {...register('startedAtLocal')}
        />
        {errors.startedAtLocal && (
          <p className="text-xs text-destructive">
            {errors.startedAtLocal.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="endedAtLocal">
          Woke up (leave blank if still asleep)
        </Label>
        <Input
          id="endedAtLocal"
          type="datetime-local"
          {...register('endedAtLocal')}
        />
        {errors.endedAtLocal && (
          <p className="text-xs text-destructive">
            {errors.endedAtLocal.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" rows={2} {...register('note')} />
      </div>

      <Button
        type="submit"
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-sage-600 text-base hover:bg-sage-700"
      >
        {entry ? 'Save changes' : 'Save sleep'}
      </Button>
    </form>
  );
}
