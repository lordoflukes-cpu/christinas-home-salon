import { cn } from '@/lib/utils';

/**
 * A small, refined lion paw-print emblem (gold) — replaces the cartoon crest
 * as the app's quiet mark. Pure SVG.
 */
export function PawMark({
  className,
  title = 'Leo',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-8 w-8', className)}
      role="img"
      aria-label={title}
      fill="currentColor"
    >
      {/* main pad */}
      <path d="M32 36c9 0 15 6 15 13 0 6-6 9-15 9s-15-3-15-9c0-7 6-13 15-13Z" />
      {/* toe beans */}
      <ellipse cx="16" cy="30" rx="5.2" ry="6.8" />
      <ellipse cx="26" cy="22" rx="5.2" ry="7.2" />
      <ellipse cx="38" cy="22" rx="5.2" ry="7.2" />
      <ellipse cx="48" cy="30" rx="5.2" ry="6.8" />
    </svg>
  );
}
