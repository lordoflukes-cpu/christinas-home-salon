-- Leo — closed-app push: the every-minute cron that sends due reminders.
--
-- This is an EXAMPLE (note the .example.sql suffix so `supabase db push` skips
-- it): it contains environment-specific values you must fill in. Run it once in
-- SQL Editor → New query AFTER you've deployed the `leo-push` Edge Function.
--
-- Replace:
--   <PROJECT_REF>  — your project ref (the subdomain of your Project URL).
--   <ANON_KEY>     — your project's anon (public) key.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any previous schedule with this name so re-running is safe.
select cron.unschedule('leo-push-tick')
where exists (select 1 from cron.job where jobname = 'leo-push-tick');

select cron.schedule(
  'leo-push-tick',
  '* * * * *', -- every minute
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

-- To check it's scheduled:   select * from cron.job;
-- To see recent runs:        select * from cron.job_run_details order by start_time desc limit 10;
