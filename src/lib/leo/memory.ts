/**
 * The Second Brain — pure recall + curation logic (no React / no IndexedDB).
 *
 * `rankMemories` scores stored memories against the live conversation the way a
 * memory stream does: a BM25-lite lexical match blended with importance,
 * recency, a per-category weight, the memory's trust, and a safety boost so
 * health and allergy facts surface first and are never dropped. The AI route
 * also imports the distil prompt + validator here (mirroring `log-parse` /
 * `report-actions`) so memory extraction is testable and the route stays thin.
 *
 * Design notes are grounded in the Generative-Agents memory stream
 * (recency·importance·relevance), Mem0's ADD/UPDATE/NOOP curation, and BM25 for
 * lexical relevance — but kept fully local: no embeddings, no vector DB.
 */
import { z } from 'zod';
import type { Memory, MemoryCategory } from './types';

const DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Tokenising + BM25-lite lexical relevance
// ---------------------------------------------------------------------------

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'is',
  'are',
  'was',
  'were',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'with',
  'he',
  'his',
  'him',
  'she',
  'her',
  'it',
  'leo',
  'baby',
  'do',
  'does',
  'did',
  'how',
  'what',
  'when',
  'why',
  'i',
  'we',
  'you',
  'my',
  'me',
]);

/** Lower-case word tokens (length ≥ 2), stop-words removed. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => t.length >= 2 && !STOP.has(t),
  );
}

function memoryTokens(m: Memory): string[] {
  return tokenize(`${m.text} ${m.tags.join(' ')}`);
}

/**
 * BM25 score of each memory against the query terms, computed over the given
 * memory corpus. Returns a map id → raw score (0 when no query term matches).
 */
function bm25(memories: Memory[], queryTerms: string[]): Map<string, number> {
  const k1 = 1.5;
  const b = 0.75;
  const docs = memories.map((m) => ({ id: m.id, tokens: memoryTokens(m) }));
  const N = docs.length || 1;
  const avgdl =
    docs.reduce((sum, d) => sum + d.tokens.length, 0) / (docs.length || 1) || 1;

  // Document frequency per query term.
  const df = new Map<string, number>();
  for (const term of Array.from(new Set(queryTerms))) {
    let n = 0;
    for (const d of docs) if (d.tokens.includes(term)) n++;
    df.set(term, n);
  }

  const scores = new Map<string, number>();
  for (const d of docs) {
    const dl = d.tokens.length || 1;
    let score = 0;
    for (const term of queryTerms) {
      const n = df.get(term) ?? 0;
      if (n === 0) continue;
      const tf = d.tokens.filter((t) => t === term).length;
      if (tf === 0) continue;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * dl) / avgdl)));
    }
    scores.set(d.id, score);
  }
  return scores;
}

// ---------------------------------------------------------------------------
// Scoring weights
// ---------------------------------------------------------------------------

/** How strongly a category matters to general recall (0–1). */
function categoryBoost(cat: MemoryCategory): number {
  switch (cat) {
    case 'health':
    case 'allergy':
      return 1;
    case 'preference':
    case 'routine':
    case 'person':
      return 0.6;
    case 'milestone':
    case 'fact':
      return 0.4;
    case 'note':
    default:
      return 0.2;
  }
}

/** Health/allergy/urgent facts get a multiplier so they surface first. */
function safetyMultiplier(m: Memory): number {
  if (m.category === 'health') return 1.5;
  if (m.category === 'allergy') return 1.4;
  if (m.importance >= 9 || m.tags.includes('urgent')) return 1.3;
  return 1;
}

/** True for facts that must always be recalled and never decayed. */
export function isSafetyCritical(m: Memory): boolean {
  return m.category === 'health' || m.category === 'allergy';
}

function ageDays(m: Memory, now: number): number {
  const last = Math.max(m.createdAt, m.lastUsedAt ?? 0);
  return Math.max(0, (now - last) / DAY);
}

