/**
 * IndexedDB connection for the Leo tracker (via `idb`).
 *
 * SSR-safety: `getDB()` throws on the server and must only ever be called from
 * client code inside effects / event handlers — never during render.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  BabyProfile,
  CareTask,
  ChatTurn,
  DiaperEntry,
  DocumentEntry,
  Experiment,
  FeedEntry,
  GrowthEntry,
  JournalEntry,
  LeoEvent,
  MedicalEntry,
  Memory,
  MilestoneEntry,
  MonthlyRecap,
  PhotoEntry,
  RoutineItem,
  RoutineSession,
  SavedRoutine,
  SizeEntry,
  SleepEntry,
  VoiceEntry,
} from './types';

export const DB_NAME = 'leo-tracker';
export const DB_VERSION = 13;

/** Cached TTS audio (regenerable — never synced or backed up). */
export interface TtsCacheEntry {
  key: string;
  bytes: ArrayBuffer;
  type: string;
  createdAt: number;
}

export interface LeoDB extends DBSchema {
  profile: { key: string; value: BabyProfile };
  feeds: {
    key: string;
    value: FeedEntry;
    indexes: { 'by-startedAt': number };
  };
  diapers: {
    key: string;
    value: DiaperEntry;
    indexes: { 'by-changedAt': number };
  };
  sleeps: {
    key: string;
    value: SleepEntry;
    indexes: { 'by-startedAt': number };
  };
  growth: {
    key: string;
    value: GrowthEntry;
    indexes: { 'by-measuredAt': number };
  };
  medical: {
    key: string;
    value: MedicalEntry;
    indexes: { 'by-at': number };
  };
  milestones: {
    key: string;
    value: MilestoneEntry;
    indexes: { 'by-achievedAt': number };
  };
  journal: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-writtenAt': number };
  };
  photos: {
    key: string;
    value: PhotoEntry;
    indexes: { 'by-takenAt': number };
  };
  events: {
    key: string;
    value: LeoEvent;
    indexes: { 'by-at': number };
  };
  documents: {
    key: string;
    value: DocumentEntry;
    indexes: { 'by-at': number };
  };
  sizes: {
    key: string;
    value: SizeEntry;
    indexes: { 'by-startedAt': number };
  };
  routines: {
    key: string;
    value: RoutineItem;
    indexes: { 'by-position': number };
  };
  routineSessions: {
    key: string;
    value: RoutineSession;
    indexes: { 'by-startedAt': number };
  };
  savedRoutines: {
    key: string;
    value: SavedRoutine;
    indexes: { 'by-createdAt': number };
  };
  experiments: {
    key: string;
    value: Experiment;
    indexes: { 'by-startedAt': number };
  };
  voices: {
    key: string;
    value: VoiceEntry;
    indexes: { 'by-recordedAt': number };
  };
  careTasks: {
    key: string;
    value: CareTask;
    indexes: { 'by-kind': string };
  };
  recaps: {
    key: string;
    value: MonthlyRecap;
    indexes: { 'by-monthIndex': number };
  };
  memories: {
    key: string;
    value: Memory;
    indexes: { 'by-createdAt': number };
  };
  chatMessages: {
    key: string;
    value: ChatTurn;
    indexes: { 'by-createdAt': number };
  };
  ttsCache: {
    key: string;
    value: TtsCacheEntry;
  };
}

let dbPromise: Promise<IDBPDatabase<LeoDB>> | null = null;

/** True only in a browser with IndexedDB available. */
export function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

