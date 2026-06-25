'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * The Cancer constellation (Leo's star sign) — the faint inverted-Y of
 * Acubens, Al Tarf, Asellus Australis/Borealis and Iota Cancri — with a gentle
 * twinkle. Coordinates are stylised within a 100×100 box.
 */
const STARS = [
  { id: 'iota', x: 60, y: 18, r: 1.6 }, // Iota Cancri (top)
  { id: 'borealis', x: 54, y: 38, r: 1.4 }, // Asellus Borealis
  { id: 'australis', x: 50, y: 52, r: 2.2 }, // Asellus Australis (hub)
  { id: 'acubens', x: 30, y: 78, r: 1.9 }, // Acubens (lower-left)
  { id: 'altarf', x: 72, y: 80, r: 2.4 }, // Al Tarf (brightest)
];
const LINES: [string, string][] = [
  ['iota', 'borealis'],
  ['borealis', 'australis'],
  ['australis', 'acubens'],
  ['australis', 'altarf'],
];
const byId = (id: string) => STARS.find((s) => s.id === id)!;

export function CancerConstellation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('overflow-visible', className)}
      role="img"
      aria-label="Cancer constellation"
    >
      <g stroke="rgba(244,226,163,0.5)" strokeWidth="0.5">
        {LINES.map(([a, b], i) => {
          const s = byId(a);
          const e = byId(b);
          return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} />;
        })}
      </g>
      {STARS.map((s, i) => (
        <motion.circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fdeec0"
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.35, 1, 0.55, 0.9, 0.35] }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
          style={{ filter: 'drop-shadow(0 0 2px rgba(253,238,192,0.9))' }}
        />
      ))}
    </svg>
  );
}
