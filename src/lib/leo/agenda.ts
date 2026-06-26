/**
 * The in-app "Coming up" agenda — PURE logic (unit tested).
 *
 * This is the calm, always-on surface: it lists what's due soon across feeds,
 * medical events, Vitamin D, a long-running nap and recurring care tasks. It is
 * deliberately independent of push delivery — showing something here never
 * means a notification fires. (Push is handled separately by computeReminders.)
 */
import type { CareTask, FeedEntry, MedicalEntry, SleepEntry } from './types';
import type { ReminderPrefs } from './reminders';
import { careEmoji, carePreset, nextCareDue } from './care-tasks';

const HOUR = 3_600_000;
const DAY = 86_400_000;
/** How far ahead the agenda looks (plus anything already overdue). */
export const AGENDA_WINDOW_MS = 36 * HOUR;

export interface AgendaItem {
  key: string;
  dueAt: number;
  overdue: boolean;
  title: string;
  subtitle?: string;
  emoji: string;
  href?: string;
  source: 'reminder' | 'care';
  careTaskId?: string;
}

export interface AgendaInputs {
  prefs: ReminderPrefs;
  feeds: FeedEntry[];
  medical: MedicalEntry[];
  activeSleep: SleepEntry | null;
  careTasks: CareTask[];
  now: number;
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function nextDailyTime(timeHHMM: string, now: number): number {
  const [h, m] = timeHHMM.split(':').map((n) => parseInt(n, 10));
  const d = new Date(now);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

const MEDICAL_EMOJI: Record<string, string> = {
  vaccination: '💉',
  medication: '💊',
  appointment: '🗓️',
  note: '📋',
};

/**
 * Build the sorted agenda. Includes anything overdue or due within
 * `AGENDA_WINDOW_MS`. Per-category prefs toggles hide a kind entirely; care
 * tasks appear when enabled. The caller decides how many to show.
 */
export function buildAgenda(input: AgendaInputs): AgendaItem[] {
  const { prefs, feeds, medical, activeSleep, careTasks, now } = input;
  const horizon = now + AGENDA_WINDOW_MS;
  const items: AgendaItem[] = [];

  // --- Feed: due N hours after the last feed ------------------------------
  if (prefs.feed && feeds.length) {
    const last = feeds.reduce((a, b) => (b.startedAt > a.startedAt ? b : a));
    const from = last.endedAt ?? last.startedAt;
    const dueAt = from + prefs.feedHours * HOUR;
    if (dueAt <= horizon) {
      items.push({
        key: 'feed',
        dueAt,
        overdue: dueAt <= now,
        title: 'Feed due',
        subtitle: `Last feed was about ${prefs.feedHours} ${
          prefs.feedHours === 1 ? 'hour' : 'hours'
        } ago`,
        emoji: '🍼',
        href: '/leo',
        source: 'reminder',
      });
    }
  }

  // --- Daily Vitamin D (unless already given today) -----------------------
  if (prefs.vitd) {
    const givenToday = medical.some(
      (m) =>
        m.kind === 'medication' &&
        m.title === 'Vitamin D' &&
        startOfDay(m.at) === startOfDay(now),
    );
    if (!givenToday) {
      const dueAt = nextDailyTime(prefs.vitdTime, now);
      if (dueAt <= horizon) {
        items.push({
          key: 'vitd',
          dueAt,
          overdue: dueAt <= now,
          title: 'Vitamin D',
          subtitle: "Leo's daily drops",
          emoji: '💧',
          href: '/leo/health',
          source: 'reminder',
        });
      }
    }
  }

  // --- Long-running nap ---------------------------------------------------
  if (prefs.sleep && activeSleep && activeSleep.endedAt == null) {
    const dueAt = activeSleep.startedAt + prefs.sleepMaxHours * HOUR;
    if (dueAt <= horizon) {
      items.push({
        key: 'sleep',
        dueAt,
        overdue: dueAt <= now,
        title: 'Still napping?',
        subtitle: `Sleep timer past ${prefs.sleepMaxHours}h`,
        emoji: '🌙',
        href: '/leo',
        source: 'reminder',
      });
    }
  }

  // --- Medical: upcoming/overdue appointments, jabs, meds -----------------
  if (prefs.medical) {
    for (const m of medical) {
      if (m.done) continue;
      if (m.at > horizon) continue;
      const noun =
        m.kind === 'vaccination'
          ? 'Vaccination'
          : m.kind === 'medication'
            ? 'Medication'
            : m.kind === 'note'
              ? 'Note'
              : 'Appointment';
      items.push({
        key: `med-${m.id}`,
        dueAt: m.at,
        overdue: m.at <= now,
        title: m.title || noun,
        subtitle: m.category ?? m.location ?? noun,
        emoji: MEDICAL_EMOJI[m.kind] ?? '🗓️',
        href: '/leo/health',
        source: 'reminder',
      });
    }
  }

  // --- Care tasks ---------------------------------------------------------
  for (const task of careTasks) {
    if (!task.enabled) continue;
    const dueAt = nextCareDue(task, now);
    if (dueAt > horizon) continue;
    items.push({
      key: `care-${task.id}`,
      dueAt,
      overdue: dueAt <= now,
      title: task.label,
      emoji: careEmoji(task.kind),
      href: carePreset(task.kind)?.href,
      source: 'care',
      careTaskId: task.id,
    });
  }

  return items.sort((a, b) => a.dueAt - b.dueAt);
}

/** Short, friendly relative-due label, e.g. "overdue" / "in 2h" / "tomorrow". */
export function relativeDue(dueAt: number, now: number): string {
  if (dueAt <= now) return 'overdue';
  const mins = Math.round((dueAt - now) / 60_000);
  if (mins < 60) return `in ${mins} min`;
  const today = startOfDay(now);
  const dueDay = startOfDay(dueAt);
  const dayDiff = Math.round((dueDay - today) / DAY);
  const clock = new Date(dueAt)
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
  if (dayDiff === 0) {
    const hrs = Math.round(mins / 60);
    return hrs <= 6 ? `in ${hrs}h` : `today ${clock}`;
  }
  if (dayDiff === 1) return `tomorrow ${clock}`;
  if (dayDiff < 7) {
    const weekday = new Date(dueAt).toLocaleDateString('en-GB', {
      weekday: 'short',
    });
    return `${weekday} ${clock}`;
  }
  return new Date(dueAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
