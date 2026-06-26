/**
 * Jamaican Patois phrasing for Leo's voice — PURE, unit-tested.
 *
 * The owner's rule, enforced in code: **personality in Patois, safety in clear
 * English.** Cute/routine prompts get Patwah at the chosen strength; medication,
 * doses, appointment times and anything health/safety stays plain English so a
 * tired parent can never misread it. A Jamaican *voice* still reads it — only the
 * *words* switch to clear English.
 *
 * Patois spelling is informal/variable; these are friendly, readable forms.
 */
import type { AgendaItem } from './agenda';

export type PatwahStrength = 'light' | 'medium' | 'heavy';
export const PATWAH_STRENGTHS: PatwahStrength[] = ['light', 'medium', 'heavy'];

/** Voice preferences (stored on BabyProfile alongside `reminders`). */
export interface VoicePrefs {
  /** Master switch — when false, nothing is spoken. */
  enabled: boolean;
  /** How strong the Patois is for non-medical lines. */
  patwahStrength: PatwahStrength;
  /** Tap-to-hear on agenda / reminder items. */
  speakReminders: boolean;
  /** Speak button on Ask Leo / right-now answers. */
  speakAi: boolean;
  /** Speak button on the monthly recap. */
  speakRecaps: boolean;
  /** Speak the gentle daily briefing on Home. */
  speakBriefing?: boolean;
  /** Read Ask Leo answers aloud automatically (vs tapping "Speak"). */
  autoSpeakAnswers?: boolean;
  /** Playback speed multiplier (0.8–1.2; 1 = normal). */
  rate?: number;
  /** Locked on: health/dose lines are always clear English. */
  medicalClearEnglish: boolean;
}

export const DEFAULT_VOICE_PREFS: VoicePrefs = {
  enabled: false,
  patwahStrength: 'medium',
  speakReminders: true,
  speakAi: true,
  speakRecaps: true,
  speakBriefing: true,
  autoSpeakAnswers: false,
  rate: 1,
  medicalClearEnglish: true,
};

/** Short, fun/routine reminder kinds that can be spoken in Patois. */
export type ReminderSpeechKind =
  | 'feed'
  | 'nappy'
  | 'sleepCue'
  | 'bedtime'
  | 'burping'
  | 'longNap'
  | 'weeklyPhoto'
  | 'dailyMemory'
  | 'unsettled';

type Pools = Record<PatwahStrength, string[]>;

/** Phrase pools per kind × strength — several variants so it's not repetitive. */
const PHRASES: Record<ReminderSpeechKind, Pools> = {
  feed: {
    light: [
      'Leo might be ready for a feed now. Check when him last fed.',
      'Looks like feed time soon. Take a look when you can.',
    ],
    medium: [
      'Leo look ready fi him feed. Check di last feed time.',
      'Leo look like him ready fi a likkle feed. Tek a look when yuh can.',
    ],
    heavy: [
      'Leo look like him waan him feed now. Check when him did last nyam.',
      'Mi tink seh Leo ready fi him feed. Si when him last did eat.',
    ],
  },
  nappy: {
    light: ['Time to check Leo nappy. He might need a change.'],
    medium: ['Time fi check Leo nappy. Him might need a change.'],
    heavy: ['Boss man Leo might have a situation inna di nappy department.'],
  },
  sleepCue: {
    light: ['Leo is showing sleepy signs. Dim the lights and keep it calm.'],
    medium: [
      'Leo a show sleepy signs. Dim di light dem and start di calm routine.',
    ],
    heavy: ['Him look tired now. Less noise, low light, soft cuddle.'],
  },
  bedtime: {
    light: [
      'Bedtime routine now: low light, clean nappy, feed, burp, cuddle, sleep.',
    ],
    medium: [
      'Bedtime routine start now. Low light, clean nappy, feed, burp, cuddle, den sleep.',
    ],
    heavy: [
      'Time fi wind him dung. Low light, clean nappy, feed, burp, cuddle, den sleep.',
    ],
  },
  burping: {
    light: [
      'Keep him upright a little while so the wind can come up before you put him down.',
    ],
    medium: [
      'Keep him upright fi a likkle while. Mek di wind come up before yuh put him dung.',
    ],
    heavy: [
      'Hold him up likkle bit mek di burp come up before yuh lay him dung.',
    ],
  },
  longNap: {
    light: ['Leo has been napping a while. Check on him when you can.'],
    medium: ['Leo a nap fi a good while now. Tek a peek when yuh can.'],
    heavy: ['Leo deh sleep long now enuh. Gwaan check pon him.'],
  },
  weeklyPhoto: {
    light: [
      'Take one nice photo of Leo today — these little moments pass quick.',
    ],
    medium: [
      'Tek one nice photo a Leo today. Dem likkle moments nuh come back.',
    ],
    heavy: [
      'Snap one nice picture a Leo today, di likkle moment dem nuh wait.',
    ],
  },
  dailyMemory: {
    light: ['Write one nice thing Leo did today. Even if small, it matters.'],
    medium: ['Write one nice ting Leo do today. Even if it small, it matter.'],
    heavy: [
      'Jot dung one nice ting Leo do today, even di likkle ting dem matter.',
    ],
  },
  unsettled: {
    light: [
      'Leo is unsettled. Start simple: feed, nappy, wind, temperature, sleepy signs. One thing at a time.',
    ],
    medium: [
      'Leo unsettled. Start simple: feed, nappy, wind, temperature, sleep cues. One ting at a time.',
    ],
    heavy: [
      'Leo nuh settle. Tek it easy: feed, nappy, wind, temperature, sleepy signs. One ting at a time.',
    ],
  },
};

