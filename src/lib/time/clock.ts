/**
 * Clock utility for deterministic time in tests
 * 
 * Use `now()` instead of `new Date()` throughout the app.
 * Tests can spy on this function to control time.
 * 
 * @example
 * // In production code
 * import { now } from '@/lib/time/clock';
 * const currentTime = now();
 * 
 * @example
 * // In tests
 * import { now } from '@/lib/time/clock';
 * vi.spyOn({ now }, 'now').mockReturnValue(new Date('2026-01-20T10:00:00Z'));
 */

export function now(): Date {
  return new Date();
}

/**
 * Get current date at midnight (start of day)
 */
export function today(): Date {
  const date = now();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date as YYYY-MM-DD (ISO date string)
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is Sunday
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}
