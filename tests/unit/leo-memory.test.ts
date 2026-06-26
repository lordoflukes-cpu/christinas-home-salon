import { describe, it, expect } from 'vitest';
import {
  rankMemories,
  memoriesContext,
  decayMemories,
  parseMemoryOps,
  actionableOps,
  isSafetyCritical,
  tokenize,
  type RankedMemory,
} from '@/lib/leo/memory';
import type { Memory, MemoryCategory } from '@/lib/leo/types';

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;

function mem(partial: Partial<Memory> & { text: string }): Memory {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    text: partial.text,
    category: partial.category ?? 'fact',
    tags: partial.tags ?? [],
    importance: partial.importance ?? 5,
    trust: partial.trust ?? 1,
    source: partial.source ?? 'ai',
    pinned: partial.pinned ?? false,
    supersededBy: partial.supersededBy,
    useCount: partial.useCount ?? 0,
    lastUsedAt: partial.lastUsedAt,
    createdAt: partial.createdAt ?? NOW,
    updatedAt: partial.updatedAt ?? NOW,
  };
}

describe('tokenize', () => {
  it('lower-cases, drops stop-words and short tokens', () => {
    expect(tokenize('Leo is allergic to DAIRY')).toEqual(['allergic', 'dairy']);
  });
});

describe('rankMemories', () => {
  it('ranks a lexical match above an unrelated memory', () => {
    const dairy = mem({ id: 'd', text: 'Reacts to dairy with a rash' });
    const nap = mem({ id: 'n', text: 'Naps best in the sling' });
    const ranked = rankMemories([dairy, nap], 'is he okay with dairy?', {
      now: NOW,
    });
    expect(ranked[0].memory.id).toBe('d');
  });

  it('excludes superseded memories', () => {
    const old = mem({ id: 'o', text: 'Sleeps in cot', supersededBy: 'new' });
    const cur = mem({ id: 'new', text: 'Sleeps in next-to-me crib' });
    const ranked = rankMemories([old, cur], 'where does he sleep', {
      now: NOW,
    });
    expect(ranked.map((r) => r.memory.id)).not.toContain('o');
  });

  it('always includes health/allergy memories even with no query match', () => {
    const allergy = mem({
      id: 'a',
      text: 'Allergic to dairy',
      category: 'allergy',
      importance: 9,
    });
    const fillers = Array.from({ length: 12 }, (_, i) =>
      mem({ id: `f${i}`, text: `random note number ${i}`, category: 'note' }),
    );
    const ranked = rankMemories(
      [...fillers, allergy],
      'tell me about his sleep',
      { now: NOW, topN: 5 },
    );
    expect(ranked.some((r) => r.memory.id === 'a')).toBe(true);
    expect(ranked.find((r) => r.memory.id === 'a')?.forced).toBe(true);
  });

  it('always includes pinned memories', () => {
    const pinned = mem({
      id: 'p',
      text: 'Grandma is called Nana',
      pinned: true,
    });
    const fillers = Array.from({ length: 10 }, (_, i) =>
      mem({ id: `f${i}`, text: `filler ${i}` }),
    );
    const ranked = rankMemories([...fillers, pinned], 'sleep routine', {
      now: NOW,
      topN: 4,
    });
    expect(ranked.some((r) => r.memory.id === 'p')).toBe(true);
  });

  it('respects topN for non-forced memories', () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      mem({
        id: `m${i}`,
        text: `sleep nap routine note ${i}`,
        category: 'note',
      }),
    );
    const ranked = rankMemories(items, 'sleep', { now: NOW, topN: 6 });
    expect(ranked.length).toBe(6);
  });

  it('favours more recent memories when scores tie', () => {
    const old = mem({
      id: 'old',
      text: 'likes the swing',
      createdAt: NOW - 60 * DAY,
    });
    const recent = mem({
      id: 'recent',
      text: 'likes the swing',
      createdAt: NOW - 1 * DAY,
    });
    const ranked = rankMemories([old, recent], 'swing', { now: NOW });
    expect(ranked[0].memory.id).toBe('recent');
  });
});

describe('memoriesContext', () => {
  it('marks safety-critical lines with a star', () => {
    const ranked: RankedMemory[] = [
      {
        memory: mem({ text: 'Allergic to dairy', category: 'allergy' }),
        score: 1,
        forced: true,
      },
      {
        memory: mem({ text: 'Likes the sling', category: 'preference' }),
        score: 0.2,
        forced: false,
      },
    ];
    const text = memoriesContext(ranked);
    expect(text).toContain('★ ALLERGY: Allergic to dairy');
    expect(text).toContain('• PREFERENCE: Likes the sling');
  });

  it('is empty when there is nothing to recall', () => {
    expect(memoriesContext([])).toBe('');
  });
});

describe('isSafetyCritical', () => {
  it.each(['health', 'allergy'] as MemoryCategory[])(
    'treats %s as safety-critical',
    (category) => {
      expect(isSafetyCritical(mem({ text: 'x', category }))).toBe(true);
    },
  );
  it('does not treat a preference as safety-critical', () => {
    expect(isSafetyCritical(mem({ text: 'x', category: 'preference' }))).toBe(
      false,
    );
  });
});

describe('decayMemories', () => {
  it('lowers importance of stale notes but never health/allergy/pinned', () => {
    const staleNote = mem({
      id: 'note',
      text: 'old note',
      category: 'note',
      importance: 5,
      createdAt: NOW - 100 * DAY,
    });
    const staleHealth = mem({
      id: 'health',
      text: 'reflux',
      category: 'health',
      importance: 8,
      createdAt: NOW - 100 * DAY,
    });
    const stalePinned = mem({
      id: 'pin',
      text: 'pinned note',
      category: 'note',
      importance: 5,
      pinned: true,
      createdAt: NOW - 100 * DAY,
    });
    const patches = decayMemories([staleNote, staleHealth, stalePinned], {
      now: NOW,
    });
    expect(patches).toEqual([{ id: 'note', importance: 4 }]);
  });

  it('leaves fresh memories alone', () => {
    const fresh = mem({
      id: 'f',
      text: 'recent note',
      category: 'note',
      createdAt: NOW - 2 * DAY,
    });
    expect(decayMemories([fresh], { now: NOW })).toEqual([]);
  });
});

describe('parseMemoryOps', () => {
  it('parses ADD/UPDATE/NOOP ops', () => {
    const out = parseMemoryOps(
      JSON.stringify({
        memories: [
          {
            op: 'ADD',
            text: 'Prefers left breast',
            category: 'preference',
            importance: 5,
            tags: ['feeding'],
          },
          { op: 'NOOP' },
        ],
      }),
    );
    expect(out?.memories).toHaveLength(2);
    expect(actionableOps(out!)).toHaveLength(1);
    expect(actionableOps(out!)[0].text).toBe('Prefers left breast');
  });

  it('strips ```json fences', () => {
    const out = parseMemoryOps(
      '```json\n{"memories":[{"op":"ADD","text":"Allergic to egg","category":"allergy","importance":9}]}\n```',
    );
    expect(out?.memories[0].category).toBe('allergy');
  });

  it('returns null on malformed JSON', () => {
    expect(parseMemoryOps('not json')).toBeNull();
  });

  it('rejects out-of-range importance', () => {
    const out = parseMemoryOps(
      JSON.stringify({
        memories: [{ op: 'ADD', text: 'x', category: 'note', importance: 99 }],
      }),
    );
    expect(out).toBeNull();
  });
});
