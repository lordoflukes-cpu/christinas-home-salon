'use client';

import { useMemo, useState } from 'react';
import { Milk, Droplets, Moon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  formatElapsed,
  startOfDay,
  dailySeries,
  hourlySeries,
  rangeSummary,
  dayMetricValue,
  type DayStat,
  type HourStat,
  type TrendMetric,
  type TrendDir,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { Segmented } from '../forms/feed-form';
import { TodayGlance } from '../home/today-glance';

type Range = 'day' | 'week' | 'month';

const HOUR = 3_600_000;

const RANGE_OPTS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const METRIC_OPTS = [
  { value: 'sleep', label: 'Sleep' },
  { value: 'feeds', label: 'Feeds' },
  { value: 'nappies', label: 'Nappies' },
];

const METRIC_META: Record<
  TrendMetric,
  { label: string; icon: typeof Moon; tint: string; unit: string }
> = {
  sleep: { label: 'sleep', icon: Moon, tint: 'text-night-600', unit: '/day' },
  feeds: { label: 'feeds', icon: Milk, tint: 'text-rose-500', unit: '/day' },
  nappies: {
    label: 'nappies',
    icon: Droplets,
    tint: 'text-aegean-500',
    unit: '/day',
  },
};

function fmtAvg(metric: TrendMetric, v: number): string {
  if (metric === 'sleep') return v > 0 ? formatElapsed(Math.round(v)) : '—';
  return (Math.round(v * 10) / 10).toString();
}

/** Short tick label for the y-axis. */
function fmtTick(metric: TrendMetric, v: number): string {
  if (metric === 'sleep') return `${Math.round(v / HOUR)}h`;
  return String(Math.round(v));
}

function dayNarrow(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'narrow' });
}
function dateShort(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/** A "nice" round axis top + its value (sleep → whole hours, counts → ints). */
function niceMax(metric: TrendMetric, max: number): number {
  if (max <= 0) return metric === 'sleep' ? HOUR : 1;
  if (metric === 'sleep') return Math.ceil(max / HOUR) * HOUR;
  return Math.ceil(max);
}

function TrendChip({ dir, metric }: { dir: TrendDir; metric: TrendMetric }) {
  const Icon = dir === 'up' ? ArrowUp : dir === 'down' ? ArrowDown : Minus;
  const tone =
    dir === 'steady'
      ? 'bg-parchment-100 text-ink-500'
      : metric === 'sleep'
        ? dir === 'up'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-600'
        : 'bg-parchment-100 text-ink-600';
  const word = dir === 'steady' ? 'steady' : dir === 'up' ? 'up' : 'down';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone,
      )}
    >
      <Icon className="h-3 w-3" /> {word} vs last
    </span>
  );
}

/**
 * Detailed custom-SVG bar chart: y-axis scale + gridlines, a label under every
 * bar, a dashed average line, and stacked segments (night/day for sleep,
 * wet/dirty for nappies). No charting library.
 */
function BarChart({
  series,
  metric,
  avg,
  selected,
  onSelect,
}: {
  series: DayStat[];
  metric: TrendMetric;
  avg: number;
  selected: number;
  onSelect: (i: number) => void;
}) {
  const W = 320;
  const H = 168;
  const padL = 24; // y-axis labels
  const padT = 8;
  const padB = 20; // x-axis labels
  const plotW = W - padL;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;

  const rawMax = Math.max(...series.map((d) => dayMetricValue(d, metric)), 0);
  const top = niceMax(metric, rawMax);
  const n = series.length;
  const gap = n > 14 ? 1.5 : 4;
  const bw = (plotW - gap * (n - 1)) / n;
  const h = (v: number) => (top > 0 ? (v / top) * plotH : 0);
  const x = (i: number) => padL + i * (bw + gap);

  const gridFracs = [1, 2 / 3, 1 / 3];
  const avgY = baseY - h(avg);
  const labelEvery = n > 14 ? 5 : 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`${metric} per day`}
    >
      {/* gridlines + y labels */}
      {gridFracs.map((f) => {
        const gy = baseY - plotH * f;
        return (
          <g key={f}>
            <line
              x1={padL}
              y1={gy}
              x2={W}
              y2={gy}
              className="stroke-ink-200/60"
              strokeWidth="1"
            />
            <text
              x={padL - 3}
              y={gy + 3}
              textAnchor="end"
              className="fill-ink-400 text-[8px]"
            >
              {fmtTick(metric, top * f)}
            </text>
          </g>
        );
      })}
      {/* baseline */}
      <line
        x1={padL}
        y1={baseY}
        x2={W}
        y2={baseY}
        className="stroke-ink-300"
        strokeWidth="1"
      />

      {series.map((d, i) => {
        const bx = x(i);
        const isSel = i === selected;
        const isToday = i === n - 1;

        // Stack segments bottom→top per metric.
        let segs: { v: number; cls: string }[];
        if (metric === 'sleep') {
          segs = [
            { v: d.nightSleepMs ?? 0, cls: 'fill-night-600' },
            { v: d.daySleepMs ?? 0, cls: 'fill-night-300' },
          ];
        } else if (metric === 'nappies') {
          segs = [
            { v: d.wet, cls: 'fill-aegean-400' },
            { v: d.dirty, cls: 'fill-amber-500' },
          ];
        } else {
          segs = [{ v: d.feeds, cls: 'fill-rose-400' }];
        }

        let yCursor = baseY;
        const total = dayMetricValue(d, metric);
        return (
          <g
            key={d.dayStart}
            onClick={() => onSelect(i)}
            className="cursor-pointer"
          >
            <rect
              x={bx}
              y={padT}
              width={bw}
              height={plotH}
              className={isSel ? 'fill-gold-400/15' : 'fill-transparent'}
            />
            {total > 0 &&
              segs.map((s, si) => {
                const sh = h(s.v);
                if (sh <= 0) return null;
                yCursor -= sh;
                return (
                  <rect
                    key={si}
                    x={bx}
                    y={yCursor}
                    width={bw}
                    height={sh}
                    className={cn(s.cls, isSel ? 'opacity-100' : 'opacity-80')}
                  />
                );
              })}
            {/* x label */}
            {(i % labelEvery === 0 || isToday) && (
              <text
                x={bx + bw / 2}
                y={H - 6}
                textAnchor="middle"
                className={cn(
                  'text-[8px]',
                  isToday ? 'fill-gold-700' : 'fill-ink-400',
                )}
              >
                {n <= 7
                  ? dayNarrow(d.dayStart)
                  : new Date(d.dayStart).getDate()}
              </text>
            )}
          </g>
        );
      })}

      {/* average line */}
      {avg > 0 && (
        <g>
          <line
            x1={padL}
            y1={avgY}
            x2={W}
            y2={avgY}
            className="stroke-ink-500"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={W - 1}
            y={avgY - 2}
            textAnchor="end"
            className="fill-ink-500 text-[8px]"
          >
            avg
          </text>
        </g>
      )}
    </svg>
  );
}

