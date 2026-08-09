-- Shared, review-first AI workflow for public resource submissions.
-- AI output remains evidence until an admin resolves it into canonical records.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'event_submissions',
    'academy_submissions',
    'teacher_submissions',
    'spot_submissions'
  ]
  loop
    execute format(
      'alter table public.%I
        add column if not exists idempotency_key text,
        add column if not exists content_fingerprint text,
        add column if not exists source_text text,
        add column if not exists review_signals jsonb not null default ''{}''::jsonb,
        add column if not exists review_priority text not null default ''normal'',
        add column if not exists ai_basic_status text not null default ''not_run'',
        add column if not exists ai_basic_model text,
        add column if not exists ai_basic_version text,
        add column if not exists ai_advanced_status text not null default ''not_run'',
        add column if not exists ai_advanced_analysis jsonb,
        add column if not exists ai_advanced_source_hash text,
        add column if not exists ai_advanced_at timestamptz,
        add column if not exists published_entity_id uuid',
      table_name
    );

    execute format(
      'create unique index if not exists %I on public.%I (idempotency_key) where idempotency_key is not null',
      table_name || '_idempotency_key_idx',
      table_name
    );

    execute format(
      'create index if not exists %I on public.%I (content_fingerprint, status)',
      table_name || '_fingerprint_status_idx',
      table_name
    );

    execute format(
      'create index if not exists %I on public.%I (review_priority, created_at desc)',
      table_name || '_review_priority_idx',
      table_name
    );

    execute format(
      'alter table public.%I drop constraint if exists %I',
      table_name,
      table_name || '_review_priority_check'
    );
    execute format(
      'alter table public.%I add constraint %I check (review_priority in (''normal'', ''recommended'', ''required''))',
      table_name,
      table_name || '_review_priority_check'
    );

    execute format(
      'alter table public.%I drop constraint if exists %I',
      table_name,
      table_name || '_ai_basic_status_check'
    );
    execute format(
      'alter table public.%I add constraint %I check (ai_basic_status in (''not_run'', ''completed'', ''failed''))',
      table_name,
      table_name || '_ai_basic_status_check'
    );

    execute format(
      'alter table public.%I drop constraint if exists %I',
      table_name,
      table_name || '_ai_advanced_status_check'
    );
    execute format(
      'alter table public.%I add constraint %I check (ai_advanced_status in (''not_run'', ''completed'', ''failed''))',
      table_name,
      table_name || '_ai_advanced_status_check'
    );
  end loop;
end $$;

create table if not exists public.submission_mentions (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null check (submission_type in ('event', 'academy', 'teacher', 'spot')),
  submission_id uuid not null,
  entity_type text not null check (entity_type in ('professional', 'academy', 'organizer', 'spot', 'festival')),
  display_name text not null,
  normalized_name text not null,
  roles text[] not null default '{}',
  affiliation text,
  origin_city text,
  origin_country_code text,
  evidence text,
  suggested_match_id uuid,
  suggested_match_name text,
  match_confidence numeric(4,3),
  resolution_status text not null default 'pending'
    check (resolution_status in ('pending', 'matched', 'candidate', 'ignored')),
  resolved_entity_id uuid,
  detected_by text not null default 'basic_ai'
    check (detected_by in ('basic_ai', 'advanced_ai', 'admin')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (submission_type, submission_id, entity_type, normalized_name)
);

create index if not exists submission_mentions_source_idx
  on public.submission_mentions (submission_type, submission_id, resolution_status);

create index if not exists submission_mentions_candidate_idx
  on public.submission_mentions (entity_type, resolution_status, normalized_name);

alter table public.submission_mentions enable row level security;

create table if not exists public.submission_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_code text not null unique,
  submission_type text not null check (submission_type in ('event', 'academy', 'teacher', 'spot')),
  submission_id uuid,
  step text not null check (step in ('upload', 'ai_basic', 'submit', 'recovery')),
  error_code text,
  error_message text,
  route text,
  user_agent text,
  user_comment text,
  contact_email text,
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists submission_incidents_status_idx
  on public.submission_incidents (status, created_at desc);

alter table public.submission_incidents enable row level security;
