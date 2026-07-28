alter table public.events
  add column if not exists date_status text not null default 'confirmed',
  add column if not exists date_label text;

alter table public.events
  alter column starts_at drop not null;

alter table public.events
  drop constraint if exists events_date_status_check;

alter table public.events
  add constraint events_date_status_check
  check (
    (date_status = 'confirmed' and starts_at is not null)
    or
    (date_status = 'coming_soon' and starts_at is null)
  );
