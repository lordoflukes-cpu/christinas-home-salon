'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLeoStore, toDatetimeLocal, fromDatetimeLocal } from '@/lib/leo';
import type {
  EventKind,
  LeoEvent,
  MoodKind,
  Severity,
  TempMethod,
} from '@/lib/leo';
import { cn } from '@/lib/utils';

const MOODS: { value: MoodKind; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'content', label: 'Content', emoji: '🙂' },
  { value: 'alert', label: 'Alert', emoji: '👀' },
  { value: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { value: 'unsettled', label: 'Unsettled', emoji: '😣' },
  { value: 'fussy', label: 'Fussy', emoji: '😤' },
];

const CRY_REASONS = [
  'Hungry',
  'Tired',
  'Wind',
  'Nappy',
  'Too hot',
  'Too cold',
  'Overstimulated',
  'Unknown',
];

const TEMP_METHODS: { value: TempMethod; label: string }[] = [
  { value: 'armpit', label: 'Armpit' },
  { value: 'ear', label: 'Ear' },
  { value: 'forehead', label: 'Forehead' },
  { value: 'oral', label: 'Oral' },
];

const MEDS = ['Calpol', 'Vitamin D', 'Ibuprofen', 'Gripe water', 'Other'];

const SYMPTOMS = [
  'Rash',
  'Cough',
  'Congestion',
  'Vomiting',
  'Diarrhoea',
  'Jitteriness',
  'Fever',
  'Other',
];

