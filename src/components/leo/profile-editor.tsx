'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore, toDatetimeLocal, fromDatetimeLocal } from '@/lib/leo';

/** Leo's birthday: 24 June 2026, 10:50pm (editable). */
const DEFAULT_BIRTH = new Date(2026, 5, 24, 22, 50).getTime();

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(40),
  birthLocal: z.string().min(1, 'Date of birth is required'),
  birthWeightGrams: z.coerce.number().min(0).max(8000).optional(),
  birthLengthCm: z.coerce.number().min(0).max(80).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProfileEditor() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? 'Leo',
      birthLocal: toDatetimeLocal(profile?.birth ?? DEFAULT_BIRTH),
      birthWeightGrams: profile?.birthWeightGrams,
      birthLengthCm: profile?.birthLengthCm,
    },
  });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      await editProfile({
        name: values.name.trim(),
        birth: fromDatetimeLocal(values.birthLocal),
        birthWeightGrams: values.birthWeightGrams || undefined,
        birthLengthCm: values.birthLengthCm || undefined,
      });
      toast({
        title: 'Saved',
        description: `${values.name.trim()}'s details are up to date.`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-cream-200 p-5">
      <h2 className="mb-4 font-display text-lg font-semibold text-night-900">
        Baby details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birthLocal">Date &amp; time of birth</Label>
          <Input
            id="birthLocal"
            type="datetime-local"
            {...register('birthLocal')}
          />
          {errors.birthLocal && (
            <p className="text-xs text-destructive">
              {errors.birthLocal.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="birthWeightGrams">Birth weight (g)</Label>
            <Input
              id="birthWeightGrams"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 3400"
              {...register('birthWeightGrams')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birthLengthCm">Length (cm)</Label>
            <Input
              id="birthLengthCm"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 51"
              {...register('birthLengthCm')}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={busy}
          size="lg"
          className="min-h-12 w-full bg-rose-500 hover:bg-rose-600"
        >
          Save details
        </Button>
      </form>
    </Card>
  );
}
