create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null,
  model text not null,
  operation text not null,
  attempt smallint not null default 1 check (attempt > 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  candidate_tokens integer not null default 0 check (candidate_tokens >= 0),
  thought_tokens integer not null default 0 check (thought_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cached_input_tokens integer not null default 0 check (cached_input_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  estimated_cost_usd numeric(14, 8),
  release_sha text
);

create index if not exists ai_usage_events_created_at_idx
  on public.ai_usage_events (created_at desc);

create index if not exists ai_usage_events_operation_created_at_idx
  on public.ai_usage_events (operation, created_at desc);

alter table public.ai_usage_events enable row level security;
revoke all on table public.ai_usage_events from anon, authenticated;

comment on table public.ai_usage_events is
  'Private Gemini token and estimated-cost telemetry. Prompts, responses, IP addresses, and user data are intentionally excluded.';

create table if not exists public.ai_rate_limits (
  client_key text not null,
  operation text not null,
  window_started_at timestamptz not null,
  expires_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (client_key, operation)
);

create index if not exists ai_rate_limits_expires_at_idx
  on public.ai_rate_limits (expires_at);

alter table public.ai_rate_limits enable row level security;
revoke all on table public.ai_rate_limits from anon, authenticated;

comment on table public.ai_rate_limits is
  'Private, durable public-AI quotas keyed by a one-way client hash. Raw IP addresses are never stored.';

create or replace function public.consume_ai_rate_limit(
  p_client_key text,
  p_operation text,
  p_window_seconds integer,
  p_max_requests integer
)
returns table (
  allowed boolean,
  request_count integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window interval;
  v_count integer;
  v_expires_at timestamptz;
begin
  if length(trim(p_client_key)) < 32
    or length(trim(p_operation)) = 0
    or p_window_seconds < 1
    or p_max_requests < 1 then
    raise exception 'Invalid AI rate-limit parameters';
  end if;

  v_window := make_interval(secs => p_window_seconds);

  insert into public.ai_rate_limits (
    client_key,
    operation,
    window_started_at,
    expires_at,
    request_count,
    updated_at
  ) values (
    p_client_key,
    p_operation,
    v_now,
    v_now + v_window,
    1,
    v_now
  )
  on conflict (client_key, operation) do update
  set
    window_started_at = case
      when ai_rate_limits.expires_at <= v_now then v_now
      else ai_rate_limits.window_started_at
    end,
    expires_at = case
      when ai_rate_limits.expires_at <= v_now then v_now + v_window
      else ai_rate_limits.expires_at
    end,
    request_count = case
      when ai_rate_limits.expires_at <= v_now then 1
      else least(ai_rate_limits.request_count + 1, p_max_requests + 1)
    end,
    updated_at = v_now
  returning ai_rate_limits.request_count, ai_rate_limits.expires_at
  into v_count, v_expires_at;

  return query select
    v_count <= p_max_requests,
    v_count,
    case
      when v_count <= p_max_requests then 0
      else greatest(1, ceil(extract(epoch from (v_expires_at - v_now)))::integer)
    end;
end;
$$;

revoke all on function public.consume_ai_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(text, text, integer, integer)
  to service_role;
