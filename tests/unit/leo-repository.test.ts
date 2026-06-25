import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import * as repo from '@/lib/leo/repository';

beforeEach(async () => {
  await repo.clearAll();
});

describe('feeds', () => {
  it('adds feeds and returns them newest-first', async () => {
    await repo.addFeed({
      type: 'breast',
      startedAt: 1000,
      side: 'L',
      durationMin: 10,
    });
    await repo.addFeed({
      type: 'bottle',
      startedAt: 3000,
      amountMl: 90,
      contents: 'formula',
    });
    await repo.addFeed({
      type: 'breast',
      startedAt: 2000,
      side: 'R',
      durationMin: 8,
    });

    const recent = await repo.getRecentFeeds();
    expect(recent.map((f) => f.startedAt)).toEqual([3000, 2000, 1000]);
  });

  it('respects the limit', async () => {
    for (let i = 0; i < 5; i++) {
      await repo.addFeed({ type: 'breast', startedAt: i * 1000, side: 'L' });
    }
    expect(await repo.getRecentFeeds(2)).toHaveLength(2);
  });

  it('getLastFeed returns the most recent', async () => {
    await repo.addFeed({ type: 'breast', startedAt: 1000, side: 'L' });
    await repo.addFeed({ type: 'bottle', startedAt: 5000, amountMl: 100 });
    expect((await repo.getLastFeed())?.startedAt).toBe(5000);
  });

  it('updates and deletes', async () => {
    const feed = await repo.addFeed({
      type: 'breast',
      startedAt: 1000,
      side: 'L',
    });
    const updated = await repo.updateFeed(feed.id, { durationMin: 15 });
    expect(updated.durationMin).toBe(15);
    await repo.deleteFeed(feed.id);
    expect(await repo.getRecentFeeds()).toHaveLength(0);
  });
});

describe('diapers', () => {
  it('orders newest-first by changedAt', async () => {
    await repo.addDiaper({ type: 'wet', changedAt: 1000 });
    await repo.addDiaper({ type: 'both', changedAt: 4000 });
    const recent = await repo.getRecentDiapers();
    expect(recent[0].changedAt).toBe(4000);
    expect(recent[0].type).toBe('both');
  });
});

describe('sleep', () => {
  it('startSleep creates an active (open) sleep', async () => {
    const sleep = await repo.startSleep(1000);
    expect(sleep.endedAt).toBeUndefined();
    const active = await repo.getActiveSleep();
    expect(active?.id).toBe(sleep.id);
  });

  it('endSleep closes the active sleep', async () => {
    const sleep = await repo.startSleep(1000);
    await repo.endSleep(sleep.id, 5000);
    expect(await repo.getActiveSleep()).toBeNull();
    const last = await repo.getLastSleep();
    expect(last?.endedAt).toBe(5000);
  });

  it('only one active sleep is reported', async () => {
    await repo.startSleep(1000);
    await repo.startSleep(2000);
    // most recent open one wins
    expect((await repo.getActiveSleep())?.startedAt).toBe(2000);
  });
});

describe('profile', () => {
  it('saves and reads the singleton profile', async () => {
    expect(await repo.getProfile()).toBeNull();
    const saved = await repo.saveProfile({ name: 'Leo', birth: 123 });
    expect(saved.id).toBe('leo');
    expect((await repo.getProfile())?.name).toBe('Leo');
  });
});
