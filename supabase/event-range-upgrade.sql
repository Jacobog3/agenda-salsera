-- Align existing databases with the current events model.
alter table public.events
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists ends_at timestamptz,
  add column if not exists price_text text;

update public.events
set gallery_urls = '{}'
where gallery_urls is null;

alter table public.events
  alter column gallery_urls set default '{}',
  alter column gallery_urls set not null;