function Legend({ metric }: { metric: TrendMetric }) {
  if (metric === 'sleep') {
    return (
      <div className="flex justify-center gap-4 text-[11px] text-ink-500">
        <Swatch cls="bg-night-600" label="Night" />
        <Swatch cls="bg-night-300" label="Day naps" />
      </div>
    );
  }
  if (metric === 'nappies') {
    return (
      <div className="flex justify-center gap-4 text-[11px] text-ink-500">
        <Swatch cls="bg-aegean-400" label="Wet" />
        <Swatch cls="bg-amber-500" label="Dirty" />
      </div>
    );
  }
  return null;
}

function Swatch({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn('h-2.5 w-2.5 rounded-sm', cls)} /> {label}
    </span>
  );
}

/** Full breakdown for the tapped day — every metric at once. */
function DayReadout({ d }: { d: DayStat }) {
  const night = d.nightSleepMs ?? 0;
  const day = d.daySleepMs ?? 0;
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <Stat
        icon={Moon}
        tint="text-night-600"
        value={d.sleepMs > 0 ? formatElapsed(d.sleepMs) : '—'}
        sub={
          d.sleepMs > 0
            ? `${formatElapsed(night)} night · ${formatElapsed(day)} day`
            : 'sleep'
        }
      />
      <Stat
        icon={Milk}
        tint="text-rose-500"
        value={String(d.feeds)}
        sub="feeds"
      />
      <Stat
        icon={Droplets}
        tint="text-aegean-500"
        value={`${d.wet}/${d.dirty}`}
        sub="wet / dirty"
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  tint,
  value,
  sub,
}: {
  icon: typeof Moon;
  tint: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon className={cn('h-4 w-4', tint)} />
      <span className="font-display text-base font-semibold text-ink-900">
        {value}
      </span>
      <span className="text-[10px] leading-tight text-ink-500">{sub}</span>
    </div>
  );
}

