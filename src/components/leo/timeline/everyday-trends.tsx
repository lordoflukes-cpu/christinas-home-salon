'use client';

import { useMemo, useState } from 'react';
import { Milk, Droplets, Moon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  useLeoStore,
  useNow,
  formatElapsed,
  dailySeries,
  rangeSummary,
  dayMetricValue,
  type DayStat,
  type TrendMetric,
  type TrendDir,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import { Segmented } from '../forms/feed-form';
import { TodayGlance } from '../home/today-glance';

type Range = 'day' | 'week' | 'month';

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
  { label: string; icon: typeof Moon; bar: string; tint: string; unit: string }
> = {
  sleep: {
    label: 'sleep',
    icon: Moon,
    bar: 'fill-night-500',
    tint: 'text-night-600',
    unit: '/day',
  },
  feeds: {
    label: 'feeds',
    icon: Milk,
    bar: 'fill-rose-400',
    tint: 'text-rose-500',
    unit: '/day',
  },
  nappies: {
    label: 'nappies',
    icon: Droplets,
    bar: 'fill-aegean-400',
    tint: 'text-aegean-500',
    unit: '/day',
  },
};

function fmtValue(metric: TrendMetric, v: number): string {
  if (metric === 'sleep') return v > 0 ? formatElapsed(v) : '0h';
  return String(Math.round(v));
}

function fmtAvg(metric: TrendMetric, v: number): string {
  if (metric === 'sleep') return v > 0 ? formatElapsed(Math.round(v)) : '—';
  return (Math.round(v * 10) / 10).toString();
}

function dayShort(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'short' });
}
function dateShort(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function TrendChip({ dir, metric }: { dir: TrendDir; metric: TrendMetric }) {
  // For sleep, up is good (green); for feeds/nappies a change is neutral.
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

/** A compact custom-SVG bar chart (one bar per day) — no charting library. */
function BarChart({
  series,
  metric,
  selected,
  onSelect,
}: {
  series: DayStat[];
  metric: TrendMetric;
  selected: number;
  onSelect: (i: number) => void;
}) {
  const W = 320;
  const H = 132;
  const padB = 18; // room for labels
  const max = Math.max(1, ...series.map((d) => dayMetricValue(d, metric)));
  const n = series.length;
  const gap = n > 14 ? 1.5 : 4;
  const bw = (W - gap * (n - 1)) / n;
  const chartH = H - padB;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`${metric} per day`}
    >
      {/* baseline */}
      <line
        x1="0"
        y1={chartH}
        x2={W}
        y2={chartH}
        className="stroke-ink-200"
        strokeWidth="1"
      />
      {series.map((d, i) => {
        const v = dayMetricValue(d, metric);
        const h = v > 0 ? Math.max(2, (v / max) * (chartH - 4)) : 0;
        const x = i * (bw + gap);
        const y = chartH - h;
        const isSel = i === selected;
        return (
          <g
            key={d.dayStart}
            onClick={() => onSelect(i)}
            className="cursor-pointer"
          >
            {/* full-height hit area */}
            <rect
              x={x}
              y={0}
              width={bw}
              height={chartH}
              className="fill-transparent"
            />
            <rect
              x={x}
              y={y}
              width={bw}
              height={h}
              rx={Math.min(2, bw / 3)}
              className={cn(
                METRIC_META[metric].bar,
                isSel ? 'opacity-100' : 'opacity-70',
              )}
            />
            {isSel && (
              <rect
                x={x}
                y={0}
                width={bw}
                height={chartH}
                className="fill-gold-400/10"
              />
            )}
          </g>
        );
      })}
      {/* end labels (weekday for week, date for longer ranges) */}
      <text x="0" y={H - 4} className="fill-ink-400 text-[9px]">
        {n <= 7 ? dayShort(series[0].dayStart) : dateShort(series[0].dayStart)}
      </text>
      <text
        x={W}
        y={H - 4}
        textAnchor="end"
        className="fill-ink-400 text-[9px]"
      >
        today
      </text>
    </svg>
  );
}

/**
 * The Everyday trends visual: a Day/Week/Month range toggle and a
 * Sleep/Feeds/Nappies metric switch over a custom-SVG bar chart, with averages
 * and a "vs last period" trend. Pure on-device data — no AI, no network.
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

  if (range === 'day') {
    return (
      <div className="space-y-3">
        <Segmented
          value={range}
          onChange={(v) => setRange(v as Range)}
          options={RANGE_OPTS}
        />
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

      <Card className="border-ink-300/40 p-4">
        {/* Selected-day readout */}
        <div className="mb-2 flex items-baseline justify-between">
          <span className="flex items-center gap-1.5 text-sm text-ink-600">
            <m.icon className={cn('h-4 w-4', m.tint)} />
            {dateShort(selDay.dayStart)}
            {sel === series.length - 1 ? ' · today' : ''}
          </span>
          <span className="font-display text-lg text-ink-900">
            {fmtValue(metric, dayMetricValue(selDay, metric))}
          </span>
        </div>

        <BarChart
          series={series}
          metric={metric}
          selected={sel}
          onSelect={setSelected}
        />

        {/* Averages + trend */}
        <div className="mt-3 flex items-center justify-between border-t border-ink-200/60 pt-3">
          <div>
            <div className="font-display text-xl text-ink-900">
              {fmtAvg(metric, t.avg)}
              <span className="ml-1 text-xs font-normal text-ink-400">
                avg {m.unit}
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