/**
 * Style instruction appended to the AI system prompt so generated content comes
 * out *in* Jamaican Patois at the chosen strength — with a hard carve-out that
 * medical facts stay clear English. Pure + testable; used by the AI route.
 */
export function patwahStyleInstruction(strength: PatwahStrength): string {
  const level: Record<PatwahStrength, string> = {
    light:
      'Write mostly in clear English with a gentle Jamaican-Patois lilt — a few natural Patois words and rhythms, easy for anyone to read.',
    medium:
      'Write in natural, warm Jamaican Patois that is still easy to follow — Patois phrasing and vocabulary, not too heavy.',
    heavy:
      'Write in rich, expressive Jamaican Patois throughout, the way it is spoken at home.',
  };
  return `${level[strength]} Keep it warm and human. IMPORTANT: keep all medical facts — medication names, doses, numbers, dates, times and any health-safety wording — in clear standard English even inside the Patois, so nothing important is ever unclear.`;
}

/** A friendly sample line for the "Test voice" button. */
export const PATWAH_SAMPLE: Record<PatwahStrength, string> = {
  light: 'Hi, I’m Leo’s helper. I’ll give you a little nudge now and then.',
  medium:
    'Wah gwaan! Mi deh yah fi help yuh wid Leo. Mi will gi yuh a likkle nudge now and den.',
  heavy:
    'Wah gwaan! A Leo helper dis. Mi will gi yuh a likkle shout when sinting need fi happen.',
};

function fill(text: string, vars?: Record<string, string>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/**
 * Pick a Patois phrase for a routine reminder. `seed` rotates the variant so
 * repeated reminders don't feel identical (pass a day/index seed; defaults to a
 * time-based rotation).
 */
export function patwahReminder(
  kind: ReminderSpeechKind,
  strength: PatwahStrength,
  opts: { seed?: number; vars?: Record<string, string> } = {},
): string {
  const pool = PHRASES[kind][strength];
  const seed = opts.seed ?? Math.floor(Date.now() / 60_000);
  const phrase = pool[Math.abs(seed) % pool.length];
  return fill(phrase, opts.vars);
}

/**
 * Clear-English medication line — NEVER Patois, always includes the dose/time
 * verbatim so there's no confusion. (The voice can still be Jamaican.)
 */
export function medicationSpeech(opts: {
  name: string;
  dose?: string;
  time?: string;
}): string {
  const parts = [`Medication reminder: ${opts.name}`];
  if (opts.dose) parts.push(`dose ${opts.dose}`);
  if (opts.time) parts.push(`due at ${opts.time}`);
  return `${parts.join(', ')}. Check the label before giving it.`;
}

/** Is this agenda item health/medical (must stay clear English)? */
function isMedicalAgenda(item: AgendaItem): boolean {
  return (
    item.key === 'vitd' ||
    item.key.startsWith('med-') ||
    /vaccinat|medicat|appointment|jab|dose/i.test(
      `${item.title} ${item.subtitle ?? ''}`,
    )
  );
}

/**
 * Spoken line for an agenda item. Feed/sleep get Patois; medical/appointment
 * and care tasks stay clear English (read the title/subtitle as-is).
 */
export function agendaSpeech(
  item: AgendaItem,
  strength: PatwahStrength,
  seed?: number,
): string {
  if (isMedicalAgenda(item)) {
    return item.subtitle
      ? `${item.title}. ${item.subtitle}.`
      : `${item.title}.`;
  }
  if (item.key === 'feed') return patwahReminder('feed', strength, { seed });
  if (item.key === 'sleep')
    return patwahReminder('longNap', strength, { seed });
  // Care tasks and anything else: read the (English) label plainly.
  return item.subtitle ? `${item.title}. ${item.subtitle}.` : `${item.title}.`;
}
