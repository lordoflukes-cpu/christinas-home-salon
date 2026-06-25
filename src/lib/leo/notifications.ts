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

/** True when the browser can do Web Push at all. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
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
  if (!isPushSupported()) return null;
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

  await sb.from(SCHED_TABLE).delete().eq('owner', owner);
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

/** Show a notification immediately (used to confirm the toggle works). */
export async function showTestNotification(): Promise<void> {
  const reg = await swRegistration();
  if (!reg) return;
  await reg.showNotification('Leo 🦁', {
    body: 'Notifications are on — you’ll get reminders here.',
    icon: '/leo/icon-192.png',
    badge: '/leo/icon-192.png',
    tag: 'leo-test',
  });
}
