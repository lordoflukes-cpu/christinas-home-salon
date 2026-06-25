'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  useLeoStore,
  ageInMonths,
  metricValue,
  percentileForMeasurement,
  formatWeight,
  formatLength,
  formatDateTime,
  METRIC_LABELS,
  type WhoMetric,
} from '@/lib/leo';
import type { GrowthEntry } from '@/lib/leo';
import { Segmented } from '../forms/feed-form';
import { GreekKey } from '../decor/greek-key';
import { GrowthChart } from './growth-chart';
import { GrowthForm } from './growth-form';

const METRICS: WhoMetric[] = ['weight', 'length', 'head'];

function ordinalPct(p: number): string {
  const n = Math.round(p);
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

export function GrowthSection() {
  const growth = useLeoStore((s) => s.growth);
  const profile = useLeoStore((s) => s.profile);
  const removeGrowth = useLeoStore((s) => s.removeGrowth);

  const [metric, setMetric] = useState<WhoMetric>('weight');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<GrowthEntry | undefined>();
  const [toDelete, setToDelete] = useState<string | null>(null);

  if (!profile) {
    return (
      <Card className="border-ink-300/40 p-6 text-center text-sm text-ink-600">
        Add Leo&apos;s birthday in Settings to track growth on the WHO curves.
      </Card>
    );
  }
  const birth = profile.birth;

  const latestWith = (key: keyof GrowthEntry) =>
    [...growth].reverse().find((e) => e[key] != null);

  const chips = METRICS.map((m) => {
    const key =
      m === 'weight'
        ? 'weightGrams'
        : m === 'length'
          ? 'lengthCm'
          : 'headCircCm';
    const entry = latestWith(key as keyof GrowthEntry);
    if (!entry) return { m, text: '—', pct: null as number | null };
    const value = metricValue(m, entry)!;
    const pct = percentileForMeasurement(
      m,
      ageInMonths(birth, entry.measuredAt),
      value,
    );
    const text =
      m === 'weight' ? formatWeight(entry.weightGrams!) : formatLength(value);
    return { m, text, pct };
  });

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }
  function openEdit(entry: GrowthEntry) {
    setEditing(entry);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* latest stats */}
      <div className="grid grid-cols-3 gap-2">
        {chips.map(({ m, text, pct }) => (
          <Card key={m} className="border-ink-300/40 p-3 text-center">
            <p className="text-[11px] font-medium text-ink-500">
              {METRIC_LABELS[m].label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink-900">
              {m === 'weight' ? text.split(' · ')[0] : text}
            </p>
            {pct != null && (
              <p className="mt-0.5 text-[11px] text-gold-700">
                {ordinalPct(pct)} pct
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* chart */}
      <Card className="border-ink-300/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Growth
          </h2>
          <Segmented
            value={metric}
            onChange={(v) => setMetric(v as WhoMetric)}
            options={METRICS.map((m) => ({
              value: m,
              label: METRIC_LABELS[m].label,
            }))}
          />
        </div>
        <GrowthChart metric={metric} birth={birth} entries={growth} />
        <p className="mt-2 text-center text-[10px] text-ink-400">
          Shaded bands = WHO boys 3rd–97th percentiles
        </p>
      </Card>

      <Button
        onClick={openAdd}
        size="lg"
        className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
      >
        <Plus className="mr-2 h-5 w-5" /> Add measurement
      </Button>

      {/* history */}
      {growth.length > 0 && (
        <Card className="border-ink-300/40 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            History
          </h3>
          <div>
            {[...growth].reverse().map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {[
                      e.weightGrams &&
                        formatWeight(e.weightGrams).split(' · ')[0],
                      e.lengthCm && formatLength(e.lengthCm),
                      e.headCircCm && `head ${e.headCircCm}cm`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDateTime(e.measuredAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(e)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4 text-ink-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setToDelete(e.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* add/edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing ? 'Edit measurement' : 'Add measurement'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <GrowthForm entry={editing} onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* delete confirm */}
      <Dialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this measurement?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) await removeGrowth(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
