/**
 * Growth helpers — convert Leo's measurements to/from WHO percentiles using
 * the LMS method.
 *   z  = ((X/M)^L − 1) / (L·S)          (L≠0)   |   ln(X/M)/S        (L=0)
 *   X  = M·(1 + L·S·z)^(1/L)            (L≠0)   |   M·exp(S·z)       (L=0)
 */
import { lmsAt, WHO_MAX_MONTH, type WhoMetric } from './who-data';
import type { GrowthEntry } from './types';

const MS_PER_MONTH = (365.25 / 12) * 86_400_000;

/** Standard normal CDF via an erf approximation (Abramowitz & Stegun 7.1.26). */
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/** z-scores for the percentile curves we draw. */
export const PERCENTILE_Z: Record<number, number> = {
  3: -1.880794,
  15: -1.036433,
  50: 0,
  85: 1.036433,
  97: 1.880794,
};

export const CHART_PERCENTILES = [3, 15, 50, 85, 97] as const;

export function ageInMonths(birth: number, at: number): number {
  return (at - birth) / MS_PER_MONTH;
}

function zForValue(L: number, M: number, S: number, x: number): number {
  if (L === 0) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}

function valueForZ(L: number, M: number, S: number, z: number): number {
  if (L === 0) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

/** A measurement's percentile (0–100) for a metric at a given age (months). */
export function percentileForMeasurement(
  metric: WhoMetric,
  ageMonths: number,
  valueInWhoUnit: number,
): number {
  const [L, M, S] = lmsAt(metric, ageMonths);
  const z = zForValue(L, M, S, valueInWhoUnit);
  return Math.round(normalCdf(z) * 1000) / 10;
}

/** A WHO percentile curve: value (WHO unit) at each whole month 0–24. */
export function percentileCurve(
  metric: WhoMetric,
  percentile: number,
): { month: number; value: number }[] {
  const z = PERCENTILE_Z[percentile] ?? 0;
  const points: { month: number; value: number }[] = [];
  for (let m = 0; m <= WHO_MAX_MONTH; m++) {
    const [L, M, S] = lmsAt(metric, m);
    points.push({ month: m, value: valueForZ(L, M, S, z) });
  }
  return points;
}

/** The value of a metric on a growth entry, in WHO units (kg / cm), or null. */
export function metricValue(
  metric: WhoMetric,
  entry: GrowthEntry,
): number | null {
  if (metric === 'weight')
    return entry.weightGrams != null ? entry.weightGrams / 1000 : null;
  if (metric === 'length') return entry.lengthCm ?? null;
  return entry.headCircCm ?? null;
}

export interface PlottedPoint {
  id: string;
  ageMonths: number;
  value: number; // WHO unit
  percentile: number;
  measuredAt: number;
}

/** Leo's measured points for a metric (those that have a value), chronological. */
export function plottedPoints(
  metric: WhoMetric,
  birth: number,
  entries: GrowthEntry[],
): PlottedPoint[] {
  return entries
    .map((e) => {
      const value = metricValue(metric, e);
      if (value == null) return null;
      const ageMonths = ageInMonths(birth, e.measuredAt);
      return {
        id: e.id,
        ageMonths,
        value,
        percentile: percentileForMeasurement(metric, ageMonths, value),
        measuredAt: e.measuredAt,
      };
    })
    .filter((p): p is PlottedPoint => p !== null)
    .sort((a, b) => a.ageMonths - b.ageMonths);
}

export const METRIC_LABELS: Record<WhoMetric, { label: string; unit: string }> =
  {
    weight: { label: 'Weight', unit: 'kg' },
    length: { label: 'Length', unit: 'cm' },
    head: { label: 'Head', unit: 'cm' },
  };
