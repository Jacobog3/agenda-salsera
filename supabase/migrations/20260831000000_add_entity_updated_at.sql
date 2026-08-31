create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.events
  add column if not exists updated_at timestamptz;

alter table public.academies
  add column if not exists updated_at timestamptz;

alter table public.spots
  add column if not exists updated_at timestamptz;

alter table public.teachers
  add column if not exists updated_at timestamptz;

update public.events set updated_at = created_at where updated_at is null;
update public.academies set updated_at = created_at where updated_at is null;
update public.spots set updated_at = created_at where updated_at is null;
update public.teachers set updated_at = created_at where updated_at is null;

alter table public.events
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.academies
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.spots
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.teachers
  alter column updated_at set default now(),
  alter column updated_at set not null;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists academies_set_updated_at on public.academies;
create trigger academies_set_updated_at
before update on public.academies
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists spots_set_updated_at on public.spots;
create trigger spots_set_updated_at
before update on public.spots
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at
before update on public.teachers
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists festival_series_set_updated_at on public.festival_series;
create trigger festival_series_set_updated_at
before update on public.festival_series
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists festival_editions_set_updated_at on public.festival_editions;
create trigger festival_editions_set_updated_at
before update on public.festival_editions
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists community_resources_set_updated_at on public.community_resources;
create trigger community_resources_set_updated_at
before update on public.community_resources
for each row execute function public.set_updated_at_timestamp();
