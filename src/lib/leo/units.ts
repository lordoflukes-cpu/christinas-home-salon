/**
 * Unit helpers. Canonical storage is metric (grams, cm); weight is also shown
 * in lb/oz (UK red-book style).
 */

const GRAMS_PER_OZ = 28.349523125;
const OZ_PER_LB = 16;

/** "7 lb 8 oz" from grams. */
export function gramsToLbOz(grams: number): string {
  const totalOz = Math.round(grams / GRAMS_PER_OZ);
  const lb = Math.floor(totalOz / OZ_PER_LB);
  const oz = totalOz % OZ_PER_LB;
  return `${lb} lb ${oz} oz`;
}

/** Convert lb + oz to grams (for input). */
export function lbOzToGrams(lb: number, oz: number): number {
  return Math.round((lb * OZ_PER_LB + oz) * GRAMS_PER_OZ);
}

/** Split grams into { lb, oz } for editing. */
export function gramsToLbOzParts(grams: number): { lb: number; oz: number } {
  const totalOz = Math.round(grams / GRAMS_PER_OZ);
  return { lb: Math.floor(totalOz / OZ_PER_LB), oz: totalOz % OZ_PER_LB };
}

/** Kilograms with one decimal, e.g. "3.4 kg". */
export function gramsToKg(grams: number): string {
  return `${(grams / 1000).toFixed(2).replace(/0$/, '')} kg`;
}

/** Full weight label, e.g. "3.4 kg · 7 lb 8 oz". */
export function formatWeight(grams: number): string {
  return `${gramsToKg(grams)} · ${gramsToLbOz(grams)}`;
}

/** Length/height label, e.g. "51 cm". */
export function formatLength(cm: number): string {
  const rounded = Math.round(cm * 10) / 10;
  return `${rounded} cm`;
}
