import { cn } from '@/lib/utils';

/**
 * Soft scattered gold stars — a gentle celestial accent for night/sleep
 * surfaces and the hero. Decorative only (not a constellation).
 */
export function Starfield({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'leo-starfield pointer-events-none absolute inset-0',
        className,
      )}
    />
  );
}
