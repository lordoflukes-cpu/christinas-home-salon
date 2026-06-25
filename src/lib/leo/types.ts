/**
 * Leo baby-tracker — data model.
 *
 * All timestamps are stored as epoch milliseconds (number) for cheap IndexedDB
 * range indexing and trivial JSON round-tripping. IDs use `crypto.randomUUID()`.
 */

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

/** Input shapes for creating entries (server fills id + timestamps). */
export type NewFeed = Omit<FeedEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewDiaper = Omit<DiaperEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type NewSleep = Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type ProfileInput = Omit<BabyProfile, 'id' | 'updatedAt'>;

/** Full backup payload for export / import. */
export interface LeoBackup {
  schemaVersion: number;
  exportedAt: Millis;
  profile: BabyProfile | null;
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
}

export type ImportMode = 'replace' | 'merge';
