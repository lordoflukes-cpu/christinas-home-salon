'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the current epoch ms, re-rendering on an interval so "time since…"
 * displays stay live without re-querying storage. Defaults to every 30s.
 */
export function useNow(intervalMs = 30_000): number {
  const [ms, setMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setMs(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return ms;
}
