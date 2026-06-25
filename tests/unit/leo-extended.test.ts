import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import * as repo from '@/lib/leo/repository';

beforeEach(async () => {
  await repo.clearAll();
});

describe('growth store', () => {
  it('adds and lists chronologically', async () => {
    await repo.addGrowth({ measuredAt: 3000, weightGrams: 4000 });
    await repo.addGrowth({ measuredAt: 1000, weightGrams: 3300 });
    const all = await repo.getAllGrowth();
    expect(all.map((g) => g.measuredAt)).toEqual([1000, 3000]);
  });
});

describe('medical store', () => {
  it('adds, updates done, deletes', async () => {
    const m = await repo.addMedical({
      at: 1000,
      kind: 'vaccination',
      title: '8 weeks',
      scheduleId: '8w',
    });
    await repo.updateMedical(m.id, { done: true });
    const all = await repo.getAllMedical();
    expect(all[0].done).toBe(true);
    await repo.deleteMedical(m.id);
    expect(await repo.getAllMedical()).toHaveLength(0);
  });
});

describe('milestones & journal', () => {
  it('returns newest first', async () => {
    await repo.addMilestone({ achievedAt: 1000, title: 'First smile' });
    await repo.addMilestone({ achievedAt: 5000, title: 'First bath' });
    const ms = await repo.getAllMilestones();
    expect(ms[0].title).toBe('First bath');

    await repo.addJournal({ writtenAt: 1000, body: 'a' });
    await repo.addJournal({ writtenAt: 5000, body: 'b' });
    const js = await repo.getAllJournal();
    expect(js[0].body).toBe('b');
  });
});

describe('photos', () => {
  it('stores a Blob and round-trips through a backup', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], {
      type: 'image/jpeg',
    });
    await repo.addPhoto(blob, { takenAt: 1000, caption: 'hi', w: 2, h: 2 });

    const photos = await repo.getAllPhotos();
    expect(photos).toHaveLength(1);
    expect(photos[0].bytes.byteLength).toBe(4);
    expect(photos[0].type).toBe('image/jpeg');

    const backup = await repo.exportAll();
    expect(backup.photos?.[0].dataUrl.startsWith('data:image/jpeg')).toBe(true);

    await repo.clearAll();
    expect(await repo.getAllPhotos()).toHaveLength(0);

    await repo.importAll(backup, 'replace');
    const restored = await repo.getAllPhotos();
    expect(restored).toHaveLength(1);
    expect(restored[0].caption).toBe('hi');
    expect(restored[0].bytes.byteLength).toBe(4);
  });
});

describe('full backup with all stores', () => {
  it('exports and re-imports growth/medical/milestone/journal', async () => {
    await repo.addGrowth({ measuredAt: 1000, weightGrams: 3300 });
    await repo.addMedical({ at: 2000, kind: 'appointment', title: 'GP' });
    await repo.addMilestone({ achievedAt: 3000, title: 'Smile' });
    await repo.addJournal({ writtenAt: 4000, body: 'Dear Leo' });

    const backup = await repo.exportAll();
    await repo.clearAll();
    await repo.importAll(backup, 'replace');

    expect(await repo.getAllGrowth()).toHaveLength(1);
    expect(await repo.getAllMedical()).toHaveLength(1);
    expect(await repo.getAllMilestones()).toHaveLength(1);
    expect(await repo.getAllJournal()).toHaveLength(1);
  });
});
