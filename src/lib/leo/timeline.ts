/**
 * Timeline view — PURE aggregation logic (unit tested).
 *
 * Flattens everything logged about Leo into one chronological timeline of
 * `TimelineItem`s, tagged with one or more categories so a single filter set
 * covers natural overlaps (a funny milestone is a milestone, a memory AND a
 * funny moment). Synthetic life "anchors" (Born, First week, …) are derived
 * from the birthday so they never need storing or syncing.
 *
 * Everything is read-only/derived — no store or schema changes.
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
import { formatLength, formatWeight } from './units';

export type TimelineCategory =
  | 'anchor'
  | 'milestones'
  | 'memories'
  | 'photos'
  | 'growth'
  | 'health'
  | 'appointments'
  | 'family'
  | 'funny'
  | 'everyday';

export interface TimelineItem {
  id: string;
  at: number;
  categories: TimelineCategory[];
  title: string;
  subtitle?: string;
  emoji?: string;
  photoId?: string;
  href?: string;
  /** A synthetic life anchor (rendered larger / gold). */
  anchor?: boolean;
  /** The single next anchor still in the future (rendered faded). */
  upcoming?: boolean;
}

/** Filter keys, including the two meta-filters. Order = chip order in the UI. */
export type TimelineFilter = 'highlights' | 'all' | TimelineCategory;

export const TIMELINE_FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: 'highlights', label: 'Highlights' },
  { key: 'all', label: 'All' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'memories', label: 'Memories' },
  { key: 'photos', label: 'Photos' },
  { key: 'health', label: 'Health' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'growth', label: 'Growth' },
  { key: 'family', label: 'Family' },
  { key: 'funny', label: 'Funny moments' },
  { key: 'everyday', label: 'Everyday' },
];

/**
 * Top-level timeline segments — three clear groups instead of one long pill
 * row. "everyday" has no sub-filters (it gets its own trends-led view). The
 * other two carry a slim secondary filter row drawn from `TIMELINE_FILTERS`.
 */
export type TimelineSegment = 'story' | 'everyday' | 'health';

export const TIMELINE_GROUPS: {
  segment: TimelineSegment;
  label: string;
  /** Secondary sub-filters shown for this segment (empty for everyday). */
  filters: { key: TimelineFilter; label: string }[];
}[] = [
  {
    segment: 'story',
    label: 'Story',
    filters: [
      { key: 'highlights', label: 'Highlights' },
      { key: 'milestones', label: 'Milestones' },
      { key: 'memories', label: 'Memories' },
      { key: 'photos', label: 'Photos' },
      { key: 'family', label: 'Family' },
      { key: 'funny', label: 'Funny' },
    ],
  },
  { segment: 'everyday', label: 'Everyday', filters: [] },
  {
    segment: 'health',
    label: 'Health',
    filters: [
      { key: 'health', label: 'All health' },
      { key: 'appointments', label: 'Appointments' },
      { key: 'growth', label: 'Growth' },
    ],
  },
];

const DAY = 86_400_000;

