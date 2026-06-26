/**
 * "Ask Leo" — client-side context builders for the AI helper (pure + tested).
 *
 * The Claude API key lives only on the server (`/api/leo/ai`). The server can't
 * read the on-device IndexedDB, so the client composes a compact TEXT context
 * from the existing aggregators and POSTs it per task. **Only logged text is
 * ever sent — never photo bytes.**
 *
 * Everything here except `askLeo` is pure and synchronous so it can be unit
 * tested without a network or a browser.
 */
import type {
  BabyProfile,
  DiaperEntry,
  FeedEntry,
  GrowthEntry,
  JournalEntry,
  LeoEvent,
  MedicalEntry,
  MilestoneEntry,
  PhotoEntry,
  RoutineSession,
  SizeEntry,
  SleepEntry,
  VoiceEntry,
} from './types';
import { formatAge } from './age';
import { summariseDay } from './summary';
import { doctorSummary } from './doctor-summary';
import { promptOfTheDay } from './journal-prompts';
import { buildTimeline, lifeAnchors, type TimelineSources } from './timeline';
import {
  currentState,
  methodStats,
  similarPastSessions,
} from './routine-insights';
import { routineTypeConfig } from './routine-templates';
import type { ReminderAdvice } from './reminder-advice';

const DAY = 86_400_000;

/** The AI tasks offered as action cards on the Ask Leo screen. */
export type AiTaskKey =
  | 'right-now'
  | 'daily-briefing'
  | 'summary-day'
  | 'summary-week'
  | 'patterns'
  | 'doctor-notes'
  | 'family-update'
  | 'memory-prompt'
  | 'baby-book'
  | 'question'
  | 'yearly-recap';

export interface AiTask {
  key: AiTaskKey;
  label: string;
  description: string;
  emoji: string;
  /** Needs a free-text question typed by the user before running. */
  needsQuestion?: boolean;
  /** Offer to save the result as a journal note. */
  saveable?: boolean;
}

export const AI_TASKS: AiTask[] = [
  {
    key: 'right-now',
    label: 'What might help right now?',
    description: 'A suggestion based on right now + what’s worked before.',
    emoji: '🌟',
  },
  {
    key: 'daily-briefing',
    label: 'Today’s briefing',
    description: 'How Leo’s doing + a gentle pattern or two.',
    emoji: '🌅',
  },
  {
    key: 'summary-day',
    label: 'Summarise the day',
    description: 'A warm recap of how today went.',
    emoji: '☀️',
  },
  {
    key: 'summary-week',
    label: 'Summarise the week',
    description: 'How the last 7 days have looked.',
    emoji: '🗓️',
  },
  {
    key: 'patterns',
    label: 'Find patterns',
    description: 'Gentle observations from recent days.',
    emoji: '🔍',
  },
  {
    key: 'doctor-notes',
    label: 'Doctor notes',
    description: 'A clean, factual timeline for an appointment.',
    emoji: '🩺',
    saveable: true,
  },
  {
    key: 'family-update',
    label: 'Family update',
    description: 'A message to share with grandparents.',
    emoji: '💌',
    saveable: true,
  },
  {
    key: 'memory-prompt',
    label: 'Memory prompt',
    description: 'A little nudge to capture today.',
    emoji: '✨',
  },
  {
    key: 'baby-book',
    label: 'Baby-book chapter',
    description: 'A keepsake chapter for this month.',
    emoji: '📖',
    saveable: true,
  },
  {
    key: 'question',
    label: 'Ask a question',
    description: '“When did Leo first smile?”',
    emoji: '💬',
    needsQuestion: true,
  },
  {
    key: 'yearly-recap',
    label: "Leo's year",
    description: 'A look back over the whole journey.',
    emoji: '🎂',
    saveable: true,
  },
];

export function aiTask(key: AiTaskKey): AiTask | undefined {
  return AI_TASKS.find((t) => t.key === key);
}

/** Everything the builders read — a superset of the timeline sources. */
export interface AiSources extends TimelineSources {
  profile: BabyProfile | null;
  milestones: MilestoneEntry[];
  journal: JournalEntry[];
  voices: VoiceEntry[];
  photos: PhotoEntry[];
  growth: GrowthEntry[];
  sizes: SizeEntry[];
  medical: MedicalEntry[];
  events: LeoEvent[];
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  activeSleep: SleepEntry | null;
  routineSessions: RoutineSession[];
  now: number;
}

