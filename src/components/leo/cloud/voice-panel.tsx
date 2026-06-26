'use client';

import { Volume2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useSpeaker,
  DEFAULT_VOICE_PREFS,
  PATWAH_SAMPLE,
  type VoicePrefs,
  type PatwahStrength,
} from '@/lib/leo';
import { Segmented } from '../forms/feed-form';

const STRENGTHS: { value: PatwahStrength; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const SPEEDS: { value: string; label: string }[] = [
  { value: '0.85', label: 'Slower' },
  { value: '1', label: 'Normal' },
  { value: '1.15', label: 'Faster' },
];

export function VoicePanel() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { speak, status } = useSpeaker();
  const { toast } = useToast();

  if (!profile) return null;
  const prefs: VoicePrefs = profile.voicePrefs ?? DEFAULT_VOICE_PREFS;

  async function savePrefs(patch: Partial<VoicePrefs>) {
    if (!profile) return;
    const next: VoicePrefs = { ...prefs, ...patch, medicalClearEnglish: true };
    const { id: _id, updatedAt: _u, ...rest } = profile;
    await editProfile({ ...rest, voicePrefs: next });
  }

  async function test() {
    await speak(PATWAH_SAMPLE[prefs.patwahStrength]);
    if (status === 'notConfigured') {
      toast({
        title: 'Voice isn’t set up yet',
        description: 'Add the ElevenLabs key on the server to hear Leo speak.',
      });
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <Volume2 className="h-5 w-5 text-gold-600" /> Leo’s voice
      </h2>
      <p className="mb-4 text-sm text-ink-600">
        Let Leo speak in Jamaican Patois — reminders, answers and recaps, read
        aloud. Tap to hear; nothing plays on its own.
      </p>

      <label className="mb-4 flex items-start gap-3 rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3">
        <Checkbox
          checked={prefs.enabled}
          onCheckedChange={(v) => savePrefs({ enabled: Boolean(v) })}
          className="mt-0.5"
        />
        <span className="flex-1">
          <span className="block text-sm font-medium text-ink-900">
            Enable voice
          </span>
          <span className="block text-xs text-ink-500">
            Adds a “Speak” button where Leo can read things out.
          </span>
        </span>
      </label>

      {prefs.enabled && (
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Patwah strength
            </p>
            <Segmented
              value={prefs.patwahStrength}
              onChange={(v) =>
                savePrefs({ patwahStrength: v as PatwahStrength })
              }
              options={STRENGTHS}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Speed
            </p>
            <Segmented
              value={String(prefs.rate ?? 1)}
              onChange={(v) => savePrefs({ rate: Number(v) })}
              options={SPEEDS}
            />
          </div>

          <div className="space-y-2">
            <SpeakToggle
              label="Reminders"
              hint="Tap-to-hear on your “Coming up” agenda"
              checked={prefs.speakReminders}
              onChange={(v) => savePrefs({ speakReminders: v })}
            />
            <SpeakToggle
              label="Ask Leo answers"
              hint="A Speak button on AI answers & the right-now coach"
              checked={prefs.speakAi}
              onChange={(v) => savePrefs({ speakAi: v })}
            />
            <SpeakToggle
              label="Read answers aloud automatically"
              hint="Speak Ask Leo’s answer as soon as it arrives"
              checked={prefs.autoSpeakAnswers ?? false}
              onChange={(v) => savePrefs({ autoSpeakAnswers: v })}
            />
            <SpeakToggle
              label="Daily briefing"
              hint="A “Hear it” button on Leo’s morning briefing"
              checked={prefs.speakBriefing ?? true}
              onChange={(v) => savePrefs({ speakBriefing: v })}
            />
            <SpeakToggle
              label="Monthly recap"
              hint="Read this month’s recap out loud"
              checked={prefs.speakRecaps}
              onChange={(v) => savePrefs({ speakRecaps: v })}
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-aegean-50 px-3 py-2 text-xs text-aegean-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Medication, doses and appointment times are always spoken in clear
            English — the voice stays Jamaican, but the wording is never left to
            chance.
          </p>

          <Button
            onClick={test}
            disabled={status === 'loading'}
            size="lg"
            className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-5 w-5" /> Test voice
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}

function SpeakToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(Boolean(v))}
        className="mt-0.5"
      />
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        <span className="block text-xs text-ink-500">{hint}</span>
      </span>
    </label>
  );
}
