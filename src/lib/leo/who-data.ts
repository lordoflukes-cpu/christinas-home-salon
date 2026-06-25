/**
 * WHO Child Growth Standards — LMS parameters for BOYS, 0–24 months.
 * Each row is [L, M, S] at that age in months (M is the median, in the metric's
 * natural unit: weight in kg, length & head circumference in cm).
 *
 * Source: WHO Child Growth Standards (weight-for-age, length-for-age,
 * head-circumference-for-age, boys).
 */

export type LMS = readonly [L: number, M: number, S: number];
export type WhoMetric = 'weight' | 'length' | 'head';

/** Weight-for-age, boys (kg). */
const WEIGHT: LMS[] = [
  [0.3487, 3.3464, 0.14602],
  [0.2297, 4.4709, 0.13395],
  [0.197, 5.5675, 0.12385],
  [0.1738, 6.3762, 0.11727],
  [0.1553, 7.0023, 0.11316],
  [0.1395, 7.5105, 0.1108],
  [0.1257, 7.934, 0.10958],
  [0.1134, 8.297, 0.10902],
  [0.1021, 8.6151, 0.10882],
  [0.0917, 8.9014, 0.10881],
  [0.082, 9.1649, 0.10891],
  [0.073, 9.4122, 0.10906],
  [0.0644, 9.6479, 0.10925],
  [0.0563, 9.8749, 0.10949],
  [0.0487, 10.0953, 0.10976],
  [0.0413, 10.3108, 0.11007],
  [0.0343, 10.5228, 0.11041],
  [0.0275, 10.7319, 0.11079],
  [0.0211, 10.9385, 0.11119],
  [0.0148, 11.143, 0.11164],
  [0.0087, 11.3462, 0.11211],
  [0.0029, 11.5486, 0.11261],
  [-0.0028, 11.7504, 0.11314],
  [-0.0083, 11.9514, 0.11369],
  [-0.0137, 12.1515, 0.11426],
];

/** Length-for-age, boys (cm); L = 1 throughout. */
const LENGTH: LMS[] = [
  [1, 49.8842, 0.03795],
  [1, 54.7244, 0.03557],
  [1, 58.4249, 0.03424],
  [1, 61.4292, 0.03328],
  [1, 63.886, 0.03257],
  [1, 65.9026, 0.03204],
  [1, 67.6236, 0.03165],
  [1, 69.1645, 0.03139],
  [1, 70.5994, 0.03124],
  [1, 71.9687, 0.03117],
  [1, 73.2812, 0.03118],
  [1, 74.5388, 0.03125],
  [1, 75.7488, 0.03137],
  [1, 76.9186, 0.03154],
  [1, 78.0497, 0.03174],
  [1, 79.1458, 0.03197],
  [1, 80.2113, 0.03222],
  [1, 81.2487, 0.0325],
  [1, 82.2587, 0.03279],
  [1, 83.2418, 0.0331],
  [1, 84.1996, 0.03342],
  [1, 85.1348, 0.03376],
  [1, 86.0477, 0.0341],
  [1, 86.941, 0.03445],
  [1, 87.8161, 0.03479],
];

/** Head-circumference-for-age, boys (cm); L = 1 throughout. */
const HEAD: LMS[] = [
  [1, 34.4618, 0.03686],
  [1, 37.2759, 0.03133],
  [1, 39.1285, 0.02997],
  [1, 40.5135, 0.02918],
  [1, 41.6317, 0.02868],
  [1, 42.5576, 0.02837],
  [1, 43.3306, 0.02817],
  [1, 43.9803, 0.02804],
  [1, 44.53, 0.02796],
  [1, 44.9998, 0.02792],
  [1, 45.4051, 0.02789],
  [1, 45.7573, 0.02789],
  [1, 46.0661, 0.02789],
  [1, 46.3395, 0.02791],
  [1, 46.5811, 0.02793],
  [1, 46.7965, 0.02795],
  [1, 46.9886, 0.02798],
  [1, 47.1607, 0.02801],
  [1, 47.3163, 0.02804],
  [1, 47.4565, 0.02807],
  [1, 47.5838, 0.02811],
  [1, 47.6997, 0.02814],
  [1, 47.8059, 0.02817],
  [1, 47.9037, 0.0282],
  [1, 47.9939, 0.02824],
];

export const WHO_BOYS: Record<WhoMetric, LMS[]> = {
  weight: WEIGHT,
  length: LENGTH,
  head: HEAD,
};

export const WHO_MAX_MONTH = 24;

/** LMS interpolated linearly at a fractional age in months (clamped 0–24). */
export function lmsAt(metric: WhoMetric, ageMonths: number): LMS {
  const table = WHO_BOYS[metric];
  const t = Math.max(0, Math.min(WHO_MAX_MONTH, ageMonths));
  const lo = Math.floor(t);
  const hi = Math.min(WHO_MAX_MONTH, lo + 1);
  const frac = t - lo;
  const [l1, m1, s1] = table[lo];
  const [l2, m2, s2] = table[hi];
  return [l1 + (l2 - l1) * frac, m1 + (m2 - m1) * frac, s1 + (s2 - s1) * frac];
}
