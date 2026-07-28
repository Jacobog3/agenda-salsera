alter table public.spot_submissions
  add column if not exists image_url text,
  add column if not exists status text default 'pending';

create index if not exists spot_submissions_status_idx
  on public.spot_submissions (status);