/** Hard cap on the text we send so a request stays small and cheap. */
export const MAX_CONTEXT_CHARS = 18_000;

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** One narrative line per day for the last `days` days (newest first). */
function weekLines(sources: AiSources, days = 7): string {
  const lines: string[] = [];
  for (let i = 0; i < days; i++) {
    const at = sources.now - i * DAY;
    const since = startOfDay(at);
    const until = since + DAY;
    const day = summariseDay({
      feeds: sources.feeds.filter(
        (f) => f.startedAt >= since && f.startedAt < until,
      ),
      diapers: sources.diapers.filter(
        (d) => d.changedAt >= since && d.changedAt < until,
      ),
      sleeps: sources.sleeps.filter(
        (s) => (s.endedAt ?? sources.now) >= since && s.startedAt < until,
      ),
      events: sources.events.filter((e) => e.at >= since && e.at < until),
      now: Math.min(until - 1, sources.now),
      name: sources.profile?.name,
    });
    lines.push(`${dayLabel(at)}: ${day.narrative}`);
  }
  return lines.join('\n');
}

/** Recent highlight lines (milestones, journal, firsts) for context. */
function highlightLines(sources: AiSources, limit = 30): string {
  const items = buildTimeline(sources, 'highlights').slice(0, limit);
  return items
    .map((it) => {
      const when = dayLabel(it.at);
      const sub = it.subtitle ? ` — ${it.subtitle}` : '';
      return `${when}: ${it.title}${sub}`;
    })
    .join('\n');
}

function ageLine(sources: AiSources): string {
  if (!sources.profile) return 'Leo';
  return `${sources.profile.name} is ${formatAge(
    sources.profile.birth,
    sources.now,
  )}.`;
}

function clamp(text: string): string {
  if (text.length <= MAX_CONTEXT_CHARS) return text;
  return `${text.slice(0, MAX_CONTEXT_CHARS - 1)}…`;
}

