-- Add missing columns to event_submissions if they don't exist
alter table public.event_submissions
  add column if not exists address   text,
  add column if not exists status    text default 'pending';

-- Index for fast pending lookup
create index if not exists event_submissions_status_idx
  on public.event_submissions (status);
