/**
 * Zod schema for validating imported Leo backup JSON.
 */
import { z } from 'zod';

const millis = z.number().int().nonnegative();

const reminderPrefsSchema = z.object({
  enabled: z.boolean(),
  feed: z.boolean(),
  feedHours: z.number().positive(),
  medical: z.boolean(),
  leadMinutes: z.number().nonnegative(),
  vitd: z.boolean(),
  vitdTime: z.string(),
  sleep: z.boolean(),
  sleepMaxHours: z.number().positive(),
  // Quiet hours — defaulted so older backups (which predate these) still parse.
  quiet: z.boolean().default(false),
  quietStart: z.string().default('22:00'),
  quietEnd: z.string().default('07:00'),
});

const voicePrefsSchema = z.object({
  enabled: z.boolean(),
  patwahStrength: z.enum(['light', 'medium', 'heavy']),
  speakReminders: z.boolean(),
  speakAi: z.boolean(),
  speakRecaps: z.boolean(),
  medicalClearEnglish: z.boolean(),
});

const babyProfileSchema = z.object({
  id: z.literal('leo'),
  name: z.string(),
  birth: millis,
  birthPlace: z.string().optional(),
  birthWeightGrams: z.number().positive().optional(),
  birthLengthCm: z.number().positive().optional(),
  birthHeadCircCm: z.number().positive().optional(),
  hospital: z.string().optional(),
  midwife: z.string().optional(),
  doctor: z.string().optional(),
  parents: z.string().optional(),
  nhsNumber: z.string().optional(),
  gp: z.string().optional(),
  healthVisitor: z.string().optional(),
  allergies: z.string().optional(),
  birthStory: z.string().optional(),
  heroPhotoId: z.string().optional(),
  reminders: reminderPrefsSchema.optional(),
  voicePrefs: voicePrefsSchema.optional(),
  updatedAt: millis,
});

const feedSchema = z.object({
  id: z.string(),
  type: z.enum(['breast', 'bottle']),
  startedAt: millis,
  side: z.enum(['L', 'R']).optional(),
  durationMin: z.number().nonnegative().optional(),
  amountMl: z.number().nonnegative().optional(),
  contents: z.enum(['formula', 'breastmilk']).optional(),
  note: z.string().optional(),
  active: z.boolean().optional(),
  endedAt: millis.optional(),
  createdAt: millis,
  updatedAt: millis,
});

