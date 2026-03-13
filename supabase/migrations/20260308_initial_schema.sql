create extension if not exists "pgcrypto";

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

alter table public.events enable row level security;
alter table public.academies enable row level security;
alter table public.event_submissions enable row level security;

create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true);

create policy "Public can read published academies"
on public.academies
for select
to anon, authenticated
using (is_published = true);
