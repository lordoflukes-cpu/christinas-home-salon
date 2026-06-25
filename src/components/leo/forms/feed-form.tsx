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
import type {
  FeedEntry,
  FeedType,
  BreastSide,
  BottleContents,
} from '@/lib/leo';
import { cn } from '@/lib/utils';

const schema = z.object({
  startedAtLocal: z.string().min(1, 'Pick a time'),
  durationMin: z.coerce.number().min(0).max(180).optional(),
  amountMl: z.coerce.number().min(0).max(1000).optional(),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function FeedForm({
  entry,
  onDone,
}: {
  entry?: FeedEntry;
  onDone: () => void;
}) {
  const createFeed = useLeoStore((s) => s.createFeed);
  const editFeed = useLeoStore((s) => s.editFeed);

  const [type, setType] = useState<FeedType>(entry?.type ?? 'breast');
  const [side, setSide] = useState<BreastSide>(entry?.side ?? 'L');
  const [contents, setContents] = useState<BottleContents>(
    entry?.contents ?? 'formula',
  );
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startedAtLocal: toDatetimeLocal(entry?.startedAt ?? Date.now()),
      durationMin: entry?.durationMin,
      amountMl: entry?.amountMl,
      note: entry?.note,
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const base = {
        type,
        startedAt: fromDatetimeLocal(values.startedAtLocal),
        note: values.note?.trim() || undefined,
        ...(type === 'breast'
          ? {
              side,
              durationMin: values.durationMin,
              amountMl: undefined,
              contents: undefined,
            }
          : {
              amountMl: values.amountMl,
              contents,
              side: undefined,
              durationMin: undefined,
            }),
      };
      if (entry) await editFeed(entry.id, base);
      else await createFeed(base);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Segmented
        value={type}
        onChange={(v) => setType(v as FeedType)}
        options={[
          { value: 'breast', label: 'Breast' },
          { value: 'bottle', label: 'Bottle' },
        ]}
      />

      {type === 'breast' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Side</Label>
            <Segmented
              value={side}
              onChange={(v) => setSide(v as BreastSide)}
              options={[
                { value: 'L', label: 'Left' },
                { value: 'R', label: 'Right' },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="durationMin">Duration (min)</Label>
            <Input
              id="durationMin"
              type="number"
              inputMode="numeric"
              min={0}
              {...register('durationMin')}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="amountMl">Amount (ml)</Label>
            <Input
              id="amountMl"
              type="number"
              inputMode="numeric"
              min={0}
              {...register('amountMl')}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contents</Label>
            <Segmented
              value={contents}
              onChange={(v) => setContents(v as BottleContents)}
              options={[
                { value: 'formula', label: 'Formula' },
                { value: 'breastmilk', label: 'Breast' },
              ]}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="startedAtLocal">Time</Label>
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
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" rows={2} {...register('note')} />
      </div>

      <Button
        type="submit"
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-rose-500 text-base hover:bg-rose-600"
      >
        {entry ? 'Save changes' : 'Save feed'}
      </Button>
    </form>
  );
}

interface SegmentedProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-lg bg-cream-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md py-2 text-sm font-medium transition-colors',
            value === opt.value
              ? 'bg-white text-sage-900 shadow-sm'
              : 'text-sage-500 hover:text-sage-700',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
