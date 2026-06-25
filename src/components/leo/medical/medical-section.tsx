'use client';

import { useState } from 'react';
import {
  CalendarClock,
  Check,
  Pill,
  Plus,
  Syringe,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLeoStore, useNow, formatDateTime } from '@/lib/leo';
import type { MedicalEntry } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { MedicalForm } from './medical-form';

/** NHS routine immunisation schedule (first year). */
const NHS_VACCINES = [
  { id: '8w', weeks: 8, label: '8 weeks', detail: '6-in-1 · Rotavirus · MenB' },
  {
    id: '12w',
    weeks: 12,
    label: '12 weeks',
    detail: '6-in-1 · Pneumococcal · Rotavirus',
  },
  { id: '16w', weeks: 16, label: '16 weeks', detail: '6-in-1 · MenB' },
  {
    id: '1y',
    weeks: 52,
    label: '1 year',
    detail: 'Hib/MenC · MMR · Pneumococcal · MenB',
  },
];

const DAY = 86_400_000;
const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const sameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);

function relDay(ts: number, nowMs: number): string {
  const d = Math.round((startOfDay(ts) - startOfDay(nowMs)) / DAY);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return 'yesterday';
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}

export function MedicalSection() {
  const profile = useLeoStore((s) => s.profile);
  const medical = useLeoStore((s) => s.medical);
  const createMedical = useLeoStore((s) => s.createMedical);
  const removeMedical = useLeoStore((s) => s.removeMedical);
  const nowMs = useNow(60_000);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalEntry | undefined>();

  // Vitamin D
  const vitaminToday = medical.find(
    (m) =>
      m.kind === 'medication' &&
      m.title === 'Vitamin D' &&
      sameDay(m.at, nowMs),
  );
  const vitaminStreak = (() => {
    const days = new Set(
      medical
        .filter((m) => m.kind === 'medication' && m.title === 'Vitamin D')
        .map((m) => startOfDay(m.at)),
    );
    let streak = 0;
    let cursor = startOfDay(nowMs);
    while (days.has(cursor)) {
      streak++;
      cursor -= DAY;
    }
    return streak;
  })();

  async function toggleVitamin() {
    if (vitaminToday) await removeMedical(vitaminToday.id);
    else
      await createMedical({
        kind: 'medication',
        title: 'Vitamin D',
        at: nowMs,
        done: true,
      });
  }

  // Appointments
  const appointments = medical
    .filter((m) => m.kind === 'appointment')
    .sort((a, b) => a.at - b.at);
  const upcoming = appointments.filter((a) => a.at >= startOfDay(nowMs));

  // Vaccinations
  async function toggleVaccine(v: (typeof NHS_VACCINES)[number]) {
    const done = medical.find(
      (m) => m.kind === 'vaccination' && m.scheduleId === v.id,
    );
    if (done) await removeMedical(done.id);
    else
      await createMedical({
        kind: 'vaccination',
        scheduleId: v.id,
        title: `${v.label} immunisations`,
        at: nowMs,
        done: true,
      });
  }

  return (
    <div className="space-y-4">
      {/* Vitamin D */}
      <Card className="flex items-center gap-3 border-gold-200 bg-gold-50 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-100 text-gold-700">
          <Pill className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-medium text-ink-900">Vitamin D</p>
          <p className="text-xs text-ink-600">
            {vitaminStreak > 0
              ? `${vitaminStreak}-day streak 🔥`
              : 'A daily drop for little ones'}
          </p>
        </div>
        <Button
          onClick={toggleVitamin}
          size="sm"
          className={
            vitaminToday
              ? 'bg-ink-700 hover:bg-ink-800'
              : 'bg-gold-500 text-ink-900 hover:bg-gold-400'
          }
        >
          {vitaminToday ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Given
            </>
          ) : (
            'Give today'
          )}
        </Button>
      </Card>

      {/* Appointments */}
      <Card className="border-ink-300/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <CalendarClock className="h-5 w-5 text-aegean-500" /> Appointments
          </h2>
          <Button
            onClick={() => {
              setEditing(undefined);
              setSheetOpen(true);
            }}
            size="sm"
            variant="outline"
            className="border-aegean-300 text-aegean-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        {upcoming.length === 0 ? (
          <p className="py-2 text-sm text-ink-500">No upcoming appointments.</p>
        ) : (
          <div>
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {a.title}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDateTime(a.at)}
                    {a.location ? ` · ${a.location}` : ''}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {relDay(a.at, nowMs)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMedical(a.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vaccinations */}
      <Card className="border-ink-300/40 p-4">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <Syringe className="h-5 w-5 text-rose-500" /> Immunisations
        </h2>
        <p className="mb-3 text-xs text-ink-500">NHS routine schedule</p>
        <div className="space-y-2">
          {NHS_VACCINES.map((v) => {
            const done = medical.find(
              (m) => m.kind === 'vaccination' && m.scheduleId === v.id,
            );
            const due = profile ? profile.birth + v.weeks * 7 * DAY : null;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleVaccine(v)}
                className="flex w-full items-center gap-3 rounded-xl border border-ink-300/40 p-3 text-left transition-colors hover:bg-parchment-50"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? 'border-sage-600 bg-ink-700 text-white'
                      : 'border-ink-300/50'
                  }`}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{v.label}</p>
                  <p className="truncate text-xs text-ink-500">{v.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-400">
                  {done ? 'Done' : due != null ? relDay(due, nowMs) : ''}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing ? 'Edit appointment' : 'Add appointment'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <MedicalForm entry={editing} onDone={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
