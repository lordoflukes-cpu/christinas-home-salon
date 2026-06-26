/**
 * Shared cloud sync for Leo — keeps two (or more) phones in step.
 *
 * Design: IndexedDB stays the local source of truth (offline-first is
 * preserved). When Supabase is configured AND a user is signed in, every
 * local change is mirrored to a single `leo_rows` table, and remote changes
 * stream back via Supabase Realtime. On startup a two-way reconcile merges
 * whatever each device already had, newest-write-per-row wins.
 *
 * One shared family login → one Supabase user → both phones see the same rows
 * (Row Level Security scopes every row to `owner = auth.uid()`).
 *
 * If sync is not configured, every export here is a safe no-op and the app
 * runs purely on-device.
 */
import type {
  RealtimeChannel,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { getSupabase, isSyncConfigured } from './supabase';
import * as repo from './repository';
import type {
  DocumentBackup,
  DocumentEntry,
  PhotoBackup,
  PhotoEntry,
  VoiceBackup,
  VoiceEntry,
} from './types';

export { isSyncConfigured } from './supabase';

const TABLE = 'leo_rows';

/** Stores that participate in sync (photos are handled specially). */
const PLAIN_STORES = [
  'profile',
  'feeds',
  'diapers',
  'sleeps',
  'growth',
  'medical',
  'milestones',
  'journal',
  'events',
  'sizes',
  'routines',
  'routineSessions',
  'savedRoutines',
  'experiments',
  'careTasks',
  'recaps',
] as const;
type PlainStore = (typeof PLAIN_STORES)[number];
/** Stores holding binary blobs — serialised to base64 data URLs for sync. */
const BINARY_STORES = ['photos', 'documents', 'voices'] as const;
type BinaryStore = (typeof BINARY_STORES)[number];
export type SyncStore = PlainStore | BinaryStore;

function isBinary(store: SyncStore): store is BinaryStore {
  return store === 'photos' || store === 'documents' || store === 'voices';
}

/** Shape of a row in the `leo_rows` table. */
interface SyncRow {
  owner?: string;
  store: SyncStore;
  id: string;
  data: Record<string, unknown>;
  updated_at: number;
  deleted: boolean;
}

interface AnyEntry {
  id?: string;
  updatedAt?: number;
}

// ---------------------------------------------------------------------------
// Merge decision (pure — unit tested)
// ---------------------------------------------------------------------------

/**
 * Should an incoming row with `remoteUpdatedAt` overwrite the local copy?
 * Remote wins ties so the outcome is deterministic across devices.
 */
export function shouldApplyRemote(
  remoteUpdatedAt: number,
  localUpdatedAt: number | undefined,
): boolean {
  if (localUpdatedAt == null) return true;
  return remoteUpdatedAt >= localUpdatedAt;
}

// ---------------------------------------------------------------------------
// Auth (single shared login)
// ---------------------------------------------------------------------------

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session ?? null;
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Cloud sync is not configured.' };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return { error: error ? error.message : null };
}

export async function signUp(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Cloud sync is not configured.' };
  const { error } = await sb.auth.signUp({ email, password });
  return { error: error ? error.message : null };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  await sb?.auth.signOut();
}

