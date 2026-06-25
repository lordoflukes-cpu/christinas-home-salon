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
  /** Where Leo was born, e.g. "Lewisham Hospital, London". */
  birthPlace?: string;
  birthWeightGrams?: number;
  birthLengthCm?: number;
  birthHeadCircCm?: number;
  // Hospital / care team
  hospital?: string;
  midwife?: string;
  doctor?: string;
  /** Parents, e.g. "Luke & Christina". */
  parents?: string;
  // Emergency & health
  nhsNumber?: string;
  /** GP practice / doctor. */
  gp?: string;
  healthVisitor?: string;
  allergies?: string;
  /** Free-text birth story — the day Leo arrived. */
  birthStory?: string;
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
  /** Optional colour note for dirty nappies (e.g. 'yellow', 'green'). */
  color?: string;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export type SleepQuality = 'good' | 'ok' | 'restless';

export interface SleepEntry {
  id: string;
  /** When sleep started (indexed). */
  startedAt: Millis;
  /** When sleep ended; `undefined` means "asleep now" (a running timer). */
  endedAt?: Millis;
  /** Rough quality of the sleep. */
  quality?: SleepQuality;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Daily "moment" events — crying, temperature, medication, symptom, mood.
// One flexible store keeps the daily log easy to extend.
// ---------------------------------------------------------------------------

export type EventKind =
  | 'cry'
  | 'temperature'
  | 'medication'
  | 'symptom'
  | 'mood';
export type MoodKind =
  | 'calm'
  | 'content'
  | 'alert'
  | 'sleepy'
  | 'unsettled'
  | 'fussy';
export type TempMethod = 'armpit' | 'ear' | 'forehead' | 'oral';
export type Severity = 'mild' | 'moderate' | 'severe';

export interface LeoEvent {
  id: string;
  kind: EventKind;
  /** When it happened (indexed). */
  at: Millis;
  note?: string;
  // crying / fussiness
  durationMin?: number;
  reason?: string;
  // temperature
  tempC?: number;
  tempMethod?: TempMethod;
  // medication
  medName?: string;
  dose?: string;
  // symptom
  symptom?: string;
  severity?: Severity;
  // mood
  mood?: MoodKind;
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

// ---------------------------------------------------------------------------
// Routine builder — routines, cues, and what works / doesn't
// ---------------------------------------------------------------------------

export type RoutineCategory =
  | 'morning'
  | 'bedtime'
  | 'settling'
  | 'sleepCues'
  | 'hungerCues'
  | 'worked'
  | 'didntWork';

/** For settling methods: how well it works for Leo. */
export type RoutineRating = 'works' | 'sometimes' | 'no';

export interface RoutineItem {
  id: string;
  category: RoutineCategory;
  text: string;
  /** Sort order within its category (lower first). */
  position: number;
  rating?: RoutineRating;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Sizes — clothing / nappy / shoe over time
// ---------------------------------------------------------------------------

export type SizeKind = 'clothing' | 'nappy' | 'shoe';

export interface SizeEntry {
  id: string;
  kind: SizeKind;
  /** Free-text size label, e.g. '0-3 months', 'Size 2', 'EU 16'. */
  size: string;
  /** When Leo started wearing this size (indexed). */
  startedAt: Millis;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export type MedicalKind = 'appointment' | 'vaccination' | 'medication' | 'note';

export interface MedicalEntry {
  id: string;
  /** Date/time the event is scheduled or happened (indexed). */
  at: Millis;
  kind: MedicalKind;
  title: string;
  /** For vaccinations from the routine schedule: a stable slug, e.g. '8w-6in1'. */
  scheduleId?: string;
  /** Appointment type: midwife / health visitor / GP / hospital. */
  category?: string;
  location?: string;
  /** Vaccination batch number. */
  batch?: string;
  /** Any reaction to a vaccination. */
  reaction?: string;
  note?: string;
  /** Whether it has been completed/given. */
  done?: boolean;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Memories
// ---------------------------------------------------------------------------

export type MilestoneCategory =
  | 'physical'
  | 'sounds'
  | 'feeding'
  | 'sleep'
  | 'social'
  | 'funny'
  | 'big';

export type Emotion = 'proud' | 'funny' | 'scary' | 'beautiful' | 'chaotic';

export interface MilestoneEntry {
  id: string;
  /** When it happened (indexed). */
  achievedAt: Millis;
  title: string;
  category?: MilestoneCategory;
  /** Note from the logging parent. */
  note?: string;
  /** Note from Christina. */
  noteFromChristina?: string;
  /** Who was there. */
  whoThere?: string;
  location?: string;
  emotion?: Emotion;
  photoId?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

export type JournalCategory =
  | 'funny'
  | 'sweet'
  | 'hard'
  | 'grateful'
  | 'learned'
  | 'message';

export interface JournalEntry {
  id: string;
  /** When the note was written / dated (indexed). */
  writtenAt: Millis;
  title?: string;
  body: string;
  /** Who wrote it, e.g. 'Daddy' / 'Mummy'. */
  author?: string;
  /** Which prompt this answers. */
  category?: JournalCategory;
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
  /** Marked a favourite — the best ones. */
  favourite?: boolean;
  /** Free tags, e.g. ['smile', 'family', 'bath']. */
  tags?: string[];
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
  favourite?: boolean;
  tags?: string[];
  role?: PhotoRole;
  w?: number;
  h?: number;
  createdAt: Millis;
  updatedAt: Millis;
}

/**
 * A stored document — a letter, prescription, report, etc. Like a photo, the
 * file bytes are kept as an ArrayBuffer (+ mime `type`); PDFs and images both
 * work.
 */
export interface DocumentEntry {
  id: string;
  title: string;
  /** e.g. 'letter', 'prescription', 'report', 'other'. */
  category?: string;
  /** Original filename, if known. */
  name?: string;
  bytes: ArrayBuffer;
  type: string;
  /** Date on the document (indexed). */
  at: Millis;
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

/** Document as serialised in a JSON backup (bytes → base64 data URL). */
export interface DocumentBackup {
  id: string;
  title: string;
  category?: string;
  name?: string;
  dataUrl: string;
  at: Millis;
  note?: string;
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
export type NewEvent = Omit<LeoEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type NewSize = Omit<SizeEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewRoutine = Omit<RoutineItem, 'id' | 'createdAt' | 'updatedAt'>;
export type NewPhotoMeta = Omit<
  PhotoEntry,
  'id' | 'bytes' | 'type' | 'createdAt' | 'updatedAt'
>;
export type NewDocumentMeta = Omit<
  DocumentEntry,
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
  events?: LeoEvent[];
  sizes?: SizeEntry[];
  routines?: RoutineItem[];
  photos?: PhotoBackup[];
  documents?: DocumentBackup[];
}

export type ImportMode = 'replace' | 'merge';
