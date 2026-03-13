create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description_es text not null,
  description_en text not null,
  cover_image_url text not null,
  city text not null,
  area text,
  address text,
  schedule_es text not null,
  schedule_en text not null,
  cover_charge_es text,
  cover_charge_en text,
  whatsapp_url text,
  instagram_url text,
  google_maps_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.spots enable row level security;

create policy "Public can read published spots"
on public.spots
for select
to anon, authenticated
using (is_published = true);
