import { describe, it, expect } from 'vitest';
import {
  AI_TASKS,
  aiTask,
  buildContext,
  MAX_CONTEXT_CHARS,
  type AiSources,
  type AiTaskKey,
} from '@/lib/leo/ai';
import type {
  BabyProfile,
  FeedEntry,
  MilestoneEntry,
  RoutineSession,
} from '@/lib/leo';

const BIRTH = new Date(2026, 5, 24, 22, 54).getTime(); // 24 Jun 2026
const DAY = 86_400_000;
const NOW = BIRTH + 40 * DAY;

const profile: BabyProfile = {
  id: 'leo',
  name: 'Leo',
  birth: BIRTH,
  birthPlace: 'Lewisham Hospital',
  updatedAt: 0,
};

function feed(startedAt: number): FeedEntry {
  return {
    id: 'f' + startedAt,
    type: 'bottle',
    startedAt,
    amountMl: 90,
    contents: 'formula',
    createdAt: 0,
    updatedAt: 0,
  };
}

const milestone = (p: Partial<MilestoneEntry>): MilestoneEntry => ({
  id: 'm' + (p.achievedAt ?? 0),
  achievedAt: BIRTH + 30 * DAY,
  title: 'A milestone',
  createdAt: 0,
  updatedAt: 0,
  ...p,
});

function sources(over: Partial<AiSources> = {}): AiSources {
  return {
    profile,
    milestones: [],
    journal: [],
    voices: [],
    photos: [],
    growth: [],
    sizes: [],
    medical: [],
    events: [],
    feeds: [],
    diapers: [],
    sleeps: [],
    activeSleep: null,
    routineSessions: [],
    now: NOW,
    ...over,
  };
}

const ALL_TASKS = AI_TASKS.map((t) => t.key);

describe('AI_TASKS catalogue', () => {
  it('has a question task and saveable tasks', () => {
    expect(AI_TASKS.some((t) => t.needsQuestion)).toBe(true);
    expect(AI_TASKS.some((t) => t.saveable)).toBe(true);
    expect(aiTask('doctor-notes')?.saveable).toBe(true);
  });
});

describe('buildContext', () => {
  it('every task produces a non-empty string with the age line', () => {
    for (const key of ALL_TASKS) {
      const ctx = buildContext(key as AiTaskKey, sources());
      expect(ctx.length).toBeGreaterThan(0);
      expect(ctx).toContain('Leo is');
    }
  });

  it('doctor-notes context contains the doctorSummary shape', () => {
    const ctx = buildContext('doctor-notes', sources({ feeds: [feed(NOW)] }));
    expect(ctx).toContain('Summary for Leo');
    expect(ctx).toMatch(/Feeding:|Nappies:|Temperature:/);
  });

  it('week / patterns context has roughly 7 day lines', () => {
    const week = buildContext('summary-week', sources());
    // 7 day labels like "Mon 24 Jun:"
    const lines = week.split('\n').filter((l) => /:\s/.test(l));
    expect(lines.length).toBeGreaterThanOrEqual(7);
    const patterns = buildContext('patterns', sources());
    expect(patterns.toLowerCase()).toContain('do not diagnose');
  });

  it('Ask a question embeds the typed question', () => {
    const ctx = buildContext('question', sources(), {
      question: 'When did Leo first smile?',
    });
    expect(ctx).toContain('When did Leo first smile?');
  });

  it('includes logged highlights for the baby-book task', () => {
    const ctx = buildContext(
      'baby-book',
      sources({ milestones: [milestone({ title: 'First giggle' })] }),
    );
    expect(ctx).toContain('First giggle');
  });

  it('right-now: includes current state and a method that worked before', () => {
    const sess: RoutineSession = {
      id: 'r1',
      type: 'settling',
      startedAt: NOW - 60 * 60_000,
      endedAt: NOW - 50 * 60_000,
      contextTags: ['Overtired'],
      methods: [{ method: 'Shoulder cuddle', result: 'worked' }],
      createdAt: 0,
      updatedAt: 0,
    };
    const ctx = buildContext(
      'right-now',
      sources({ feeds: [feed(NOW - 40 * 60_000)], routineSessions: [sess] }),
    );
    expect(ctx).toContain('Leo is');
    expect(ctx).toContain('Right now');
    expect(ctx).toContain('Shoulder cuddle');
  });

  it('enforces the length cap', () => {
    // Flood with milestones to exceed the cap.
    const many = Array.from({ length: 4000 }, (_, i) =>
      milestone({
        achievedAt: BIRTH + (i % 30) * DAY,
        title: `Milestone number ${i} with a fairly long descriptive title`,
      }),
    );
    const ctx = buildContext('baby-book', sources({ milestones: many }));
    expect(ctx.length).toBeLessThanOrEqual(MAX_CONTEXT_CHARS);
  });
});
