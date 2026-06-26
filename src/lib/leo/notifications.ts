/**
 * Web Push notifications for Leo.
 *
 * The browser subscribes to push (using the VAPID public key), and the
 * subscription is stored in Supabase. A small scheduled function on Supabase
 * reads the `leo_scheduled` table and delivers due reminders as push messages
 * — so they arrive even when the app is fully closed (iOS 16.4+ requires the
 * app be installed to the Home Screen).
 *
 * Everything here degrades safely: if push isn't configured or supported, the
 * functions report that and do nothing.
 */
import { getSupabase, isSyncConfigured } from './supabase';
import type { ScheduledReminder } from './reminders';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const SUBS_TABLE = 'leo_push_subscriptions';
const SCHED_TABLE = 'leo_scheduled';

/**
 * True when the browser can show notifications at all (service worker +
 * Notification API). This is enough for on-device reminders; closed-app
 * delivery additionally needs PushManager + the cloud pipeline.
 */
export function areNotificationsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window
  );
}

/** True when the browser can do Web Push (closed-app delivery) at all. */
export function isPushSupported(): boolean {
  return areNotificationsSupported() && 'PushManager' in window;
}

/** True when the app is wired for push (VAPID key + Supabase both present). */
export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC) && isSyncConfigured();
}

export function notificationPermission(): NotificationPermission | 'default' {
  if (typeof Notification === 'undefined') return 'default';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function swRegistration(): Promise<ServiceWorkerRegistration | null> {
  // Only needs a service worker — NOT PushManager. Local notifications work
  // without push support; gating this on isPushSupported() made the whole
  // toggle (and the test notification) silently fail on devices that lack
  // PushManager, even though plain notifications would have shown fine.
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return null;
  try {
    return (
      (await navigator.serviceWorker.getRegistration('/leo')) ??
      (await navigator.serviceWorker.ready)
    );
  } catch {
    return null;
  }
}

/** Is this device currently subscribed to push? */
export async function isPushEnabled(): Promise<boolean> {
  const reg = await swRegistration();
  if (!reg) return false;
  return Boolean(await reg.pushManager.getSubscription());
}

/**
 * Request permission, subscribe to push, and store the subscription.
 * Returns `{ ok }` or `{ ok:false, error }` with a friendly message.
 */
export async function enablePush(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported())
    return { ok: false, error: 'This device doesn’t support notifications.' };
  if (!isPushConfigured())
    return { ok: false, error: 'Notifications aren’t set up yet.' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted')
    return { ok: false, error: 'Notifications were not allowed.' };

  const reg = await swRegistration();
  if (!reg) return { ok: false, error: 'Service worker unavailable.' };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC as string,
      ) as BufferSource,
    });
  }

  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Cloud sync is not configured.' };
  const { data: userData } = await sb.auth.getUser();
  const owner = userData.user?.id;
  if (!owner) return { ok: false, error: 'Please sign in first.' };

  const json = sub.toJSON();
  const { error } = await sb.from(SUBS_TABLE).upsert({
    owner,
    endpoint: json.endpoint,
    data: json,
    updated_at: Date.now(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Unsubscribe this device and remove its stored subscription. */
export async function disablePush(): Promise<void> {
  const reg = await swRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    const sb = getSupabase();
    if (sb) await sb.from(SUBS_TABLE).delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
}

/**
 * Replace the scheduled reminders for this account with the given set.
 * Delete-then-insert keeps the table in step with the latest data/prefs.
 */
export async function pushScheduledReminders(
  reminders: ScheduledReminder[],
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: userData } = await sb.auth.getUser();
  const owner = userData.user?.id;
  if (!owner) return;

  // Replace this owner's computed reminders, but never touch a pending 'test'
  // row — that one is awaiting the next scheduler tick (see sendTestPush).
  await sb.from(SCHED_TABLE).delete().eq('owner', owner).neq('key', 'test');
  if (!reminders.length) return;
  await sb.from(SCHED_TABLE).insert(
    reminders.map((r) => ({
      owner,
      key: r.key,
      fire_at: r.fireAt,
      title: r.title,
      body: r.body,
    })),
  );
}

/**
 * Send a REAL end-to-end test push to every signed-in device on this account.
 *
 * Unlike `showTestNotification` (which only shows a local notification on this
 * phone), this writes a due row to `leo_scheduled` so the Supabase scheduler
 * delivers it as an actual Web Push within ~a minute — exercising the whole
 * chain (stored subscription → cron → Edge Function → VAPID → device). It's the
 * honest way to confirm reminders will arrive when the app is closed.
 */
export async function sendTestPush(): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Cloud sync is not configured.' };
  const { data: userData } = await sb.auth.getUser();
  const owner = userData.user?.id;
  if (!owner) return { ok: false, error: 'Please sign in first.' };

  const { error } = await sb.from(SCHED_TABLE).upsert({
    owner,
    key: 'test',
    fire_at: Date.now(),
    title: 'Leo 🦁',
    body: 'Test notification — reminders will reach you like this.',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Diagnostics — make the (otherwise silent) closed-app chain observable
// ---------------------------------------------------------------------------

/** A snapshot of every link in the push chain, for the in-app checklist. */
export interface ChainState {
  /** Notification API + service worker available (enough for local). */
  supported: boolean;
  /** PushManager available (needed for closed-app delivery). */
  pushSupported: boolean;
  permission: NotificationPermission | 'default';
  /** VAPID key + Supabase both present (the cloud pipeline is wired). */
  pushConfigured: boolean;
  /** Signed in to the shared family account. */
  signedIn: boolean;
  /** This device has an active push subscription. */
  subscribedThisDevice: boolean;
}

export interface ChecklistItem {
  label: string;
  ok: boolean;
  hint: string;
}

/**
 * Turn a {@link ChainState} into an ordered checklist of every link needed for
 * closed-app delivery, so a parent can see exactly what's done and what's left.
 * Pure — unit tested.
 */
export function notificationChecklist(s: ChainState): ChecklistItem[] {
  return [
    {
      label: 'This device can show notifications',
      ok: s.supported && s.pushSupported,
      hint: s.supported
        ? s.pushSupported
          ? 'Ready'
          : 'This browser can’t do closed-app push'
        : 'Open Leo from your Home Screen, not a browser tab',
    },
    {
      label: 'You allowed notifications',
      ok: s.permission === 'granted',
      hint:
        s.permission === 'granted'
          ? 'Allowed'
          : s.permission === 'denied'
            ? 'Blocked in your phone’s settings — allow them for Leo'
            : 'Tap “Turn on notifications” and allow when asked',
    },
    {
      label: 'Closed-app delivery configured',
      ok: s.pushConfigured,
      hint: s.pushConfigured
        ? 'Cloud pipeline is set up'
        : 'One-time setup needed (see docs/leo-cloud-sync.md)',
    },
    {
      label: 'Signed in to cloud sync',
      ok: s.signedIn,
      hint: s.signedIn ? 'Signed in' : 'Sign in (Settings → Cloud sync)',
    },
    {
      label: 'This phone is subscribed',
      ok: s.subscribedThisDevice,
      hint: s.subscribedThisDevice
        ? 'Will receive closed-app reminders'
        : 'Turn notifications on here to subscribe this phone',
    },
  ];
}

export interface PushAccountStatus {
  signedIn: boolean;
  /** How many devices on the account are subscribed for push. */
  devices: number;
  /** How many reminders are currently queued to send. */
  pending: number;
}

/**
 * Read how many devices are subscribed and how many reminders are queued for
 * this account — a live readout that confirms the cloud side is working.
 * Returns null when sync isn't configured.
 */
export async function pushAccountStatus(): Promise<PushAccountStatus | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: userData } = await sb.auth.getUser();
  const owner = userData.user?.id;
  if (!owner) return { signedIn: false, devices: 0, pending: 0 };
  try {
    const [subs, sched] = await Promise.all([
      sb
        .from(SUBS_TABLE)
        .select('endpoint', { count: 'exact', head: true })
        .eq('owner', owner),
      sb
        .from(SCHED_TABLE)
        .select('key', { count: 'exact', head: true })
        .eq('owner', owner),
    ]);
    return {
      signedIn: true,
      devices: subs.count ?? 0,
      pending: sched.count ?? 0,
    };
  } catch {
    return { signedIn: true, devices: 0, pending: 0 };
  }
}

/**
 * Show a notification immediately (used to confirm the toggle works).
 * Returns true if it was actually shown, so the UI can flag a silent failure
 * (e.g. notifications blocked for the app at the OS level).
 */
export async function showTestNotification(): Promise<boolean> {
  if (notificationPermission() !== 'granted') return false;
  const reg = await swRegistration();
  if (!reg) return false;
  try {
    await reg.showNotification('Leo 🦁', {
      body: 'Notifications are on — you’ll get reminders here.',
      icon: '/leo/icon-192.png',
      badge: '/leo/icon-192.png',
      tag: 'leo-test',
    });
    return true;
  } catch {
    return false;
  }
}

export type NotificationMode = 'push' | 'local';

export interface EnableResult {
  ok: boolean;
  /** 'push' = will arrive even when closed; 'local' = only while Leo is open. */
  mode?: NotificationMode;
  error?: string;
}

/**
 * Turn on notifications on this device. Always works with just permission +
 * the service worker (local mode: reminders while Leo is open). When the cloud
 * pipeline is configured it ALSO subscribes for closed-app delivery (push
 * mode). This is what the toggle calls — it no longer requires Supabase/VAPID
 * just to switch on.
 */
export async function enableNotifications(): Promise<EnableResult> {
  if (!areNotificationsSupported()) {
    return {
      ok: false,
      error: 'This device can’t show notifications.',
    };
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, error: 'Notifications were not allowed.' };
  }
  const reg = await swRegistration();
  if (!reg) {
    return {
      ok: false,
      error: 'Reopen Leo from your Home Screen, then try again.',
    };
  }

  // Layer on closed-app delivery when the cloud pipeline is available.
  if (isPushConfigured()) {
    const res = await enablePush();
    if (res.ok) return { ok: true, mode: 'push' };
    // Couldn't subscribe — still useful locally, but say why.
    return { ok: true, mode: 'local', error: res.error };
  }
  return { ok: true, mode: 'local' };
}

/**
 * Schedule on-device notifications for due reminders that fall within the next
 * day. These fire only while Leo is open/alive (a PWA can't run timers once
 * fully closed — that's what push is for). Returns a cancel function.
 */
const firedLocal = new Set<string>();
const DAY_MS = 86_400_000;

export function scheduleLocalNotifications(
  reminders: ScheduledReminder[],
  nowMs: number,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (const r of reminders) {
    const delay = r.fireAt - nowMs;
    if (delay < 0 || delay > DAY_MS) continue;
    const dedupe = `${r.key}:${r.fireAt}`;
    if (firedLocal.has(dedupe)) continue;
    const id = setTimeout(
      () => {
        if (firedLocal.has(dedupe)) return;
        firedLocal.add(dedupe);
        void (async () => {
          const reg = await swRegistration();
          if (reg && notificationPermission() === 'granted') {
            await reg.showNotification(r.title, {
              body: r.body,
              icon: '/leo/icon-192.png',
              badge: '/leo/icon-192.png',
              tag: r.key,
              data: { url: '/leo' },
            });
          }
        })();
      },
      Math.max(0, delay),
    );
    timers.push(id);
  }
  return () => timers.forEach(clearTimeout);
}