const SEVERITIES: { value: Severity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const SAVE_LABEL: Record<EventKind, string> = {
  mood: 'Save mood',
  cry: 'Save crying',
  temperature: 'Save temperature',
  medication: 'Save medication',
  symptom: 'Save symptom',
};

export function EventForm({
  kind,
  entry,
  onDone,
}: {
  kind: EventKind;
  entry?: LeoEvent;
  onDone: () => void;
}) {
  const createEvent = useLeoStore((s) => s.createEvent);
  const editEvent = useLeoStore((s) => s.editEvent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [atLocal, setAtLocal] = useState(
    toDatetimeLocal(entry?.at ?? Date.now()),
  );
  const [note, setNote] = useState(entry?.note ?? '');
  const [mood, setMood] = useState<MoodKind | ''>(entry?.mood ?? '');
  const [reason, setReason] = useState(entry?.reason ?? '');
  const [durationMin, setDurationMin] = useState(
    entry?.durationMin != null ? String(entry.durationMin) : '',
  );
  const [tempC, setTempC] = useState(
    entry?.tempC != null ? String(entry.tempC) : '',
  );
  const [tempMethod, setTempMethod] = useState<TempMethod>(
    entry?.tempMethod ?? 'armpit',
  );
  const [medName, setMedName] = useState(entry?.medName ?? '');
  const [dose, setDose] = useState(entry?.dose ?? '');
  const [symptom, setSymptom] = useState(entry?.symptom ?? '');
  const [severity, setSeverity] = useState<Severity | ''>(
    entry?.severity ?? '',
  );

  const tempNum = parseFloat(tempC);
  const tempWarn =
    kind === 'temperature' && !Number.isNaN(tempNum)
      ? tempNum >= 38
        ? 'high'
        : tempNum < 36
          ? 'low'
          : null
      : null;

  async function submit() {
    setError(null);
    if (kind === 'mood' && !mood) return setError('Pick how Leo seems.');
    if (kind === 'temperature' && Number.isNaN(tempNum))
      return setError('Enter a temperature.');

    setBusy(true);
    try {
      const data = {
        kind,
        at: fromDatetimeLocal(atLocal),
        note: note.trim() || undefined,
        mood: kind === 'mood' ? (mood as MoodKind) : undefined,
        reason:
          (kind === 'cry' || kind === 'medication') && reason.trim()
            ? reason.trim()
            : undefined,
        durationMin:
          kind === 'cry' && durationMin ? Number(durationMin) : undefined,
        tempC: kind === 'temperature' ? tempNum : undefined,
        tempMethod: kind === 'temperature' ? tempMethod : undefined,
        medName:
          kind === 'medication' && medName.trim() ? medName.trim() : undefined,
        dose: kind === 'medication' && dose.trim() ? dose.trim() : undefined,
        symptom:
          kind === 'symptom' && symptom.trim() ? symptom.trim() : undefined,
        severity:
          kind === 'symptom' && severity ? (severity as Severity) : undefined,
      };
      if (entry) await editEvent(entry.id, data);
      else await createEvent(data);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {kind === 'mood' && (
        <Field label="How does Leo seem?">
          <ChipGroup
            options={MOODS.map((m) => ({
              value: m.value,
              label: `${m.emoji} ${m.label}`,
            }))}
            value={mood}
            onChange={(v) => setMood(v as MoodKind)}
          />
        </Field>
      )}

      {kind === 'cry' && (
        <>
          <Field label="Possible reason (optional)">
            <ChipGroup
              options={CRY_REASONS.map((r) => ({ value: r, label: r }))}
              value={reason}
              onChange={setReason}
              clearable
            />
          </Field>
          <Field label="How long? (minutes, optional)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="e.g. 20"
            />
          </Field>
        </>
      )}

      {kind === 'temperature' && (
        <>
          <Field label="Temperature (°C)">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={tempC}
              onChange={(e) => setTempC(e.target.value)}
              placeholder="e.g. 37.2"
            />
            {tempWarn === 'high' && (
              <p className="mt-1 text-xs text-rose-600">
                That&apos;s a high reading — if Leo seems unwell, call 111 or
                your GP.
              </p>
            )}
            {tempWarn === 'low' && (
              <p className="mt-1 text-xs text-aegean-600">
                That&apos;s on the low side — keep him cosy and recheck.
              </p>
            )}
          </Field>
          <Field label="Method">
            <ChipGroup
              options={TEMP_METHODS}
              value={tempMethod}
              onChange={(v) => setTempMethod(v as TempMethod)}
            />
          </Field>
        </>
      )}

      {kind === 'medication' && (
        <>
          <Field label="Medicine">
            <ChipGroup
              options={MEDS.map((m) => ({ value: m, label: m }))}
              value={MEDS.includes(medName) ? medName : 'Other'}
              onChange={(v) => setMedName(v === 'Other' ? '' : v)}
            />
            <Input
              className="mt-2"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="Name (e.g. Calpol / paracetamol)"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dose">
              <Input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 2.5 ml"
              />
            </Field>
            <Field label="Reason (optional)">
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. teething"
              />
            </Field>
          </div>
        </>
      )}

      {kind === 'symptom' && (
        <>
          <Field label="Symptom">
            <ChipGroup
              options={SYMPTOMS.map((s) => ({ value: s, label: s }))}
              value={
                SYMPTOMS.includes(symptom) ? symptom : symptom ? 'Other' : ''
              }
              onChange={(v) => setSymptom(v === 'Other' ? '' : v)}
            />
            {(!SYMPTOMS.includes(symptom) || symptom === '') && (
              <Input
                className="mt-2"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Describe the symptom"
              />
            )}
          </Field>
          <Field label="Severity (optional)">
            <ChipGroup
              options={SEVERITIES}
              value={severity}
              onChange={(v) => setSeverity(v as Severity)}
              clearable
            />
          </Field>
        </>
      )}

      <Field label="Time">
        <Input
          type="datetime-local"
          value={atLocal}
          onChange={(e) => setAtLocal(e.target.value)}
        />
      </Field>

      <Field label="Note (optional)">
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={submit}
        disabled={busy}
        size="lg"
        className="min-h-14 w-full bg-ink-700 text-base hover:bg-ink-800"
      >
        {entry ? 'Save changes' : SAVE_LABEL[kind]}
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/** Wrapping selectable chips. `clearable` lets you tap again to deselect. */
export function ChipGroup({
  options,
  value,
  onChange,
  clearable = false,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  clearable?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(clearable && active ? '' : opt.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'border-ink-700 bg-ink-700 text-parchment-50'
                : 'border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
