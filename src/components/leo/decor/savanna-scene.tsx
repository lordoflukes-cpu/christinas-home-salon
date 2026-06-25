'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SceneVariant = 'dawn' | 'day' | 'dusk' | 'night';

const SKY: Record<SceneVariant, string[]> = {
  // top → bottom stops
  dawn: ['#f6c98b', '#f2a679', '#e0b15f'],
  day: ['#bcd9e0', '#e7d6a6', '#e9c777'],
  dusk: ['#3d2a4f', '#9c4f3f', '#e2a24a'],
  night: ['#161a3a', '#241b3a', '#3a2a2f'],
};
const ORB: Record<SceneVariant, { fill: string; glow: string }> = {
  dawn: { fill: '#fff2d4', glow: 'rgba(255,221,150,0.7)' },
  day: { fill: '#fff6dc', glow: 'rgba(255,236,170,0.6)' },
  dusk: { fill: '#ffd79a', glow: 'rgba(255,160,90,0.65)' },
  night: { fill: '#eef0d8', glow: 'rgba(220,225,200,0.5)' },
};

const STAR_DOTS = [
  [24, 28],
  [60, 20],
  [120, 40],
  [200, 26],
  [300, 36],
  [350, 22],
  [90, 60],
  [260, 56],
  [330, 64],
];

/**
 * A hand-illustrated savanna diorama — sky, sun or moon, acacia tree, drifting
 * clouds and a resting lion pride in silhouette. Night/dusk variants show stars
 * and the Cancer constellation. Pure SVG, animated, offline.
 */
export function SavannaScene({
  variant = 'dusk',
  showPride = true,
  showConstellation,
  className,
}: {
  variant?: SceneVariant;
  showPride?: boolean;
  showConstellation?: boolean;
  className?: string;
}) {
  const isDark = variant === 'night' || variant === 'dusk';
  const stars = isDark;
  const constellation = showConstellation ?? variant === 'night';
  const sky = SKY[variant];
  const orb = ORB[variant];
  const fg = variant === 'night' ? '#120c10' : '#241710';
  const mid = variant === 'night' ? '#241a2c' : '#3c281d';

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Savanna scene"
    >
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="55%" stopColor={sky[1]} />
          <stop offset="100%" stopColor={sky[2]} />
        </linearGradient>
        <radialGradient id={`orb-${variant}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={orb.fill} />
          <stop offset="60%" stopColor={orb.fill} stopOpacity="0.9" />
          <stop offset="100%" stopColor={orb.fill} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="240" fill={`url(#sky-${variant})`} />

      {/* Stars */}
      {stars &&
        STAR_DOTS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 1.4 : 0.9}
            fill="#fdeec0"
            opacity={0.85}
          />
        ))}
      {constellation && (
        <g>
          <g stroke="rgba(244,226,163,0.45)" strokeWidth="0.6">
            <line x1="318" y1="29" x2="313" y2="43" />
            <line x1="313" y1="43" x2="310" y2="52" />
            <line x1="310" y1="52" x2="294" y2="71" />
            <line x1="310" y1="52" x2="328" y2="72" />
          </g>
          {[
            [318, 29, 1.3],
            [313, 43, 1.2],
            [310, 52, 1.9],
            [294, 71, 1.7],
            [328, 72, 2.1],
          ].map(([cx, cy, r], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="#fdeec0"
              animate={{ opacity: [0.4, 1, 0.6, 0.9, 0.4] }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </g>
      )}

      {/* Sun / moon with glow */}
      <circle cx="96" cy="78" r="60" fill={`url(#orb-${variant})`} />
      <circle
        cx="96"
        cy="78"
        r="22"
        fill={orb.fill}
        opacity={isDark ? 0.95 : 0.9}
      />

      {/* Drifting clouds (lighter, day/dusk/dawn) */}
      {variant !== 'night' && (
        <g fill="#fbf1dd" opacity="0.5">
          <motion.g
            initial={{ x: -40 }}
            animate={{ x: 40 }}
            transition={{
              duration: 26,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <ellipse cx="150" cy="54" rx="34" ry="9" />
            <ellipse cx="180" cy="50" rx="22" ry="8" />
          </motion.g>
          <motion.g
            initial={{ x: 30 }}
            animate={{ x: -30 }}
            transition={{
              duration: 34,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <ellipse cx="300" cy="86" rx="30" ry="8" />
            <ellipse cx="326" cy="82" rx="18" ry="6" />
          </motion.g>
        </g>
      )}

      {/* Distant hills */}
      <path
        d="M0 168 Q100 150 200 166 T400 160 V240 H0 Z"
        fill={mid}
        opacity="0.55"
      />

      {/* Acacia umbrella tree (right) */}
      <g fill={fg}>
        <path
          d="M330 196 C330 176 326 156 332 140 C334 150 336 150 340 142 C342 152 346 154 350 146
             C350 162 348 178 350 196 Z"
        />
        <path d="M300 132 q40 -20 84 0 q-42 -8 -84 0 Z" />
        <ellipse cx="342" cy="128" rx="56" ry="14" />
        <ellipse cx="318" cy="134" rx="26" ry="9" />
        <ellipse cx="368" cy="134" rx="22" ry="8" />
      </g>

      {/* Ground */}
      <path d="M0 196 Q140 184 260 196 T400 196 V240 H0 Z" fill={fg} />

      {/* Lion pride silhouettes on the ridge */}
      {showPride && (
        <g fill={fg}>
          {/* resting maned lion */}
          <g transform="translate(120,176)">
            <ellipse cx="20" cy="18" rx="34" ry="12" />
            <circle cx="-10" cy="6" r="13" />
            <circle cx="-10" cy="6" r="9" fill={mid} />
            <path d="M-20 2 l-5 -6 M0 2 l5 -6" stroke={fg} strokeWidth="2" />
            <rect x="44" y="8" width="6" height="16" rx="2" />
          </g>
          {/* lioness sitting */}
          <g transform="translate(196,178)">
            <ellipse cx="14" cy="16" rx="20" ry="9" />
            <circle cx="-2" cy="2" r="8" />
            <path d="M-8 -2 l-3 -5 M4 -2 l3 -5" stroke={fg} strokeWidth="1.6" />
            <rect x="28" y="8" width="4" height="12" rx="2" />
          </g>
          {/* cub */}
          <g transform="translate(238,186)">
            <ellipse cx="8" cy="8" rx="11" ry="6" />
            <circle cx="0" cy="2" r="5" />
          </g>
        </g>
      )}

      {/* Foreground grass tufts */}
      <g stroke={fg} strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M20 226 q3 -14 0 -22 M26 226 q6 -12 10 -18 M14 226 q-4 -12 -8 -16" />
        <path d="M360 228 q3 -14 0 -22 M368 228 q6 -12 10 -18 M352 228 q-4 -12 -8 -16" />
      </g>
    </svg>
  );
}
