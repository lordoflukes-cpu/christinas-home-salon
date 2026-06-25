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
  note: z.string().optional(),
  photoId: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const journalSchema = z.object({
  id: z.string(),
  writtenAt: millis,
  title: z.string().optional(),
  body: z.string(),
  photoId: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const photoBackupSchema = z.object({
  id: z.string(),
  takenAt: millis,
  dataUrl: z.string(),
  caption: z.string().optional(),
  role: z.enum(['gallery', 'backdrop']).optional(),
  w: z.number().optional(),
  h: z.number().optional(),
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
  photos: z.array(photoBackupSchema).optional(),
  documents: z.array(documentBackupSchema).optional(),
});

export type ParsedBackup = z.infer<typeof leoBackupSchema>;
