'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Smartphone, Moon, Check, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useLeoStore } from '@/lib/leo';
import { cn } from '@/lib/utils';
import {
  DEFAULT_REMINDER_PREFS,
  type ReminderPrefs,
} from '@/lib/leo/reminders';
import {
  enableNotifications,
  disablePush,
  areNotificationsSupported,
  isPushConfigured,
  showTestNotification,
  sendTestPush,
  notificationPermission,
} from '@/lib/leo/notifications';

export function NotificationsPanel() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();

  const prefs: ReminderPrefs = profile?.reminders ?? DEFAULT_REMINDER_PREFS;
  const [permission, setPermission] = useState<
    NotificationPermission | 'default'
  >('default');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  if (!profile) return null;

  const supported = areNotificationsSupported();
  const pushConfigured = isPushConfigured();
  const granted = permission === 'granted';
  const denied = permission === 'denied';
  // "On" means permission granted AND the master switch is on.
  const active = granted && prefs.enabled;

  async function savePrefs(patch: Partial<ReminderPrefs>) {
    if (!profile) return;
    const next = { ...prefs, ...patch };
    const { id: _id, updatedAt: _u, ...rest } = profile;
    await editProfile({ ...rest, reminders: next });
  }

  async function turnOn() {
    setBusy(true);
    try {
      const res = await enableNotifications();
      setPermission(notificationPermission());
      if (!res.ok) {
        toast({
          title: 'Couldn’t turn on notifications',
          description: res.error,
          variant: 'destructive',
        });
        return;
      }
      await savePrefs({ enabled: true });
      await showTestNotification();
      toast({
        title: 'Notifications on 🦁',
        description:
          res.mode === 'push'
            ? 'You’ll get reminders even when Leo is closed.'
            : 'Reminders will show while Leo is open. Finish cloud setup for closed-app delivery.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      await disablePush();
      await savePrefs({ enabled: false });
      toast({ title: 'Notifications off on this phone' });
    } finally {
      setBusy(false);
    }
  }

  async function localTest() {
    await showTestNotification();
  }

  async function realTest() {
    setBusy(true);
    try {
      const res = await sendTestPush();
      if (!res.ok) {
        toast({
          title: 'Couldn’t send the test',
          description: res.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Test on its way 🦁',
        description:
          'It should arrive on every signed-in phone within a minute — even with the app closed.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-ink-300/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        {active ? (
          <Bell className="h-5 w-5 text-emerald-600" />
        ) : (
          <BellOff className="h-5 w-5 text-ink-500" />
        )}
        Reminders &amp; notifications
      </h2>

      {!supported ? (
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          On iPhone, open Leo from your <strong>Home Screen</strong> (Share →
          Add to Home Screen) and open it from there — a browser tab can’t show
          notifications.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-600">
            Off by default — only what you switch on here will ever buzz your
            phone. Everything else stays a quiet list in your Home agenda.
            {denied && (
              <span className="mt-1 block text-rose-600">
                Notifications are blocked in your phone’s settings — allow them
                for Leo, then try again.
              </span>
            )}
          </p>

          {!active ? (
            <Button
              onClick={turnOn}
              disabled={busy || denied}
              size="lg"
              className="min-h-12 w-full bg-ink-700 hover:bg-ink-800"
            >
              <Bell className="mr-2 h-5 w-5" /> Turn on notifications
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Status: what's actually working */}
              <div className="space-y-1.5 rounded-xl border border-ink-200/60 bg-parchment-50/60 p-3">
                <StatusRow
                  ok
                  label="On this phone"
                  hint="Reminders show while Leo is open"
                />
                <StatusRow
                  ok={pushConfigured}
                  label="When Leo is closed"
                  hint={
                    pushConfigured
                      ? 'Delivered in the background via the cloud'
                      : 'Needs the one-time cloud setup (see docs/leo-cloud-sync.md)'
                  }
                />
              </div>

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

              <ToggleRow
                label="Quiet hours"
                hint={
                  prefs.quiet
                    ? `Hold non-urgent nudges ${prefs.quietStart}–${prefs.quietEnd}`
                    : 'Hold non-urgent nudges overnight'
                }
                checked={prefs.quiet}
                onChange={(v) => savePrefs({ quiet: v })}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-aegean-500" />
                    <Label className="text-xs text-ink-500">From</Label>
                    <Input
                      type="time"
                      defaultValue={prefs.quietStart}
                      onBlur={(e) => savePrefs({ quietStart: e.target.value })}
                      className="h-9 w-28"
                    />
                    <Label className="text-xs text-ink-500">to</Label>
                    <Input
                      type="time"
                      defaultValue={prefs.quietEnd}
                      onBlur={(e) => savePrefs({ quietEnd: e.target.value })}
                      className="h-9 w-28"
                    />
                  </div>
                  <p className="text-xs text-ink-500">
                    Feed, Vitamin D and nap nudges wait until morning.
                    Appointment &amp; jab reminders always come through.
                  </p>
                </div>
              </ToggleRow>

              <Button
                onClick={localTest}
                disabled={busy}
                variant="outline"
                className="min-h-11 w-full border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
              >
                <Bell className="mr-2 h-4 w-4" /> Send a test now (this phone)
              </Button>

              {pushConfigured && (
                <Button
                  onClick={realTest}
                  disabled={busy}
                  variant="outline"
                  className="min-h-11 w-full border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
                >
                  <Cloud className="mr-2 h-4 w-4" /> Send a closed-app test to
                  all phones
                </Button>
              )}

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

function StatusRow({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
          ok
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-parchment-200 text-ink-400',
        )}
      >
        {ok ? <Check className="h-3 w-3" /> : <Cloud className="h-2.5 w-2.5" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        <span className="block text-xs text-ink-500">{hint}</span>
      </span>
    </div>
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
