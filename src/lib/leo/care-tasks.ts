/**
 * Care tasks — recurring household nudges (in-app agenda only, never pushed).
 *
 * Pure scheduling logic so the agenda stays declarative and easy to test.
 * A care task recurs on a cadence; ticking it "done" sets `lastDoneAt`, which
 * advances the next occurrence.
 */
import type { CareCadence, CareTask, CareTaskKind, NewCareTask } from './types';

const DAY = 86_400_000;

export interface CareTaskPreset {
  kind: CareTaskKind;
  label: string;
  emoji: string;
  cadence: CareCadence;
  intervalDays?: number;
  weekday?: number; // 0 = Sunday … 6 = Saturday
  timeHHMM?: string;
  /** Where ticking/visiting this task should take you, if anywhere. */
  href?: string;
  /** Short helper line shown under the toggle in Settings. */
  hint: string;
}

/** The built-in care tasks offered in Settings (all start disabled). */
export const CARE_TASK_PRESETS: CareTaskPreset[] = [
  {
    kind: 'nappies',
    label: 'Order nappies',
    emoji: '📦',
    cadence: 'everyN',
    intervalDays: 14,
    hint: 'A gentle stock-up nudge every couple of weeks.',
  },
  {
    kind: 'sterilise',
    label: 'Sterilise bottles',
    emoji: '🫧',
    cadence: 'daily',
    timeHHMM: '20:00',
    hint: 'A daily evening reminder to run the steriliser.',
  },
  {
    kind: 'weeklyPhoto',
    label: 'Take weekly photo',
    emoji: '📸',
    cadence: 'weekly',
    weekday: 0,
    timeHHMM: '10:00',
    href: '/leo/memories',
    hint: 'One photo a week — watch him grow.',
  },
  {
    kind: 'dailyMemory',
    label: 'Add a memory',
    emoji: '📝',
    cadence: 'daily',
    timeHHMM: '20:00',
    href: '/leo/memories',
    hint: 'A line about today, while it’s fresh.',
  },
  {
    kind: 'binDay',
    label: 'Bin day',
    emoji: '🗑️',
    cadence: 'weekly',
    weekday: 2,
    timeHHMM: '07:00',
    hint: 'For when the nappy bin is filling up.',
  },
  {
    kind: 'bathNight',
    label: 'Bath night',
    emoji: '🛁',
    cadence: 'weekly',
    weekday: 0,
    timeHHMM: '18:00',
    hint: 'A cosy wind-down a couple of evenings a week.',
  },
];

export function carePreset(kind: CareTaskKind): CareTaskPreset | null {
  return CARE_TASK_PRESETS.find((p) => p.kind === kind) ?? null;
}

/** Emoji for any care task (falls back to a bell for custom tasks). */
export function careEmoji(kind: CareTaskKind): string {
  return carePreset(kind)?.emoji ?? '🔔';
}

/** Build a fresh (disabled) care task from a preset, anchored at `now`. */
export function presetToCareTask(
  preset: CareTaskPreset,
  now: number,
): NewCareTask {
  return {
    kind: preset.kind,
    label: preset.label,
    cadence: preset.cadence,
    intervalDays: preset.intervalDays,
    weekday: preset.weekday,
    timeHHMM: preset.timeHHMM,
    enabled: false,
    anchorAt: now,
  };
}

// ---------------------------------------------------------------------------
// Scheduling (pure)
// ---------------------------------------------------------------------------

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Set a local `HH:MM` (default 09:00) on the calendar day of `dayMs`. */
function atTimeOnDay(dayMs: number, hhmm: string | undefined): number {
  const [h, m] = (hhmm ?? '09:00').split(':').map((n) => parseInt(n, 10));
  const d = new Date(dayMs);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

/**
 * The next time a care task is due (epoch ms). May be in the past when the
 * task is overdue (due but not yet ticked).
 */
export function nextCareDue(task: CareTask, now: number): number {
  const time = task.timeHHMM;

  if (task.cadence === 'everyN') {
    const interval =
      (task.intervalDays && task.intervalDays > 0 ? task.intervalDays : 1) *
      DAY;
    const base = task.lastDoneAt ?? task.anchorAt;
    const due = base + interval;
    return time ? atTimeOnDay(due, time) : due;
  }

  // For daily / weekly, the schedule fires strictly after the last completion
  // (or, if never done, on/after the anchor day).
  const after = task.lastDoneAt ?? task.anchorAt - 1;

  if (task.cadence === 'weekly') {
    const wd = task.weekday ?? 1;
    const fromDay = startOfDay(after);
    for (let i = 0; i < 8; i++) {
      const cand = atTimeOnDay(fromDay + i * DAY, time);
      if (new Date(cand).getDay() === wd && cand > after) return cand;
    }
    return atTimeOnDay(fromDay + 7 * DAY, time);
  }

  // daily
  let cand = atTimeOnDay(after, time);
  if (cand <= after) cand = atTimeOnDay(after + DAY, time);
  return cand;
}

export type CareDueState = 'overdue' | 'today' | 'soon' | 'later';

const SOON_WINDOW = 36 * 3_600_000;

/** Bucket a care task's next-due time relative to `now`. */
export function careDueState(task: CareTask, now: number): CareDueState {
  const due = nextCareDue(task, now);
  if (due <= now) return 'overdue';
  const endOfToday = startOfDay(now) + DAY;
  if (due < endOfToday) return 'today';
  if (due <= now + SOON_WINDOW) return 'soon';
  return 'later';
}
