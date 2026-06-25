import { cn } from '@/lib/utils';

/**
 * An abstract three-strand woven motif — a tasteful nod to Leo's blended
 * Greek-Cypriot (aegean), Nigerian (gold) and British (rose) heritage.
 * Used sparingly. Decorative only.
 */
export function HeritageThread({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={cn('h-5 w-40', className)}
      role="img"
      aria-label="A woven thread celebrating Leo's heritage"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M4 12 C 44 0, 84 24, 124 12 S 204 0, 236 12" stroke="#2f87ac" />
      <path d="M4 12 C 44 24, 84 0, 124 12 S 204 24, 236 12" stroke="#d99e23" />
      <path
        d="M4 12 C 64 6, 64 18, 124 12 S 184 6, 236 12"
        stroke="#f43f5e"
        strokeOpacity="0.85"
      />
    </svg>
  );
}
