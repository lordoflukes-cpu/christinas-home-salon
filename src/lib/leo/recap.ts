/**
 * Monthly recap — PURE derivation logic (unit tested).
 *
 * Builds a keepsake summary for each month of Leo's life by pulling from the
 * data already logged (growth, milestones, journal, photos), which the owner
 * can then edit/override. Month 1 = the first month after birth.
 */
import type {
  GrowthEntry,
  JournalEntry,
  MilestoneEntry,
  MonthlyRecap,
  PhotoEntry,
} from './types';
import { formatWeight } from './units';

export interface RecapField {
  key:
    | 'weight'
    | 'favouriteThing'
    | 'newSkill'
    | 'funniest'
    | 'hardest'
    | 'messageFromDad'
    | 'messageFromMum'
    | 'placesVisited'
    | 'peopleMet'
    | 'neverForget';
  label: string;
  emoji: string;
}

/** The recap layout, in book order. */
export const RECAP_FIELDS: RecapField[] = [
  { key: 'weight', label: 'Weight', emoji: '⚖️' },
  { key: 'favouriteThing', label: 'Favourite thing', emoji: '💛' },
  { key: 'newSkill', label: 'New skill', emoji: '✨' },
  { key: 'funniest', label: 'Funniest moment', emoji: '😂' },
  { key: 'hardest', label: 'Hardest moment', emoji: '🌧️' },
  { key: 'messageFromDad', label: 'Message from Dad', emoji: '💬' },
  { key: 'messageFromMum', label: 'Message from Mum', emoji: '💗' },
  { key: 'placesVisited', label: 'Places visited', emoji: '🗺️' },
  { key: 'peopleMet', label: 'People met', emoji: '🤝' },
  { key: 'neverForget', label: 'Never want to forget', emoji: '🌟' },
];

/** Values the recap can auto-derive from logged data (before owner overrides). */
export interface AutoRecap {
  weight?: string;
  newSkill?: string;
  funniest?: string;
  hardest?: string;
  messageFromDad?: string;
  messageFromMum?: string;
  placesVisited?: string;
  peopleMet?: string;
  bestPhotoId?: string;
}

export interface MonthWindow {
  monthIndex: number;
  start: number;
  end: number;
}

function addMonths(ms: number, n: number): number {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

/** [start, end) for a 1-based month of life. */
export function monthWindow(birth: number, monthIndex: number): MonthWindow {
  return {
    monthIndex,
    start: addMonths(birth, monthIndex - 1),
    end: addMonths(birth, monthIndex),
  };
}

/** Month numbers from 1 up to (and including) the month `now` falls in. */
export function listMonths(birth: number, now: number): number[] {
  let count = 1;
  // Grow until the window's start passes `now`.
  while (addMonths(birth, count) <= now) count++;
  const months: number[] = [];
  for (let i = count; i >= 1; i--) months.push(i); // newest first
  return months;
}

function uniqueJoin(values: (string | undefined)[]): string | undefined {
  const seen = new Set<string>();
  for (const v of values) {
    const t = v?.trim();
    if (t) seen.add(t);
  }
  return seen.size ? Array.from(seen).join(', ') : undefined;
}

const isDad = (a?: string) => !!a && /dad|daddy|papa|father/i.test(a);
const isMum = (a?: string) => !!a && /mum|mummy|mum|mama|mother|mom/i.test(a);

export interface RecapSources {
  birth: number;
  growth: GrowthEntry[];
  milestones: MilestoneEntry[];
  journal: JournalEntry[];
  photos: PhotoEntry[];
}

/** Derive the auto-filled values for a month from logged data. */
export function deriveRecap(
  monthIndex: number,
  sources: RecapSources,
): AutoRecap {
  const { birth, growth, milestones, journal, photos } = sources;
  const { start, end } = monthWindow(birth, monthIndex);
  const inWindow = (ts: number) => ts >= start && ts < end;

  // Weight: the most recent measurement on or before the month's end.
  const weighed = growth
    .filter((g) => g.weightGrams != null && g.measuredAt < end)
    .sort((a, b) => b.measuredAt - a.measuredAt);
  const weight = weighed.length
    ? formatWeight(weighed[0].weightGrams as number)
    : undefined;

  const monthMilestones = milestones
    .filter((m) => inWindow(m.achievedAt))
    .sort((a, b) => b.achievedAt - a.achievedAt);

  // New skill: milestones in skill-y categories (fall back to any milestone).
  const skillCats = new Set(['physical', 'sounds', 'social', 'big']);
  const skills = monthMilestones.filter(
    (m) => !m.category || skillCats.has(m.category),
  );
  const newSkill = uniqueJoin(
    (skills.length ? skills : monthMilestones).slice(0, 3).map((m) => m.title),
  );

  const monthJournal = journal
    .filter((j) => inWindow(j.writtenAt))
    .sort((a, b) => b.writtenAt - a.writtenAt);

  const funniest =
    monthJournal.find((j) => j.category === 'funny')?.body ??
    monthMilestones.find((m) => m.emotion === 'funny')?.title;

  const hardest =
    monthJournal.find((j) => j.category === 'hard')?.body ??
    monthMilestones.find(
      (m) => m.emotion === 'scary' || m.emotion === 'chaotic',
    )?.title;

  const messages = monthJournal.filter((j) => j.category === 'message');
  const messageFromDad = messages.find((j) => isDad(j.author))?.body;
  const messageFromMum = messages.find((j) => isMum(j.author))?.body;

  const placesVisited = uniqueJoin(monthMilestones.map((m) => m.location));
  const peopleMet = uniqueJoin(monthMilestones.map((m) => m.whoThere));

  // Best photo: a favourite taken this month, else the latest photo this month.
  const monthPhotos = photos
    .filter((p) => inWindow(p.takenAt))
    .sort((a, b) => b.takenAt - a.takenAt);
  const bestPhotoId =
    monthPhotos.find((p) => p.favourite)?.id ?? monthPhotos[0]?.id;

  return {
    weight,
    newSkill,
    funniest,
    hardest,
    messageFromDad,
    messageFromMum,
    placesVisited,
    peopleMet,
    bestPhotoId,
  };
}

/** Merge saved overrides over auto-derived values (override wins when set). */
export function effectiveRecap(
  auto: AutoRecap,
  saved: MonthlyRecap | undefined,
): Record<RecapField['key'], string | undefined> & { bestPhotoId?: string } {
  const pick = (savedVal?: string, autoVal?: string) =>
    savedVal && savedVal.trim() ? savedVal : autoVal;
  return {
    weight: auto.weight, // weight is always derived (not a manual field)
    favouriteThing: saved?.favouriteThing,
    newSkill: pick(saved?.newSkill, auto.newSkill),
    funniest: pick(saved?.funniest, auto.funniest),
    hardest: pick(saved?.hardest, auto.hardest),
    messageFromDad: pick(saved?.messageFromDad, auto.messageFromDad),
    messageFromMum: pick(saved?.messageFromMum, auto.messageFromMum),
    placesVisited: pick(saved?.placesVisited, auto.placesVisited),
    peopleMet: pick(saved?.peopleMet, auto.peopleMet),
    neverForget: saved?.neverForget,
    bestPhotoId: saved?.bestPhotoId ?? auto.bestPhotoId,
  };
}