function fmtMins(mins?: number): string {
  if (mins == null) return 'not logged';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

/** Compact "what's true right now + what's worked before" context. */
function rightNowContext(sources: AiSources): string {
  const state = currentState({
    feeds: sources.feeds,
    diapers: sources.diapers,
    sleeps: sources.sleeps,
    activeSleep: sources.activeSleep,
    events: sources.events,
    sessions: sources.routineSessions,
    now: sources.now,
  });

  const lines: string[] = ['Right now:'];
  lines.push(`- Time of day: ${state.hourOfDay}:00`);
  lines.push(`- Last feed: ${fmtMins(state.minsSinceFeed)}`);
  lines.push(`- Last nappy: ${fmtMins(state.minsSinceNappy)}`);
  if (state.isAsleep) {
    lines.push('- Currently asleep');
  } else {
    lines.push(`- Last sleep ended: ${fmtMins(state.minsSinceSleep)}`);
    if (state.awakeMins != null)
      lines.push(
        `- Awake for: ${fmtMins(state.awakeMins).replace(' ago', '')}`,
      );
  }
  if (state.recentCues.length)
    lines.push(`- Cues just logged: ${state.recentCues.join(', ')}`);

  // What's worked overall, and specifically at similar moments / similar cues.
  const overall = methodStats(sources.routineSessions, { minTried: 2 }).slice(
    0,
    5,
  );
  if (overall.length) {
    lines.push('', 'What has worked before (success rate over times tried):');
    for (const s of overall)
      lines.push(
        `- ${s.method}: ${Math.round(s.successRate * 100)}% (${s.wins}/${s.tried})`,
      );
  }

  const contextTag = state.recentCues[0];
  if (contextTag) {
    const byContext = methodStats(sources.routineSessions, {
      contextTag,
    }).slice(0, 3);
    if (byContext.length) {
      lines.push('', `When Leo is "${contextTag}":`);
      for (const s of byContext)
        lines.push(
          `- ${s.method}: ${Math.round(s.successRate * 100)}% (${s.wins}/${s.tried})`,
        );
    }
  }

  const similar = similarPastSessions(sources.routineSessions, sources.now, {
    limit: 3,
  });
  const withWins = similar.filter((s) => s.worked.length);
  if (withWins.length) {
    lines.push('', 'Recent sessions around this time of day:');
    for (const { session, worked } of withWins)
      lines.push(
        `- ${routineTypeConfig(session.type).label}: ${worked.join(', ')} worked`,
      );
  }

  const today = summariseDay({
    feeds: sources.feeds,
    diapers: sources.diapers,
    sleeps: sources.sleeps,
    events: sources.events,
    now: sources.now,
    name: sources.profile?.name,
  });
  lines.push('', `Today so far: ${today.narrative}`);

  return lines.join('\n');
}

/** Context for the once-a-day briefing: today + recent days + what's worked. */
function dailyBriefingContext(sources: AiSources): string {
  const today = summariseDay({
    feeds: sources.feeds,
    diapers: sources.diapers,
    sleeps: sources.sleeps,
    events: sources.events,
    now: sources.now,
    name: sources.profile?.name,
  });

  const lines: string[] = [`Today so far: ${today.narrative}`];
  lines.push('', 'The last few days, one line each:', weekLines(sources, 4));

  const stats = methodStats(sources.routineSessions, { minTried: 2 }).slice(
    0,
    4,
  );
  if (stats.length) {
    lines.push('', 'Settling methods that have worked recently:');
    for (const s of stats)
      lines.push(
        `- ${s.method}: ${Math.round(s.successRate * 100)}% (${s.wins}/${s.tried})`,
      );
  }
  return lines.join('\n');
}

/**
 * Build the compact text context for a task. Never includes photo bytes — only
 * captions/titles already surfaced as text by the aggregators.
 */
export function buildContext(
  task: AiTaskKey,
  sources: AiSources,
  opts: { question?: string } = {},
): string {
  const age = ageLine(sources);
  let body = '';

  switch (task) {
    case 'right-now':
      body = rightNowContext(sources);
      break;
    case 'daily-briefing':
      body = dailyBriefingContext(sources);
      break;
    case 'summary-day': {
      const day = summariseDay({
        feeds: sources.feeds,
        diapers: sources.diapers,
        sleeps: sources.sleeps,
        events: sources.events,
        now: sources.now,
        name: sources.profile?.name,
      });
      body = `Today so far: ${day.narrative}`;
      break;
    }
    case 'summary-week':
      body = `The last 7 days, one line each:\n${weekLines(sources)}`;
      break;
    case 'patterns':
      body =
        `The last 7 days, one line each — look for gentle patterns ` +
        `(timing of fussiness, feeds, sleep). Do not diagnose.\n${weekLines(
          sources,
        )}`;
      break;
    case 'doctor-notes':
      body = `Recent factual summary:\n${doctorSummary({
        events: sources.events,
        feeds: sources.feeds,
        diapers: sources.diapers,
        sleeps: sources.sleeps,
        now: sources.now,
        days: 7,
        name: sources.profile?.name,
      })}`;
      break;
    case 'family-update':
      body = `Today: ${
        summariseDay({
          feeds: sources.feeds,
          diapers: sources.diapers,
          sleeps: sources.sleeps,
          events: sources.events,
          now: sources.now,
          name: sources.profile?.name,
        }).narrative
      }\n\nRecent highlights:\n${highlightLines(sources, 12)}`;
      break;
    case 'memory-prompt': {
      const prompt = promptOfTheDay(sources.now);
      body =
        `A writing prompt for today: "${prompt.prompt}"\n\n` +
        `Recent highlights:\n${highlightLines(sources, 10)}`;
      break;
    }
    case 'baby-book':
      body = `Highlights of Leo's life so far:\n${highlightLines(sources, 40)}`;
      break;
    case 'yearly-recap': {
      const anchors = sources.profile
        ? lifeAnchors(sources.profile.birth, sources.now)
            .filter((a) => !a.upcoming)
            .map((a) => `${dayLabel(a.at)}: ${a.title}`)
            .join('\n')
        : '';
      body = `Life milestones:\n${anchors}\n\nHighlights:\n${highlightLines(
        sources,
        40,
      )}`;
      break;
    }
    case 'question':
      body =
        `Question: ${opts.question?.trim() || '(no question)'}\n\n` +
        `What we know, from the log:\n${highlightLines(sources, 40)}`;
      break;
  }

  return clamp(`${age}\n\n${body}`.trim());
}

export interface AskLeoResult {
  text?: string;
  error?: string;
  /** True when the server has no ANTHROPIC_API_KEY configured. */
  notConfigured?: boolean;
}

/**
 * POST the built context to the server route and return the AI's text.
 * Kept thin on purpose — the pure builders above are what tests cover.
 */
export async function askLeo(
  task: AiTaskKey,
  context: string,
  question?: string,
  patwah?: 'light' | 'medium' | 'heavy',
): Promise<AskLeoResult> {
  try {
    const res = await fetch('/api/leo/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context, question, patwah }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      text?: string;
      error?: string;
    };
    if (res.status === 503) {
      return { notConfigured: true, error: data.error };
    }
    if (!res.ok) {
      return { error: data.error || 'Ask Leo had trouble. Please try again.' };
    }
    return { text: data.text };
  } catch {
    return { error: 'Couldn’t reach Ask Leo. Check your connection.' };
  }
}

/**
 * One proposed log entry parsed from a spoken/typed note. Mirrors the server's
 * `logEntrySchema`. Nothing is written until the parent confirms it.
 */
export interface ParsedLogEntry {
  kind: 'feed' | 'diaper' | 'sleep' | 'event' | 'milestone' | 'note';
  summary: string;
  feedType?: 'breast' | 'bottle';
  amountMl?: number;
  contents?: 'formula' | 'breastmilk';
  side?: 'L' | 'R';
  durationMin?: number;
  diaperType?: 'wet' | 'dirty' | 'both';
  color?: string;
  eventKind?: 'cry' | 'temperature' | 'medication' | 'symptom' | 'mood';
  tempC?: number;
  medName?: string;
  dose?: string;
  symptom?: string;
  mood?: 'calm' | 'content' | 'alert' | 'sleepy' | 'unsettled' | 'fussy';
  note?: string;
  title?: string;
  body?: string;
}

export interface ParseLogResult {
  entries?: ParsedLogEntry[];
  error?: string;
  /** True when the server has no ANTHROPIC_API_KEY configured. */
  notConfigured?: boolean;
}

/**
 * Send a free-text/spoken note to the server and get back structured log
 * proposals. The caller shows them for confirmation — this never writes.
 */
export async function parseLog(text: string): Promise<ParseLogResult> {
  const trimmed = text.trim();
  if (!trimmed) return { entries: [] };
  try {
    const res = await fetch('/api/leo/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'parse-log', context: trimmed }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      entries?: ParsedLogEntry[];
      error?: string;
    };
    if (res.status === 503) {
      return { notConfigured: true, error: data.error };
    }
    if (!res.ok) {
      return { error: data.error || 'Couldn’t understand that. Try again.' };
    }
    return { entries: data.entries ?? [] };
  } catch {
    return { error: 'Couldn’t reach Leo. Check your connection.' };
  }
}

// --- Conversational chat ----------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  text?: string;
  error?: string;
  notConfigured?: boolean;
}

