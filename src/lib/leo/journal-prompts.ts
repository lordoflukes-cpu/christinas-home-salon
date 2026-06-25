/**
 * Journal prompts — gentle starters so a blank page never feels intimidating.
 * `promptOfTheDay` rotates deterministically by calendar day (pure + testable).
 */
import type { JournalCategory } from './types';

export interface JournalPrompt {
  category: JournalCategory;
  label: string;
  prompt: string;
  example: string;
}

export const PROMPTS: JournalPrompt[] = [
  {
    category: 'funny',
    label: '😂 Something funny',
    prompt: 'What did Leo do today that made you laugh?',
    example: 'Pulled a face like an angry old man.',
  },
  {
    category: 'sweet',
    label: '🥰 Something sweet',
    prompt: 'What melted your heart today?',
    example: 'Fell asleep on my chest.',
  },
  {
    category: 'hard',
    label: '😮‍💨 Something hard',
    prompt: 'What was tough today?',
    example: 'Wouldn’t settle all evening.',
  },
  {
    category: 'grateful',
    label: '🙏 Grateful for',
    prompt: 'What are you grateful for today?',
    example: 'Christina handled today amazingly.',
  },
  {
    category: 'learned',
    label: '💡 Something I learned',
    prompt: 'What did you learn about Leo today?',
    example: 'He calms down when I walk around with him.',
  },
  {
    category: 'message',
    label: '💌 Message to Leo',
    prompt: 'Write a few words for Leo to read one day.',
    example: 'One day you’ll read this…',
  },
];

const DAY = 86_400_000;

/** A stable "prompt of the day" that rotates each calendar day. */
export function promptOfTheDay(now: number): JournalPrompt {
  const dayNumber = Math.floor(now / DAY);
  return PROMPTS[dayNumber % PROMPTS.length];
}

export function promptByCategory(
  category?: JournalCategory,
): JournalPrompt | undefined {
  return PROMPTS.find((p) => p.category === category);
}
