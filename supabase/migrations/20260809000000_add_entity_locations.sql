-- Make location explicit across every discoverable entity.
-- Existing records are in Guatemala and are backfilled safely through defaults.

alter table public.events
  add column if not exists country_code text not null default 'GT',
  add column if not exists time_zone text not null default 'America/Guatemala';

alter table public.academies
  add column if not exists country_code text not null default 'GT';

alter table public.teachers
  add column if not exists country_code text not null default 'GT';

alter table public.spots
  add column if not exists country_code text not null default 'GT';

alter table public.organizers
  add column if not exists country_code text not null default 'GT';

alter table public.event_submissions
  add column if not exists country_code text not null default 'GT',
  add column if not exists time_zone text not null default 'America/Guatemala';

alter table public.academy_submissions
  add column if not exists country_code text not null default 'GT';

alter table public.teacher_submissions
  add column if not exists country_code text not null default 'GT';

alter table public.spot_submissions
  add column if not exists country_code text not null default 'GT';

create index if not exists events_location_idx
  on public.events (country_code, city);

create index if not exists academies_location_idx
  on public.academies (country_code, city);

create index if not exists teachers_location_idx
  on public.teachers (country_code, city);

create index if not exists spots_location_idx
  on public.spots (country_code, city);

create index if not exists organizers_location_idx
  on public.organizers (country_code, city);
