import { cn } from '@/lib/utils';

/** Cancer constellation stars (stylised) within a 200×200 box. */
const CANCER = {
  pts: {
    iota: [120, 28],
    borealis: [108, 64],
    australis: [100, 92],
    acubens: [60, 140],
    altarf: [150, 150],
  } as const,
  lines: [
    ['iota', 'borealis'],
    ['borealis', 'australis'],
    ['australis', 'acubens'],
    ['australis', 'altarf'],
  ] as const,
};

/**
 * The glowing Cancer constellation (Leo's star sign) — for overlaying on the
 * night sky. Twinkles gently.
 */
export function CancerConstellation({ className }: { className?: string }) {
  const P = (k: keyof typeof CANCER.pts) => CANCER.pts[k];
  const sizes: Record<string, number> = {
    iota: 1.8,
    borealis: 1.6,
    australis: 2.6,
    acubens: 2.2,
    altarf: 2.9,
  };
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('overflow-visible', className)}
      role="img"
      aria-label="Cancer constellation"
    >
      <defs>
        <filter id="cc-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="rgba(206,224,255,0.55)" strokeWidth="0.9">
        {CANCER.lines.map(([a, b], i) => (
          <line key={i} x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} />
        ))}
      </g>
      <g filter="url(#cc-glow)" fill="#f2f6ff">
        {Object.entries(CANCER.pts).map(([k, p], i) => (
          <circle
            key={k}
            cx={p[0]}
            cy={p[1]}
            r={sizes[k]}
            className="leo-twinkle"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Full-viewport backdrop: a real moonless savanna night photo (stars, acacia
 * trees, moonlit grass) with the Cancer constellation glowing overhead and a
 * few drifting fireflies. A soft scrim keeps parchment cards readable.
 */
export function NightMeadow() {
  const fireflies = [
    { x: '16%', y: '64%', d: '0s' },
    { x: '40%', y: '72%', d: '1.5s' },
    { x: '66%', y: '60%', d: '0.8s' },
    { x: '82%', y: '74%', d: '2.2s' },
    { x: '52%', y: '82%', d: '3s' },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#0a1020]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/leo/art/savanna-night.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Readability + mood scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070c1c]/70 via-[#0a1124]/35 to-[#0a140d]/60" />

      {/* Cancer constellation overhead */}
      <CancerConstellation className="absolute right-[12%] top-[7%] h-28 w-28 opacity-90" />

      {/* Fireflies */}
      {fireflies.map((f, i) => (
        <span
          key={i}
          className="leo-firefly absolute h-1.5 w-1.5 rounded-full bg-gold-200"
          style={{
            left: f.x,
            top: f.y,
            animationDelay: f.d,
            boxShadow: '0 0 6px 2px rgba(246,226,122,0.6)',
          }}
        />
      ))}
    </div>
  );
}
