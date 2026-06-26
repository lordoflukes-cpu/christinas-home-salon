import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import * as repo from '@/lib/leo/repository';

beforeEach(async () => {
  await repo.clearAll();
});

describe('saved routines', () => {
  it('adds, lists newest-first, updates and deletes', async () => {
    const a = await repo.addSavedRoutine({
      name: 'Bedtime',
      type: 'bedtime',
      steps: ['Bath', 'Feed', 'Cuddle'],
    });
    await repo.addSavedRoutine({
      name: 'Nap',
      type: 'nap',
      steps: ['White noise'],
    });

    const all = await repo.getAllSavedRoutines();
    expect(all.map((r) => r.name)).toEqual(['Nap', 'Bedtime']);

    await repo.updateSavedRoutine(a.id, { name: 'Bedtime v2' });
    expect(
      (await repo.getAllSavedRoutines()).find((r) => r.id === a.id)?.name,
    ).toBe('Bedtime v2');

    await repo.deleteSavedRoutine(a.id);
    expect(await repo.getAllSavedRoutines()).toHaveLength(1);
  });
});

describe('experiments', () => {
  it('adds, concludes and persists outcome', async () => {
    const e = await repo.addExperiment({
      title: 'Dream feed',
      startedAt: 1000,
      status: 'running',
    });
    expect((await repo.getAllExperiments())[0].status).toBe('running');

    await repo.updateExperiment(e.id, {
      status: 'worked',
      outcome: 'Longer stretch',
      endedAt: 2000,
    });
    const done = (await repo.getAllExperiments())[0];
    expect(done.status).toBe('worked');
    expect(done.outcome).toBe('Longer stretch');

    await repo.deleteExperiment(e.id);
    expect(await repo.getAllExperiments()).toHaveLength(0);
  });
});

describe('backup round-trip includes the new stores', () => {
  it('exports and re-imports saved routines + experiments', async () => {
    await repo.addSavedRoutine({
      name: 'Bedtime',
      type: 'bedtime',
      steps: ['Bath'],
    });
    await repo.addExperiment({
      title: 'Dream feed',
      startedAt: 1000,
      status: 'running',
    });

    const backup = await repo.exportAll();
    expect(backup.savedRoutines).toHaveLength(1);
    expect(backup.experiments).toHaveLength(1);

    await repo.clearAll();
    expect(await repo.getAllSavedRoutines()).toHaveLength(0);

    await repo.importAll(backup, 'replace');
    expect(await repo.getAllSavedRoutines()).toHaveLength(1);
    expect(await repo.getAllExperiments()).toHaveLength(1);
  });
});
