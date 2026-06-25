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