const diaperSchema = z.object({
  id: z.string(),
  changedAt: millis,
  type: z.enum(['wet', 'dirty', 'both']),
  color: z.string().optional(),
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const sleepSchema = z.object({
  id: z.string(),
  startedAt: millis,
  endedAt: millis.optional(),
  quality: z.enum(['good', 'ok', 'restless']).optional(),
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const eventSchema = z.object({
  id: z.string(),
  kind: z.enum(['cry', 'temperature', 'medication', 'symptom', 'mood']),
  at: millis,
  note: z.string().optional(),
  durationMin: z.number().nonnegative().optional(),
  reason: z.string().optional(),
  tempC: z.number().optional(),
  tempMethod: z.enum(['armpit', 'ear', 'forehead', 'oral']).optional(),
  medName: z.string().optional(),
  dose: z.string().optional(),
  symptom: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  mood: z
    .enum(['calm', 'content', 'alert', 'sleepy', 'unsettled', 'fussy'])
    .optional(),
  createdAt: millis,
  updatedAt: millis,
});

const growthSchema = z.object({
  id: z.string(),
  measuredAt: millis,
  weightGrams: z.number().nonnegative().optional(),
  lengthCm: z.number().nonnegative().optional(),
  headCircCm: z.number().nonnegative().optional(),
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const medicalSchema = z.object({
  id: z.string(),
  at: millis,
  kind: z.enum(['appointment', 'vaccination', 'medication', 'note']),
  title: z.string(),
  scheduleId: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  batch: z.string().optional(),
  reaction: z.string().optional(),
  note: z.string().optional(),
  done: z.boolean().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const milestoneSchema = z.object({
  id: z.string(),
  achievedAt: millis,
  title: z.string(),
  category: z
    .enum(['physical', 'sounds', 'feeding', 'sleep', 'social', 'funny', 'big'])
    .optional(),
  note: z.string().optional(),
  noteFromChristina: z.string().optional(),
  whoThere: z.string().optional(),
  location: z.string().optional(),
  emotion: z
    .enum(['proud', 'funny', 'scary', 'beautiful', 'chaotic'])
    .optional(),
  photoId: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const journalSchema = z.object({
  id: z.string(),
  writtenAt: millis,
  title: z.string().optional(),
  body: z.string(),
  author: z.string().optional(),
  category: z
    .enum(['funny', 'sweet', 'hard', 'grateful', 'learned', 'message'])
    .optional(),
  photoId: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const photoBackupSchema = z.object({
  id: z.string(),
  takenAt: millis,
  dataUrl: z.string(),
  caption: z.string().optional(),
  favourite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  role: z.enum(['gallery', 'backdrop']).optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const voiceBackupSchema = z.object({
  id: z.string(),
  recordedAt: millis,
  dataUrl: z.string(),
  durationMs: z.number().nonnegative().optional(),
  title: z.string().optional(),
  transcript: z.string().optional(),
  category: z
    .enum(['funny', 'proud', 'emotional', 'message', 'firstSound'])
    .optional(),
  author: z.string().optional(),
  favourite: z.boolean().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const documentBackupSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().optional(),
  name: z.string().optional(),
  dataUrl: z.string(),
  at: millis,
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const sizeSchema = z.object({
  id: z.string(),
  kind: z.enum(['clothing', 'nappy', 'shoe']),
  size: z.string(),
  startedAt: millis,
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const routineSchema = z.object({
  id: z.string(),
  category: z.enum([
    'morning',
    'bedtime',
    'settling',
    'sleepCues',
    'hungerCues',
    'worked',
    'didntWork',
  ]),
  text: z.string(),
  position: z.number(),
  rating: z.enum(['works', 'sometimes', 'no']).optional(),
  createdAt: millis,
  updatedAt: millis,
});

const routineSessionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'morning',
    'nap',
    'bedtime',
    'settling',
    'feed_recovery',
    'custom',
  ]),
  startedAt: millis,
  endedAt: millis.optional(),
  startedBy: z.enum(['Luke', 'Christina', 'Both']).optional(),
  location: z.string().optional(),
  beforeMood: z.string().optional(),
  contextTags: z.array(z.string()).optional(),
  sleepCues: z.array(z.string()).optional(),
  hungerCues: z.array(z.string()).optional(),
  windSigns: z.array(z.string()).optional(),
  steps: z
    .array(
      z.object({
        name: z.string(),
        done: z.boolean(),
        at: millis.optional(),
      }),
    )
    .optional(),
  methods: z
    .array(
      z.object({
        method: z.string(),
        result: z.enum([
          'worked',
          'helped',
          'no_effect',
          'made_worse',
          'not_sure',
        ]),
        at: millis.optional(),
        minutesTried: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
  putDowns: z
    .array(
      z.object({
        kind: z.enum(['awake', 'drowsy', 'asleep', 'transfer']),
        result: z.enum(['stayed', 'woke']),
        afterMinutesAsleep: z.number().nonnegative().optional(),
        at: millis.optional(),
      }),
    )
    .optional(),
  settled: z.boolean().optional(),
  settleMinutes: z.number().nonnegative().optional(),
  sleptMinutes: z.number().nonnegative().optional(),
  wokeAfterPutDown: z.boolean().optional(),
  wokeMood: z.enum(['calm', 'fussy', 'crying']).optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const careTaskSchema = z.object({
  id: z.string(),
  kind: z.enum([
    'nappies',
    'sterilise',
    'weeklyPhoto',
    'dailyMemory',
    'binDay',
    'bathNight',
    'custom',
  ]),
  label: z.string(),
  cadence: z.enum(['daily', 'weekly', 'everyN']),
  intervalDays: z.number().positive().optional(),
  weekday: z.number().min(0).max(6).optional(),
  timeHHMM: z.string().optional(),
  enabled: z.boolean(),
  anchorAt: millis,
  lastDoneAt: millis.optional(),
  createdAt: millis,
  updatedAt: millis,
});

const recapSchema = z.object({
  id: z.string(),
  monthIndex: z.number().int().positive(),
  favouriteThing: z.string().optional(),
  newSkill: z.string().optional(),
  funniest: z.string().optional(),
  hardest: z.string().optional(),
  bestPhotoId: z.string().optional(),
  messageFromDad: z.string().optional(),
  messageFromMum: z.string().optional(),
  placesVisited: z.string().optional(),
  peopleMet: z.string().optional(),
  neverForget: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const savedRoutineSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    'morning',
    'nap',
    'bedtime',
    'settling',
    'feed_recovery',
    'custom',
  ]),
  steps: z.array(z.string()),
  methods: z.array(z.string()).optional(),
  note: z.string().optional(),
  fromSessionId: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const experimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  hypothesis: z.string().optional(),
  startedAt: millis,
  days: z.number().positive().optional(),
  status: z.enum(['running', 'worked', 'didnt', 'mixed', 'abandoned']),
  outcome: z.string().optional(),
  endedAt: millis.optional(),
  createdAt: millis,
  updatedAt: millis,
});

export const leoBackupSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: millis,
  profile: babyProfileSchema.nullable(),
  feeds: z.array(feedSchema),
  diapers: z.array(diaperSchema),
  sleeps: z.array(sleepSchema),
  growth: z.array(growthSchema).optional(),
  medical: z.array(medicalSchema).optional(),
  milestones: z.array(milestoneSchema).optional(),
  journal: z.array(journalSchema).optional(),
  events: z.array(eventSchema).optional(),
  sizes: z.array(sizeSchema).optional(),
  routines: z.array(routineSchema).optional(),
  routineSessions: z.array(routineSessionSchema).optional(),
  savedRoutines: z.array(savedRoutineSchema).optional(),
  experiments: z.array(experimentSchema).optional(),
  careTasks: z.array(careTaskSchema).optional(),
  recaps: z.array(recapSchema).optional(),
  voices: z.array(voiceBackupSchema).optional(),
  photos: z.array(photoBackupSchema).optional(),
  documents: z.array(documentBackupSchema).optional(),
});

export type ParsedBackup = z.infer<typeof leoBackupSchema>;
