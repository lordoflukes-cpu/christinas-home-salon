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

describe('events', () => {
  it('adds events newest-first and updates/deletes', async () => {
    await repo.addEvent({ kind: 'mood', at: 1000, mood: 'calm' });
    const cry = await repo.addEvent({ kind: 'cry', at: 3000, reason: 'wind' });
    await repo.addEvent({ kind: 'temperature', at: 2000, tempC: 37.1 });

    const recent = await repo.getRecentEvents();
    expect(recent.map((e) => e.at)).toEqual([3000, 2000, 1000]);

    const updated = await repo.updateEvent(cry.id, { durationMin: 12 });
    expect(updated.durationMin).toBe(12);

    await repo.deleteEvent(cry.id);
    expect(await repo.getRecentEvents()).toHaveLength(2);
  });
});

describe('documents', () => {
  it('adds, reads bytes, and deletes a document', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], {
      type: 'application/pdf',
    });
    const doc = await repo.addDocument(blob, {
      title: 'Discharge letter',
      category: 'letter',
      at: 1000,
    });
    expect(doc.type).toBe('application/pdf');
    expect(doc.bytes.byteLength).toBe(4);

    const all = await repo.getAllDocuments();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Discharge letter');

    await repo.deleteDocument(doc.id);
    expect(await repo.getAllDocuments()).toHaveLength(0);
  });
});

describe('sizes', () => {
  it('adds sizes newest-started-first, updates and deletes', async () => {
    await repo.addSize({ kind: 'nappy', size: 'Size 1', startedAt: 1000 });
    const two = await repo.addSize({
      kind: 'nappy',
      size: 'Size 2',
      startedAt: 5000,
    });
    await repo.addSize({
      kind: 'clothing',
      size: '0–3 months',
      startedAt: 3000,
    });
    const all = await repo.getAllSizes();
    expect(all[0].startedAt).toBe(5000);

    await repo.updateSize(two.id, { note: 'roomy' });
    expect((await repo.getAllSizes()).find((s) => s.id === two.id)?.note).toBe(
      'roomy',
    );
    await repo.deleteSize(two.id);
    expect(await repo.getAllSizes()).toHaveLength(2);
  });
});

describe('voices', () => {
  it('adds voice notes newest-first, updates metadata and deletes', async () => {
    await repo.addVoice(
      new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' }),
      { recordedAt: 1000, category: 'firstSound' },
    );
    const two = await repo.addVoice(
      new Blob([new Uint8Array([4, 5, 6, 7])], { type: 'audio/webm' }),
      { recordedAt: 5000, title: 'Coo', durationMs: 4200 },
    );

    const all = await repo.getAllVoices();
    expect(all).toHaveLength(2);
    expect(all[0].recordedAt).toBe(5000);
    expect(all[0].bytes.byteLength).toBe(4);

    await repo.updateVoice(two.id, {
      transcript: 'a little noise',
      favourite: true,
    });
    const saved = (await repo.getAllVoices()).find((v) => v.id === two.id);
    expect(saved?.transcript).toBe('a little noise');
    expect(saved?.favourite).toBe(true);

    await repo.deleteVoice(two.id);
    expect(await repo.getAllVoices()).toHaveLength(1);
  });
});

describe('routines', () => {
  it('adds routines ordered by position, updates rating and deletes', async () => {
    const a = await repo.addRoutine({
      category: 'morning',
      text: 'Wake',
      position: 0,
    });
    const b = await repo.addRoutine({
      category: 'morning',
      text: 'Feed',
      position: 1,
    });
    await repo.addRoutine({
      category: 'settling',
      text: 'Rocking',
      position: 0,
    });

    const all = await repo.getAllRoutines();
    expect(all).toHaveLength(3);
    // by-position index sorts ascending across the store
    expect(all[0].position).toBeLessThanOrEqual(all[1].position);

    await repo.updateRoutine(a.id, { rating: 'works' });
    expect(
      (await repo.getAllRoutines()).find((r) => r.id === a.id)?.rating,
    ).toBe('works');

    await repo.deleteRoutine(b.id);
    expect(await repo.getAllRoutines()).toHaveLength(2);
  });
});

describe('journal', () => {
  it('stores author and category', async () => {
    const j = await repo.addJournal({
      writtenAt: 1000,
      body: 'Fell asleep on my chest.',
      author: 'Daddy',
      category: 'sweet',
    });
    const all = await repo.getAllJournal();
    const saved = all.find((x) => x.id === j.id);
    expect(saved?.author).toBe('Daddy');
    expect(saved?.category).toBe('sweet');
  });
});

describe('milestones', () => {
  it('stores category, emotion, dual notes and who/where', async () => {
    const m = await repo.addMilestone({
      title: 'First smile',
      achievedAt: 1000,
      category: 'physical',
      emotion: 'beautiful',
      note: 'melted my heart',
      noteFromChristina: 'mine too',
      whoThere: 'Mummy & Daddy',
      location: 'home',
    });
    const all = await repo.getAllMilestones();
    const saved = all.find((x) => x.id === m.id);
    expect(saved?.category).toBe('physical');
    expect(saved?.emotion).toBe('beautiful');
    expect(saved?.noteFromChristina).toBe('mine too');
    expect(saved?.whoThere).toBe('Mummy & Daddy');
  });
});

describe('medical', () => {
  it('stores vaccination batch + reaction', async () => {
    const v = await repo.addMedical({
      kind: 'vaccination',
      title: '8 week jabs',
      at: 2000,
      batch: 'AB123',
      reaction: 'slight fever',
      done: true,
    });
    expect(v.batch).toBe('AB123');
    const all = await repo.getAllMedical();
    expect(all.find((m) => m.id === v.id)?.reaction).toBe('slight fever');
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