export function getDB(): Promise<IDBPDatabase<LeoDB>> {
  if (!isStorageAvailable()) {
    throw new Error(
      'IndexedDB is unavailable (server-side or unsupported browser).',
    );
  }
  if (!dbPromise) {
    dbPromise = openDB<LeoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('feeds')) {
          const feeds = db.createObjectStore('feeds', { keyPath: 'id' });
          feeds.createIndex('by-startedAt', 'startedAt');
        }
        if (!db.objectStoreNames.contains('diapers')) {
          const diapers = db.createObjectStore('diapers', { keyPath: 'id' });
          diapers.createIndex('by-changedAt', 'changedAt');
        }
        if (!db.objectStoreNames.contains('sleeps')) {
          const sleeps = db.createObjectStore('sleeps', { keyPath: 'id' });
          sleeps.createIndex('by-startedAt', 'startedAt');
        }
        // v2 stores (additive — existing v1 data is preserved)
        if (!db.objectStoreNames.contains('growth')) {
          const growth = db.createObjectStore('growth', { keyPath: 'id' });
          growth.createIndex('by-measuredAt', 'measuredAt');
        }
        if (!db.objectStoreNames.contains('medical')) {
          const medical = db.createObjectStore('medical', { keyPath: 'id' });
          medical.createIndex('by-at', 'at');
        }
        if (!db.objectStoreNames.contains('milestones')) {
          const milestones = db.createObjectStore('milestones', {
            keyPath: 'id',
          });
          milestones.createIndex('by-achievedAt', 'achievedAt');
        }
        if (!db.objectStoreNames.contains('journal')) {
          const journal = db.createObjectStore('journal', { keyPath: 'id' });
          journal.createIndex('by-writtenAt', 'writtenAt');
        }
        if (!db.objectStoreNames.contains('photos')) {
          const photos = db.createObjectStore('photos', { keyPath: 'id' });
          photos.createIndex('by-takenAt', 'takenAt');
        }
        // v3 store (additive — existing data is preserved)
        if (!db.objectStoreNames.contains('events')) {
          const events = db.createObjectStore('events', { keyPath: 'id' });
          events.createIndex('by-at', 'at');
        }
        // v4 store (additive)
        if (!db.objectStoreNames.contains('documents')) {
          const documents = db.createObjectStore('documents', {
            keyPath: 'id',
          });
          documents.createIndex('by-at', 'at');
        }
        // v5 store (additive)
        if (!db.objectStoreNames.contains('sizes')) {
          const sizes = db.createObjectStore('sizes', { keyPath: 'id' });
          sizes.createIndex('by-startedAt', 'startedAt');
        }
        // v6 store (additive)
        if (!db.objectStoreNames.contains('routines')) {
          const routines = db.createObjectStore('routines', { keyPath: 'id' });
          routines.createIndex('by-position', 'position');
        }
        // v7 store (additive)
        if (!db.objectStoreNames.contains('voices')) {
          const voices = db.createObjectStore('voices', { keyPath: 'id' });
          voices.createIndex('by-recordedAt', 'recordedAt');
        }
        // v8 store (additive)
        if (!db.objectStoreNames.contains('careTasks')) {
          const careTasks = db.createObjectStore('careTasks', {
            keyPath: 'id',
          });
          careTasks.createIndex('by-kind', 'kind');
        }
        // v9 store (additive)
        if (!db.objectStoreNames.contains('recaps')) {
          const recaps = db.createObjectStore('recaps', { keyPath: 'id' });
          recaps.createIndex('by-monthIndex', 'monthIndex');
        }
        // v10 store (additive)
        if (!db.objectStoreNames.contains('routineSessions')) {
          const sessions = db.createObjectStore('routineSessions', {
            keyPath: 'id',
          });
          sessions.createIndex('by-startedAt', 'startedAt');
        }
        // v11 store (additive) — regenerable TTS audio cache
        if (!db.objectStoreNames.contains('ttsCache')) {
          db.createObjectStore('ttsCache', { keyPath: 'key' });
        }
        // v12 stores (additive) — saved routines + experiments
        if (!db.objectStoreNames.contains('savedRoutines')) {
          const saved = db.createObjectStore('savedRoutines', {
            keyPath: 'id',
          });
          saved.createIndex('by-createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('experiments')) {
          const experiments = db.createObjectStore('experiments', {
            keyPath: 'id',
          });
          experiments.createIndex('by-startedAt', 'startedAt');
        }
        // v13 stores (additive) — Second Brain: durable memories + chat history
        if (!db.objectStoreNames.contains('memories')) {
          const memories = db.createObjectStore('memories', { keyPath: 'id' });
          memories.createIndex('by-createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('chatMessages')) {
          const chat = db.createObjectStore('chatMessages', { keyPath: 'id' });
          chat.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}
