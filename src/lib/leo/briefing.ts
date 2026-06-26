/**
 * Daily-briefing cache keys — pure, unit-tested.
 *
 * The briefing is generated at most once per day (per device) and cached in
 * localStorage so opening the app again that day shows it instantly, with no
 * extra AI call and no notifications. Keys are date-scoped so a new day starts
 * fresh.
 */

function ymd(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** localStorage key holding today's cached briefing text. */
export function briefingCacheKey(now: number): string {
  return `leo-briefing-${ymd(now)}`;
}

/** localStorage key marking that today's briefing was dismissed. */
export function briefingDismissKey(now: number): string {
  return `leo-briefing-dismissed-${ymd(now)}`;
}
