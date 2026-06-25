'use client';

import { create } from 'zustand';
import * as repo from './repository';
import * as sync from './sync';
import type {
  BabyProfile,
  BreastSide,
  DiaperEntry,
  DocumentEntry,
  FeedEntry,
  GrowthEntry,
  ImportMode,
  JournalEntry,
  LeoBackup,
  LeoEvent,
  MedicalEntry,
  MilestoneEntry,
  NewDiaper,
  NewDocumentMeta,
  NewEvent,
  NewFeed,
  NewGrowth,
  NewJournal,
  NewMedical,
  NewMilestone,
  NewPhotoMeta,
  NewRoutine,
  NewSize,
  PhotoEntry,
  ProfileInput,
  RoutineItem,
  SizeEntry,
  SleepEntry,
} from './types';

const RECENT_LIMIT = 50;

interface LeoState {
  hydrated: boolean;
  profile: BabyProfile | null;
  feeds: FeedEntry[];
  activeFeed: FeedEntry | null;
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  activeSleep: SleepEntry | null;
  growth: GrowthEntry[];
  medical: MedicalEntry[];
  milestones: MilestoneEntry[];
  journal: JournalEntry[];
  events: LeoEvent[];
  sizes: SizeEntry[];
  routines: RoutineItem[];
  photos: PhotoEntry[];
  documents: DocumentEntry[];

  hydrate: () => Promise<void>;

  editProfile: (input: ProfileInput) => Promise<void>;

  createFeed: (input: NewFeed) => Promise<void>;
  editFeed: (id: string, patch: Partial<FeedEntry>) => Promise<void>;
  removeFeed: (id: string) => Promise<void>;
  startFeedTimer: (side: BreastSide) => Promise<void>;
  stopFeedTimer: (id: string) => Promise<void>;

  createDiaper: (input: NewDiaper) => Promise<void>;
  editDiaper: (id: string, patch: Partial<DiaperEntry>) => Promise<void>;
  removeDiaper: (id: string) => Promise<void>;

  startSleepTimer: (startedAt?: number) => Promise<void>;
  stopSleepTimer: (id: string, endedAt?: number) => Promise<void>;
  editSleep: (id: string, patch: Partial<SleepEntry>) => Promise<void>;
  removeSleep: (id: string) => Promise<void>;

  createGrowth: (input: NewGrowth) => Promise<void>;
  editGrowth: (id: string, patch: Partial<GrowthEntry>) => Promise<void>;
  removeGrowth: (id: string) => Promise<void>;

  createMedical: (input: NewMedical) => Promise<void>;
  editMedical: (id: string, patch: Partial<MedicalEntry>) => Promise<void>;
  removeMedical: (id: string) => Promise<void>;

  createMilestone: (input: NewMilestone) => Promise<void>;
  editMilestone: (id: string, patch: Partial<MilestoneEntry>) => Promise<void>;
  removeMilestone: (id: string) => Promise<void>;

  createJournal: (input: NewJournal) => Promise<void>;
  editJournal: (id: string, patch: Partial<JournalEntry>) => Promise<void>;
  removeJournal: (id: string) => Promise<void>;

  createSize: (input: NewSize) => Promise<void>;
  editSize: (id: string, patch: Partial<SizeEntry>) => Promise<void>;
  removeSize: (id: string) => Promise<void>;

  createRoutine: (input: NewRoutine) => Promise<void>;
  editRoutine: (id: string, patch: Partial<RoutineItem>) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;

