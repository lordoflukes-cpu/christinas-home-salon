/**
 * Leo baby-tracker — data model.
 *
 * All timestamps are stored as epoch milliseconds (number) for cheap IndexedDB
 * range indexing and trivial JSON round-tripping. IDs use `crypto.randomUUID()`.
 */

import type { ReminderPrefs } from './reminders';
import type { VoicePrefs } from './patwah';

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
  /** Jamaican-Patois voice (ElevenLabs) preferences. */
  voicePrefs?: VoicePrefs;
  /** Slideshow music preferences (shared across phones). */
  slideshowPrefs?: SlideshowPrefs;
  updatedAt: Millis;
}

/** Slideshow music preferences — which song plays and whether to blend songs. */
export interface SlideshowPrefs {
  /** Filename (under /leo/music) of the song that plays by default. */
  defaultTrack?: string;
  /** When true, play through all songs with a gentle crossfade instead of looping one. */
  mix?: boolean;
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
// Routine SESSIONS — a logged settling / nap / bedtime episode (the smart log)
// ---------------------------------------------------------------------------

export type RoutineSessionType =
  | 'morning'
  | 'nap'
  | 'bedtime'
  | 'settling'
  | 'feed_recovery'
  | 'custom';

/** How a settling method went this time. */
export type MethodResult =
  | 'worked'
  | 'helped'
  | 'no_effect'
  | 'made_worse'
  | 'not_sure';

export type ParentName = 'Luke' | 'Christina' | 'Both';

/** One step of a routine template, ticked off as it happens. */
export interface RoutineStep {
  name: string;
  done: boolean;
  at?: Millis;
}

/** A settling method tried during a session, with its outcome. */
export interface RoutineMethod {
  method: string;
  result: MethodResult;
  at?: Millis;
  minutesTried?: number;
}

/** A "put down" attempt and whether Leo stayed asleep. */
export interface PutDownAttempt {
  kind: 'awake' | 'drowsy' | 'asleep' | 'transfer';
  result: 'stayed' | 'woke';
  afterMinutesAsleep?: number;
  at?: Millis;
}

/**
 * A logged routine session. Nested arrays live inline (cloud sync mirrors the
 * record as JSON, so nested objects are fine).
 */
export interface RoutineSession {
  id: string;
  type: RoutineSessionType;
  startedAt: Millis;
  endedAt?: Millis;
  startedBy?: ParentName;
  location?: string;
  beforeMood?: string;
  contextTags?: string[];
  sleepCues?: string[];
  hungerCues?: string[];
  windSigns?: string[];
  steps?: RoutineStep[];
  methods?: RoutineMethod[];
  putDowns?: PutDownAttempt[];
  settled?: boolean;
  settleMinutes?: number;
  sleptMinutes?: number;
  wokeAfterPutDown?: boolean;
  wokeMood?: 'calm' | 'fussy' | 'crying';
  confidence?: 'high' | 'medium' | 'low';
  note?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Saved routines — a named, reusable routine the parents can start from
// ---------------------------------------------------------------------------

/**
 * A reusable routine the parents have saved (often distilled from a session
 * that worked well). Starting one pre-fills a new session's steps + suggested
 * methods, so a good bedtime/nap flow is one tap away.
 */
export interface SavedRoutine {
  id: string;
  name: string;
  type: RoutineSessionType;
  /** Ordered step names to tick off. */
  steps: string[];
  /** Settling methods worth trying for this routine. */
  methods?: string[];
  note?: string;
  /** The session it was created from, if any. */
  fromSessionId?: string;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Experiments — a deliberate "let's try X for a few days and see" tracker
// ---------------------------------------------------------------------------

export type ExperimentStatus =
  | 'running'
  | 'worked'
  | 'didnt'
  | 'mixed'
  | 'abandoned';

/**
 * A small, deliberate experiment ("dream feed at 10pm for 5 nights"). Parents
 * note what they're trying and why, then record how it went — turning guesswork
 * into something they can look back on. Never medical guidance.
 */
export interface Experiment {
  id: string;
  title: string;
  /** What they hope it does, e.g. "might help him sleep longer". */
  hypothesis?: string;
  startedAt: Millis;
  /** Planned length in days (optional). */
  days?: number;
  status: ExperimentStatus;
  /** Free-text reflection once concluded. */
  outcome?: string;
  endedAt?: Millis;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Care tasks — recurring household nudges (in-app agenda only, never pushed)
// ---------------------------------------------------------------------------

export type CareTaskKind =
  | 'nappies'
  | 'sterilise'
  | 'weeklyPhoto'
  | 'dailyMemory'
  | 'binDay'
  | 'bathNight'
  | 'custom';

export type CareCadence = 'daily' | 'weekly' | 'everyN';

export interface CareTask {
  id: string;
  kind: CareTaskKind;
  label: string;
  cadence: CareCadence;
  /** For 'everyN': repeat every this many days. */
  intervalDays?: number;
  /** For 'weekly': 0 = Sunday … 6 = Saturday. */
  weekday?: number;
  /** Optional time of day, 'HH:MM' local. */
  timeHHMM?: string;
  enabled: boolean;
  /** When the schedule starts counting (epoch ms). */
  anchorAt: Millis;
  /** When it was last marked done (advances the next occurrence). */
  lastDoneAt?: Millis;
  createdAt: Millis;
  updatedAt: Millis;
}

// ---------------------------------------------------------------------------
// Monthly recap — a keepsake page per month (auto-filled, editable)
// ---------------------------------------------------------------------------

/**
 * The owner's edits/overrides for a given month. Auto-derived values (weight,
 * new skills, funniest/hardest, best photo, parent messages, places/people)
 * are computed live from the other stores; any field set here takes precedence.
 * `id` is deterministic (`m{monthIndex}`) so both phones edit the same record.
 */
export interface MonthlyRecap {
  id: string;
  /** 1-based month of life (Month 1 = first month after birth). */
  monthIndex: number;
  favouriteThing?: string;
  newSkill?: string;
  funniest?: string;
  hardest?: string;
  bestPhotoId?: string;
  messageFromDad?: string;
  messageFromMum?: string;
  placesVisited?: string;
  peopleMet?: string;
  neverForget?: string;
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
  /** Marked as missed (cleared from the agenda but recorded as not done). */
  missed?: boolean;
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

// ---------------------------------------------------------------------------
// Voice notes — the audio time capsule (coos, laughs, first words, messages)
// ---------------------------------------------------------------------------

export type VoiceCategory =
  | 'funny'
  | 'proud'
  | 'emotional'
  | 'message'
  | 'firstSound';

/**
 * A recorded audio moment. Like photos/documents, the audio bytes are kept as
 * an ArrayBuffer (+ mime `type`) for reliable structured-cloning in IndexedDB.
 */
export interface VoiceEntry {
  id: string;
  /** When it was recorded (indexed). */
  recordedAt: Millis;
  bytes: ArrayBuffer;
  type: string;
  /** Length of the recording in milliseconds. */
  durationMs?: number;
  title?: string;
  /** Speech-to-text transcript (auto-filled, always editable). */
  transcript?: string;
  category?: VoiceCategory;
  /** Who recorded it, e.g. 'Daddy' / 'Mummy'. */
  author?: string;
  /** Marked a favourite — the keepers. */
  favourite?: boolean;
  createdAt: Millis;
  updatedAt: Millis;
}

/** Voice note as serialised in a JSON backup (bytes → base64 data URL). */
export interface VoiceBackup {
  id: string;
  recordedAt: Millis;
  dataUrl: string;
  durationMs?: number;
  title?: string;
  transcript?: string;
  category?: VoiceCategory;
  author?: string;
  favourite?: boolean;
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

// ---------------------------------------------------------------------------
// Second Brain — durable AI memory + persistent chat history
// ---------------------------------------------------------------------------

/**
 * What a memory is about — drives recall weighting and how carefully it is
 * handled. `health` and `allergy` are safety-critical: always recalled, never
 * decayed, and confirmed with the parent before the AI saves them.
 */
export type MemoryCategory =
  | 'health'
  | 'allergy'
  | 'preference'
  | 'routine'
  | 'person'
  | 'milestone'
  | 'fact'
  | 'note';

/** Where a memory came from — the AI distilling chat, or the parent teaching it. */
export type MemorySource = 'ai' | 'user' | 'chat';

/**
 * One durable fact the AI "knows" about Leo — the Second Brain. Recall scores
 * these by relevance, importance and recency (see `memory.ts`) and injects the
 * top few into the chat so the assistant remembers across sessions and devices.
 */
export interface Memory {
  id: string;
  /** The remembered fact, in plain language. */
  text: string;
  category: MemoryCategory;
  /** Free keywords that help recall (e.g. ['dairy', 'rash']). */
  tags: string[];
  /** How important this is, 1 (trivial) – 10 (critical). */
  importance: number;
  /** Confidence multiplier 0–1; lowered when something is uncertain. */
  trust: number;
  source: MemorySource;
  /** Pinned memories are always recalled and never decayed. */
  pinned: boolean;
  /** If set, this memory has been replaced by another (kept for history). */
  supersededBy?: string;
  /** How many times this memory has been recalled into a conversation. */
  useCount: number;
  /** When it was last recalled (epoch ms). */
  lastUsedAt?: Millis;
  createdAt: Millis;
  updatedAt: Millis;
}

export type NewMemory = Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>;

/** A single persisted chat turn (synced + backed up, so history roams devices). */
export interface ChatTurn {
  id: string;
  /** Conversation id; one rolling thread today (`'main'`), extensible later. */
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  /** True for a rolling-summary turn that condenses older history. */
  summary?: boolean;
  createdAt: Millis;
  updatedAt: Millis;
}

export type NewChatTurn = Omit<ChatTurn, 'id' | 'createdAt' | 'updatedAt'>;

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
export type NewSavedRoutine = Omit<
  SavedRoutine,
  'id' | 'createdAt' | 'updatedAt'
>;
export type NewExperiment = Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>;
export type NewRoutineSession = Omit<
  RoutineSession,
  'id' | 'createdAt' | 'updatedAt'
>;
export type NewCareTask = Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>;
/** Editable fields of a monthly recap (id/monthIndex/timestamps are managed). */
export type RecapInput = Partial<
  Omit<MonthlyRecap, 'id' | 'monthIndex' | 'createdAt' | 'updatedAt'>
>;
export type NewPhotoMeta = Omit<
  PhotoEntry,
  'id' | 'bytes' | 'type' | 'createdAt' | 'updatedAt'
>;
export type NewVoiceMeta = Omit<
  VoiceEntry,
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
  routineSessions?: RoutineSession[];
  savedRoutines?: SavedRoutine[];
  experiments?: Experiment[];
  careTasks?: CareTask[];
  recaps?: MonthlyRecap[];
  memories?: Memory[];
  chatMessages?: ChatTurn[];
  voices?: VoiceBackup[];
  photos?: PhotoBackup[];
  documents?: DocumentBackup[];
}

export type ImportMode = 'replace' | 'merge';
