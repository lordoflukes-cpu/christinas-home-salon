'use client';

import { useMemo } from 'react';
import { Starfield } from '../decor/starfield';

/** A small deterministic-enough scatter of twinkling stars + drifting motes. */
interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * A full-screen, living night sky for the slideshow: a deep gradient, the gold
 * `Starfield` wash, a layer of softly twinkling stars, a couple of drifting
 * motes and the odd shooting star. Purely decorative (transform/opacity only,
 * and stilled under prefers-reduced-motion via the CSS guards).
 */
const THEME_BG: Record<string, string> = {
  night:
    'radial-gradient(120% 80% at 50% 0%, #11204a 0%, #0a1330 45%, #060a1d 100%)',
  dawn: 'radial-gradient(120% 80% at 50% 0%, #3b2a4a 0%, #2a2140 45%, #14111f 100%)',
  gold: 'radial-gradient(120% 80% at 50% 0%, #4a3a16 0%, #2f2410 45%, #15100a 100%)',
};

export function StarryStage({
  theme = 'night',
}: {
  theme?: 'night' | 'dawn' | 'gold';
}) {
  const stars = useMemo<Star[]>(() => {
    const out: Star[] = [];
    for (let i = 0; i < 46; i++) {
      out.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 5,
        duration: 3.5 + Math.random() * 4,
      });
    }
    return out;
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ background: THEME_BG[theme] ?? THEME_BG.night }}
    >
      <Starfield className="opacity-70" />

      {stars.map((s, i) => (
        <span
          key={i}
          className="leo-twinkle absolute rounded-full bg-parchment-50"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: '0 0 6px rgba(244,226,163,0.7)',
          }}
        />
      ))}

      {/* A couple of gentle drifting motes. */}
      <span
        className="leo-firefly absolute h-1.5 w-1.5 rounded-full bg-gold-200"
        style={{
          left: '18%',
          top: '70%',
          boxShadow: '0 0 8px rgba(236,205,104,0.9)',
        }}
      />
      <span
        className="leo-firefly absolute h-1.5 w-1.5 rounded-full bg-gold-200"
        style={{
          left: '76%',
          top: '58%',
          animationDelay: '3s',
          boxShadow: '0 0 8px rgba(236,205,104,0.9)',
        }}
      />

      {/* Shooting stars, offset so they don't fire together. */}
      <span
        className="leo-shoot absolute h-px w-24 bg-gradient-to-r from-transparent via-parchment-50 to-transparent"
        style={{ left: '85%', top: '12%' }}
      />
      <span
        className="leo-shoot absolute h-px w-16 bg-gradient-to-r from-transparent via-gold-100 to-transparent"
        style={{ left: '70%', top: '4%', animationDelay: '3.5s' }}
      />

      {/* Soft vignette to seat photos in the sky. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(4,7,18,0.55) 100%)',
        }}
      />
    </div>
  );
}
