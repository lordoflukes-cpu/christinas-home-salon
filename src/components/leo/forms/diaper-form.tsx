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
import type { DiaperEntry, DiaperType } from '@/lib/leo';
import { Segmented } from './feed-form';

const schema = z.object({
  changedAtLocal: z.string().min(1, 'Pick a time'),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function DiaperForm({
  entry,
  onDone,
}: {
  entry?: DiaperEntry;
  onDone: () => void;
}) {
  const createDiaper = useLeoStore((s) => s.createDiaper);
  const editDiaper = useLeoStore((s) => s.editDiaper);

  const [type, setType] = useState<DiaperType>(entry?.type ?? 'wet');
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      changedAtLocal: toDatetimeLocal(entry?.changedAt ?? Date.now()),
      note: entry?.note,
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        type,
        changedAt: fromDatetimeLocal(values.changedAtLocal),
        note: values.note?.trim() || undefined,
      };
      if (entry) await editDiaper(entry.id, base);
      else await createDiaper(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Segmented
          value={type}
          onChange={(v) => setType(v as DiaperType)}
          options={[
            { value: 'wet', label: 'Wet' },
            { value: 'dirty', label: 'Dirty' },
            { value: 'both', label: 'Both' },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="changedAtLocal">Time</Label>
        <Input
          id="changedAtLocal"
          type="datetime-local"
          {...register('changedAtLocal')}
        />
        {errors.changedAtLocal && (
          <p className="text-xs text-destructive">
            {errors.changedAtLocal.message}
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
        className="min-h-14 w-full bg-aegean-600 text-base hover:bg-aegean-700"
      >
        {entry ? 'Save changes' : 'Save nappy'}
      </Button>
    </form>
  );
}
