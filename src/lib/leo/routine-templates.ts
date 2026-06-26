/**
 * Routine logger vocabulary + starter templates — static, pure, reusable.
 *
 * Kept free of React so it can be unit-tested and reused by the PR-2 insights
 * layer. The chip lists are deliberately short and tappable: the whole point of
 * the logger is that capturing a session takes under ~10 seconds.
 */
import type { MethodResult, PutDownAttempt, RoutineSessionType } from './types';

export interface RoutineTypeConfig {
  type: RoutineSessionType;
  label: string;
  emoji: string;
}

/** The session types offered on the "Start a routine" row. */
export const ROUTINE_TYPES: RoutineTypeConfig[] = [
  { type: 'settling', label: 'Settling', emoji: '🤱' },
  { type: 'nap', label: 'Nap', emoji: '😴' },
  { type: 'bedtime', label: 'Bedtime', emoji: '🌙' },
  { type: 'morning', label: 'Morning', emoji: '🌅' },
  { type: 'feed_recovery', label: 'Feed recovery', emoji: '🍼' },
  { type: 'custom', label: 'Custom', emoji: '✨' },
];

export function routineTypeConfig(type: RoutineSessionType): RoutineTypeConfig {
  return (
    ROUTINE_TYPES.find((t) => t.type === type) ?? {
      type,
      label: 'Routine',
      emoji: '✨',
    }
  );
}

/** Ready-made step lists so parents tick off rather than type. */
export const SESSION_TEMPLATES: Record<RoutineSessionType, string[]> = {
  morning: [
    'Wake',
    'Nappy',
    'Feed',
    'Burp',
    'Cuddle',
    'Short awake time',
    'Nap',
  ],
  nap: [
    'Notice sleepy cue',
    'Change nappy if needed',
    'Swaddle / sleep bag',
    'White noise',
    'Rock / cuddle',
    'Put down',
    'Sleep',
  ],
  bedtime: [
    'Dim lights',
    'Nappy change',
    'Bath or wash',
    'Sleepsuit',
    'Feed',
    'Burp',
    'Cuddle',
    'White noise',
    'Put down',
    'Sleep',
  ],
  feed_recovery: [
    'Burp halfway',
    'Burp after feed',
    'Keep upright 15 minutes',
    'Avoid lying flat immediately',
  ],
  settling: [],
  custom: [],
};

// --- Quick chip vocabularies ------------------------------------------------

/** Context before a routine. */
export const CONTEXT_TAGS: string[] = [
  'Calm',
  'Hungry',
  'Overtired',
  'Windy',
  'Crying',
  'Awake too long',
  'Just had nappy',
  'Dirty nappy suspected',
  'Too hot',
  'Too cold',
  'Noisy house',
  'Car journey',
  'Out of routine',
];

export const SLEEP_CUES: string[] = [
  'Yawning',
  'Staring',
  'Red eyebrows / eyes',
  'Fussing',
  'Looking away',
  'Jerky movements',
  'Pulling a face',
  'Crying',
  'Going quiet',
  'Clenched fists',
];

export const HUNGER_CUES: string[] = [
  'Rooting',
  'Hands to mouth',
  'Lip smacking',
  'Turning head',
  'Sucking fist',
  'Fussing',
  'Crying',
  'Calms when offered feed',
  'Still unsettled after feed',
];

export const WIND_SIGNS: string[] = [
  'Burped quickly',
  'Took ages to burp',
  'No burp',
  'Hiccups',
  'Spit-up',
  'Arching back',
  'Pulling legs up',
  'Grunting',
  'Uncomfortable lying flat',
  'Settles better upright',
];

/** Settling methods offered in the live session. */
export const SETTLING_METHODS: string[] = [
  'Shoulder cuddle',
  'Rocking',
  'Walking',
  'Gentle bounce',
  'White noise',
  'Dummy',
  'Feed',
  'Burp',
  'Swaddle',
  'Dark room',
  'Put straight down',
  'Pram / car',
];

export interface MethodResultConfig {
  result: MethodResult;
  label: string;
  emoji: string;
  /** -1 worse · 0 neutral · 1 helped · 2 worked — used by PR-2 insights. */
  positivity: number;
}

export const METHOD_RESULTS: MethodResultConfig[] = [
  { result: 'worked', label: 'Worked', emoji: '💚', positivity: 2 },
  { result: 'helped', label: 'Helped', emoji: '🙂', positivity: 1 },
  { result: 'no_effect', label: "Didn't help", emoji: '😐', positivity: 0 },
  { result: 'made_worse', label: 'Made worse', emoji: '🚫', positivity: -1 },
  { result: 'not_sure', label: 'Not sure', emoji: '🤷', positivity: 0 },
];

export interface PutDownKindConfig {
  kind: PutDownAttempt['kind'];
  label: string;
}

export const PUT_DOWN_KINDS: PutDownKindConfig[] = [
  { kind: 'awake', label: 'Put down awake' },
  { kind: 'drowsy', label: 'Put down drowsy' },
  { kind: 'asleep', label: 'Put down asleep' },
  { kind: 'transfer', label: 'Transfer from arms' },
];

export const LOCATIONS: string[] = [
  'Cot',
  'Moses basket',
  'Pram',
  'Car',
  'Arms',
  'Sofa',
];

export interface ConfidenceConfig {
  value: 'high' | 'medium' | 'low';
  label: string;
}

export const CONFIDENCE_LEVELS: ConfidenceConfig[] = [
  { value: 'high', label: 'Definitely worked' },
  { value: 'medium', label: 'Probably / not sure' },
  { value: 'low', label: 'Did not work' },
];

export const PARENTS = ['Luke', 'Christina', 'Both'] as const;
