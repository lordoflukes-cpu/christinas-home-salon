import { cn } from '@/lib/utils';

/** Deterministic star field (no RNG, so SSR and client match). */
function starField(
  count: number,
  width: number,
  height: number,
  twinkleEvery = 6,
) {
  return Array.from({ length: count }, (_, i) => ({
    x: (i * 97 + 13) % width,
    y: (i * 57 + 29) % height,
    r: 0.4 + ((i * 13) % 5) / 5,
    o: 0.35 + ((i * 7) % 6) / 10,
    twinkle: i % twinkleEvery === 0,
    delay: (i % 9) * 0.5,
  }));
}

/** Cancer constellation stars (stylised) at a given origin + scale. */
function cancer(ox: number, oy: number, s: number) {
  const pts = {
    iota: [60, 18],
    borealis: [54, 38],
    australis: [50, 52],
    acubens: [30, 78],
    altarf: [72, 80],
  } as const;
  const P = (k: keyof typeof pts) => [ox + pts[k][0] * s, oy + pts[k][1] * s];
  const lines: [number[], number[]][] = [
    [P('iota'), P('borealis')],
    [P('borealis'), P('australis')],
    [P('australis'), P('acubens')],
    [P('australis'), P('altarf')],
  ];
  const stars = [
    { p: P('iota'), r: 1.6 },
    { p: P('borealis'), r: 1.4 },
    { p: P('australis'), r: 2.4 },
    { p: P('acubens'), r: 2.0 },
    { p: P('altarf'), r: 2.6 },
  ];
  return { lines, stars };
}

