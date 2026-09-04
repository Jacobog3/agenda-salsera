create table if not exists public.entity_aliases (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('professional', 'academy', 'organizer', 'spot', 'festival')),
  entity_id uuid not null,
  alias text not null,
  normalized_alias text not null,
  source text not null default 'admin_resolution'
    check (source in ('admin_resolution', 'admin_manual', 'import')),
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, normalized_alias)
);

create index if not exists entity_aliases_lookup_idx
  on public.entity_aliases (entity_type, normalized_alias);

alter table public.entity_aliases enable row level security;

comment on table public.entity_aliases is
  'Admin-confirmed alternate spellings used to match mentions to canonical entities.';

alter table public.events
  add column if not exists spot_id uuid references public.spots(id) on delete set null;

create index if not exists events_spot_id_idx
  on public.events (spot_id);
