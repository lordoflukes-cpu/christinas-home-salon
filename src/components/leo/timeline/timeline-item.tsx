'use client';

import type { PhotoEntry, TimelineItem as TItem } from '@/lib/leo';
import { cn } from '@/lib/utils';
import { PhotoImage } from '../photos/photo-image';

function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function TimelineRow({
  item,
  photo,
  isLast,
  onOpen,
}: {
  item: TItem;
  photo?: PhotoEntry;
  isLast: boolean;
  onOpen?: () => void;
}) {
  const anchor = item.anchor;
  return (
    <li className="relative flex gap-3">
      {/* Rail — fixed width so every card starts at the same x */}
      <div className="flex w-7 flex-col items-center">
        <span
          className={cn(
            'mt-1.5 flex shrink-0 items-center justify-center rounded-full ring-4 ring-parchment-50',
            anchor ? 'h-7 w-7 bg-gold-400 text-sm' : 'h-3.5 w-3.5 bg-ink-300',
            item.upcoming && 'bg-gold-200',
          )}
        >
          {anchor && <span>{item.emoji}</span>}
        </span>
        {!isLast && <span className="w-px flex-1 bg-ink-300/40" />}
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className={cn(
          'mb-2.5 flex w-full min-w-0 flex-1 items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors',
          anchor
            ? 'border-gold-300 bg-gradient-to-br from-gold-50 to-parchment-50'
            : 'border-ink-300/40 bg-parchment-50/70',
          onOpen && 'hover:bg-parchment-100 active:scale-[0.99]',
          item.upcoming && 'opacity-60',
        )}
      >
        {photo ? (
          <PhotoImage
            bytes={photo.bytes}
            type={photo.type}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
        ) : (
          !anchor && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment-100 text-lg">
              {item.emoji ?? '•'}
            </span>
          )
        )}

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate font-medium text-ink-900',
              anchor && 'font-display text-lg',
            )}
          >
            {item.title}
          </span>
          {item.subtitle && (
            <span className="mt-0.5 block truncate text-sm text-ink-500">
              {item.subtitle}
            </span>
          )}
          <span className="mt-0.5 block text-xs text-gold-700">
            {item.upcoming ? 'Coming up' : shortDate(item.at)}
          </span>
        </span>
      </button>
    </li>
  );
}
