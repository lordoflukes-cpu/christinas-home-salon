'use client';

import { useMemo } from 'react';
import { usePhotoUrl } from '@/lib/leo';
import { cn } from '@/lib/utils';

const KENBURNS = [
  'leo-kenburns-a',
  'leo-kenburns-b',
  'leo-kenburns-c',
] as const;

/**
 * One photo, floating on the starry stage with a slow Ken-Burns drift. The
 * bytes come from the on-device `PhotoEntry`; the drift variant rotates per
 * slide so consecutive photos move differently. `object-contain` keeps faces
 * un-cropped — the sky fills the rest.
 */
export function SlideImage({
  bytes,
  type,
  index,
  paused,
  reduceMotion,
}: {
  bytes: ArrayBuffer;
  type?: string;
  index: number;
  paused?: boolean;
  reduceMotion?: boolean;
}) {
  const blob = useMemo(
    () => new Blob([bytes], { type: type || 'image/jpeg' }),
    [bytes, type],
  );
  const url = usePhotoUrl(blob);
  const variant = KENBURNS[index % KENBURNS.length];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className={cn(
            'max-h-full max-w-full rounded-2xl object-contain shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-parchment-50/10',
            !reduceMotion && variant,
          )}
          style={
            paused && !reduceMotion
              ? { animationPlayState: 'paused' }
              : undefined
          }
        />
      ) : (
        <div className="h-2/3 w-3/4 animate-pulse rounded-2xl bg-ink-800/40" />
      )}
    </div>
  );
}
