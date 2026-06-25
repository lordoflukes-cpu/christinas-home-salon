'use client';

import { useMemo } from 'react';
import { usePhotoUrl } from '@/lib/leo';
import { cn } from '@/lib/utils';

/** Renders photo bytes (ArrayBuffer + mime type) via a managed object URL. */
export function PhotoImage({
  bytes,
  type = 'image/jpeg',
  alt = 'Leo',
  className,
}: {
  bytes: ArrayBuffer;
  type?: string;
  alt?: string;
  className?: string;
}) {
  const blob = useMemo(() => new Blob([bytes], { type }), [bytes, type]);
  const url = usePhotoUrl(blob);
  if (!url)
    return <div className={cn('animate-pulse bg-cream-200', className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
