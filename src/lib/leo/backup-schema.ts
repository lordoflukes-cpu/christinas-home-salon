/**
 * Zod schema for validating imported Leo backup JSON.
 */
import { z } from 'zod';

const millis = z.number().int().nonnegative();

const babyProfileSchema = z.object({
  id: z.literal('leo'),
  name: z.string(),
  birth: millis,
  birthWeightGrams: z.number().positive().optional(),
  birthLengthCm: z.number().positive().optional(),
  birthHeadCircCm: z.number().positive().optional(),
  heroPhotoId: z.string().optional(),
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
  createdAt: millis,
  updatedAt: millis,
});

const diaperSchema = z.object({
  id: z.string(),
  changedAt: millis,
  type: z.enum(['wet', 'dirty', 'both']),
  note: z.string().optional(),
  createdAt: millis,
  updatedAt: millis,
});

const sleepSchema = z.object({
  id: z.string(),
  startedAt: millis,
  endedAt: millis.optional(),
  note: z.string().optional(),
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
  kind: z.enum(['appointment', 'vaccination', 'medication']),
  title: z.string(),
  scheduleId: z.string().optional(),
  location: z.string().optional(),
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
  w: z.number().optional(),
  h: z.number().optional(),
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
  photos: z.array(photoBackupSchema).optional(),
});

export type ParsedBackup = z.infer<typeof leoBackupSchema>;
