/**
 * "Doctor summary" — turns recent logs into a calm, factual paragraph the
 * owner can read out (or hand over) at an appointment. Pure + unit tested.
 *
 * Example output:
 *   Summary for Leo over the last 7 days (to Mon 29 Jun).
 *   Symptoms: jittery hand movements noted 4× since Mon 22 Jun.
 *   Temperature: no fever (highest 37.2°C).
 *   Feeding: about 7 feeds/day.
 *   Nappies: about 5 wet/day, 3 dirty over 7 days; no colour change noted.
 *   Medication: Calpol (2×).
 */
import type { DiaperEntry, FeedEntry, LeoEvent, SleepEntry } from './types';

export interface DoctorSummaryInput {
  events: LeoEvent[];
  feeds: FeedEntry[];
  diapers: DiaperEntry[];
  sleeps: SleepEntry[];
  now: number;
  days?: number;
  name?: string;
}

const DAY = 86_400_000;

/** "Mon 22 Jun" */
export function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const times = (n: number) => `${n}×`;

export function doctorSummary(input: DoctorSummaryInput): string {
  const { events, feeds, diapers, sleeps, now } = input;
  const days = input.days ?? 7;
  const name = input.name?.trim() || 'Leo';
  const since = now - days * DAY;

  const inWin = <
    T extends { at?: number; startedAt?: number; changedAt?: number },
  >(
    list: T[],
    key: keyof T,
  ) => list.filter((e) => (e[key] as unknown as number) >= since);

  const lines: string[] = [
    `Summary for ${name} over the last ${days} days (to ${shortDate(now)}).`,
  ];

  // --- Symptoms -----------------------------------------------------------
  const symptoms = events.filter((e) => e.kind === 'symptom' && e.at >= since);
  if (symptoms.length) {
    const byType = new Map<string, { count: number; first: number }>();
    for (const s of symptoms) {
      const key = (s.symptom || 'symptom').toLowerCase();
      const cur = byType.get(key) ?? { count: 0, first: s.at };
      cur.count++;
      cur.first = Math.min(cur.first, s.at);
      byType.set(key, cur);
    }
    const parts = Array.from(byType.entries()).map(
      ([sym, { count, first }]) =>
        `${sym} noted ${times(count)} since ${shortDate(first)}`,
    );
    lines.push(`Symptoms: ${parts.join('; ')}.`);
  } else {
    lines.push('Symptoms: none logged.');
  }

  // --- Temperature / fever ------------------------------------------------
  const temps = events
    .filter((e) => e.kind === 'temperature' && e.at >= since && e.tempC != null)
    .map((e) => e.tempC as number);
  if (temps.length) {
    const max = Math.max(...temps);
    lines.push(
      max >= 38
        ? `Temperature: fever recorded, up to ${max}°C.`
        : `Temperature: no fever (highest ${max}°C).`,
    );
  } else {
    lines.push('Temperature: not taken.');
  }

  // --- Feeding ------------------------------------------------------------
  const feedCount = inWin(feeds, 'startedAt').length;
  lines.push(
    feedCount
      ? `Feeding: about ${Math.round(feedCount / days)} feeds/day.`
      : 'Feeding: none logged.',
  );

  // --- Nappies ------------------------------------------------------------
  const naps = inWin(diapers, 'changedAt');
  const wet = naps.filter((d) => d.type === 'wet' || d.type === 'both').length;
  const dirty = naps.filter(
    (d) => d.type === 'dirty' || d.type === 'both',
  ).length;
  const colours = Array.from(
    new Set(naps.map((d) => d.color).filter(Boolean) as string[]),
  );
  const unusual = colours.filter(
    (c) => !['yellow', 'brown', 'mustard'].includes(c.toLowerCase()),
  );
  if (naps.length) {
    const colourNote = unusual.length
      ? `colours noted: ${unusual.join(', ').toLowerCase()}`
      : 'no colour change noted';
    lines.push(
      `Nappies: about ${Math.round(wet / days)} wet/day, ${dirty} dirty over ${days} days; ${colourNote}.`,
    );
  } else {
    lines.push('Nappies: none logged.');
  }

  // --- Sleep --------------------------------------------------------------
  const sleepMs = sleeps
    .filter((s) => (s.endedAt ?? now) >= since)
    .reduce((sum, s) => {
      const start = Math.max(s.startedAt, since);
      const end = s.endedAt ?? now;
      return sum + Math.max(0, end - start);
    }, 0);
  if (sleepMs > 0) {
    const perDay = sleepMs / days / 3_600_000;
    lines.push(`Sleep: about ${perDay.toFixed(1)}h/day.`);
  }

  // --- Medication ---------------------------------------------------------
  const meds = events.filter((e) => e.kind === 'medication' && e.at >= since);
  if (meds.length) {
    const byName = new Map<string, number>();
    for (const m of meds) {
      const key = m.medName || 'medication';
      byName.set(key, (byName.get(key) ?? 0) + 1);
    }
    const parts = Array.from(byName.entries()).map(
      ([n, c]) => `${cap(n)} (${times(c)})`,
    );
    lines.push(`Medication: ${parts.join(', ')}.`);
  } else {
    lines.push('Medication: none given.');
  }

  return lines.join('\n');
}
