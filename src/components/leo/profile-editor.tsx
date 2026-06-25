'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  toDatetimeLocal,
  fromDatetimeLocal,
  gramsToLbOz,
} from '@/lib/leo';

/** Leo's birthday: 24 June 2026, 10:54pm (editable). */
const DEFAULT_BIRTH = new Date(2026, 5, 24, 22, 54).getTime();

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  birthLocal: z.string().min(1, 'Date of birth is required'),
  birthPlace: z.string().max(120).optional(),
  birthWeightGrams: z.coerce.number().min(0).max(8000).optional(),
  birthLengthCm: z.coerce.number().min(0).max(80).optional(),
  birthHeadCircCm: z.coerce.number().min(0).max(60).optional(),
  hospital: z.string().max(120).optional(),
  midwife: z.string().max(120).optional(),
  doctor: z.string().max(120).optional(),
  parents: z.string().max(120).optional(),
  nhsNumber: z.string().max(40).optional(),
  gp: z.string().max(160).optional(),
  healthVisitor: z.string().max(160).optional(),
  allergies: z.string().max(500).optional(),
  birthStory: z.string().max(8000).optional(),
});
type FormValues = z.infer<typeof schema>;

const trim = (v?: string) => v?.trim() || undefined;

export function ProfileEditor() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? 'Leo',
      birthLocal: toDatetimeLocal(profile?.birth ?? DEFAULT_BIRTH),
      birthPlace: profile?.birthPlace,
      birthWeightGrams: profile?.birthWeightGrams,
      birthLengthCm: profile?.birthLengthCm,
      birthHeadCircCm: profile?.birthHeadCircCm,
      hospital: profile?.hospital,
      midwife: profile?.midwife,
      doctor: profile?.doctor,
      parents: profile?.parents,
      nhsNumber: profile?.nhsNumber,
      gp: profile?.gp,
      healthVisitor: profile?.healthVisitor,
      allergies: profile?.allergies,
      birthStory: profile?.birthStory,
    },
  });

  const birthWeight = watch('birthWeightGrams');

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      await editProfile({
        // Preserve everything not in this form (hero photo, reminder prefs…).
        ...(profile ?? {}),
        name: values.name.trim(),
        birth: fromDatetimeLocal(values.birthLocal),
        birthPlace: trim(values.birthPlace),
        birthWeightGrams: values.birthWeightGrams || undefined,
        birthLengthCm: values.birthLengthCm || undefined,
        birthHeadCircCm: values.birthHeadCircCm || undefined,
        hospital: trim(values.hospital),
        midwife: trim(values.midwife),
        doctor: trim(values.doctor),
        parents: trim(values.parents),
        nhsNumber: trim(values.nhsNumber),
        gp: trim(values.gp),
        healthVisitor: trim(values.healthVisitor),
        allergies: trim(values.allergies),
        birthStory: trim(values.birthStory),
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
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">
        Baby details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basics ---------------------------------------------------------- */}
        <Section title="Basics">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Leo …" />
          </Field>

          <Field
            label="Date & time of birth"
            error={errors.birthLocal?.message}
          >
            <Input type="datetime-local" {...register('birthLocal')} />
          </Field>

          <Field label="Place of birth">
            <Input
              {...register('birthPlace')}
              placeholder="e.g. Lewisham Hospital, London"
            />
          </Field>

          <Field label="Parents">
            <Input
              {...register('parents')}
              placeholder="e.g. Luke & Christina"
            />
          </Field>
        </Section>

        {/* Birth measurements --------------------------------------------- */}
        <Section title="Birth measurements">
          <Field label="Birth weight (g)">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 3400"
              {...register('birthWeightGrams')}
            />
            {birthWeight ? (
              <p className="mt-1 text-xs text-ink-500">
                = {gramsToLbOz(Number(birthWeight))}
              </p>
            ) : null}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Length (cm)">
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="e.g. 51"
                {...register('birthLengthCm')}
              />
            </Field>
            <Field label="Head (cm)">
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="e.g. 35"
                {...register('birthHeadCircCm')}
              />
            </Field>
          </div>
        </Section>

        {/* Hospital & care team ------------------------------------------- */}
        <Section title="Hospital & care team">
          <Field label="Hospital">
            <Input {...register('hospital')} placeholder="Hospital name" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Midwife">
              <Input {...register('midwife')} placeholder="Name" />
            </Field>
            <Field label="Doctor">
              <Input {...register('doctor')} placeholder="Name" />
            </Field>
          </div>
        </Section>

        {/* Emergency & health --------------------------------------------- */}
        <Section title="Emergency & health">
          <Field label="NHS number">
            <Input
              {...register('nhsNumber')}
              inputMode="numeric"
              placeholder="000 000 0000"
            />
          </Field>
          <Field label="GP (practice / doctor)">
            <Input {...register('gp')} placeholder="Surgery name & number" />
          </Field>
          <Field label="Health visitor">
            <Input
              {...register('healthVisitor')}
              placeholder="Name & contact"
            />
          </Field>
          <Field label="Allergies & medical notes">
            <Textarea
              rows={2}
              {...register('allergies')}
              placeholder="None known so far"
            />
          </Field>
        </Section>

        {/* Birth story ---------------------------------------------------- */}
        <Section title="Birth story">
          <p className="-mt-1 mb-2 text-xs text-ink-500">
            The day Leo arrived — what happened, how you felt, who was there,
            the funny bits and the scary bits. Something to read back on in
            years to come. 🦁
          </p>
          <Textarea
            rows={8}
            {...register('birthStory')}
            placeholder="On the night of 24 June 2026…"
            className="font-serif text-base leading-relaxed"
          />
        </Section>

        <Button
          type="submit"
          disabled={busy}
          size="lg"
          className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
        >
          Save details
        </Button>
      </form>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b border-ink-200/60 pb-1 font-serif text-sm font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
