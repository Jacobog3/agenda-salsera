-- Public submissions are accepted only through server-side API routes that use
-- the service role. They must never be reachable directly through the Data API.
alter table public.academy_submissions enable row level security;
alter table public.teacher_submissions enable row level security;
alter table public.spot_submissions enable row level security;

revoke all on table public.academy_submissions from anon, authenticated;
revoke all on table public.teacher_submissions from anon, authenticated;
revoke all on table public.spot_submissions from anon, authenticated;

-- Trigger functions execute with the caller's role unless configured otherwise.
-- Pin the lookup path so it cannot be influenced by a mutable session setting.
alter function public.set_updated_at_timestamp() set search_path = public;