/**
 * A compact snapshot the chat assistant reasons over: age, today + the week,
 * what settles Leo, and a health summary. Pure — no photos, capped in size.
 */
export function chatContext(sources: AiSources): string {
  const today = summariseDay({
    feeds: sources.feeds,
    diapers: sources.diapers,
    sleeps: sources.sleeps,
    events: sources.events,
    now: sources.now,
    name: sources.profile?.name,
  });
  const methods = methodStats(sources.routineSessions, { minTried: 2 })
    .slice(0, 5)
    .map(
      (s) =>
        `- ${s.method}: ${Math.round(s.successRate * 100)}% (${s.wins}/${s.tried})`,
    )
    .join('\n');
  const health = doctorSummary({
    events: sources.events,
    feeds: sources.feeds,
    diapers: sources.diapers,
    sleeps: sources.sleeps,
    now: sources.now,
    days: 7,
    name: sources.profile?.name,
  });
  const parts = [
    ageLine(sources),
    `Today so far: ${today.narrative}`,
    `The last 7 days, one line each:\n${weekLines(sources, 7)}`,
    methods ? `Settling methods that have worked:\n${methods}` : '',
    `Health snapshot (last 7 days):\n${health}`,
    sources.profile?.allergies
      ? `Known allergies/notes: ${sources.profile.allergies}`
      : '',
  ];
  return clamp(parts.filter(Boolean).join('\n\n'));
}

/** Send the conversation + snapshot and get Leo's reply. */
export async function chatWithLeo(
  messages: ChatMessage[],
  context: string,
  patwah?: 'light' | 'medium' | 'heavy',
): Promise<ChatResult> {
  try {
    const res = await fetch('/api/leo/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'chat', context, messages, patwah }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      text?: string;
      error?: string;
      detail?: string;
    };
    if (res.status === 503) return { notConfigured: true, error: data.error };
    if (!res.ok) {
      return {
        error: data.detail
          ? `${data.error} (${data.detail})`
          : data.error || 'Leo had trouble replying. Please try again.',
      };
    }
    return { text: data.text };
  } catch {
    return { error: 'Couldn’t reach Leo. Check your connection.' };
  }
}

// --- Notification-timing advice --------------------------------------------

export interface ReminderAdviceResult {
  advice?: ReminderAdvice;
  error?: string;
  notConfigured?: boolean;
}

/** Ask the server for suggested reminder timings from a cadence snapshot. */
export async function getReminderAdvice(
  context: string,
): Promise<ReminderAdviceResult> {
  try {
    const res = await fetch('/api/leo/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'reminder-advice', context }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      advice?: ReminderAdvice;
      error?: string;
    };
    if (res.status === 503) return { notConfigured: true, error: data.error };
    if (!res.ok) {
      return { error: data.error || 'Couldn’t get a suggestion right now.' };
    }
    return { advice: data.advice };
  } catch {
    return { error: 'Couldn’t reach Leo. Check your connection.' };
  }
}
