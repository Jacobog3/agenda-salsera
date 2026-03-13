alter table public.events
  add column if not exists gallery_urls text[] default '{}';
