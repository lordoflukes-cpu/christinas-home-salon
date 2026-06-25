/**
 * Leo tracker data-access layer.
 *
 * This is the ONLY storage module the UI imports. To add cloud sync later,
 * reimplement these functions against a new backend — the UI never changes.
 */
import { now } from '@/lib/time/clock';
import { getDB, DB_VERSION } from './db';
import type {
  BabyProfile,
  DiaperEntry,
  FeedEntry,
  ImportMode,
  LeoBackup,
  NewDiaper,
  NewFeed,
  NewSleep,
  ProfileInput,
  SleepEntry,
} from './types';

const PROFILE_KEY = 'leo';

function newId(): string {
  return crypto.randomUUID();
}

function ts(): number {
  return now().getTime();
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<BabyProfile | null> {
  const db = await getDB();
  return (await db.get('profile', PROFILE_KEY)) ?? null;
}

export async function saveProfile(input: ProfileInput): Promise<BabyProfile> {
  const db = await getDB();
  const profile: BabyProfile = {
    ...input,
    id: PROFILE_KEY,
    updatedAt: ts(),
  };
  await db.put('profile', profile);
  return profile;
}

// ---------------------------------------------------------------------------
// Feeds
// ---------------------------------------------------------------------------

export async function addFeed(input: NewFeed): Promise<FeedEntry> {
  const db = await getDB();
  const time = ts();
  const entry: FeedEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('feeds', entry);
  return entry;
}

export async function updateFeed(
  id: string,
  patch: Partial<FeedEntry>,
): Promise<FeedEntry> {
  const db = await getDB();
  const existing = await db.get('feeds', id);
  if (!existing) throw new Error(`Feed ${id} not found`);
  const updated: FeedEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('feeds', updated);
  return updated;
}

export async function deleteFeed(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('feeds', id);
}

export async function getRecentFeeds(limit = 20): Promise<FeedEntry[]> {
  const db = await getDB();
  const results: FeedEntry[] = [];
  let cursor = await db
    .transaction('feeds')
    .store.index('by-startedAt')
    .openCursor(null, 'prev');
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function getLastFeed(): Promise<FeedEntry | null> {
  return (await getRecentFeeds(1))[0] ?? null;
}

// ---------------------------------------------------------------------------
// Diapers
// ---------------------------------------------------------------------------

export async function addDiaper(input: NewDiaper): Promise<DiaperEntry> {
  const db = await getDB();
  const time = ts();
  const entry: DiaperEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('diapers', entry);
  return entry;
}

export async function updateDiaper(
  id: string,
  patch: Partial<DiaperEntry>,
): Promise<DiaperEntry> {
  const db = await getDB();
  const existing = await db.get('diapers', id);
  if (!existing) throw new Error(`Diaper ${id} not found`);
  const updated: DiaperEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('diapers', updated);
  return updated;
}

export async function deleteDiaper(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('diapers', id);
}

export async function getRecentDiapers(limit = 20): Promise<DiaperEntry[]> {
  const db = await getDB();
  const results: DiaperEntry[] = [];
  let cursor = await db
    .transaction('diapers')
    .store.index('by-changedAt')
    .openCursor(null, 'prev');
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function getLastDiaper(): Promise<DiaperEntry | null> {
  return (await getRecentDiapers(1))[0] ?? null;
}

// ---------------------------------------------------------------------------
// Sleep
// ---------------------------------------------------------------------------

export async function addSleep(input: NewSleep): Promise<SleepEntry> {
  const db = await getDB();
  const time = ts();
  const entry: SleepEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('sleeps', entry);
  return entry;
}

export async function startSleep(
  startedAt: number = ts(),
): Promise<SleepEntry> {
  return addSleep({ startedAt });
}

export async function endSleep(
  id: string,
  endedAt: number = ts(),
): Promise<SleepEntry> {
  return updateSleep(id, { endedAt });
}

export async function updateSleep(
  id: string,
  patch: Partial<SleepEntry>,
): Promise<SleepEntry> {
  const db = await getDB();
  const existing = await db.get('sleeps', id);
  if (!existing) throw new Error(`Sleep ${id} not found`);
  const updated: SleepEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('sleeps', updated);
  return updated;
}

export async function deleteSleep(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sleeps', id);
}

export async function getRecentSleeps(limit = 20): Promise<SleepEntry[]> {
  const db = await getDB();
  const results: SleepEntry[] = [];
  let cursor = await db
    .transaction('sleeps')
    .store.index('by-startedAt')
    .openCursor(null, 'prev');
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function getLastSleep(): Promise<SleepEntry | null> {
  return (await getRecentSleeps(1))[0] ?? null;
}

/** The currently-running sleep (no `endedAt`), if any. */
export async function getActiveSleep(): Promise<SleepEntry | null> {
  const recent = await getRecentSleeps(50);
  return recent.find((s) => s.endedAt == null) ?? null;
}

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------

export async function exportAll(): Promise<LeoBackup> {
  const db = await getDB();
  const [profile, feeds, diapers, sleeps] = await Promise.all([
    db.get('profile', PROFILE_KEY),
    db.getAll('feeds'),
    db.getAll('diapers'),
    db.getAll('sleeps'),
  ]);
  return {
    schemaVersion: DB_VERSION,
    exportedAt: ts(),
    profile: profile ?? null,
    feeds,
    diapers,
    sleeps,
  };
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['profile', 'feeds', 'diapers', 'sleeps'],
    'readwrite',
  );
  await Promise.all([
    tx.objectStore('profile').clear(),
    tx.objectStore('feeds').clear(),
    tx.objectStore('diapers').clear(),
    tx.objectStore('sleeps').clear(),
  ]);
  await tx.done;
}

export async function importAll(
  backup: LeoBackup,
  mode: ImportMode,
): Promise<void> {
  if (mode === 'replace') {
    await clearAll();
  }
  const db = await getDB();
  const tx = db.transaction(
    ['profile', 'feeds', 'diapers', 'sleeps'],
    'readwrite',
  );
  if (backup.profile) {
    await tx.objectStore('profile').put({ ...backup.profile, id: PROFILE_KEY });
  }
  for (const feed of backup.feeds) await tx.objectStore('feeds').put(feed);
  for (const diaper of backup.diapers)
    await tx.objectStore('diapers').put(diaper);
  for (const sleep of backup.sleeps) await tx.objectStore('sleeps').put(sleep);
  await tx.done;
}
