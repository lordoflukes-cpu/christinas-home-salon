'use client';

import { useMemo, useState } from 'react';
import {
  percentileCurve,
  plottedPoints,
  CHART_PERCENTILES,
  METRIC_LABELS,
  formatDateTime,
  type WhoMetric,
} from '@/lib/leo';
import type { GrowthEntry } from '@/lib/leo';

const W = 340;
const H = 240;
const PAD = { l: 30, r: 10, t: 12, b: 24 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

// Lightest → darkest band fills (P3–P97 outer, P15–P85 inner).
const BAND_FILL = 'fill-gold-200/40';
const BAND_FILL_INNER = 'fill-gold-200/60';

export function GrowthChart({
  metric,
  birth,
  entries,
}: {
  metric: WhoMetric;
  birth: number;
  entries: GrowthEntry[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const { maxMonth, yMin, yMax, curves, points } = useMemo(() => {
    const pts = plottedPoints(metric, birth, entries);
    const latest = pts.length ? pts[pts.length - 1].ageMonths : 0;
    const maxMonth = Math.min(24, Math.max(4, Math.ceil(latest + 1)));
    const curves = CHART_PERCENTILES.map((p) => ({
      p,
      pts: percentileCurve(metric, p).filter((c) => c.month <= maxMonth),
    }));
    const lo = curves[0].pts; // P3
    const hi = curves[curves.length - 1].pts; // P97
    let yMin = Math.min(...lo.map((c) => c.value));
    let yMax = Math.max(...hi.map((c) => c.value));
    for (const pt of pts) {
      yMin = Math.min(yMin, pt.value);
      yMax = Math.max(yMax, pt.value);
    }
    const padY = (yMax - yMin) * 0.06 || 1;
    return {
      maxMonth,
      yMin: yMin - padY,
      yMax: yMax + padY,
      curves,
      points: pts,
    };
  }, [metric, birth, entries]);

  const x = (m: number) => PAD.l + (m / maxMonth) * PLOT_W;
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;

  const linePath = (cps: { month: number; value: number }[]) =>
    cps.map((c, i) => `${i ? 'L' : 'M'}${x(c.month)} ${y(c.value)}`).join(' ');

  const bandPath = (
    lower: { month: number; value: number }[],
    upper: { month: number; value: number }[],
  ) => {
    const up = upper.map((c) => `${x(c.month)} ${y(c.value)}`).join(' L');
    const down = [...lower]
      .reverse()
      .map((c) => `${x(c.month)} ${y(c.value)}`)
      .join(' L');
    return `M${up} L${down} Z`;
  };

  const byP = (p: number) => curves.find((c) => c.p === p)!.pts;
  const selectedPoint = points.find((p) => p.id === selected);
  const { unit } = METRIC_LABELS[metric];

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMin + ((yMax - yMin) * i) / yTicks;
    return { v, y: y(v) };
  });
  const monthTicks = Array.from(
    { length: Math.floor(maxMonth / (maxMonth > 12 ? 4 : 2)) + 1 },
    (_, i) => i * (maxMonth > 12 ? 4 : 2),
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Growth chart"
      >
        {/* y grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={t.y}
              y2={t.y}
              className="stroke-cream-200"
              strokeWidth={1}
            />
            <text
              x={PAD.l - 4}
              y={t.y + 3}
              textAnchor="end"
              className="fill-sage-400 text-[8px]"
            >
              {t.v.toFixed(unit === 'kg' ? 1 : 0)}
            </text>
          </g>
        ))}
        {/* x labels */}
        {monthTicks.map((m) => (
          <text
            key={m}
            x={x(m)}
            y={H - 8}
            textAnchor="middle"
            className="fill-sage-400 text-[8px]"
          >
            {m}m
          </text>
        ))}

        {/* WHO bands */}
        <path d={bandPath(byP(3), byP(97))} className={BAND_FILL} />
        <path d={bandPath(byP(15), byP(85))} className={BAND_FILL_INNER} />
        {/* P50 median line */}
        <path
          d={linePath(byP(50))}
          className="fill-none stroke-gold-500/70"
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />

        {/* Leo's line + points — sepia ink, drawn on like a pen stroke */}
        {points.length > 1 && (
          <path
            d={linePath(
              points.map((p) => ({ month: p.ageMonths, value: p.value })),
            )}
            className="animate-ink-draw fill-none stroke-ink-700"
            style={
              {
                '--draw-length': '600',
                strokeDasharray: 600,
              } as React.CSSProperties
            }
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p) => (
          <circle
            key={p.id}
            cx={x(p.ageMonths)}
            cy={y(p.value)}
            r={selected === p.id ? 6 : 4.5}
            className="animate-ink-in cursor-pointer fill-ink-700 stroke-parchment-50"
            strokeWidth={2}
            onClick={() => setSelected(selected === p.id ? null : p.id)}
          />
        ))}
      </svg>

      {selectedPoint && (
        <div className="mt-1 rounded-lg bg-ink-900 px-3 py-2 text-center text-xs text-parchment-50">
          <span className="font-semibold">
            {selectedPoint.value.toFixed(unit === 'kg' ? 2 : 1)} {unit}
          </span>{' '}
          · {Math.round(selectedPoint.percentile)}th percentile
          <span className="block text-[10px] text-gold-200">
            {formatDateTime(selectedPoint.measuredAt)}
          </span>
        </div>
      )}
      {!selectedPoint && points.length > 0 && (
        <p className="mt-1 text-center text-[11px] text-ink-400">
          Tap a dot to see the value &amp; percentile
        </p>
      )}
      {points.length === 0 && (
        <p className="mt-1 text-center text-[11px] text-ink-400">
          Add a measurement to plot {METRIC_LABELS[metric].label.toLowerCase()}{' '}
          on the WHO curves
        </p>
      )}
    </div>
  );
}
