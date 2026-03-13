-- ============================================
-- SalsaGuate - Full database setup
-- Run this in Supabase SQL Editor (one time)
-- ============================================

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null,
  title_en text not null,
  description_es text not null,
  description_en text not null,
  cover_image_url text not null,
  dance_style text not null,
  city text not null,
  area text,
  venue_name text not null,
  address text,
  starts_at timestamptz not null,
  price_amount numeric(10,2),
  currency text not null default 'GTQ',
  organizer_name text not null,
  contact_url text not null,
  external_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Academies table
create table if not exists public.academies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description_es text not null,
  description_en text not null,
  cover_image_url text not null,
  city text not null,
  area text,
  address text,
  styles_taught text[] not null default '{}',
  whatsapp_url text,
  instagram_url text,
  website_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Event submissions table
create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  dance_style text not null,
  date date not null,
  time time not null,
  price_text text,
  city text not null,
  venue_name text not null,
  organizer_name text not null,
  contact_url text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- 5. Spots table (recurring dance venues)
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

-- 6. Row Level Security
alter table public.events enable row level security;
alter table public.academies enable row level security;
alter table public.event_submissions enable row level security;
alter table public.spots enable row level security;

-- 7. RLS Policies (public read for published records)
create policy "Public can read published events"
on public.events for select to anon, authenticated
using (is_published = true);

create policy "Public can read published academies"
on public.academies for select to anon, authenticated
using (is_published = true);

create policy "Public can read published spots"
on public.spots for select to anon, authenticated
using (is_published = true);

-- 8. Storage bucket for event flyers
insert into storage.buckets (id, name, public)
values ('event-flyers', 'event-flyers', true)
on conflict (id) do nothing;

-- 9. Storage policy (public read for event flyers)
create policy "Public can read event flyers"
on storage.objects for select to anon, authenticated
using (bucket_id = 'event-flyers');

-- 10. Storage policy (service role can upload)
create policy "Service role can upload event flyers"
on storage.objects for insert to service_role
with check (bucket_id = 'event-flyers');
