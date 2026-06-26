import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import * as repo from '@/lib/leo/repository';
import { leoBackupSchema } from '@/lib/leo/backup-schema';
import { DB_VERSION } from '@/lib/leo/db';

beforeEach(async () => {
  await repo.clearAll();
});

describe('backup round-trip', () => {
  it('exports, clears, and re-imports all data', async () => {
    await repo.saveProfile({ name: 'Leo', birth: 1000 });
    await repo.addFeed({
      type: 'bottle',
      startedAt: 2000,
      amountMl: 90,
      contents: 'formula',
    });
    await repo.addDiaper({ type: 'both', changedAt: 3000 });
    const sleep = await repo.startSleep(4000);
    await repo.endSleep(sleep.id, 9000);
    await repo.addEvent({ kind: 'mood', at: 5000, mood: 'content' });
    await repo.addMedical({ kind: 'note', title: 'Red book note', at: 6000 });
    await repo.addSize({ kind: 'nappy', size: 'Size 2', startedAt: 6500 });
    await repo.addRoutine({
      category: 'settling',
      text: 'White noise',
      position: 0,
      rating: 'works',
    });
    await repo.addCareTask({
      kind: 'binDay',
      label: 'Bin day',
      cadence: 'weekly',
      weekday: 2,
      enabled: true,
      anchorAt: 6600,
    });
    await repo.addVoice(
      new Blob([new Uint8Array([9, 8, 7, 6])], { type: 'audio/webm' }),
      { recordedAt: 6800, title: 'First coo', category: 'firstSound' },
    );
    await repo.addDocument(
      new Blob([new Uint8Array([5, 6, 7])], { type: 'application/pdf' }),
      { title: 'GP letter', at: 7000 },
    );

    const backup = await repo.exportAll();
    expect(backup.schemaVersion).toBe(DB_VERSION);
    expect(backup.feeds).toHaveLength(1);
    expect(backup.diapers).toHaveLength(1);
    expect(backup.sleeps).toHaveLength(1);
    expect(backup.events).toHaveLength(1);
    expect(backup.sizes).toHaveLength(1);
    expect(backup.routines).toHaveLength(1);
    expect(backup.careTasks).toHaveLength(1);
    expect(backup.voices).toHaveLength(1);
    expect(backup.documents).toHaveLength(1);

    await repo.clearAll();
    expect(await repo.getRecentFeeds()).toHaveLength(0);
    expect(await repo.getRecentEvents()).toHaveLength(0);
    expect(await repo.getProfile()).toBeNull();

    await repo.importAll(backup, 'replace');
    expect(await repo.getProfile()).not.toBeNull();
    expect(await repo.getRecentFeeds()).toHaveLength(1);
    expect((await repo.getLastSleep())?.endedAt).toBe(9000);
    expect(await repo.getRecentEvents()).toHaveLength(1);
    expect(await repo.getAllRoutines()).toHaveLength(1);
    expect((await repo.getAllRoutines())[0].rating).toBe('works');
    expect(await repo.getAllVoices()).toHaveLength(1);
    expect((await repo.getAllVoices())[0].bytes.byteLength).toBe(4);
    expect((await repo.getAllVoices())[0].category).toBe('firstSound');
    expect(await repo.getAllDocuments()).toHaveLength(1);
    expect((await repo.getAllDocuments())[0].bytes.byteLength).toBe(3);
  });

  it('merge keeps existing entries and adds new ones', async () => {
    await repo.addFeed({ type: 'breast', startedAt: 1000, side: 'L' });
    const backup = await repo.exportAll();
    // add another live entry, then merge the old backup back in
    await repo.addFeed({ type: 'breast', startedAt: 2000, side: 'R' });
    await repo.importAll(backup, 'merge');
    expect(await repo.getRecentFeeds()).toHaveLength(2);
  });
});

describe('schema validation', () => {
  it('accepts a valid backup', () => {
    const valid = {
      schemaVersion: 1,
      exportedAt: 123,
      profile: null,
      feeds: [],
      diapers: [],
      sleeps: [],
    };
    expect(leoBackupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects malformed payloads', () => {
    expect(leoBackupSchema.safeParse({ foo: 'bar' }).success).toBe(false);
    expect(
      leoBackupSchema.safeParse({
        schemaVersion: 1,
        exportedAt: 1,
        profile: null,
        feeds: [
          {
            id: 'x',
            type: 'invalid',
            startedAt: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        ],
        diapers: [],
        sleeps: [],
      }).success,
    ).toBe(false);
  });
});
