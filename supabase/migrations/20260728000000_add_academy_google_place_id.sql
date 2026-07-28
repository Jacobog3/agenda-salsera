alter table public.academies
  add column if not exists google_place_id text;

comment on column public.academies.google_place_id is
  'Stable Google Places identifier. Rating data is fetched from Google and is not persisted.';
