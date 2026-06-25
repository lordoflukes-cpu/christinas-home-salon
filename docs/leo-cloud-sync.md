# Leo — shared cloud sync setup

This makes Leo's data (feeds, nappies, sleep, growth, medical, milestones,
journal **and photos**) sync automatically between your phone and Christina's.
Both phones use the **same** email + password, so they share one private space.

It's optional: with no Supabase keys set, Leo just runs on each phone on its own
(exactly as before).

---

## 1. Create the Supabase project

1. Go to **supabase.com → Start your project**, sign in with GitHub.
2. **New project** → name it `leo`, set a database password (save it somewhere),
   region **West EU (London)**. Wait ~2 minutes for it to finish.

## 2. Create the table (one-time)

In the project, open **SQL Editor → New query**, paste **all** of the below,
and press **Run**:

```sql
-- One table holds every kind of entry; each row is scoped to its owner.
create table if not exists public.leo_rows (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  store text not null,
  id text not null,
  data jsonb not null,
  updated_at bigint not null,
  deleted boolean not null default false,
  primary key (owner, store, id)
);

alter table public.leo_rows enable row level security;

-- Only the signed-in owner can see or change their rows.
create policy "owner read"   on public.leo_rows for select using (owner = auth.uid());
create policy "owner insert" on public.leo_rows for insert with check (owner = auth.uid());
create policy "owner update" on public.leo_rows for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner delete" on public.leo_rows for delete using (owner = auth.uid());

-- Stream changes to the other phone in real time.
alter publication supabase_realtime add table public.leo_rows;
```

## 3. Create the shared login

**Authentication → Users → Add user → Create new user.** Enter the shared email
and password you'll both use. (Optionally turn off "Confirm email" under
**Authentication → Providers → Email** so sign-in works immediately.)

## 4. Get the keys

**Settings (gear) → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon `public`** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to ship; not a secret)

> Never use the `service_role` secret key in the app.

## 5. Add the keys in Vercel

In your Vercel project: **Settings → Environment Variables**, add both names with
their values (Production + Preview + Development), then **redeploy**.

## 6. Use it

Open the app on both phones, sign in with the shared email/password, and Leo
keeps both in step. Whatever data each phone already had is merged in on first
sign-in (newest edit per item wins). The on-device backup (Settings → Backup)
still works as a belt-and-braces safety net.

---

# Push notifications (optional, needs cloud sync above)

This delivers reminders (feeds, appointments/jabs, daily Vitamin D, long naps)
to the phone **even when Leo is closed**. On iPhone this requires iOS 16.4+ and
that Leo is **added to the Home Screen** and opened from there.

## A. Extra tables (one-time)

In **SQL Editor → New query**, run:

```sql
-- One row per device that opted in to notifications.
create table if not exists public.leo_push_subscriptions (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text primary key,
  data jsonb not null,
  updated_at bigint not null
);
alter table public.leo_push_subscriptions enable row level security;
create policy "owner sub read"   on public.leo_push_subscriptions for select using (owner = auth.uid());
create policy "owner sub insert" on public.leo_push_subscriptions for insert with check (owner = auth.uid());
create policy "owner sub update" on public.leo_push_subscriptions for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner sub delete" on public.leo_push_subscriptions for delete using (owner = auth.uid());

-- The reminders waiting to be sent (the app keeps this in step).
create table if not exists public.leo_scheduled (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,
  fire_at bigint not null,
  title text not null,
  body text not null,
  primary key (owner, key)
);
alter table public.leo_scheduled enable row level security;
create policy "owner sched read"   on public.leo_scheduled for select using (owner = auth.uid());
create policy "owner sched insert" on public.leo_scheduled for insert with check (owner = auth.uid());
create policy "owner sched update" on public.leo_scheduled for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner sched delete" on public.leo_scheduled for delete using (owner = auth.uid());
```

## B. The push keys (VAPID)

A key pair has already been generated for you. The **public** key (safe to
ship) is below; the **private** key is a secret and is **not** stored in this
repo — Claude provided it in the chat. (You can regenerate a pair any time with
`npx web-push generate-vapid-keys`.)

- **Public** (ships in the app):
  `BGqK5e6tm4urcn0-_wd5pR8QU4Cj0wgnBWGFlhS-qrlADwKKjZ4iF4KGJsZJTq2-swlRlVrshsnqsPpR_nS8V_E`
- **Private** (secret — paste from the chat into Supabase below; never commit it)

In **Vercel → Settings → Environment Variables** add:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BGqK5e6tm4urcn0-_wd5pR8QU4Cj0wgnBWGFlhS-qrlADwKKjZ4iF4KGJsZJTq2-swlRlVrshsnqsPpR_nS8V_E
```

Then redeploy.

## C. Deploy the sender (Edge Function)

The function lives in this repo at `supabase/functions/leo-push/index.ts`.

In Supabase: **Edge Functions → Create a function**, name it exactly
**`leo-push`**, paste the file's contents, and **Deploy**. Then under the
function's **Secrets**, add:

```
VAPID_PUBLIC_KEY  = BGqK5e6tm4urcn0-_wd5pR8QU4Cj0wgnBWGFlhS-qrlADwKKjZ4iF4KGJsZJTq2-swlRlVrshsnqsPpR_nS8V_E
VAPID_PRIVATE_KEY = <paste the private key from the chat>
VAPID_SUBJECT     = mailto:lukeadekoya89@gmail.com
```

(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function
automatically — you don't add those.)

## D. Run it every minute (pg_cron)

In **SQL Editor**, run (replace `<PROJECT_REF>` with your project ref — the
subdomain of your Project URL — and `<ANON_KEY>` with your anon key):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'leo-push-tick',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.functions.supabase.co/leo-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    )
  );
  $$
);
```

## E. Turn it on

On each phone: add Leo to the Home Screen, open it, go to **Settings →
Reminders & notifications → Turn on notifications**, and allow when prompted.
Choose which reminders you want and their timings. Done — a test notification
confirms it's working, and reminders will arrive even with the app closed.