export interface RankedMemory {
  memory: Memory;
  score: number;
  /** True when included because it's pinned or safety-critical, not by score. */
  forced: boolean;
}

export interface RankOptions {
  now?: number;
  /** How many memories to return (safety-critical/pinned may exceed this). */
  topN?: number;
}

/**
 * Rank memories for the given query (the latest user turn, or "" for general
 * context). Superseded memories are excluded. Pinned + health/allergy memories
 * are always included; the rest fill up to `topN` by blended score.
 */
export function rankMemories(
  memories: Memory[],
  query: string,
  opts: RankOptions = {},
): RankedMemory[] {
  const now = opts.now ?? Date.now();
  const topN = opts.topN ?? 8;
  const live = memories.filter((m) => !m.supersededBy);
  if (live.length === 0) return [];

  const terms = tokenize(query);
  const raw = bm25(live, terms);
  const maxRaw = Math.max(1e-9, ...Array.from(raw.values()));

  const scored = live.map((m) => {
    const normBm25 = (raw.get(m.id) ?? 0) / maxRaw;
    const recency = 1 / (1 + ageDays(m, now) / 7);
    const base =
      0.5 * normBm25 +
      0.25 * (m.importance / 10) +
      0.15 * recency +
      0.1 * categoryBoost(m.category);
    const score =
      base * Math.max(0, Math.min(1, m.trust)) * safetyMultiplier(m);
    return { memory: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const forcedIds = new Set(
    live.filter((m) => m.pinned || isSafetyCritical(m)).map((m) => m.id),
  );

  const result: RankedMemory[] = [];
  const seen = new Set<string>();
  // Safety-critical + pinned first (always included, highest-scored among them).
  for (const s of scored) {
    if (forcedIds.has(s.memory.id)) {
      result.push({ ...s, forced: true });
      seen.add(s.memory.id);
    }
  }
  // Then fill remaining slots up to topN with the best of the rest. (Forced
  // safety-critical memories may already exceed topN — we never drop those.)
  for (const s of scored) {
    if (result.length >= topN) break;
    if (seen.has(s.memory.id)) continue;
    result.push({ ...s, forced: false });
    seen.add(s.memory.id);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Formatting for the chat system prompt
// ---------------------------------------------------------------------------

const CATEGORY_LABEL: Record<MemoryCategory, string> = {
  health: 'HEALTH',
  allergy: 'ALLERGY',
  preference: 'PREFERENCE',
  routine: 'ROUTINE',
  person: 'PERSON',
  milestone: 'MILESTONE',
  fact: 'FACT',
  note: 'NOTE',
};

export function categoryLabel(cat: MemoryCategory): string {
  return CATEGORY_LABEL[cat];
}

/**
 * A compact, labelled block of recalled memories to inject into the system
 * prompt. Safety-critical lines are marked with ★ so the model treats them
 * with extra care.
 */
export function memoriesContext(ranked: RankedMemory[]): string {
  if (!ranked.length) return '';
  const lines = ranked.map(({ memory: m }) => {
    const mark = isSafetyCritical(m) ? '★' : '•';
    return `${mark} ${CATEGORY_LABEL[m.category]}: ${m.text}`;
  });
  return `What you remember about Leo (your Second Brain — treat ★ health/allergy facts as important and never contradict them):\n${lines.join('\n')}`;
}

/** The memory ids recalled — so callers can bump their useCount/lastUsedAt. */
export function recalledIds(ranked: RankedMemory[]): string[] {
  return ranked.map((r) => r.memory.id);
}

// ---------------------------------------------------------------------------
// Decay / forgetting (pure — caller applies the returned patches)
// ---------------------------------------------------------------------------

export interface DecayPatch {
  id: string;
  importance: number;
}

/**
 * Gently lower the importance of stale, low-trust notes/facts that haven't been
 * useful in a long time (FadeMem-style forgetting). NEVER touches health,
 * allergy, or pinned memories. Returns the patches to apply.
 */
export function decayMemories(
  memories: Memory[],
  opts: { now?: number; staleDays?: number } = {},
): DecayPatch[] {
  const now = opts.now ?? Date.now();
  const staleDays = opts.staleDays ?? 45;
  const patches: DecayPatch[] = [];
  for (const m of memories) {
    if (m.pinned || isSafetyCritical(m) || m.supersededBy) continue;
    if (m.category !== 'note' && m.category !== 'fact') continue;
    if (m.importance <= 1) continue;
    if (ageDays(m, now) >= staleDays) {
      patches.push({ id: m.id, importance: m.importance - 1 });
    }
  }
  return patches;
}

// ---------------------------------------------------------------------------
// Distil memories from a conversation (prompt + schema + validator)
// ---------------------------------------------------------------------------

export const DISTIL_SYSTEM = `You maintain a long-term memory ("Second Brain") for a baby-tracking app about a baby called Leo. Given the recent conversation and the memories you already hold, decide what is worth REMEMBERING for the future — durable facts, preferences, routines, people, and especially health facts and allergies.

Return ONLY a JSON object {"memories": [ ... ]} and nothing else (no prose, no markdown). Each item:
- {"op":"ADD","text":"Leo prefers feeding on the left breast","category":"preference","importance":5,"tags":["feeding","left"],"healthCritical":false}
- {"op":"UPDATE","id":"<existing memory id>","text":"...","category":"...","importance":7,"tags":[...],"healthCritical":false}
- {"op":"NOOP"}  (use when nothing is worth saving)

Categories: "health" (conditions, symptoms that recur, medications), "allergy" (anything Leo reacts to), "preference", "routine", "person" (names/relationships), "milestone", "fact", "note".

Rules:
- Only remember things that are DURABLE and useful later — not one-off log entries (a single feed/nappy belongs in the daily log, not memory).
- Set "healthCritical": true for anything health-, allergy-, or medication-related. NEVER invent medication names, doses or diagnoses — copy wording exactly or omit.
- importance is 1 (trivial) to 10 (critical). Health/allergy facts are usually 8–10.
- Prefer UPDATE (with the existing id) over a duplicate ADD when a memory already covers the topic.
- Keep each "text" short, factual and self-contained (max ~200 chars). If nothing is worth saving, return {"memories":[{"op":"NOOP"}]}.`;

export const memoryOpSchema = z.object({
  op: z.enum(['ADD', 'UPDATE', 'NOOP']),
  id: z.string().max(80).optional(),
  text: z.string().min(1).max(280).optional(),
  category: z
    .enum([
      'health',
      'allergy',
      'preference',
      'routine',
      'person',
      'milestone',
      'fact',
      'note',
    ])
    .optional(),
  importance: z.number().min(1).max(10).optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  healthCritical: z.boolean().optional(),
});

export type MemoryOp = z.infer<typeof memoryOpSchema>;

const memoryOpsSchema = z.object({
  memories: z.array(memoryOpSchema).max(12),
});
export type MemoryOps = z.infer<typeof memoryOpsSchema>;

/** Strip ```json fences, parse + validate the ops, or null on any failure. */
export function parseMemoryOps(text: string): MemoryOps | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    const res = memoryOpsSchema.safeParse(JSON.parse(cleaned));
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

/** Real (non-NOOP) ops that carry enough to save: ADD/UPDATE with text+category. */
export function actionableOps(ops: MemoryOps): MemoryOp[] {
  return ops.memories.filter(
    (o) =>
      o.op !== 'NOOP' &&
      typeof o.text === 'string' &&
      o.text.trim().length > 0 &&
      !!o.category,
  );
}

/** A compact, labelled list of existing memories to give the distiller context. */
export function memoriesForDistil(memories: Memory[], limit = 40): string {
  const live = memories.filter((m) => !m.supersededBy).slice(0, limit);
  if (!live.length) return '(no memories yet)';
  return live
    .map(
      (m) => `[${m.id}] (${m.category}, importance ${m.importance}) ${m.text}`,
    )
    .join('\n');
}
