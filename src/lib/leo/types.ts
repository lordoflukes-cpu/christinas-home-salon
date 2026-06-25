/**
 * Leo baby-tracker — data model.
 *
 * All timestamps are stored as epoch milliseconds (number) for cheap IndexedDB
 * range indexing and trivial JSON round-tripping. IDs use `crypto.randomUUID()`.
 */

import type { ReminderPrefs } from './reminders';

/** Epoch milliseconds (e.g. `Date.now()` / `now().getTime()`). */
export type Millis = number;

export type FeedType = 'breast' | 'bottle';
export type BreastSide = 'L' | 'R';
export type BottleContents = 'formula' | 'breastmilk';
export type DiaperType = 'wet' | 'dirty' | 'both';

/** Singleton profile record, always keyed `'leo'`. */
export interface BabyProfile {
  id: 'leo';
  name: string;
  /** Date/time of birth, epoch ms. */
  birth: Millis;
  birthWeightGrams?: number;
  birthLengthCm?: number;
  birthHeadCircCm?: number;
  /** PhotoEntry id chosen as the hero image, if any. */
  heroPhotoId?: string;
  /** Notification/reminder preferences (shared across phones). */
  reminders?: ReminderPrefs;
  updatedAt: Millis;
}

export interface FeedEntry {
  id: string;
  type: FeedType;
  /** When the feed started (indexed). */
  startedAt: Millis;
  // breast feeds
  side?: BreastSide;
  durationMin?: number;
  // bottle feeds
  amountMl?: number;
  contents?: BottleContents;
  note?: string;
  /** True while a live feed timer is running (set by the stopwatch). */
  active?: boolean;
  /** When a timed feed finished; used to derive `durationMin`. */
  endedAt?: Millis;
  createdAt: Millis;
  updatedAt: Millis;
}

export interface DiaperEntry {
  id: string;
  /** When the nappy was changed (indexed). */
  changedAt: Millis;
  type: DiaperType;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export interface SleepEntry {
  id: string;
  /** When sleep started (indexed). */
  startedAt: Millis;
  /** When sleep ended; `undefined` means "asleep now" (a running timer). */
  endedAt?: Millis;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Growth & health
// ---------------------------------------------------------------------------

export interface GrowthEntry {
  id: string;
  /** When the measurement was taken (indexed). */
  measuredAt: Millis;
  weightGrams?: number;
  lengthCm?: number;
  headCircCm?: number;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export type MedicalKind = 'appointment' | 'vaccination' | 'medication';

export interface MedicalEntry {
  id: string;
  /** Date/time the event is scheduled or happened (indexed). */
  at: Millis;
  kind: MedicalKind;
  title: string;
  /** For vaccinations from the routine schedule: a stable slug, e.g. '8w-6in1'. */
  scheduleId?: string;
  location?: string;
  note?: string;
  /** Whether it has been completed/given. */
  done?: boolean;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Memories
// ---------------------------------------------------------------------------

export interface MilestoneEntry {
  id: string;
  /** When it happened (indexed). */
  achievedAt: Millis;
  title: string;
  note?: string;
  photoId?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export interface JournalEntry {
  id: string;
  /** When the note was written / dated (indexed). */
  writtenAt: Millis;
  title?: string;
  body: string;
  photoId?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

/**
 * Photo stored on-device. Image bytes are kept as an ArrayBuffer (+ mime
 * `type`) rather than a Blob — universally structured-cloneable and reliable
 * across browsers/IndexedDB implementations.
 */
export type PhotoRole = 'gallery' | 'backdrop';

export interface PhotoEntry {
  id: string;
  /** When the photo was taken (indexed). */
  takenAt: Millis;
  bytes: ArrayBuffer;
  type: string;
  caption?: string;
  /** 'backdrop' photos are used behind section banners; default is gallery. */
  role?: PhotoRole;
  /** Pixel dimensions after downscaling, for layout. */
  w?: number;
  h?: number;
  createdAt: Millis;
  updatedAt: Millis;
}

/** Photo as serialised in a JSON backup (Blob → base64 data URL). */
export interface PhotoBackup {
  id: string;
  takenAt: Millis;
  dataUrl: string;
  caption?: string;
  role?: PhotoRole;
  w?: number;
  h?: number;
  createdAt: Millis;
  updatedAt: Millis;
}

/** Input shapes for creating entries (repository fills id + timestamps). */
export type NewFeed = Omit<FeedEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewDiaper = Omit<DiaperEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewSleep = Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewGrowth = Omit<GrowthEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMedical = Omit<MedicalEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMilestone = Omit<
  MilestoneEntry,
  'id' | 'createdAt' | 'updatedAt'
>;
export type NewJournal = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewPhotoMeta = Omit<
  PhotoEntry,
  'id' | 'bytes' | 'type' | 'createdAt' | 'updatedAt'
>;

export type ProfileInput = Omit<BabyProfile, 'id' | 'updatedAt'>;

/** Full backup payload for export / import. */
export interface LeoBackup {
  schemaVersion: number;
  exportedAt: Millis;
  profile: BabyProfile | null;
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  growth?: GrowthEntry[];
  medical?: MedicalEntry[];
  milestones?: MilestoneEntry[];
  journal?: JournalEntry[];
  photos?: PhotoBackup[];
}

export type ImportMode = 'replace' | 'merge';
