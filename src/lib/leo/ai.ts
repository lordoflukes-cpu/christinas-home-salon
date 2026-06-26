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
  SizeEntry,
  SleepEntry,
  VoiceEntry,
} from './types';
import { formatAge } from './age';
import { summariseDay } from './summary';
import { doctorSummary } from './doctor-summary';
import { promptOfTheDay } from './journal-prompts';
import { buildTimeline, lifeAnchors, type TimelineSources } from './timeline';

const DAY = 86_400_000;

/** The AI tasks offered as action cards on the Ask Leo screen. */
export type AiTaskKey =
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
): Promise<AskLeoResult> {
  try {
    const res = await fetch('/api/leo/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, context, question }),
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
