// Leo push scheduler — Supabase Edge Function (Deno).
//
// Runs on a schedule (pg_cron, every minute). It finds reminders in
// `leo_scheduled` that are due (fire_at <= now), sends each one as a Web Push
// to every device in `leo_push_subscriptions` for that owner, then deletes the
// reminder row so it isn't sent again (the app re-creates recurring reminders).
//
// Deploy from the Supabase dashboard (Edge Functions → Deploy a new function,
// name: leo-push) or with the CLI. Then set the secrets:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@email)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:leo@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async () => {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const now = Date.now();

  const { data: due, error } = await admin
    .from('leo_scheduled')
    .select('owner,key,fire_at,title,body')
    .lte('fire_at', now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // Group due reminders by owner so we fetch each owner's devices once.
  const owners = [...new Set(due.map((d) => d.owner))];
  const subsByOwner = new Map<string, { endpoint: string; data: unknown }[]>();
  for (const owner of owners) {
    const { data: subs } = await admin
      .from('leo_push_subscriptions')
      .select('endpoint,data')
      .eq('owner', owner);
    subsByOwner.set(owner, subs ?? []);
  }

  let sent = 0;
  for (const r of due) {
    const payload = JSON.stringify({
      title: r.title,
      body: r.body,
      tag: r.key,
      url: '/leo',
    });
    for (const sub of subsByOwner.get(r.owner) ?? []) {
      try {
        // deno-lint-ignore no-explicit-any
        await webpush.sendNotification(sub.data as any, payload);
        sent++;
      } catch (err) {
        // 404/410 = subscription gone; clean it up.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin
            .from('leo_push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
      }
    }
    // One-shot: remove the reminder so it isn't re-sent.
    await admin
      .from('leo_scheduled')
      .delete()
      .eq('owner', r.owner)
      .eq('key', r.key);
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
});
