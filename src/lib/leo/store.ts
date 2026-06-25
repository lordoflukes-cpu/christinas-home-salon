'use client';

import { create } from 'zustand';
import * as repo from './repository';
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
  PhotoEntry,
  ProfileInput,
  SleepEntry,
} from './types';

const RECENT_LIMIT = 50;

interface LeoState {
  hydrated: boolean;
  profile: BabyProfile | null;
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  activeSleep: SleepEntry | null;
  growth: GrowthEntry[];
  medical: MedicalEntry[];
  milestones: MilestoneEntry[];
  journal: JournalEntry[];
  photos: PhotoEntry[];

  hydrate: () => Promise<void>;

  editProfile: (input: ProfileInput) => Promise<void>;

  createFeed: (input: NewFeed) => Promise<void>;
  editFeed: (id: string, patch: Partial<FeedEntry>) => Promise<void>;
  removeFeed: (id: string) => Promise<void>;

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

  addPhoto: (blob: Blob, meta: NewPhotoMeta) => Promise<PhotoEntry>;
  editPhoto: (id: string, patch: Partial<PhotoEntry>) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;

  importBackup: (backup: LeoBackup, mode: ImportMode) => Promise<void>;
  clearAll: () => Promise<void>;
}

/** Re-read every store from the repository and refresh in-memory state. */
async function refresh() {
  const [
    profile,
    feeds,
    diapers,
    sleeps,
    activeSleep,
    growth,
    medical,
    milestones,
    journal,
    photos,
  ] = await Promise.all([
    repo.getProfile(),
    repo.getRecentFeeds(RECENT_LIMIT),
    repo.getRecentDiapers(RECENT_LIMIT),
    repo.getRecentSleeps(RECENT_LIMIT),
    repo.getActiveSleep(),
    repo.getAllGrowth(),
    repo.getAllMedical(),
    repo.getAllMilestones(),
    repo.getAllJournal(),
    repo.getAllPhotos(),
  ]);
  return {
    profile,
    feeds,
    diapers,
    sleeps,
    activeSleep,
    growth,
    medical,
    milestones,
    journal,
    photos,
  };
}

export const useLeoStore = create<LeoState>((set, get) => ({
  hydrated: false,
  profile: null,
  feeds: [],
  diapers: [],
  sleeps: [],
  activeSleep: null,
  growth: [],
  medical: [],
  milestones: [],
  journal: [],
  photos: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const data = await refresh();
    set({ ...data, hydrated: true });
  },

  editProfile: async (input) => {
    const profile = await repo.saveProfile(input);
    set({ profile });
  },

  createFeed: async (input) => {
    await repo.addFeed(input);
    set({ feeds: await repo.getRecentFeeds(RECENT_LIMIT) });
  },
  editFeed: async (id, patch) => {
    await repo.updateFeed(id, patch);
    set({ feeds: await repo.getRecentFeeds(RECENT_LIMIT) });
  },
  removeFeed: async (id) => {
    await repo.deleteFeed(id);
    set({ feeds: await repo.getRecentFeeds(RECENT_LIMIT) });
  },

  createDiaper: async (input) => {
    await repo.addDiaper(input);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
  },
  editDiaper: async (id, patch) => {
    await repo.updateDiaper(id, patch);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
  },
  removeDiaper: async (id) => {
    await repo.deleteDiaper(id);
    set({ diapers: await repo.getRecentDiapers(RECENT_LIMIT) });
  },

  startSleepTimer: async (startedAt) => {
    await repo.startSleep(startedAt);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
  },
  stopSleepTimer: async (id, endedAt) => {
    await repo.endSleep(id, endedAt);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
  },
  editSleep: async (id, patch) => {
    await repo.updateSleep(id, patch);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
  },
  removeSleep: async (id) => {
    await repo.deleteSleep(id);
    set({
      sleeps: await repo.getRecentSleeps(RECENT_LIMIT),
      activeSleep: await repo.getActiveSleep(),
    });
  },

  createGrowth: async (input) => {
    await repo.addGrowth(input);
    set({ growth: await repo.getAllGrowth() });
  },
  editGrowth: async (id, patch) => {
    await repo.updateGrowth(id, patch);
    set({ growth: await repo.getAllGrowth() });
  },
  removeGrowth: async (id) => {
    await repo.deleteGrowth(id);
    set({ growth: await repo.getAllGrowth() });
  },

  createMedical: async (input) => {
    await repo.addMedical(input);
    set({ medical: await repo.getAllMedical() });
  },
  editMedical: async (id, patch) => {
    await repo.updateMedical(id, patch);
    set({ medical: await repo.getAllMedical() });
  },
  removeMedical: async (id) => {
    await repo.deleteMedical(id);
    set({ medical: await repo.getAllMedical() });
  },

  createMilestone: async (input) => {
    await repo.addMilestone(input);
    set({ milestones: await repo.getAllMilestones() });
  },
  editMilestone: async (id, patch) => {
    await repo.updateMilestone(id, patch);
    set({ milestones: await repo.getAllMilestones() });
  },
  removeMilestone: async (id) => {
    await repo.deleteMilestone(id);
    set({ milestones: await repo.getAllMilestones() });
  },

  createJournal: async (input) => {
    await repo.addJournal(input);
    set({ journal: await repo.getAllJournal() });
  },
  editJournal: async (id, patch) => {
    await repo.updateJournal(id, patch);
    set({ journal: await repo.getAllJournal() });
  },
  removeJournal: async (id) => {
    await repo.deleteJournal(id);
    set({ journal: await repo.getAllJournal() });
  },

  addPhoto: async (blob, meta) => {
    const entry = await repo.addPhoto(blob, meta);
    set({ photos: await repo.getAllPhotos() });
    return entry;
  },
  editPhoto: async (id, patch) => {
    await repo.updatePhoto(id, patch);
    set({ photos: await repo.getAllPhotos() });
  },
  removePhoto: async (id) => {
    await repo.deletePhoto(id);
    set({ photos: await repo.getAllPhotos() });
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
