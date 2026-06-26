'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore } from '@/lib/leo';
import {
  DEFAULT_REMINDER_PREFS,
  type ReminderPrefs,
} from '@/lib/leo/reminders';
import {
  enablePush,
  disablePush,
  isPushConfigured,
  isPushSupported,
  isPushEnabled,
  showTestNotification,
  notificationPermission,
} from '@/lib/leo/notifications';

export function NotificationsPanel() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();

  const prefs: ReminderPrefs = profile?.reminders ?? DEFAULT_REMINDER_PREFS;
  const [enabledHere, setEnabledHere] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isPushEnabled().then(setEnabledHere);
  }, []);

  if (!profile) return null;

  const configured = isPushConfigured();
  const supported = isPushSupported();
  const denied = notificationPermission() === 'denied';

  async function savePrefs(patch: Partial<ReminderPrefs>) {
    if (!profile) return;
    const next = { ...prefs, ...patch };
    const { id: _id, updatedAt: _u, ...rest } = profile;
    await editProfile({ ...rest, reminders: next });
  }

  async function turnOn() {
    setBusy(true);
    try {
      const res = await enablePush();
      if (!res.ok) {
        toast({
          title: 'Couldn’t turn on notifications',
          description: res.error,
          variant: 'destructive',
        });
        return;
      }
      setEnabledHere(true);
      await savePrefs({ enabled: true });
      await showTestNotification();
      toast({
        title: 'Notifications on 🦁',
        description: 'You’ll get reminders even when the app is closed.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      await disablePush();
      setEnabledHere(false);
      toast({ title: 'Notifications off on this phone' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        {enabledHere ? (
          <Bell className="h-5 w-5 text-emerald-600" />
        ) : (
          <BellOff className="h-5 w-5 text-ink-500" />
        )}
        Reminders &amp; notifications
      </h2>

      {!configured ? (
        <p className="text-sm text-ink-600">
          Set up cloud sync first (above) — notifications use the same Supabase
          project so they can reach your phone when the app is closed.
        </p>
      ) : !supported ? (
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          On iPhone, open Leo from your <strong>Home Screen</strong> (Share →
          Add to Home Screen) to allow notifications. This browser tab can’t
          receive them.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-600">
            Off by default — only what you switch on here will ever buzz your
            phone. Everything else stays a quiet list in your Home agenda.
            {denied && (
              <span className="mt-1 block text-rose-600">
                Notifications are blocked in your phone’s settings — allow them
                for this app, then try again.
              </span>
            )}
          </p>

          {!enabledHere ? (
            <Button
              onClick={turnOn}
              disabled={busy}
              size="lg"
              className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
            >
              <Bell className="mr-2 h-5 w-5" /> Turn on notifications
            </Button>
          ) : (
            <div className="space-y-4">
              <ToggleRow
                label="Feed reminders"
                hint={`Nudge ${prefs.feedHours}h after the last feed`}
                checked={prefs.feed}
                onChange={(v) => savePrefs({ feed: v })}
              >
                <NumberField
                  label="Hours"
                  value={prefs.feedHours}
                  min={1}
                  max={12}
                  onCommit={(n) => savePrefs({ feedHours: n })}
                />
              </ToggleRow>

              <ToggleRow
                label="Appointments & jabs"
                hint={`Remind ${prefs.leadMinutes} min before`}
                checked={prefs.medical}
                onChange={(v) => savePrefs({ medical: v })}
              >
                <NumberField
                  label="Mins before"
                  value={prefs.leadMinutes}
                  min={0}
                  max={1440}
                  step={15}
                  onCommit={(n) => savePrefs({ leadMinutes: n })}
                />
              </ToggleRow>

              <ToggleRow
                label="Daily Vitamin D"
                hint={`Every day at ${prefs.vitdTime}`}
                checked={prefs.vitd}
                onChange={(v) => savePrefs({ vitd: v })}
              >
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-ink-500">Time</Label>
                  <Input
                    type="time"
                    defaultValue={prefs.vitdTime}
                    onBlur={(e) => savePrefs({ vitdTime: e.target.value })}
                    className="h-9 w-28"
                  />
                </div>
              </ToggleRow>

              <ToggleRow
                label="Long-nap nudge"
                hint={`If a sleep timer runs over ${prefs.sleepMaxHours}h`}
                checked={prefs.sleep}
                onChange={(v) => savePrefs({ sleep: v })}
              >
                <NumberField
                  label="Hours"
                  value={prefs.sleepMaxHours}
                  min={1}
                  max={12}
                  onCommit={(n) => savePrefs({ sleepMaxHours: n })}
                />
              </ToggleRow>

              <Button
                onClick={turnOff}
                disabled={busy}
                variant="ghost"
                className="min-h-11 w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <BellOff className="mr-2 h-5 w-5" /> Turn off on this phone
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  children,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3">
      <label className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onChange(Boolean(v))}
          className="mt-0.5"
        />
        <span className="flex-1">
          <span className="block text-sm font-medium text-ink-900">
            {label}
          </span>
          <span className="block text-xs text-ink-500">{hint}</span>
        </span>
      </label>
      {checked && children && <div className="mt-3 pl-7">{children}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onCommit: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-ink-500">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && n >= min && n <= max) onCommit(n);
        }}
        className="h-9 w-20"
      />
    </div>
  );
}