function Glow() {
  return (
    <filter id="leo-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.2" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

function Constellation({ ox, oy, s }: { ox: number; oy: number; s: number }) {
  const { lines, stars } = cancer(ox, oy, s);
  return (
    <g>
      <g stroke="rgba(190,214,255,0.5)" strokeWidth="0.8">
        {lines.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      <g filter="url(#leo-glow)" fill="#eaf2ff">
        {stars.map((st, i) => (
          <circle
            key={i}
            cx={st.p[0]}
            cy={st.p[1]}
            r={st.r}
            className={i % 2 === 0 ? 'leo-twinkle' : undefined}
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </g>
    </g>
  );
}

/**
 * Sky-only night scene (gradient, nebula, stars, moon, glowing Cancer
 * constellation) for header / banner strips. Fills its box.
 */
export function NightSky({
  className,
  showConstellation = true,
  showMoon = true,
}: {
  className?: string;
  showConstellation?: boolean;
  showMoon?: boolean;
}) {
  const stars = starField(70, 400, 200, 5);
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Starry night sky"
    >
      <defs>
        <linearGradient id="sky-strip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070b22" />
          <stop offset="60%" stopColor="#0e1b3e" />
          <stop offset="100%" stopColor="#1b2f57" />
        </linearGradient>
        <radialGradient id="neb-strip" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(70,110,170,0.4)" />
          <stop offset="100%" stopColor="rgba(70,110,170,0)" />
        </radialGradient>
        <Glow />
      </defs>
      <rect width="400" height="200" fill="url(#sky-strip)" />
      <rect width="400" height="200" fill="url(#neb-strip)" />
      {showMoon && (
        <>
          <circle cx="338" cy="46" r="44" fill="rgba(225,232,210,0.18)" />
          <circle
            cx="338"
            cy="46"
            r="16"
            fill="#eef0d8"
            filter="url(#leo-glow)"
          />
        </>
      )}
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#dfe8ff"
          opacity={s.o}
          className={s.twinkle ? 'leo-twinkle' : undefined}
          style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
        />
      ))}
      {showConstellation && <Constellation ox={120} oy={40} s={1.1} />}
    </svg>
  );
}

/**
 * Full-viewport night-meadow backdrop: starry sky with the Cancer
 * constellation fading into a moonlit green meadow with tree/grass silhouettes
 * and drifting fireflies. Hand-built SVG/CSS — atmospheric and offline.
 */
export function NightMeadow() {
  const stars = starField(120, 400, 440, 6);
  const fireflies = [
    [60, 600],
    [150, 660],
    [250, 620],
    [330, 680],
    [110, 720],
    [300, 740],
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#070b1d]"
    >
      <svg
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="sky-full" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060a1c" />
            <stop offset="35%" stopColor="#0b1733" />
            <stop offset="70%" stopColor="#142a52" />
            <stop offset="100%" stopColor="#27406a" />
          </linearGradient>
          <radialGradient id="neb1" cx="25%" cy="22%" r="40%">
            <stop offset="0%" stopColor="rgba(60,120,150,0.35)" />
            <stop offset="100%" stopColor="rgba(60,120,150,0)" />
          </radialGradient>
          <radialGradient id="neb2" cx="78%" cy="34%" r="42%">
            <stop offset="0%" stopColor="rgba(120,90,180,0.3)" />
            <stop offset="100%" stopColor="rgba(120,90,180,0)" />
          </radialGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d3f29" />
            <stop offset="45%" stopColor="#123a24" />
            <stop offset="100%" stopColor="#06140d" />
          </linearGradient>
          <Glow />
        </defs>

        {/* Sky */}
        <rect width="400" height="520" fill="url(#sky-full)" />
        <rect width="400" height="520" fill="url(#neb1)" />
        <rect width="400" height="520" fill="url(#neb2)" />

        {/* Moon */}
        <circle cx="320" cy="96" r="70" fill="rgba(225,232,210,0.12)" />
        <circle
          cx="320"
          cy="96"
          r="22"
          fill="#eef0d8"
          filter="url(#leo-glow)"
        />

        {/* Stars */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#dfe8ff"
            opacity={s.o}
            className={s.twinkle ? 'leo-twinkle' : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}

        {/* Cancer constellation */}
        <Constellation ox={150} oy={150} s={1.5} />

        {/* Horizon glow */}
        <ellipse
          cx="200"
          cy="500"
          rx="300"
          ry="60"
          fill="rgba(120,150,120,0.16)"
        />

        {/* Tree silhouettes on the horizon */}
        <g fill="#0a1a10">
          {/* rounded bush clumps */}
          <ellipse cx="60" cy="500" rx="70" ry="34" />
          <ellipse cx="350" cy="498" rx="80" ry="38" />
          {/* acacia */}
          <path
            d="M250 504 v-46 M250 466 q-22 -8 -40 0 q40 -14 80 0 q-18 -8 -40 0"
            stroke="#0a1a10"
            strokeWidth="4"
            fill="none"
          />
          <ellipse cx="250" cy="456" rx="40" ry="10" />
          {/* pines */}
          <path d="M150 506 l-14 0 l14 -30 l14 30 z" />
          <path d="M150 488 l-11 0 l11 -22 l11 22 z" />
          <path d="M120 508 l-10 0 l10 -22 l10 22 z" />
        </g>

        {/* Meadow */}
        <path
          d="M0 496 Q200 478 400 496 L400 800 L0 800 Z"
          fill="url(#ground)"
        />

        {/* Grass blades */}
        <g stroke="#1f4a2c" strokeWidth="2.4" strokeLinecap="round">
          {Array.from({ length: 46 }, (_, i) => {
            const x = (i * 9 + 4) % 400;
            const h = 16 + ((i * 7) % 22);
            const lean = ((i % 3) - 1) * 8;
            const base = 512 + ((i * 13) % 30);
            return (
              <path
                key={i}
                d={`M${x} ${base} q${lean} ${-h * 0.6} ${lean / 2} ${-h}`}
              />
            );
          })}
        </g>
        <g
          stroke="#2f6b3e"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.8"
        >
          {Array.from({ length: 30 }, (_, i) => {
            const x = (i * 14 + 9) % 400;
            const h = 12 + ((i * 5) % 16);
            const base = 520 + ((i * 11) % 40);
            return <path key={i} d={`M${x} ${base} q3 ${-h * 0.6} 1 ${-h}`} />;
          })}
        </g>

        {/* Fireflies */}
        <g fill="#f6e27a" filter="url(#leo-glow)">
          {fireflies.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.8}
              className="leo-firefly"
              style={{ animationDelay: `${i * 1.3}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
