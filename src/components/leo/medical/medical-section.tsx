'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Check,
  Pill,
  Plus,
  Stethoscope,
  Syringe,
  Thermometer,
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
import { useLeoStore, useNow, formatDateTime, formatClock } from '@/lib/leo';
import type { MedicalEntry, MedicalKind, LeoEvent } from '@/lib/leo';
import { GreekKey } from '../decor/greek-key';
import { MedicalForm } from './medical-form';
import { DoctorSummarySheet } from './doctor-summary-sheet';
import { QuickAddSheet, type QuickAddState } from '../quick-add-sheet';

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
  const events = useLeoStore((s) => s.events);
  const createMedical = useLeoStore((s) => s.createMedical);
  const removeMedical = useLeoStore((s) => s.removeMedical);
  const removeEvent = useLeoStore((s) => s.removeEvent);
  const nowMs = useNow(60_000);

  const [formKind, setFormKind] = useState<MedicalKind>('appointment');
  const [editing, setEditing] = useState<MedicalEntry | undefined>();
  const [vaccine, setVaccine] = useState<{
    title: string;
    scheduleId: string;
  } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null);

  function openForm(kind: MedicalKind, entry?: MedicalEntry) {
    setFormKind(kind);
    setEditing(entry);
    setVaccine(null);
    setSheetOpen(true);
  }

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

  const upcoming = medical
    .filter((m) => m.kind === 'appointment')
    .sort((a, b) => a.at - b.at)
    .filter((a) => a.at >= startOfDay(nowMs));

  const notes = medical
    .filter((m) => m.kind === 'note')
    .sort((a, b) => b.at - a.at);

  // Medication log: medication events + non-VitD medical meds.
  const medLog = [
    ...events.filter((e) => e.kind === 'medication'),
    ...medical
      .filter((m) => m.kind === 'medication' && m.title !== 'Vitamin D')
      .map(
        (m): LeoEvent => ({
          id: m.id,
          kind: 'medication',
          at: m.at,
          medName: m.title,
          note: m.note,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }),
      ),
  ].sort((a, b) => b.at - a.at);

  // Symptoms timeline: symptom + temperature events.
  const symptomLog = events
    .filter((e) => e.kind === 'symptom' || e.kind === 'temperature')
    .sort((a, b) => b.at - a.at);

  return (
    <div className="space-y-4">
      {/* Doctor summary */}
      <button
        type="button"
        onClick={() => setSummaryOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-aegean-300 bg-aegean-50 p-4 text-left transition-colors hover:bg-aegean-100"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-aegean-100 text-aegean-700">
          <Stethoscope className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block font-display text-base font-semibold text-ink-900">
            Doctor summary
          </span>
          <span className="block text-xs text-ink-600">
            A clear recap of recent days to read out at an appointment
          </span>
        </span>
      </button>

      {/* Allergies */}
      <Card className="flex items-start gap-3 border-rose-200 bg-rose-50/60 p-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-medium text-ink-900">Allergies</p>
          <p className="text-sm text-ink-600">
            {profile?.allergies?.trim() || 'None recorded yet.'}
          </p>
        </div>
        <Link
          href={'/leo/settings' as Route}
          className="shrink-0 text-xs font-medium text-aegean-700 underline"
        >
          Edit
        </Link>
      </Card>

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
            onClick={() => openForm('appointment')}
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
                <button
                  type="button"
                  onClick={() => openForm('appointment', a)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-ink-900">
                    {a.title}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDateTime(a.at)}
                    {a.location ? ` · ${a.location}` : ''}
                  </p>
                </button>
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
        <p className="mb-3 text-xs text-ink-500">
          NHS routine schedule — tap to record date, batch &amp; any reaction
        </p>
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
                onClick={() => {
                  if (done) {
                    openForm('vaccination', done);
                  } else {
                    setVaccine({
                      title: `${v.label} immunisations`,
                      scheduleId: v.id,
                    });
                    setFormKind('vaccination');
                    setEditing(undefined);
                    setSheetOpen(true);
                  }
                }}
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
                  <p className="truncate text-xs text-ink-500">
                    {done
                      ? `Given ${formatDateTime(done.at)}${done.batch ? ` · batch ${done.batch}` : ''}${done.reaction ? ` · ${done.reaction}` : ''}`
                      : v.detail}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-ink-400">
                  {done ? 'Done' : due != null ? relDay(due, nowMs) : ''}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Medication log */}
      <LogCard
        title="Medication log"
        icon={Pill}
        tint="text-aegean-500"
        empty="No medication logged."
        onAdd={() => setQuickAdd({ kind: 'medication' })}
        rows={medLog}
        render={(e) => ({
          title: e.medName || 'Medication',
          sub: [e.dose, e.reason].filter(Boolean).join(' · '),
          time: formatDateTime(e.at),
        })}
        onDelete={(e) =>
          medical.some((m) => m.id === e.id)
            ? removeMedical(e.id)
            : removeEvent(e.id)
        }
        onEdit={(e) =>
          events.some((x) => x.id === e.id)
            ? setQuickAdd({ kind: 'medication', entry: e })
            : undefined
        }
      />

      {/* Symptoms timeline */}
      <LogCard
        title="Symptoms timeline"
        icon={Activity}
        tint="text-emerald-600"
        empty="No symptoms logged."
        onAdd={() => setQuickAdd({ kind: 'symptom' })}
        rows={symptomLog}
        render={(e) =>
          e.kind === 'temperature'
            ? {
                title: `Temperature ${e.tempC ?? '?'}°C`,
                sub: e.tempMethod ?? '',
                time: formatDateTime(e.at),
                Icon: Thermometer,
              }
            : {
                title: e.symptom || 'Symptom',
                sub: e.severity ?? '',
                time: formatDateTime(e.at),
                Icon: Activity,
              }
        }
        onDelete={(e) => removeEvent(e.id)}
        onEdit={(e) =>
          setQuickAdd({
            kind: e.kind === 'temperature' ? 'temperature' : 'symptom',
            entry: e,
          })
        }
      />

      {/* Red Book notes */}
      <Card className="border-ink-300/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Red Book notes
          </h2>
          <Button
            onClick={() => openForm('note')}
            size="sm"
            variant="outline"
            className="border-aegean-300 text-aegean-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        {notes.length === 0 ? (
          <p className="py-2 text-sm text-ink-500">
            Key notes from appointments and checks.
          </p>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => openForm('note', n)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm font-medium text-ink-900">{n.title}</p>
                  <p className="text-xs text-ink-500">{formatDateTime(n.at)}</p>
                  {n.note && (
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink-700">
                      {n.note}
                    </p>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMedical(n.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="border-ink-300/40">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-xl text-ink-900">
              {editing
                ? 'Edit'
                : formKind === 'vaccination'
                  ? 'Record vaccination'
                  : formKind === 'note'
                    ? 'Add note'
                    : 'Add appointment'}
            </SheetTitle>
            <GreekKey className="mt-2 h-2 w-24" />
          </SheetHeader>
          <MedicalForm
            kind={formKind}
            entry={editing}
            defaultTitle={vaccine?.title}
            scheduleId={vaccine?.scheduleId}
            onDone={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <DoctorSummarySheet
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />
      <QuickAddSheet state={quickAdd} onClose={() => setQuickAdd(null)} />
    </div>
  );
}

/** Compact add-able list card for medication / symptoms. */
function LogCard({
  title,
  icon: Icon,
  tint,
  empty,
  rows,
  render,
  onAdd,
  onDelete,
  onEdit,
}: {
  title: string;
  icon: typeof Pill;
  tint: string;
  empty: string;
  rows: LeoEvent[];
  render: (e: LeoEvent) => {
    title: string;
    sub?: string;
    time: string;
    Icon?: typeof Pill;
  };
  onAdd: () => void;
  onDelete: (e: LeoEvent) => void;
  onEdit?: (e: LeoEvent) => void;
}) {
  return (
    <Card className="border-ink-300/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <Icon className={`h-5 w-5 ${tint}`} /> {title}
        </h2>
        <Button
          onClick={onAdd}
          size="sm"
          variant="outline"
          className="border-aegean-300 text-aegean-700"
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="py-2 text-sm text-ink-500">{empty}</p>
      ) : (
        <div>
          {rows.slice(0, 30).map((e) => {
            const r = render(e);
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 border-b border-ink-300/40 py-2.5 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => onEdit?.(e)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-ink-900">
                    {r.title}
                  </p>
                  <p className="text-xs text-ink-500">
                    {r.time}
                    {r.sub ? ` · ${r.sub}` : ''}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(e)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
