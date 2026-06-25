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
  GrowthEntry,
  ImportMode,
  JournalEntry,
  LeoBackup,
  MedicalEntry,
  MilestoneEntry,
  NewDiaper,
  NewFeed,
  NewGrowth,
  NewJournal,
  NewMedical,
  NewMilestone,
  NewPhotoMeta,
  NewSleep,
  PhotoEntry,
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
// Growth
// ---------------------------------------------------------------------------

export async function addGrowth(input: NewGrowth): Promise<GrowthEntry> {
  const db = await getDB();
  const time = ts();
  const entry: GrowthEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('growth', entry);
  return entry;
}

export async function updateGrowth(
  id: string,
  patch: Partial<GrowthEntry>,
): Promise<GrowthEntry> {
  const db = await getDB();
  const existing = await db.get('growth', id);
  if (!existing) throw new Error(`Growth ${id} not found`);
  const updated: GrowthEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('growth', updated);
  return updated;
}

export async function deleteGrowth(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('growth', id);
}

/** All growth measurements, oldest → newest (chronological for charting). */
export async function getAllGrowth(): Promise<GrowthEntry[]> {
  const db = await getDB();
  const results: GrowthEntry[] = [];
  let cursor = await db
    .transaction('growth')
    .store.index('by-measuredAt')
    .openCursor(null, 'next');
  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

// ---------------------------------------------------------------------------
// Medical
// ---------------------------------------------------------------------------

export async function addMedical(input: NewMedical): Promise<MedicalEntry> {
  const db = await getDB();
  const time = ts();
  const entry: MedicalEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('medical', entry);
  return entry;
}

export async function updateMedical(
  id: string,
  patch: Partial<MedicalEntry>,
): Promise<MedicalEntry> {
  const db = await getDB();
  const existing = await db.get('medical', id);
  if (!existing) throw new Error(`Medical ${id} not found`);
  const updated: MedicalEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('medical', updated);
  return updated;
}

export async function deleteMedical(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('medical', id);
}

/** All medical entries, oldest → newest by date. */
export async function getAllMedical(): Promise<MedicalEntry[]> {
  const db = await getDB();
  const results: MedicalEntry[] = [];
  let cursor = await db
    .transaction('medical')
    .store.index('by-at')
    .openCursor(null, 'next');
  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export async function addMilestone(
  input: NewMilestone,
): Promise<MilestoneEntry> {
  const db = await getDB();
  const time = ts();
  const entry: MilestoneEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('milestones', entry);
  return entry;
}

export async function updateMilestone(
  id: string,
  patch: Partial<MilestoneEntry>,
): Promise<MilestoneEntry> {
  const db = await getDB();
  const existing = await db.get('milestones', id);
  if (!existing) throw new Error(`Milestone ${id} not found`);
  const updated: MilestoneEntry = {
    ...existing,
    ...patch,
    id,
    updatedAt: ts(),
  };
  await db.put('milestones', updated);
  return updated;
}

export async function deleteMilestone(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('milestones', id);
}

/** All milestones, newest → oldest. */
export async function getAllMilestones(): Promise<MilestoneEntry[]> {
  const db = await getDB();
  const results: MilestoneEntry[] = [];
  let cursor = await db
    .transaction('milestones')
    .store.index('by-achievedAt')
    .openCursor(null, 'prev');
  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export async function addJournal(input: NewJournal): Promise<JournalEntry> {
  const db = await getDB();
  const time = ts();
  const entry: JournalEntry = {
    ...input,
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('journal', entry);
  return entry;
}

export async function updateJournal(
  id: string,
  patch: Partial<JournalEntry>,
): Promise<JournalEntry> {
  const db = await getDB();
  const existing = await db.get('journal', id);
  if (!existing) throw new Error(`Journal ${id} not found`);
  const updated: JournalEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('journal', updated);
  return updated;
}

export async function deleteJournal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('journal', id);
}

/** All journal notes, newest → oldest. */
export async function getAllJournal(): Promise<JournalEntry[]> {
  const db = await getDB();
  const results: JournalEntry[] = [];
  let cursor = await db
    .transaction('journal')
    .store.index('by-writtenAt')
    .openCursor(null, 'prev');
  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function addPhoto(
  blob: Blob,
  meta: NewPhotoMeta,
): Promise<PhotoEntry> {
  const db = await getDB();
  const time = ts();
  const entry: PhotoEntry = {
    ...meta,
    bytes: await blobToArrayBuffer(blob),
    type: blob.type || 'image/jpeg',
    id: newId(),
    createdAt: time,
    updatedAt: time,
  };
  await db.put('photos', entry);
  return entry;
}

export async function updatePhoto(
  id: string,
  patch: Partial<PhotoEntry>,
): Promise<PhotoEntry> {
  const db = await getDB();
  const existing = await db.get('photos', id);
  if (!existing) throw new Error(`Photo ${id} not found`);
  const updated: PhotoEntry = { ...existing, ...patch, id, updatedAt: ts() };
  await db.put('photos', updated);
  return updated;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}

export async function getPhoto(id: string): Promise<PhotoEntry | null> {
  const db = await getDB();
  return (await db.get('photos', id)) ?? null;
}

/** All photos, newest → oldest. */
export async function getAllPhotos(): Promise<PhotoEntry[]> {
  const db = await getDB();
  const results: PhotoEntry[] = [];
  let cursor = await db
    .transaction('photos')
    .store.index('by-takenAt')
    .openCursor(null, 'prev');
  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

// ---------------------------------------------------------------------------
// Raw writes (for cloud sync — apply remote rows verbatim, no re-stamping)
// ---------------------------------------------------------------------------

/** Stores whose rows are plain JSON and sync 1:1 (everything except photos). */
export type PlainStore =
  | 'profile'
  | 'feeds'
  | 'diapers'
  | 'sleeps'
  | 'growth'
  | 'medical'
  | 'milestones'
  | 'journal';

/** Write an entry exactly as given, preserving its id/updatedAt (no stamping). */
export async function putRaw(store: PlainStore, value: unknown): Promise<void> {
  const db = await getDB();
  // idb's typed `put` can't express a runtime-chosen store; cast at the boundary.
  await (
    db as unknown as { put: (s: string, v: unknown) => Promise<unknown> }
  ).put(store, value);
}

/** Delete by id from any store (used when a remote tombstone arrives). */
export async function deleteRaw(
  store: PlainStore | 'photos',
  id: string,
): Promise<void> {
  const db = await getDB();
  await (
    db as unknown as { delete: (s: string, k: string) => Promise<void> }
  ).delete(store, id);
}

/** Write a fully-formed photo entry (bytes already decoded) verbatim. */
export async function putPhotoRaw(entry: PhotoEntry): Promise<void> {
  const db = await getDB();
  await db.put('photos', entry);
}

/** Every row in a store (for the two-way sync reconcile). */
export async function getAllRaw<T = unknown>(
  store: PlainStore | 'photos',
): Promise<T[]> {
  const db = await getDB();
  return (await (
    db as unknown as { getAll: (s: string) => Promise<T[]> }
  ).getAll(store)) as T[];
}

// ---------------------------------------------------------------------------
// Blob <-> base64 helpers (for photo backup)
// ---------------------------------------------------------------------------

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Read a Blob's bytes; falls back to FileReader where `Blob.arrayBuffer` is absent. */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------

const ALL_STORES = [
  'profile',
  'feeds',
  'diapers',
  'sleeps',
  'growth',
  'medical',
  'milestones',
  'journal',
  'photos',
] as const;

export async function exportAll(): Promise<LeoBackup> {
  const db = await getDB();
  const [
    profile,
    feeds,
    diapers,
    sleeps,
    growth,
    medical,
    milestones,
    journal,
    photos,
  ] = await Promise.all([
    db.get('profile', PROFILE_KEY),
    db.getAll('feeds'),
    db.getAll('diapers'),
    db.getAll('sleeps'),
    db.getAll('growth'),
    db.getAll('medical'),
    db.getAll('milestones'),
    db.getAll('journal'),
    db.getAll('photos'),
  ]);
  const photoBackups = await Promise.all(
    photos.map(async ({ bytes, type, ...meta }) => ({
      ...meta,
      dataUrl: await blobToDataUrl(new Blob([bytes], { type })),
    })),
  );
  return {
    schemaVersion: DB_VERSION,
    exportedAt: ts(),
    profile: profile ?? null,
    feeds,
    diapers,
    sleeps,
    growth,
    medical,
    milestones,
    journal,
    photos: photoBackups,
  };
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(ALL_STORES, 'readwrite');
  await Promise.all(ALL_STORES.map((s) => tx.objectStore(s).clear()));
  await tx.done;
}

export async function importAll(
  backup: LeoBackup,
  mode: ImportMode,
): Promise<void> {
  if (mode === 'replace') {
    await clearAll();
  }
  // Decode photos (async) before opening the write transaction.
  const photoEntries: PhotoEntry[] = await Promise.all(
    (backup.photos ?? []).map(async ({ dataUrl, ...meta }) => {
      const blob = await dataUrlToBlob(dataUrl);
      return {
        ...meta,
        bytes: await blobToArrayBuffer(blob),
        type: blob.type || 'image/jpeg',
      };
    }),
  );

  const db = await getDB();
  const tx = db.transaction(ALL_STORES, 'readwrite');
  if (backup.profile) {
    await tx.objectStore('profile').put({ ...backup.profile, id: PROFILE_KEY });
  }
  for (const feed of backup.feeds) await tx.objectStore('feeds').put(feed);
  for (const diaper of backup.diapers)
    await tx.objectStore('diapers').put(diaper);
  for (const sleep of backup.sleeps) await tx.objectStore('sleeps').put(sleep);
  for (const g of backup.growth ?? []) await tx.objectStore('growth').put(g);
  for (const m of backup.medical ?? []) await tx.objectStore('medical').put(m);
  for (const m of backup.milestones ?? [])
    await tx.objectStore('milestones').put(m);
  for (const j of backup.journal ?? []) await tx.objectStore('journal').put(j);
  for (const p of photoEntries) await tx.objectStore('photos').put(p);
  await tx.done;
}
