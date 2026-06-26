'use client';

import { ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useLeoStore,
  useNow,
  CARE_TASK_PRESETS,
  presetToCareTask,
  nextCareDue,
  relativeDue,
  type CareTaskPreset,
} from '@/lib/leo';
import type { CareTask } from '@/lib/leo';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function RemindersPanel() {
  const profile = useLeoStore((s) => s.profile);
  const careTasks = useLeoStore((s) => s.careTasks);
  const createCareTask = useLeoStore((s) => s.createCareTask);
  const editCareTask = useLeoStore((s) => s.editCareTask);
  const now = useNow(60_000);

  if (!profile) return null;

  const byKind = (kind: string) => careTasks.find((t) => t.kind === kind);

  async function toggle(preset: CareTaskPreset, on: boolean) {
    const existing = byKind(preset.kind);
    if (existing) {
      await editCareTask(existing.id, { enabled: on });
    } else if (on) {
      await createCareTask({
        ...presetToCareTask(preset, Date.now()),
        enabled: true,
      });
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <ListChecks className="h-5 w-5 text-gold-600" />
        Care reminders
      </h2>
      <p className="mb-4 text-sm text-ink-600">
        Gentle recurring nudges shown in your Home <strong>agenda</strong> —
        they never send a notification. Tick them off as you go.
      </p>

      <div className="space-y-3">
        {CARE_TASK_PRESETS.map((preset) => {
          const task = byKind(preset.kind);
          const enabled = task?.enabled ?? false;
          return (
            <CareRow
              key={preset.kind}
              preset={preset}
              task={task}
              enabled={enabled}
              now={now}
              onToggle={(v) => void toggle(preset, v)}
              onEdit={(patch) => task && void editCareTask(task.id, patch)}
            />
          );
        })}
      </div>
    </Card>
  );
}

function CareRow({
  preset,
  task,
  enabled,
  now,
  onToggle,
  onEdit,
}: {
  preset: CareTaskPreset;
  task: CareTask | undefined;
  enabled: boolean;
  now: number;
  onToggle: (v: boolean) => void;
  onEdit: (patch: Partial<CareTask>) => void;
}) {
  const cadence = task?.cadence ?? preset.cadence;
  const time = task?.timeHHMM ?? preset.timeHHMM ?? '';
  const weekday = task?.weekday ?? preset.weekday ?? 0;
  const intervalDays = task?.intervalDays ?? preset.intervalDays ?? 7;

  return (
    <div className="rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3">
      <label className="flex items-start gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          className="mt-0.5"
        />
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
            <span>{preset.emoji}</span> {preset.label}
          </span>
          <span className="block text-xs text-ink-500">{preset.hint}</span>
          {enabled && task && (
            <span className="mt-0.5 block text-xs text-gold-700">
              Next: {relativeDue(nextCareDue(task, now), now)}
            </span>
          )}
        </span>
      </label>

      {enabled && task && (
        <div className="mt-3 space-y-2 pl-7">
          {cadence === 'everyN' && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-ink-500">Every</Label>
              <Input
                type="number"
                inputMode="numeric"
                defaultValue={intervalDays}
                min={1}
                max={90}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isNaN(n) && n >= 1 && n <= 90)
                    onEdit({ intervalDays: n });
                }}
                className="h-9 w-20"
              />
              <span className="text-xs text-ink-500">days</span>
            </div>
          )}

          {cadence === 'weekly' && (
            <div className="flex items-center gap-1">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onEdit({ weekday: i })}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    weekday === i
                      ? 'bg-ink-700 text-parchment-50'
                      : 'bg-parchment-100 text-ink-500 hover:bg-parchment-200',
                  )}
                  aria-label={`Weekday ${i}`}
                  aria-pressed={weekday === i}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {(cadence === 'daily' || cadence === 'weekly') && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-ink-500">Time</Label>
              <Input
                type="time"
                defaultValue={time || '09:00'}
                onBlur={(e) => onEdit({ timeHHMM: e.target.value })}
                className="h-9 w-28"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
