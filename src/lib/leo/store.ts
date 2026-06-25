'use client';

import { create } from 'zustand';
import * as repo from './repository';
import type {
  BabyProfile,
  DiaperEntry,
  FeedEntry,
  ImportMode,
  LeoBackup,
  NewDiaper,
  NewFeed,
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

  importBackup: (backup: LeoBackup, mode: ImportMode) => Promise<void>;
  clearAll: () => Promise<void>;
}

/** Re-read every store from the repository and refresh in-memory state. */
async function refresh() {
  const [profile, feeds, diapers, sleeps, activeSleep] = await Promise.all([
    repo.getProfile(),
    repo.getRecentFeeds(RECENT_LIMIT),
    repo.getRecentDiapers(RECENT_LIMIT),
    repo.getRecentSleeps(RECENT_LIMIT),
    repo.getActiveSleep(),
  ]);
  return { profile, feeds, diapers, sleeps, activeSleep };
}

export const useLeoStore = create<LeoState>((set, get) => ({
  hydrated: false,
  profile: null,
  feeds: [],
  diapers: [],
  sleeps: [],
  activeSleep: null,

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

  importBackup: async (backup, mode) => {
    await repo.importAll(backup, mode);
    set(await refresh());
  },
  clearAll: async () => {
    await repo.clearAll();
    set(await refresh());
  },
}));
