'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  Smartphone,
  Moon,
  Check,
  Cloud,
  Sparkles,
  Loader2,
  Stethoscope,
  RefreshCw,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  useLeoStore,
  useNow,
  cadenceSnapshot,
  getReminderAdvice,
  type ReminderAdvice,
} from '@/lib/leo';
import { cn } from '@/lib/utils';
import {
  DEFAULT_REMINDER_PREFS,
  type ReminderPrefs,
} from '@/lib/leo/reminders';
import {
  enableNotifications,
  disablePush,
  areNotificationsSupported,
  isPushSupported,
  isPushConfigured,
  isPushEnabled,
  showTestNotification,
  sendTestPush,
  notificationPermission,
  notificationChecklist,
  pushAccountStatus,
  type PushAccountStatus,
} from '@/lib/leo/notifications';

export function NotificationsPanel() {
  const profile = useLeoStore((s) => s.profile);
  const editProfile = useLeoStore((s) => s.editProfile);
  const { toast } = useToast();

  const prefs: ReminderPrefs = {
    ...DEFAULT_REMINDER_PREFS,
    ...(profile?.reminders ?? {}),
  };
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

              <DeliveryDiagnostics
                supported={supported}
                permission={permission}
                pushConfigured={pushConfigured}
              />

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
                label="Awake-too-long nudge"
                hint={`“Might be getting tired” after ${prefs.wakeWindowMinutes} min awake`}
                checked={prefs.wakeWindow}
                onChange={(v) => savePrefs({ wakeWindow: v })}
              >
                <NumberField
                  label="Mins awake"
                  value={prefs.wakeWindowMinutes}
                  min={20}
                  max={240}
                  step={5}
                  onCommit={(n) => savePrefs({ wakeWindowMinutes: n })}
                />
              </ToggleRow>

              <ToggleRow
                label="Bedtime routine"
                hint={`A nudge to wind down at ${prefs.bedtimeTime}`}
                checked={prefs.bedtime}
                onChange={(v) => savePrefs({ bedtime: v })}
              >
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-ink-500">Time</Label>
                  <Input
                    type="time"
                    defaultValue={prefs.bedtimeTime}
                    onBlur={(e) => savePrefs({ bedtimeTime: e.target.value })}
                    className="h-9 w-28"
                  />
                </div>
              </ToggleRow>

              <ToggleRow
                label="Nappy check"
                hint={`Nudge ${prefs.nappyHours}h after the last change`}
                checked={prefs.nappy}
                onChange={(v) => savePrefs({ nappy: v })}
              >
                <NumberField
                  label="Hours"
                  value={prefs.nappyHours}
                  min={1}
                  max={12}
                  onCommit={(n) => savePrefs({ nappyHours: n })}
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

              <AiTimingSuggestions onApply={savePrefs} />

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

/**
 * AI-suggested reminder timings from Leo's age/weight/feed type and recent
 * feed & sleep rhythm. The AI only suggests — the parent taps "Use these" to
 * apply. Hidden gracefully when the AI key isn't configured.
 */
function AiTimingSuggestions({
  onApply,
}: {
  onApply: (patch: Partial<ReminderPrefs>) => void;
}) {
  const profile = useLeoStore((s) => s.profile);
  const feeds = useLeoStore((s) => s.feeds);
  const sleeps = useLeoStore((s) => s.sleeps);
  const growth = useLeoStore((s) => s.growth);
  const now = useNow(3_600_000);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<ReminderAdvice | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  async function fetchAdvice() {
    setLoading(true);
    setUnavailable(null);
    const context = cadenceSnapshot({ profile, feeds, sleeps, growth, now });
    const res = await getReminderAdvice(context);
    setLoading(false);
    if (res.notConfigured) {
      setUnavailable('Set up the AI key on the server to get suggestions.');
      return;
    }
    if (res.error || !res.advice) {
      setUnavailable(res.error ?? 'Couldn’t get a suggestion right now.');
      return;
    }
    setAdvice(res.advice);
  }

  function apply() {
    if (!advice) return;
    const patch: Partial<ReminderPrefs> = {};
    if (advice.feedHours != null) {
      patch.feed = true;
      patch.feedHours = advice.feedHours;
    }
    if (advice.sleepMaxHours != null) {
      patch.sleep = true;
      patch.sleepMaxHours = advice.sleepMaxHours;
    }
    if (advice.wakeWindowMinutes != null) {
      patch.wakeWindow = true;
      patch.wakeWindowMinutes = advice.wakeWindowMinutes;
    }
    if (advice.bedtime) {
      patch.bedtime = true;
      patch.bedtimeTime = advice.bedtime;
    }
    if (advice.vitdTime) {
      patch.vitd = true;
      patch.vitdTime = advice.vitdTime;
    }
    if (advice.quietStart && advice.quietEnd) {
      patch.quiet = true;
      patch.quietStart = advice.quietStart;
      patch.quietEnd = advice.quietEnd;
    }
    onApply(patch);
    setAdvice(null);
    toast({
      title: 'Timings updated 🦁',
      description: 'Leo’s suggestions applied — tweak any of them above.',
    });
  }

  return (
    <div className="rounded-xl border border-gold-200 bg-gradient-to-br from-gold-50 to-parchment-50 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-800">
        <Sparkles className="h-4 w-4 text-gold-600" /> AI timing suggestions
      </p>

      {advice ? (
        <div className="space-y-2">
          <ul className="space-y-1 text-sm text-ink-700">
            {advice.feedHours != null && (
              <li>• Feed reminder every {advice.feedHours}h</li>
            )}
            {advice.sleepMaxHours != null && (
              <li>• Long-nap nudge after {advice.sleepMaxHours}h</li>
            )}
            {advice.wakeWindowMinutes != null && (
              <li>
                • Awake-too-long nudge after {advice.wakeWindowMinutes} min
              </li>
            )}
            {advice.bedtime && <li>• Bedtime routine at {advice.bedtime}</li>}
            {advice.vitdTime && <li>• Vitamin D at {advice.vitdTime}</li>}
            {advice.quietStart && advice.quietEnd && (
              <li>
                • Quiet hours {advice.quietStart}–{advice.quietEnd}
              </li>
            )}
          </ul>
          <p className="text-xs italic text-ink-500">{advice.rationale}</p>
          <div className="flex gap-2">
            <Button
              onClick={apply}
              className="min-h-10 flex-1 bg-ink-700 hover:bg-ink-800"
            >
              Use these
            </Button>
            <Button
              onClick={() => setAdvice(null)}
              variant="ghost"
              className="min-h-10 text-ink-500"
            >
              Dismiss
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-ink-500">
            Suggested feed/sleep/Vitamin-D timings from Leo’s age, weight and
            recent rhythm. Just a starting point — not medical advice.
          </p>
          <Button
            onClick={fetchAdvice}
            disabled={loading}
            variant="outline"
            className="min-h-10 w-full border-gold-300 bg-parchment-50 text-ink-700 hover:bg-gold-100"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI timing suggestions
              </>
            )}
          </Button>
          {unavailable && (
            <p className="mt-1.5 text-xs text-ink-400">{unavailable}</p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * An expandable, self-checking readout of the whole closed-app delivery chain —
 * so a silent feature becomes verifiable. Shows each link's status plus a live
 * count of subscribed devices and queued reminders from the cloud.
 */
function DeliveryDiagnostics({
  supported,
  permission,
  pushConfigured,
}: {
  supported: boolean;
  permission: NotificationPermission | 'default';
  pushConfigured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [account, setAccount] = useState<PushAccountStatus | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [enabled, acct] = await Promise.all([
        isPushEnabled(),
        pushAccountStatus(),
      ]);
      setSubscribed(enabled);
      setAccount(acct);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && !account && !loading) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const items = notificationChecklist({
    supported,
    pushSupported: isPushSupported(),
    permission,
    pushConfigured,
    signedIn: account?.signedIn ?? false,
    subscribedThisDevice: subscribed,
  });

  return (
    <div className="rounded-xl border border-ink-200/60 bg-parchment-50/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 p-3 text-left"
      >
        <Stethoscope className="h-4 w-4 text-ink-500" />
        <span className="flex-1 text-sm font-medium text-ink-900">
          Check delivery setup
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-ink-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3">
          {items.map((it) => (
            <div key={it.label} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                  it.ok
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-parchment-200 text-ink-400',
                )}
              >
                {it.ok ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-2.5 w-2.5" />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-sm text-ink-800">{it.label}</span>
                <span className="block text-xs text-ink-500">{it.hint}</span>
              </span>
            </div>
          ))}

          {account?.signedIn && (
            <p className="pt-1 text-xs text-ink-500">
              {account.devices} {account.devices === 1 ? 'device' : 'devices'}{' '}
              subscribed · {account.pending}{' '}
              {account.pending === 1 ? 'reminder' : 'reminders'} queued
            </p>
          )}

          <Button
            onClick={() => void refresh()}
            disabled={loading}
            variant="outline"
            className="mt-1 h-9 w-full border-ink-300 bg-parchment-50 text-ink-700 hover:bg-parchment-100"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Re-check
          </Button>
        </div>
      )}
    </div>
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