/** A 24-hour timeline of one day: sleep fill, feed bars, nappy dots. */
function DayTimeline({ hours }: { hours: HourStat[] }) {
  const W = 320;
  const labelW = 42;
  const rowH = 20;
  const rowGap = 8;
  const cellW = (W - labelW) / 24;
  const H = rowH * 3 + rowGap * 2 + 16;
  const maxFeeds = Math.max(1, ...hours.map((h) => h.feeds));
  const cx = (hour: number) => labelW + hour * cellW + cellW / 2;
  const rows = [0, 1, 2];
  const rowY = (r: number) => r * (rowH + rowGap);
  const ticks = [0, 6, 12, 18, 23];
  const tickLabel = (h: number) =>
    h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Today by hour"
    >
      {['Sleep', 'Feeds', 'Nappies'].map((label, r) => (
        <text
          key={label}
          x={0}
          y={rowY(r) + rowH / 2 + 3}
          className="fill-ink-500 text-[9px]"
        >
          {label}
        </text>
      ))}

      {rows.map((r) => (
        <rect
          key={`bg${r}`}
          x={labelW}
          y={rowY(r)}
          width={W - labelW}
          height={rowH}
          rx="3"
          className="fill-parchment-100"
        />
      ))}

      {hours.map((h) => {
        const x = labelW + h.hour * cellW;
        return (
          <g key={h.hour}>
            {/* Sleep fill (opacity ∝ minutes asleep) */}
            {h.sleepMs > 0 && (
              <rect
                x={x}
                y={rowY(0)}
                width={cellW}
                height={rowH}
                className="fill-night-500"
                opacity={Math.max(0.12, Math.min(1, h.sleepMs / HOUR))}
              />
            )}
            {/* Feed bars */}
            {h.feeds > 0 && (
              <rect
                x={x + cellW * 0.2}
                y={rowY(1) + rowH * (1 - h.feeds / maxFeeds)}
                width={cellW * 0.6}
                height={rowH * (h.feeds / maxFeeds)}
                className="fill-rose-400"
              />
            )}
            {/* Nappy dots */}
            {h.wet > 0 && (
              <circle
                cx={cx(h.hour)}
                cy={rowY(2) + rowH * 0.35}
                r={Math.min(2.6, cellW / 3)}
                className="fill-aegean-400"
              />
            )}
            {h.dirty > 0 && (
              <circle
                cx={cx(h.hour)}
                cy={rowY(2) + rowH * 0.7}
                r={Math.min(2.6, cellW / 3)}
                className="fill-amber-500"
              />
            )}
          </g>
        );
      })}

      {/* hour ticks */}
      {ticks.map((h) => (
        <text
          key={h}
          x={labelW + h * cellW + cellW / 2}
          y={H - 3}
          textAnchor="middle"
          className="fill-ink-400 text-[8px]"
        >
          {tickLabel(h)}
        </text>
      ))}
    </svg>
  );
}

/**
 * The Everyday trends visual: Day/Week/Month + Sleep/Feeds/Nappies toggles
 * over a detailed custom-SVG chart (scale, labels, average line, split bars,
 * full per-day breakdown) plus a 24-hour Day view. Pure on-device data.
 */
export function EverydayTrends() {
  const feeds = useLeoStore((s) => s.feeds);
  const diapers = useLeoStore((s) => s.diapers);
  const sleeps = useLeoStore((s) => s.sleeps);
  const now = useNow(300_000);

  const [range, setRange] = useState<Range>('week');
  const [metric, setMetric] = useState<TrendMetric>('sleep');
  const [selected, setSelected] = useState<number | null>(null);

  const days = range === 'month' ? 30 : 7;
  const input = useMemo(
    () => ({ feeds, diapers, sleeps }),
    [feeds, diapers, sleeps],
  );

  const series = useMemo(
    () => dailySeries(input, days, now),
    [input, days, now],
  );
  const prev = useMemo(
    () => dailySeries(input, days, now - days * 86_400_000),
    [input, days, now],
  );
  const summary = useMemo(() => rangeSummary(series, prev), [series, prev]);
  const hours = useMemo(
    () => hourlySeries(input, startOfDay(now), now),
    [input, now],
  );

  if (range === 'day') {
    return (
      <div className="space-y-3">
        <Segmented
          value={range}
          onChange={(v) => setRange(v as Range)}
          options={RANGE_OPTS}
        />
        <Card className="border-ink-300/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Today, hour by hour
          </p>
          <DayTimeline hours={hours} />
        </Card>
        <TodayGlance linkToEveryday={false} />
      </div>
    );
  }

  const sel = selected ?? series.length - 1;
  const selDay = series[sel];
  const m = METRIC_META[metric];
  const t = summary[metric];

  return (
    <div className="space-y-3">
      <Segmented
        value={range}
        onChange={(v) => {
          setRange(v as Range);
          setSelected(null);
        }}
        options={RANGE_OPTS}
      />
      <Segmented
        value={metric}
        onChange={(v) => setMetric(v as TrendMetric)}
        options={METRIC_OPTS}
      />

      <Card className="space-y-3 border-ink-300/40 p-4">
        {/* Selected-day header */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
            {dateShort(selDay.dayStart)}
            {sel === series.length - 1 ? ' · today' : ''}
          </span>
          <span className="text-[11px] text-ink-400">
            tap a bar for any day
          </span>
        </div>

        {/* Full breakdown for the selected day */}
        <DayReadout d={selDay} />

        <BarChart
          series={series}
          metric={metric}
          avg={t.avg}
          selected={sel}
          onSelect={setSelected}
        />

        <Legend metric={metric} />

        {/* Period average + trend */}
        <div className="flex items-center justify-between border-t border-ink-200/60 pt-3">
          <div>
            <div className="font-display text-xl text-ink-900">
              {fmtAvg(metric, t.avg)}
              <span className="ml-1 text-xs font-normal text-ink-400">
                avg {m.label}
                {m.unit}
              </span>
            </div>
            <div className="text-[11px] text-ink-500">
              over the last {days} days
            </div>
          </div>
          <TrendChip dir={t.dir} metric={metric} />
        </div>
      </Card>
    </div>
  );
}
