-- Leo shared cloud sync — the single table every kind of entry lives in.
--
-- This is the table the app's sync layer (src/lib/leo/sync.ts) reads/writes:
-- one row per entry, scoped to its owner via Row Level Security
-- (owner = auth.uid()), streamed between devices over Supabase Realtime.
--
-- Idempotent: safe to run more than once (e.g. `supabase db push` or a manual
-- paste in the SQL editor). Previously this SQL only existed in
-- docs/leo-cloud-sync.md; committing it as a migration makes sync turnkey.

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
drop policy if exists "owner read"   on public.leo_rows;
drop policy if exists "owner insert" on public.leo_rows;
drop policy if exists "owner update" on public.leo_rows;
drop policy if exists "owner delete" on public.leo_rows;

create policy "owner read"   on public.leo_rows for select using (owner = auth.uid());
create policy "owner insert" on public.leo_rows for insert with check (owner = auth.uid());
create policy "owner update" on public.leo_rows for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner delete" on public.leo_rows for delete using (owner = auth.uid());

-- Stream changes to the other phone in real time (ignore if already added).
do $$
begin
  alter publication supabase_realtime add table public.leo_rows;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;
