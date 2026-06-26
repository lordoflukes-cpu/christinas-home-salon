/**
 * Reminder scheduling — PURE logic (unit tested).
 *
 * Given the current data + the family's preferences, produce the set of
 * notifications that should fire in the future. A tiny scheduler on Supabase
 * delivers them as Web Push so they arrive even when the app is closed.
 *
 * Each reminder has a stable `key` so it can be upserted/replaced rather than
 * duplicated, and a `fireAt` epoch-ms timestamp.
 */
import type { FeedEntry, MedicalEntry, SleepEntry } from './types';

export interface ReminderPrefs {
  /** Master switch — when false, no reminders are scheduled. */
  enabled: boolean;
  feed: boolean;
  /** Hours after the last feed to nudge. */
  feedHours: number;
  medical: boolean;
  /** Minutes before an appointment/jab to remind. */
  leadMinutes: number;
  vitd: boolean;
  /** Daily Vitamin-D time, 'HH:MM' (local). */
  vitdTime: string;
  sleep: boolean;
  /** Nudge if a sleep timer has run longer than this many hours. */
  sleepMaxHours: number;
  /** Hold non-urgent nudges (feed/Vitamin D/nap) during an overnight window. */
  quiet: boolean;
  /** Quiet window start, 'HH:MM' (local). */
  quietStart: string;
  /** Quiet window end, 'HH:MM' (local). May wrap past midnight. */
  quietEnd: string;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  enabled: false,
  feed: true,
  feedHours: 3,
  medical: true,
  leadMinutes: 120,
  vitd: true,
  vitdTime: '09:00',
  sleep: true,
  sleepMaxHours: 3,
  quiet: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

export interface ScheduledReminder {
  key: string;
  fireAt: number;
  title: string;
  body: string;
}

export interface ReminderInputs {
  prefs: ReminderPrefs;
  feeds: FeedEntry[];
  medical: MedicalEntry[];
  activeSleep: SleepEntry | null;
  now: number;
}

const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Next epoch-ms at local `HH:MM` that is strictly after `now`. */
export function nextDailyTime(timeHHMM: string, now: number): number {
  const [h, m] = timeHHMM.split(':').map((n) => parseInt(n, 10));
  const d = new Date(now);
  d.setHours(h || 0, m || 0, 0, 0);
  let t = d.getTime();
  if (t <= now) t += DAY;
  return t;
}

/** Minutes-past-midnight (local) for an 'HH:MM' string. */
function hhmmToMinutes(timeHHMM: string): number {
  const [h, m] = timeHHMM.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

/**
 * Is the local time of `ms` inside the quiet window [start, end)?
 * Handles windows that wrap past midnight (e.g. 22:00 → 07:00). An empty or
 * zero-length window (start === end) is never quiet.
 */
export function inQuietHours(
  ms: number,
  startHHMM: string,
  endHHMM: string,
): boolean {
  const start = hhmmToMinutes(startHHMM);
  const end = hhmmToMinutes(endHHMM);
  if (start === end) return false;
  const d = new Date(ms);
  const t = d.getHours() * 60 + d.getMinutes();
  return start < end
    ? t >= start && t < end // same-day window
    : t >= start || t < end; // wraps past midnight
}

/** The future reminders that should currently be scheduled. */
export function computeReminders(input: ReminderInputs): ScheduledReminder[] {
  const { prefs, feeds, medical, activeSleep, now } = input;
  if (!prefs.enabled) return [];
  const out: ScheduledReminder[] = [];

  // --- Feed reminder: N hours after the last feed -------------------------
  if (prefs.feed && feeds.length) {
    const last = feeds.reduce((a, b) => (b.startedAt > a.startedAt ? b : a));
    const from = last.endedAt ?? last.startedAt;
    out.push({
      key: 'feed',
      fireAt: from + prefs.feedHours * HOUR,
      title: 'Time for a feed? 🍼',
      body: `Leo's last feed was about ${prefs.feedHours} ${
        prefs.feedHours === 1 ? 'hour' : 'hours'
      } ago.`,
    });
  }

  // --- Medical: lead time before appointments & jabs ----------------------
  if (prefs.medical) {
    for (const m of medical) {
      if (m.done) continue;
      const fireAt = m.at - prefs.leadMinutes * 60_000;
      const noun =
        m.kind === 'vaccination'
          ? 'Vaccination'
          : m.kind === 'medication'
            ? 'Medication'
            : 'Appointment';
      out.push({
        key: `med-${m.id}`,
        fireAt,
        title: `${noun} reminder 🗓️`,
        body: m.title,
      });
    }
  }

  // --- Daily Vitamin D ----------------------------------------------------
  if (prefs.vitd) {
    out.push({
      key: 'vitd',
      fireAt: nextDailyTime(prefs.vitdTime, now),
      title: 'Vitamin D for Leo 💧',
      body: "Time for Leo's daily Vitamin D drops.",
    });
  }

  // --- Sleep nudge: a long running sleep timer ----------------------------
  if (prefs.sleep && activeSleep && activeSleep.endedAt == null) {
    out.push({
      key: 'sleep',
      fireAt: activeSleep.startedAt + prefs.sleepMaxHours * HOUR,
      title: 'Still napping? 🌙',
      body: `Leo's sleep timer has been running over ${prefs.sleepMaxHours} hours.`,
    });
  }

  // Only schedule reminders that are still in the future; once one has fired
  // (and the scheduler deletes it) its time is in the past, so it is not
  // recreated — which prevents duplicate sends.
  const future = out.filter((r) => r.fireAt > now);

  // Quiet hours: hold back non-urgent nudges (feed/Vitamin D/nap) that would
  // land overnight. Appointment & jab reminders (med-*) are time-critical and
  // always come through.
  if (!prefs.quiet) return future;
  return future.filter((r) => {
    if (r.key.startsWith('med-')) return true;
    return !inQuietHours(r.fireAt, prefs.quietStart, prefs.quietEnd);
  });
}
