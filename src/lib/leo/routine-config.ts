/**
 * Routine builder configuration — the categories, copy and suggestion chips.
 * Pure data so the UI stays declarative and it's easy to extend.
 */
import type { RoutineCategory } from './types';

export interface RoutineCategoryConfig {
  category: RoutineCategory;
  title: string;
  emoji: string;
  description: string;
  /** Ordered routines show step numbers + reorder; lists don't. */
  ordered: boolean;
  /** Settling methods get a works/sometimes/no rating. */
  rateable: boolean;
  suggestions: string[];
  placeholder: string;
}

export const ROUTINE_CATEGORIES: RoutineCategoryConfig[] = [
  {
    category: 'morning',
    title: 'Morning routine',
    emoji: '🌅',
    description: 'The usual start to the day, in order.',
    ordered: true,
    rateable: false,
    suggestions: ['Wake', 'Feed', 'Nappy change', 'Play', 'Nap', 'Cuddle'],
    placeholder: 'Add a step…',
  },
  {
    category: 'bedtime',
    title: 'Bedtime routine',
    emoji: '🌙',
    description: 'The wind-down to sleep, in order.',
    ordered: true,
    rateable: false,
    suggestions: [
      'Bath',
      'Massage',
      'Into sleepsuit',
      'Bottle',
      'Story',
      'Cuddle',
      'Lights off',
      'White noise',
      'Sleep',
    ],
    placeholder: 'Add a step…',
  },
  {
    category: 'settling',
    title: 'Settling methods',
    emoji: '🤱',
    description: 'What helps Leo settle — tap to rate how well it works.',
    ordered: false,
    rateable: true,
    suggestions: [
      'Rocking',
      'White noise',
      'Dummy',
      'Walking',
      'Shushing',
      'Swaddle',
      'Pram',
      'Car ride',
      'Skin to skin',
    ],
    placeholder: 'Add a method…',
  },
  {
    category: 'sleepCues',
    title: 'Sleep cues',
    emoji: '😴',
    description: 'Signs Leo is getting tired.',
    ordered: false,
    rateable: false,
    suggestions: [
      'Yawning',
      'Staring',
      'Rubbing eyes',
      'Going quiet',
      'Red eyebrows',
      'Clingy',
      'Pulling ears',
    ],
    placeholder: 'Add a cue…',
  },
  {
    category: 'hungerCues',
    title: 'Hunger cues',
    emoji: '🍼',
    description: 'Signs Leo is hungry.',
    ordered: false,
    rateable: false,
    suggestions: [
      'Hands to mouth',
      'Rooting',
      'Smacking lips',
      'Sucking fists',
      'Fussing',
      'Turning head',
    ],
    placeholder: 'Add a cue…',
  },
  {
    category: 'worked',
    title: 'Things that work',
    emoji: '✅',
    description: 'Little wins worth remembering.',
    ordered: false,
    rateable: false,
    suggestions: [],
    placeholder: 'e.g. Falls asleep faster on a shoulder',
  },
  {
    category: 'didntWork',
    title: "Things that don't work",
    emoji: '🚫',
    description: 'So you don’t repeat them at 3am.',
    ordered: false,
    rateable: false,
    suggestions: [],
    placeholder: 'e.g. Hates being put down straight after a feed',
  },
];

export function routineConfig(
  category: RoutineCategory,
): RoutineCategoryConfig {
  return (
    ROUTINE_CATEGORIES.find((c) => c.category === category) ??
    ROUTINE_CATEGORIES[0]
  );
}
