-- Leo — closed-app push notifications: schema (idempotent).
--
-- Two small tables backing the Web Push pipeline (see docs/leo-cloud-sync.md):
--   • leo_push_subscriptions — one row per device that opted in.
--   • leo_scheduled          — reminders waiting to be delivered.
-- Both are scoped to the signed-in family account via Row Level Security
-- (owner = auth.uid()), exactly like the main `leo_rows` sync table.
--
-- Safe to run more than once. Apply with `supabase db push`, the Supabase CLI,
-- or by pasting into SQL Editor → New query. The cron job that actually sends
-- due reminders lives in 0002_leo_push_cron.example.sql (environment-specific).

-- One row per device + owner that opted in to notifications.
create table if not exists public.leo_push_subscriptions (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text primary key,
  data jsonb not null,
  updated_at bigint not null
);
alter table public.leo_push_subscriptions enable row level security;

-- Reminders waiting to be sent — the app keeps this in step with the latest
-- data + preferences (one row per (owner, key)).
create table if not exists public.leo_scheduled (
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,
  fire_at bigint not null,
  title text not null,
  body text not null,
  primary key (owner, key)
);
alter table public.leo_scheduled enable row level security;

-- Helps the Edge Function find due reminders quickly.
create index if not exists leo_scheduled_fire_at_idx
  on public.leo_scheduled (fire_at);

-- RLS: every row is private to its owner. Policies are recreated idempotently.
do $$
begin
  -- leo_push_subscriptions
  drop policy if exists "owner sub read"   on public.leo_push_subscriptions;
  drop policy if exists "owner sub insert" on public.leo_push_subscriptions;
  drop policy if exists "owner sub update" on public.leo_push_subscriptions;
  drop policy if exists "owner sub delete" on public.leo_push_subscriptions;
  create policy "owner sub read"   on public.leo_push_subscriptions for select using (owner = auth.uid());
  create policy "owner sub insert" on public.leo_push_subscriptions for insert with check (owner = auth.uid());
  create policy "owner sub update" on public.leo_push_subscriptions for update using (owner = auth.uid()) with check (owner = auth.uid());
  create policy "owner sub delete" on public.leo_push_subscriptions for delete using (owner = auth.uid());

  -- leo_scheduled
  drop policy if exists "owner sched read"   on public.leo_scheduled;
  drop policy if exists "owner sched insert" on public.leo_scheduled;
  drop policy if exists "owner sched update" on public.leo_scheduled;
  drop policy if exists "owner sched delete" on public.leo_scheduled;
  create policy "owner sched read"   on public.leo_scheduled for select using (owner = auth.uid());
  create policy "owner sched insert" on public.leo_scheduled for insert with check (owner = auth.uid());
  create policy "owner sched update" on public.leo_scheduled for update using (owner = auth.uid()) with check (owner = auth.uid());
  create policy "owner sched delete" on public.leo_scheduled for delete using (owner = auth.uid());
end $$;
