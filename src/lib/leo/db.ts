/**
 * IndexedDB connection for the Leo tracker (via `idb`).
 *
 * SSR-safety: `getDB()` throws on the server and must only ever be called from
 * client code inside effects / event handlers — never during render.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { BabyProfile, DiaperEntry, FeedEntry, SleepEntry } from './types';

export const DB_NAME = 'leo-tracker';
export const DB_VERSION = 1;

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
      },
    });
  }
  return dbPromise;
}