/** Subscribe to sign-in/sign-out; returns an unsubscribe fn. */
export function onAuthChange(
  cb: (session: Session | null) => void,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

// ---------------------------------------------------------------------------
// Local <-> row conversion
// ---------------------------------------------------------------------------

type BinaryEntry = PhotoEntry | DocumentEntry | VoiceEntry;
type BinaryBackup = PhotoBackup | DocumentBackup | VoiceBackup;

/** Serialise a binary (photo/document) entry's bytes to a base64 data URL. */
function binaryEntryToBackup(entry: BinaryEntry): BinaryBackup {
  const { bytes, type, ...meta } = entry;
  let binary = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  const base64 = typeof btoa === 'function' ? btoa(binary) : '';
  return { ...meta, dataUrl: `data:${type};base64,${base64}` } as BinaryBackup;
}

async function binaryBackupToEntry(
  store: BinaryStore,
  backup: BinaryBackup,
): Promise<BinaryEntry> {
  const blob = await repo.dataUrlToBlob(backup.dataUrl);
  const { dataUrl, ...meta } = backup as BinaryBackup & { dataUrl: string };
  const fallback =
    store === 'photos'
      ? 'image/jpeg'
      : store === 'voices'
        ? 'audio/webm'
        : 'application/octet-stream';
  return {
    ...(meta as object),
    bytes: await repo.blobToArrayBuffer(blob),
    type: blob.type || fallback,
  } as BinaryEntry;
}

/** Build a table row from a local entry (binary stores serialise to a data URL). */
function toRow(store: SyncStore, entry: AnyEntry, owner: string): SyncRow {
  const data = isBinary(store)
    ? (binaryEntryToBackup(
        entry as unknown as BinaryEntry,
      ) as unknown as Record<string, unknown>)
    : (entry as unknown as Record<string, unknown>);
  return {
    owner,
    store,
    id: String(entry.id),
    data,
    updated_at: entry.updatedAt ?? 0,
    deleted: false,
  };
}

/** Apply a remote row to local IndexedDB if it's newer than what we hold. */
async function applyRemoteRow(row: SyncRow): Promise<boolean> {
  const local = await readLocal(row.store, row.id);
  if (!shouldApplyRemote(row.updated_at, local?.updatedAt)) return false;

  if (row.deleted) {
    await repo.deleteRaw(row.store, row.id);
    return true;
  }
  if (isBinary(row.store)) {
    const entry = await binaryBackupToEntry(
      row.store,
      row.data as unknown as BinaryBackup,
    );
    if (row.store === 'photos') await repo.putPhotoRaw(entry as PhotoEntry);
    else if (row.store === 'voices')
      await repo.putVoiceRaw(entry as VoiceEntry);
    else await repo.putDocumentRaw(entry as DocumentEntry);
  } else {
    await repo.putRaw(row.store, row.data);
  }
  return true;
}

async function readLocal(
  store: SyncStore,
  id: string,
): Promise<AnyEntry | null> {
  if (store === 'photos') return (await repo.getPhoto(id)) as AnyEntry | null;
  if (store === 'documents')
    return (await repo.getDocument(id)) as AnyEntry | null;
  if (store === 'voices') return (await repo.getVoice(id)) as AnyEntry | null;
  const all = (await repo.getAllRaw<AnyEntry>(store)) ?? [];
  return all.find((e) => e.id === id) ?? null;
}

async function readAllLocal(store: SyncStore): Promise<AnyEntry[]> {
  return (await repo.getAllRaw<AnyEntry>(store)) ?? [];
}

// ---------------------------------------------------------------------------
// Push (fire-and-forget; failures heal on the next reconcile)
// ---------------------------------------------------------------------------

let cachedOwner: string | null = null;

async function owner(sb: SupabaseClient): Promise<string | null> {
  if (cachedOwner) return cachedOwner;
  const { data } = await sb.auth.getUser();
  cachedOwner = data.user?.id ?? null;
  return cachedOwner;
}

/** Mirror a single created/updated entry to the cloud. */
export function pushEntry(store: SyncStore, entry: AnyEntry): void {
  const sb = getSupabase();
  if (!sb || !entry?.id) return;
  void (async () => {
    try {
      const o = await owner(sb);
      if (!o) return;
      await sb.from(TABLE).upsert(toRow(store, entry, o));
    } catch {
      /* offline — the next startup reconcile will re-push */
    }
  })();
}

/** Mark an entry deleted in the cloud (tombstone so peers remove it too). */
export function pushDelete(store: SyncStore, id: string): void {
  const sb = getSupabase();
  if (!sb || !id) return;
  void (async () => {
    try {
      const o = await owner(sb);
      if (!o) return;
      const row: SyncRow = {
        owner: o,
        store,
        id,
        data: {},
        updated_at: Date.now(),
        deleted: true,
      };
      await sb.from(TABLE).upsert(row);
    } catch {
      /* offline — peers reconcile later */
    }
  })();
}

// ---------------------------------------------------------------------------
// Two-way reconcile + realtime
// ---------------------------------------------------------------------------

let channel: RealtimeChannel | null = null;

/** Pull all remote rows, merge with local, then push anything local-newer. */
async function reconcile(sb: SupabaseClient): Promise<void> {
  const o = await owner(sb);
  if (!o) return;

  const { data: rows, error } = await sb
    .from(TABLE)
    .select('store,id,data,updated_at,deleted')
    .returns<SyncRow[]>();
  if (error) throw error;

  const remoteIndex = new Map<string, SyncRow>();
  for (const row of rows ?? []) {
    remoteIndex.set(`${row.store}:${row.id}`, row);
    await applyRemoteRow(row);
  }

  // Push local entries the cloud is missing or has an older copy of.
  for (const store of [...PLAIN_STORES, ...BINARY_STORES] as SyncStore[]) {
    const locals = await readAllLocal(store);
    for (const entry of locals) {
      const remote = remoteIndex.get(`${store}:${entry.id}`);
      const localUpdated = entry.updatedAt ?? 0;
      if (!remote || localUpdated > remote.updated_at) {
        await sb.from(TABLE).upsert(toRow(store, entry, o));
      }
    }
  }
}

/**
 * Begin syncing. Runs an initial reconcile then subscribes to realtime.
 * `onChange` fires whenever a remote change lands so the UI can refresh.
 * Returns an unsubscribe function. No-op when sync isn't configured / signed in.
 */
export async function startSync(onChange: () => void): Promise<() => void> {
  const sb = getSupabase();
  if (!sb) return () => {};
  const session = await getSession();
  if (!session) return () => {};

  await reconcile(sb);
  onChange();

  channel = sb
    .channel('leo_rows_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      (payload) => {
        const row = payload.new as SyncRow | undefined;
        if (!row || !row.store) return;
        void applyRemoteRow(row).then((applied) => {
          if (applied) onChange();
        });
      },
    )
    .subscribe();

  return () => {
    if (channel) {
      void sb.removeChannel(channel);
      channel = null;
    }
  };
}

/** Forget the cached signed-in user (call on sign-out). */
export function resetSyncCache(): void {
  cachedOwner = null;
}
