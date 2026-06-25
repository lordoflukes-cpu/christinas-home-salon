/**
 * IndexedDB connection for the Leo tracker (via `idb`).
 *
 * SSR-safety: `getDB()` throws on the server and must only ever be called from
 * client code inside effects / event handlers — never during render.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  BabyProfile,
  DiaperEntry,
  DocumentEntry,
  FeedEntry,
  GrowthEntry,
  JournalEntry,
  LeoEvent,
  MedicalEntry,
  MilestoneEntry,
  PhotoEntry,
  SleepEntry,
} from './types';

export const DB_NAME = 'leo-tracker';
export const DB_VERSION = 4;

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
      },
    });
  }
  return dbPromise;
}
