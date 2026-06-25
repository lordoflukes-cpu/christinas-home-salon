/**
 * Plain-English growth insights (pure, unit tested) — weight gain per week and
 * percentile trend, to make the charts feel informative rather than just lines.
 */
import type { GrowthEntry } from './types';
import type { WhoMetric } from './who-data';
import { ageInMonths, metricValue, percentileForMeasurement } from './growth';

const WEEK = 7 * 86_400_000;

export interface WeightGain {
  gramsPerWeek: number;
  text: string;
}

/** Weight gain between the last two weight measurements. */
export function weightGainPerWeek(growth: GrowthEntry[]): WeightGain | null {
  const ws = growth
    .filter((g) => g.weightGrams != null)
    .sort((a, b) => a.measuredAt - b.measuredAt);
  if (ws.length < 2) return null;
  const a = ws[ws.length - 2];
  const b = ws[ws.length - 1];
  const weeks = (b.measuredAt - a.measuredAt) / WEEK;
  if (weeks <= 0) return null;
  const grams = (b.weightGrams! - a.weightGrams!) / weeks;
  const rounded = Math.round(grams);
  const text =
    rounded >= 0
      ? `Gained about ${rounded} g/week recently.`
      : `Down about ${Math.abs(rounded)} g/week recently.`;
  return { gramsPerWeek: rounded, text };
}

export type TrendDirection = 'up' | 'down' | 'steady';

export interface PercentileTrend {
  pct: number;
  direction: TrendDirection;
  text: string;
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const s = ['th', 'st', 'nd', 'rd'];
  return `${n}${s[n % 10] ?? 'th'}`;
}

/** Percentile of the latest measurement + how it's moved vs the previous one. */
export function percentileTrend(
  metric: WhoMetric,
  birth: number,
  growth: GrowthEntry[],
): PercentileTrend | null {
  const withMetric = growth
    .filter((g) => metricValue(metric, g) != null)
    .sort((a, b) => a.measuredAt - b.measuredAt);
  if (!withMetric.length) return null;

  const pctOf = (g: GrowthEntry) =>
    percentileForMeasurement(
      metric,
      ageInMonths(birth, g.measuredAt),
      metricValue(metric, g)!,
    );

  const latest = withMetric[withMetric.length - 1];
  const pct = Math.round(pctOf(latest));

  let direction: TrendDirection = 'steady';
  if (withMetric.length >= 2) {
    const prev = Math.round(pctOf(withMetric[withMetric.length - 2]));
    const diff = pct - prev;
    direction = diff > 7 ? 'up' : diff < -7 ? 'down' : 'steady';
  }

  const tail =
    direction === 'up'
      ? 'climbing the centiles.'
      : direction === 'down'
        ? 'easing down the centiles.'
        : 'tracking steadily.';
  const text = `Around the ${ordinal(pct)} centile — ${tail}`;
  return { pct, direction, text };
}
