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

export const leoBackupSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: millis,
  profile: babyProfileSchema.nullable(),
  feeds: z.array(feedSchema),
  diapers: z.array(diaperSchema),
  sleeps: z.array(sleepSchema),
});

export type ParsedBackup = z.infer<typeof leoBackupSchema>;
