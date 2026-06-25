'use client';

import { motion } from 'framer-motion';
import { SavannaScene, type SceneVariant } from './decor/savanna-scene';

/**
 * A slim animated savanna banner that gives each section its own distinctive
 * sky and title. Sits at the top of Log / Health / Memories / Settings.
 */
export function SectionBanner({
  title,
  subtitle,
  variant,
  showPride = true,
  showConstellation,
}: {
  title: string;
  subtitle?: string;
  variant: SceneVariant;
  showPride?: boolean;
  showConstellation?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="leo-frame relative mb-1 h-28 overflow-hidden rounded-2xl bg-bark-400 shadow-sm"
    >
      <SavannaScene
        variant={variant}
        showPride={showPride}
        showConstellation={showConstellation}
        className="absolute inset-0"
      />
      <div className="leo-vignette pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950/60 to-transparent p-4">
        <h1 className="font-serif text-3xl font-semibold leading-none tracking-wide text-parchment-50 drop-shadow">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 font-hand text-base leading-none text-parchment-200">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