  createEvent: (input: NewEvent) => Promise<void>;
  editEvent: (id: string, patch: Partial<LeoEvent>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;

  addPhoto: (blob: Blob, meta: NewPhotoMeta) => Promise<PhotoEntry>;
  editPhoto: (id: string, patch: Partial<PhotoEntry>) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;

  addDocument: (blob: Blob, meta: NewDocumentMeta) => Promise<DocumentEntry>;
  removeDocument: (id: string) => Promise<void>;

  importBackup: (backup: LeoBackup, mode: ImportMode) => Promise<void>;
  clearAll: () => Promise<void>;
}

/** Re-read every store from the repository and refresh in-memory state. */
async function refresh() {
  const [
    profile,
    feeds,
    activeFeed,
    diapers,
    sleeps,
    activeSleep,
    growth,
    medical,
    milestones,
    journal,
    events,
    sizes,
    routines,
    photos,
    documents,
  ] = await Promise.all([
    repo.getProfile(),
    repo.getRecentFeeds(RECENT_LIMIT),
    repo.getActiveFeed(),
    repo.getRecentDiapers(RECENT_LIMIT),
    repo.getRecentSleeps(RECENT_LIMIT),
    repo.getActiveSleep(),
    repo.getAllGrowth(),
    repo.getAllMedical(),
    repo.getAllMilestones(),
    repo.getAllJournal(),
    repo.getRecentEvents(RECENT_LIMIT),
    repo.getAllSizes(),
    repo.getAllRoutines(),
    repo.getAllPhotos(),
    repo.getAllDocuments(),
  ]);
  return {
    profile,
    feeds,
    activeFeed,
    diapers,
    sleeps,
    activeSleep,
    growth,
    medical,
    milestones,
    journal,
    events,
    sizes,
    routines,
    photos,
    documents,
  };
}

/** Guards against starting realtime sync more than once per session. */
let syncStarted = false;
let syncUnsub: (() => void) | null = null;

function startCloudSync(onChange: () => void) {
  if (syncStarted || !sync.isSyncConfigured()) return;
  syncStarted = true;
  // Re-run whenever auth flips (sign-in after load, or sign-out/in again).
  sync.onAuthChange(() => {
    syncUnsub?.();
    void sync.startSync(onChange).then((unsub) => {
      syncUnsub = unsub;
    });
  });
  void sync.startSync(onChange).then((unsub) => {
    syncUnsub = unsub;
  });
}

export const useLeoStore = create<LeoState>((set, get) => ({
  hydrated: false,
  profile: null,
  feeds: [],
  activeFeed: null,
  diapers: [],
  sleeps: [],
  activeSleep: null,
  growth: [],
  medical: [],
  milestones: [],
  journal: [],
  events: [],
  sizes: [],
  routines: [],
  photos: [],
  documents: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const data = await refresh();
    set({ ...data, hydrated: true });
    // Kick off shared cloud sync (no-op unless configured + signed in).
    startCloudSync(() => {
      void refresh().then((d) => set(d));
    });
  },

  editProfile: async (input) => {
    const profile = await repo.saveProfile(input);
    set({ profile });
    sync.pushEntry('profile', profile);
  },

  createFeed: async (input) => {
    const entry = await repo.addFeed(input);
    set({ feeds: await repo.getRecentFeeds(RECENT_LIMIT) });
    sync.pushEntry('feeds', entry);
  },
  editFeed: async (id, patch) => {
    const entry = await repo.updateFeed(id, patch);
    set({ feeds: await repo.getRecentFeeds(RECENT_LIMIT) });
    sync.pushEntry('feeds', entry);
  },
  removeFeed: async (id) => {
    await repo.deleteFeed(id);
    set({
      feeds: await repo.getRecentFeeds(RECENT_LIMIT),
      activeFeed: await repo.getActiveFeed(),
    });
    sync.pushDelete('feeds', id);
  },
  startFeedTimer: async (side) => {
    const entry = await repo.startFeed(side);
    set({
      feeds: await repo.getRecentFeeds(RECENT_LIMIT),
      activeFeed: await repo.getActiveFeed(),
    });
    sync.pushEntry('feeds', entry);
  },
  stopFeedTimer: async (id) => {
    const entry = await repo.stopFeed(id);
    set({
      feeds: await repo.getRecentFeeds(RECENT_LIMIT),
      activeFeed: await repo.getActiveFeed(),
    });
    sync.pushEntry('feeds', entry);
  },

  createDiaper: async (input) => {
    const entry = await repo.addDiaper(input);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
    sync.pushEntry('diapers', entry);
  },
  editDiaper: async (id, patch) => {
    const entry = await repo.updateDiaper(id, patch);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
    sync.pushEntry('diapers', entry);
  },
  removeDiaper: async (id) => {
    await repo.deleteDiaper(id);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
    sync.pushDelete('diapers', id);
  },

  startSleepTimer: async (startedAt) => {
    const entry = await repo.startSleep(startedAt);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
    sync.pushEntry('sleeps', entry);
  },
  stopSleepTimer: async (id, endedAt) => {
    const entry = await repo.endSleep(id, endedAt);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
    sync.pushEntry('sleeps', entry);
  },
  editSleep: async (id, patch) => {
    const entry = await repo.updateSleep(id, patch);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
    sync.pushEntry('sleeps', entry);
  },
  removeSleep: async (id) => {
    await repo.deleteSleep(id);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
    sync.pushDelete('sleeps', id);
  },

  createGrowth: async (input) => {
    const entry = await repo.addGrowth(input);
    set({ growth: await repo.getAllGrowth() });
    sync.pushEntry('growth', entry);
  },
  editGrowth: async (id, patch) => {
    const entry = await repo.updateGrowth(id, patch);
    set({ growth: await repo.getAllGrowth() });
    sync.pushEntry('growth', entry);
  },
  removeGrowth: async (id) => {
    await repo.deleteGrowth(id);
    set({ growth: await repo.getAllGrowth() });
    sync.pushDelete('growth', id);
  },

  createMedical: async (input) => {
    const entry = await repo.addMedical(input);
    set({ medical: await repo.getAllMedical() });
    sync.pushEntry('medical', entry);
  },
  editMedical: async (id, patch) => {
    const entry = await repo.updateMedical(id, patch);
    set({ medical: await repo.getAllMedical() });
    sync.pushEntry('medical', entry);
  },
  removeMedical: async (id) => {
    await repo.deleteMedical(id);
    set({ medical: await repo.getAllMedical() });
    sync.pushDelete('medical', id);
  },

  createMilestone: async (input) => {
    const entry = await repo.addMilestone(input);
    set({ milestones: await repo.getAllMilestones() });
    sync.pushEntry('milestones', entry);
  },
  editMilestone: async (id, patch) => {
    const entry = await repo.updateMilestone(id, patch);
    set({ milestones: await repo.getAllMilestones() });
    sync.pushEntry('milestones', entry);
  },
  removeMilestone: async (id) => {
    await repo.deleteMilestone(id);
    set({ milestones: await repo.getAllMilestones() });
    sync.pushDelete('milestones', id);
  },

  createJournal: async (input) => {
    const entry = await repo.addJournal(input);
    set({ journal: await repo.getAllJournal() });
    sync.pushEntry('journal', entry);
  },
  editJournal: async (id, patch) => {
    const entry = await repo.updateJournal(id, patch);
    set({ journal: await repo.getAllJournal() });
    sync.pushEntry('journal', entry);
  },
  removeJournal: async (id) => {
    await repo.deleteJournal(id);
    set({ journal: await repo.getAllJournal() });
    sync.pushDelete('journal', id);
  },

  createSize: async (input) => {
    const entry = await repo.addSize(input);
    set({ sizes: await repo.getAllSizes() });
    sync.pushEntry('sizes', entry);
  },
  editSize: async (id, patch) => {
    const entry = await repo.updateSize(id, patch);
    set({ sizes: await repo.getAllSizes() });
    sync.pushEntry('sizes', entry);
  },
  removeSize: async (id) => {
    await repo.deleteSize(id);
    set({ sizes: await repo.getAllSizes() });
    sync.pushDelete('sizes', id);
  },

  createRoutine: async (input) => {
    const entry = await repo.addRoutine(input);
    set({ routines: await repo.getAllRoutines() });
    sync.pushEntry('routines', entry);
  },
  editRoutine: async (id, patch) => {
    const entry = await repo.updateRoutine(id, patch);
    set({ routines: await repo.getAllRoutines() });
    sync.pushEntry('routines', entry);
  },
  removeRoutine: async (id) => {
    await repo.deleteRoutine(id);
    set({ routines: await repo.getAllRoutines() });
    sync.pushDelete('routines', id);
  },

  createEvent: async (input) => {
    const entry = await repo.addEvent(input);
    set({ events: await repo.getRecentEvents(RECENT_LIMIT) });
    sync.pushEntry('events', entry);
  },
  editEvent: async (id, patch) => {
    const entry = await repo.updateEvent(id, patch);
    set({ events: await repo.getRecentEvents(RECENT_LIMIT) });
    sync.pushEntry('events', entry);
  },
  removeEvent: async (id) => {
    await repo.deleteEvent(id);
    set({ events: await repo.getRecentEvents(RECENT_LIMIT) });
    sync.pushDelete('events', id);
  },

  addPhoto: async (blob, meta) => {
    const entry = await repo.addPhoto(blob, meta);
    set({ photos: await repo.getAllPhotos() });
    sync.pushEntry('photos', entry);
    return entry;
  },
  editPhoto: async (id, patch) => {
    const entry = await repo.updatePhoto(id, patch);
    set({ photos: await repo.getAllPhotos() });
    sync.pushEntry('photos', entry);
  },
  removePhoto: async (id) => {
    await repo.deletePhoto(id);
    set({ photos: await repo.getAllPhotos() });
    sync.pushDelete('photos', id);
  },

  addDocument: async (blob, meta) => {
    const entry = await repo.addDocument(blob, meta);
    set({ documents: await repo.getAllDocuments() });
    sync.pushEntry('documents', entry);
    return entry;
  },
  removeDocument: async (id) => {
    await repo.deleteDocument(id);
    set({ documents: await repo.getAllDocuments() });
    sync.pushDelete('documents', id);
  },

  importBackup: async (backup, mode) => {
    await repo.importAll(backup, mode);
    set(await refresh());
  },
  clearAll: async () => {
    await repo.clearAll();
    set(await refresh());
  },
}));
