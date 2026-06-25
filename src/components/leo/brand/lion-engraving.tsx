import { cn } from '@/lib/utils';

/**
 * An original woodcut / engraving-style lion-cub portrait, drawn in sepia ink
 * with fur hatching — for the keepsake "etched on wood" aesthetic. Pure inline
 * SVG: crisp at any size, works offline. (For a photographic look, set a cover
 * photo or drop /public/leo/leo-hero.jpg — this is the default centrepiece.)
 */
export function LionEngraving({
  className,
  title = 'Leo the lion cub',
}: {
  className?: string;
  title?: string;
}) {
  // Radial fur strokes around the mane, generated for an engraved texture.
  const cx = 160;
  const cy = 158;
  const furStrokes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const count = 34;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const wobble = (i % 3) * 4;
    const r1 = 92 + wobble;
    const r2 = 126 + (i % 2 ? 10 : 0) + wobble;
    furStrokes.push({
      x1: cx + Math.cos(a) * r1,
      y1: cy + Math.sin(a) * r1 * 0.98,
      x2: cx + Math.cos(a) * r2,
      y2: cy + Math.sin(a) * r2 * 0.98,
    });
  }

  return (
    <svg
      viewBox="0 0 320 330"
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <radialGradient id="cub-face" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#f4e7cf" />
          <stop offset="100%" stopColor="#e3c896" />
        </radialGradient>
        <radialGradient id="cub-mane" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stopColor="#b27a44" />
          <stop offset="100%" stopColor="#6f4b30" />
        </radialGradient>
      </defs>

      <g
        stroke="#3c2c1a"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Mane base — scalloped fur ring */}
        <path
          d="M160 36
             C198 34 214 58 214 78
             C242 70 268 92 262 120
             C288 128 292 166 270 184
             C284 206 270 244 244 246
             C246 274 214 292 190 280
             C178 300 142 300 130 280
             C106 292 74 274 76 246
             C50 244 36 206 50 184
             C28 166 32 128 58 120
             C52 92 78 70 106 78
             C106 58 122 34 160 36 Z"
          fill="url(#cub-mane)"
          stroke="#4f3920"
          strokeWidth="2.4"
        />

        {/* Radial fur hatching over the mane */}
        <g stroke="#3c2c1a" strokeWidth="1" strokeOpacity="0.55">
          {furStrokes.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </g>

        {/* Ears */}
        <path
          d="M96 96 C84 70 96 56 118 60 C120 78 116 92 110 102 Z"
          fill="url(#cub-mane)"
          strokeWidth="2.2"
        />
        <path
          d="M224 96 C236 70 224 56 202 60 C200 78 204 92 210 102 Z"
          fill="url(#cub-mane)"
          strokeWidth="2.2"
        />
        <path
          d="M104 92 C100 78 106 70 114 70"
          strokeWidth="1.4"
          strokeOpacity="0.6"
        />
        <path
          d="M216 92 C220 78 214 70 206 70"
          strokeWidth="1.4"
          strokeOpacity="0.6"
        />

        {/* Face */}
        <path
          d="M160 92
             C212 92 238 128 238 168
             C238 214 204 250 160 250
             C116 250 82 214 82 168
             C82 128 108 92 160 92 Z"
          fill="url(#cub-face)"
          strokeWidth="2.4"
        />

        {/* Forehead hatching */}
        <g strokeWidth="1" strokeOpacity="0.4">
          <path d="M132 116 q28 -10 56 0" />
          <path d="M128 126 q32 -10 64 0" />
          <path d="M150 104 v12 M160 102 v13 M170 104 v12" />
        </g>

        {/* Brow + eyes */}
        <path d="M118 150 q22 -16 44 -4" strokeWidth="2" />
        <path d="M202 150 q-22 -16 -44 -4" strokeWidth="2" />
        <ellipse
          cx="132"
          cy="166"
          rx="15"
          ry="13"
          fill="#2c2013"
          stroke="none"
        />
        <ellipse
          cx="188"
          cy="166"
          rx="15"
          ry="13"
          fill="#2c2013"
          stroke="none"
        />
        <circle cx="137" cy="161" r="3.4" fill="#fbf6ec" stroke="none" />
        <circle cx="193" cy="161" r="3.4" fill="#fbf6ec" stroke="none" />
        {/* under-eye fur ticks */}
        <g strokeWidth="0.9" strokeOpacity="0.5">
          <path d="M120 182 l-6 8 M132 186 l0 9 M144 182 l6 8" />
          <path d="M176 182 l-6 8 M188 186 l0 9 M200 182 l6 8" />
        </g>

        {/* Muzzle + nose */}
        <path
          d="M128 196 C128 182 192 182 192 196 C192 220 172 234 160 234 C148 234 128 220 128 196 Z"
          fill="#f6efe0"
          strokeWidth="1.8"
        />
        <path
          d="M146 196 L174 196 L160 210 Z"
          fill="#5b4326"
          stroke="#3c2c1a"
          strokeWidth="1.4"
        />
        <path
          d="M160 210 v10 M160 220 q-12 8 -22 2 M160 220 q12 8 22 2"
          strokeWidth="2"
        />

        {/* Whisker dots + whiskers */}
        <g fill="#5b4326" stroke="none">
          <circle cx="138" cy="200" r="1.6" />
          <circle cx="134" cy="208" r="1.6" />
          <circle cx="182" cy="200" r="1.6" />
          <circle cx="186" cy="208" r="1.6" />
        </g>
        <g strokeWidth="0.9" strokeOpacity="0.55">
          <path d="M128 202 q-34 -4 -52 4" />
          <path d="M126 210 q-34 2 -50 12" />
          <path d="M192 202 q34 -4 52 4" />
          <path d="M194 210 q34 2 50 12" />
        </g>
      </g>
    </svg>
  );
}
