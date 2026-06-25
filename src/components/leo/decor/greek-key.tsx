import { cn } from '@/lib/utils';

/**
 * A slim gold Greek-key (meander) divider — a Cypriot/Greek nod.
 * Decorative only.
 */
export function GreekKey({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('leo-greek-key h-2.5 w-full opacity-80', className)}
    />
  );
}
