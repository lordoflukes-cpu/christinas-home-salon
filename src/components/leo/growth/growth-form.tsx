'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useLeoStore,
  toDatetimeLocal,
  fromDatetimeLocal,
  gramsToLbOz,
} from '@/lib/leo';
import type { GrowthEntry } from '@/lib/leo';

const schema = z
  .object({
    measuredAtLocal: z.string().min(1, 'Pick a date'),
    weightKg: z.coerce.number().min(0).max(40).optional(),
    lengthCm: z.coerce.number().min(0).max(130).optional(),
    headCircCm: z.coerce.number().min(0).max(70).optional(),
    note: z.string().max(300).optional(),
  })
  .refine((v) => v.weightKg || v.lengthCm || v.headCircCm, {
    path: ['weightKg'],
    message: 'Enter at least one measurement',
  });
type FormValues = z.infer<typeof schema>;

export function GrowthForm({
  entry,
  onDone,
}: {
  entry?: GrowthEntry;
  onDone: () => void;
}) {
  const createGrowth = useLeoStore((s) => s.createGrowth);
  const editGrowth = useLeoStore((s) => s.editGrowth);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      measuredAtLocal: toDatetimeLocal(entry?.measuredAt ?? Date.now()),
      weightKg: entry?.weightGrams ? entry.weightGrams / 1000 : undefined,
      lengthCm: entry?.lengthCm,
      headCircCm: entry?.headCircCm,
      note: entry?.note,
    },
  });

  const weightKg = watch('weightKg');

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        measuredAt: fromDatetimeLocal(values.measuredAtLocal),
        weightGrams: values.weightKg
          ? Math.round(values.weightKg * 1000)
          : undefined,
        lengthCm: values.lengthCm || undefined,
        headCircCm: values.headCircCm || undefined,
        note: values.note?.trim() || undefined,
      };
      if (entry) await editGrowth(entry.id, base);
      else await createGrowth(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="measuredAtLocal">Date</Label>
        <Input
          id="measuredAtLocal"
          type="datetime-local"
          {...register('measuredAtLocal')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="weightKg">Weight (kg)</Label>
        <Input
          id="weightKg"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="e.g. 3.40"
          {...register('weightKg')}
        />
        {weightKg ? (
          <p className="text-xs text-ink-500">
            = {gramsToLbOz(Math.round(weightKg * 1000))}
          </p>
        ) : null}
        {errors.weightKg && (
          <p className="text-xs text-destructive">{errors.weightKg.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lengthCm">Length (cm)</Label>
          <Input
            id="lengthCm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 51"
            {...register('lengthCm')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="headCircCm">Head (cm)</Label>
          <Input
            id="headCircCm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="e.g. 35"
            {...register('headCircCm')}
          />
        </div>
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
        {entry ? 'Save changes' : 'Save measurement'}
      </Button>
    </form>
  );
}
