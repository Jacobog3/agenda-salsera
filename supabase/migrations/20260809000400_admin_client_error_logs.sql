create table if not exists public.admin_client_error_logs (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  created_at timestamptz not null default now(),
  route text not null default '',
  message text not null,
  stack text,
  digest text,
  user_agent text,
  release_sha text,
  resolved_at timestamptz
);

create index if not exists admin_client_error_logs_created_at_idx
  on public.admin_client_error_logs (created_at desc);

alter table public.admin_client_error_logs enable row level security;

revoke all on table public.admin_client_error_logs from anon, authenticated;

comment on table public.admin_client_error_logs is
  'Private client-side admin errors captured without form data or uploaded media.';
