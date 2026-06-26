/**
 * AI notification-timing advice — the shared prompt + JSON validator (used by
 * the AI route) and a PURE `cadenceSnapshot` that turns Leo's age/weight/feed
 * type and recent feed & sleep rhythm into the text the model reasons from.
 *
 * The model only ever SUGGESTS reminder settings; the parent applies them with
 * a tap. Nothing here writes anything. Kept free of React/IndexedDB so it can
 * be unit tested and imported on the server.
 */
import { z } from 'zod';
import type { BabyProfile, FeedEntry, GrowthEntry, SleepEntry } from './types';
import { formatAge, ageInMonthsCalendar, formatElapsed } from './age';
import { formatWeight } from './units';
import { dailySeries } from './everyday-trends';

const HOUR = 3_600_000;
const DAY = 86_400_000;

export const REMINDER_ADVICE_SYSTEM = `You suggest gentle baby reminder timings for an app, from the snapshot of a real baby's age, weight, feeding type and recent rhythm provided by the parent.

Return ONLY a JSON object (no prose, no markdown) of the form:
{"feedHours": 3, "sleepMaxHours": 2, "wakeWindowMinutes": 75, "bedtime": "19:00", "vitdTime": "09:00", "quietStart": "22:00", "quietEnd": "07:00", "rationale": "one short, warm sentence"}

Guidance:
- "feedHours": base on the baby's typical gap between feeds and age (newborns feed often, ~2–3h; older babies stretch longer).
- "sleepMaxHours": when a long-nap nudge should fire (a little above their usual nap).
- "wakeWindowMinutes": how long the baby can comfortably stay awake between sleeps before getting overtired — strongly age-dependent (newborns ~45–60 min; ~3 months ~75–90 min; ~6 months ~2–3 hours). Lean on the observed awake stretch when given.
- "bedtime": a sensible time (HH:MM) to start the bedtime routine for this age (younger babies often settle earlier).
- "vitdTime": a sensible daily time (UK babies are usually given daily vitamin D).
- Quiet hours cover their longest night stretch.
Omit any field you can't sensibly suggest. NEVER give medical advice or mention amounts/doses — these are only reminder timings. Keep "rationale" to one friendly sentence referencing what you saw (e.g. "Leo's feeds are about 3 hours apart and he manages around 75 minutes awake at the moment").`;

const adviceSchema = z.object({
  // Bounds are enforced by clampAdvice so an over-eager number is corrected
  // rather than discarding the whole suggestion.
  feedHours: z.number().positive().optional(),
  sleepMaxHours: z.number().positive().optional(),
  wakeWindowMinutes: z.number().positive().optional(),
  bedtime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  vitdTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  quietStart: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  quietEnd: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  rationale: z.string().min(1).max(300),
});

export type ReminderAdvice = z.infer<typeof adviceSchema>;

/** Round feed/sleep hours to whole numbers and keep values in panel ranges. */
function clampAdvice(a: ReminderAdvice): ReminderAdvice {
  return {
    ...a,
    feedHours:
      a.feedHours != null
        ? Math.min(12, Math.max(1, Math.round(a.feedHours)))
        : undefined,
    sleepMaxHours:
      a.sleepMaxHours != null
        ? Math.min(12, Math.max(1, Math.round(a.sleepMaxHours)))
        : undefined,
    wakeWindowMinutes:
      a.wakeWindowMinutes != null
        ? Math.min(240, Math.max(20, Math.round(a.wakeWindowMinutes)))
        : undefined,
  };
}

/** Strip ```json fences, parse + validate the advice JSON, or null. */
export function parseAdvice(text: string): ReminderAdvice | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    const res = adviceSchema.safeParse(JSON.parse(cleaned));
    return res.success ? clampAdvice(res.data) : null;
  } catch {
    return null;
  }
}

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface CadenceInput {
  profile: BabyProfile | null;
  feeds: FeedEntry[];
  sleeps: SleepEntry[];
  growth: GrowthEntry[];
  now: number;
}

/**
 * A compact, human-readable snapshot of Leo's age/weight/feeding & sleep
 * rhythm over the last 7 days — the context the advice model reads. Pure.
 */
export function cadenceSnapshot(input: CadenceInput): string {
  const { profile, feeds, sleeps, growth, now } = input;
  const since = now - 7 * DAY;
  const lines: string[] = [];

  if (profile) {
    lines.push(
      `Age: ${formatAge(profile.birth, now)} (${ageInMonthsCalendar(profile.birth, now)} months).`,
    );
  }

  const latestGrowth = growth
    .filter((g) => g.weightGrams != null)
    .sort((a, b) => b.measuredAt - a.measuredAt)[0];
  if (latestGrowth?.weightGrams != null) {
    lines.push(`Latest weight: ${formatWeight(latestGrowth.weightGrams)}.`);
  }

  const recentFeeds = feeds
    .filter((f) => f.startedAt >= since)
    .sort((a, b) => a.startedAt - b.startedAt);
  if (recentFeeds.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < recentFeeds.length; i++) {
      const gap = recentFeeds[i].startedAt - recentFeeds[i - 1].startedAt;
      // Ignore overnight gaps so the figure reflects daytime feed spacing.
      if (gap > 0 && gap <= 8 * HOUR) gaps.push(gap);
    }
    const med = median(gaps);
    if (med != null) {
      lines.push(`Typical gap between feeds: about ${formatElapsed(med)}.`);
    }
  }
  const breast = recentFeeds.filter((f) => f.type === 'breast').length;
  const bottle = recentFeeds.filter((f) => f.type === 'bottle').length;
  if (breast || bottle) {
    const split =
      breast && bottle
        ? `mixed (${breast} breast, ${bottle} bottle)`
        : breast
          ? 'breast'
          : 'bottle';
    lines.push(
      `Feeding (last 7 days): ${split}, ${recentFeeds.length} feeds total.`,
    );
  }

  // Average night vs day sleep per day (reuses the everyday-trends split).
  const series = dailySeries({ feeds: [], diapers: [], sleeps }, 7, now);
  const withSleep = series.filter((d) => d.sleepMs > 0);
  if (withSleep.length) {
    const avgNight =
      withSleep.reduce((s, d) => s + (d.nightSleepMs ?? 0), 0) /
      withSleep.length;
    const avgDay =
      withSleep.reduce((s, d) => s + (d.daySleepMs ?? 0), 0) / withSleep.length;
    lines.push(
      `Sleep per day (last 7 days): about ${formatElapsed(avgNight)} at night and ${formatElapsed(avgDay)} in day naps.`,
    );
  }

  // Typical wake window: gap between a sleep ending and the next starting.
  const sortedSleeps = sleeps
    .filter((s) => s.endedAt != null && s.startedAt >= since)
    .sort((a, b) => a.startedAt - b.startedAt);
  const wakes: number[] = [];
  for (let i = 1; i < sortedSleeps.length; i++) {
    const gap = sortedSleeps[i].startedAt - (sortedSleeps[i - 1].endedAt ?? 0);
    if (gap > 0 && gap <= 5 * HOUR) wakes.push(gap);
  }
  const wakeMed = median(wakes);
  if (wakeMed != null) {
    lines.push(
      `Typical awake stretch between sleeps: about ${formatElapsed(wakeMed)}.`,
    );
  }

  if (lines.length === 0) {
    return 'Not much has been logged yet — suggest gentle, age-appropriate defaults for a young baby.';
  }
  return lines.join('\n');
}