function addMonths(ms: number, n: number): number {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

/**
 * Life anchors that are reached as of `now`, plus the single next upcoming one
 * (flagged `upcoming`). "First smile / word / steps" are not date-derivable —
 * they appear from logged milestones, not here.
 */
export function lifeAnchors(birth: number, now: number): TimelineItem[] {
  const d = new Date(birth);
  let xmasYear = d.getFullYear();
  if (new Date(xmasYear, 11, 25).getTime() < birth) xmasYear += 1;
  const firstChristmas = new Date(xmasYear, 11, 25).getTime();

  const candidates: { id: string; at: number; title: string; emoji: string }[] =
    [
      { id: 'anchor-born', at: birth, title: 'Born', emoji: '👶' },
      {
        id: 'anchor-week',
        at: birth + 7 * DAY,
        title: 'First week',
        emoji: '🗓️',
      },
      {
        id: 'anchor-month',
        at: addMonths(birth, 1),
        title: 'First month',
        emoji: '🌙',
      },
      {
        id: 'anchor-christmas',
        at: firstChristmas,
        title: 'First Christmas',
        emoji: '🎄',
      },
      {
        id: 'anchor-6month',
        at: addMonths(birth, 6),
        title: 'Half a year old',
        emoji: '✨',
      },
      {
        id: 'anchor-birthday',
        at: addMonths(birth, 12),
        title: 'First birthday',
        emoji: '🎂',
      },
    ].sort((a, b) => a.at - b.at);

  const items: TimelineItem[] = [];
  let upcomingAdded = false;
  for (const c of candidates) {
    if (c.at <= now) {
      items.push({ ...c, categories: ['anchor'], anchor: true });
    } else if (!upcomingAdded) {
      items.push({
        ...c,
        categories: ['anchor'],
        anchor: true,
        upcoming: true,
        subtitle: 'Coming up',
      });
      upcomingAdded = true;
    }
  }
  return items;
}

export interface TimelineSources {
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

const SIZE_EMOJI: Record<SizeEntry['kind'], string> = {
  clothing: '👕',
  nappy: '🧷',
  shoe: '👟',
};

function truncate(s: string | undefined, n = 80): string | undefined {
  if (!s) return undefined;
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** Build the full timeline (newest-first), optionally filtered to one category. */
export function buildTimeline(
  sources: TimelineSources,
  filter: TimelineFilter = 'highlights',
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const {
    profile,
    milestones,
    journal,
    voices,
    photos,
    growth,
    sizes,
    medical,
    events,
    feeds,
    diapers,
    sleeps,
  } = sources;

  // Life anchors.
  if (profile) {
    for (const a of lifeAnchors(profile.birth, sources.now)) {
      if (a.id === 'anchor-born') {
        a.subtitle =
          profile.birthPlace ??
          (profile.birthWeightGrams
            ? formatWeight(profile.birthWeightGrams)
            : a.subtitle);
        a.photoId = profile.heroPhotoId;
      }
      items.push(a);
    }
  }

  // Milestones.
  for (const m of milestones) {
    const cats: TimelineCategory[] = ['milestones', 'memories'];
    if (m.category === 'funny' || m.emotion === 'funny') cats.push('funny');
    if (m.whoThere || m.emotion === 'beautiful') cats.push('family');
    items.push({
      id: `milestone-${m.id}`,
      at: m.achievedAt,
      categories: cats,
      title: m.title,
      subtitle: truncate(m.note) ?? m.location ?? m.whoThere,
      emoji: '⭐',
      photoId: m.photoId,
      href: '/leo/memories',
    });
  }

  // Journal letters.
  for (const j of journal) {
    const cats: TimelineCategory[] = ['memories'];
    if (j.category === 'funny') cats.push('funny');
    if (j.category === 'message') cats.push('family');
    items.push({
      id: `journal-${j.id}`,
      at: j.writtenAt,
      categories: cats,
      title: j.title || 'A little note',
      subtitle: truncate(j.body),
      emoji: '✍️',
      photoId: j.photoId,
      href: '/leo/memories',
    });
  }

  // Voice notes.
  for (const v of voices) {
    const cats: TimelineCategory[] = ['memories'];
    if (v.category === 'funny') cats.push('funny');
    if (v.category === 'message') cats.push('family');
    items.push({
      id: `voice-${v.id}`,
      at: v.recordedAt,
      categories: cats,
      title: v.title || 'Voice note',
      subtitle: truncate(v.transcript),
      emoji: '🎙️',
      href: '/leo/memories',
    });
  }

  // Photos (gallery only — backdrops are decoration).
  for (const p of photos) {
    if (p.role === 'backdrop') continue;
    items.push({
      id: `photo-${p.id}`,
      at: p.takenAt,
      categories: ['photos', 'memories'],
      title: p.caption || 'Photo',
      emoji: '📸',
      photoId: p.id,
      href: '/leo/memories',
    });
  }

  // Growth measurements.
  for (const g of growth) {
    const parts: string[] = [];
    if (g.weightGrams != null) parts.push(formatWeight(g.weightGrams));
    if (g.lengthCm != null) parts.push(formatLength(g.lengthCm));
    if (g.headCircCm != null) parts.push(`head ${g.headCircCm} cm`);
    items.push({
      id: `growth-${g.id}`,
      at: g.measuredAt,
      categories: ['growth', 'health'],
      title: parts[0] ?? 'Measurement',
      subtitle: parts.slice(1).join(' · ') || undefined,
      emoji: '📏',
      href: '/leo/health',
    });
  }

  // Sizes.
  for (const s of sizes) {
    items.push({
      id: `size-${s.id}`,
      at: s.startedAt,
      categories: ['growth'],
      title: `${s.size}`,
      subtitle: s.note,
      emoji: SIZE_EMOJI[s.kind] ?? '👕',
      href: '/leo/health',
    });
  }

  // Medical: appointments, vaccinations, meds, notes.
  for (const m of medical) {
    const cats: TimelineCategory[] =
      m.kind === 'appointment' ? ['appointments', 'health'] : ['health'];
    const emoji =
      m.kind === 'vaccination'
        ? '💉'
        : m.kind === 'medication'
          ? '💊'
          : m.kind === 'appointment'
            ? '🩺'
            : '📋';
    items.push({
      id: `medical-${m.id}`,
      at: m.at,
      categories: cats,
      title: m.title,
      subtitle: m.category ?? m.location,
      emoji,
      href: '/leo/health',
    });
  }

  // Daily events.
  for (const e of events) {
    let title = '';
    let cats: TimelineCategory[] = ['everyday'];
    let emoji = '•';
    switch (e.kind) {
      case 'temperature':
        title = `Temperature ${e.tempC ?? '?'}°C`;
        cats = ['health'];
        emoji = '🌡️';
        break;
      case 'medication':
        title = e.medName ? `Gave ${e.medName}` : 'Medication';
        cats = ['health'];
        emoji = '💊';
        break;
      case 'symptom':
        title = e.symptom || 'Symptom';
        cats = ['health'];
        emoji = '🤒';
        break;
      case 'mood':
        title = `Mood: ${e.mood ?? ''}`.trim();
        emoji = '🙂';
        break;
      case 'cry':
        title = e.reason ? `Crying · ${e.reason}` : 'Crying';
        emoji = '😢';
        break;
    }
    items.push({
      id: `event-${e.id}`,
      at: e.at,
      categories: cats,
      title,
      subtitle: truncate(e.note),
      emoji,
      href: '/leo/timeline',
    });
  }

  // Everyday care — feeds / nappies / sleeps.
  for (const f of feeds) {
    const detail =
      f.type === 'breast'
        ? [
            f.side === 'L' ? 'left' : f.side === 'R' ? 'right' : '',
            f.durationMin ? `${f.durationMin} min` : '',
          ]
            .filter(Boolean)
            .join(', ')
        : [f.amountMl ? `${f.amountMl} ml` : '', f.contents ?? '']
            .filter(Boolean)
            .join(' ');
    items.push({
      id: `feed-${f.id}`,
      at: f.startedAt,
      categories: ['everyday'],
      title: f.type === 'breast' ? 'Breast feed' : 'Bottle feed',
      subtitle: detail || undefined,
      emoji: '🍼',
      href: '/leo/timeline',
    });
  }
  for (const dp of diapers) {
    const label =
      dp.type === 'both' ? 'Wet + dirty' : dp.type === 'wet' ? 'Wet' : 'Dirty';
    items.push({
      id: `diaper-${dp.id}`,
      at: dp.changedAt,
      categories: ['everyday'],
      title: `Nappy · ${label}`,
      subtitle: dp.color,
      emoji: '💧',
      href: '/leo/timeline',
    });
  }
  for (const s of sleeps) {
    items.push({
      id: `sleep-${s.id}`,
      at: s.startedAt,
      categories: ['everyday'],
      title: s.endedAt ? 'Sleep' : 'Asleep (ongoing)',
      subtitle: s.quality,
      emoji: '🌙',
      href: '/leo/timeline',
    });
  }

  const filtered = items.filter((it) => {
    if (filter === 'all') return true;
    if (filter === 'highlights') return !it.categories.includes('everyday');
    return it.categories.includes(filter);
  });

  return filtered.sort((a, b) => b.at - a.at);
}
