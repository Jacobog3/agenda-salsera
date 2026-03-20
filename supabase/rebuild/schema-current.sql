create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null,
  title_en text not null,
  description_es text not null,
  description_en text not null,
  cover_image_url text not null,
  gallery_urls text[] not null default '{}',
  dance_style text not null,
  city text not null,
  area text,
  venue_name text not null,
  address text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_amount numeric(10,2),
  price_text text,
  currency text not null default 'GTQ',
  organizer_name text not null,
  organizer_id uuid,
  academy_id uuid,
  contact_url text not null,
  external_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description_es text not null default '',
  description_en text not null default '',
  logo_image_url text,
  banner_image_url text,
  city text,
  area text,
  address text,
  whatsapp_url text,
  instagram_url text,
  facebook_url text,
  website_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.academies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description_es text not null,
  description_en text not null,
  cover_image_url text not null,
  banner_image_url text,
  city text not null,
  area text,
  address text,
  styles_taught text[] not null default '{}',
  style_tags text[] not null default '{}',
  schedule_text text,
  schedule_data jsonb,
  levels text,
  trial_class boolean not null default false,
  modality text default 'presencial',
  whatsapp_url text,
  instagram_url text,
  facebook_url text,
  website_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

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

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  bio_es text not null,
  bio_en text not null,
  profile_image_url text,
  banner_image_url text,
  city text not null,
  area text,
  address text,
  styles_taught text[] not null default '{}',
  style_tags text[] not null default '{}',
  levels text,
  modality text,
  class_formats text[] not null default '{}',
  teaching_zones text[] not null default '{}',
  teaching_venues text[] not null default '{}',
  schedule_text text,
  schedule_data jsonb,
  booking_url text,
  whatsapp_url text,
  instagram_url text,
  facebook_url text,
  website_url text,
  trial_class boolean not null default false,
  price_text text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.event_teachers (
  event_id uuid not null references public.events(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, teacher_id)
);

create table if not exists public.academy_teachers (
  academy_id uuid not null references public.academies(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (academy_id, teacher_id)
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
  address text,
  contact_url text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.academy_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text not null,
  address text,
  styles text,
  whatsapp text,
  instagram text,
  website text,
  contact_name text,
  schedule_text text,
  levels text,
  trial_class boolean default false,
  modality text default 'presencial',
  image_url text,
  dance_style text default 'salsa_bachata',
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.spot_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text not null,
  address text,
  image_url text,
  schedule text,
  cover_charge text,
  whatsapp text,
  instagram text,
  contact_name text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.teacher_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text not null,
  address text,
  styles text,
  levels text,
  modality text default 'presencial',
  class_formats text,
  teaching_venues text,
  schedule_text text,
  image_url text,
  whatsapp text,
  instagram text,
  website text,
  booking_url text,
  contact_name text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  reason text not null,
  details text,
  contact_email text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists academy_submissions_status_idx
  on public.academy_submissions (status);

create index if not exists event_submissions_status_idx
  on public.event_submissions (status);

create index if not exists teacher_submissions_status_idx
  on public.teacher_submissions (status);

create index if not exists spot_submissions_status_idx
  on public.spot_submissions (status);

create index if not exists events_organizer_id_idx
  on public.events (organizer_id);

create index if not exists events_academy_id_idx
  on public.events (academy_id);

create index if not exists event_teachers_teacher_id_idx
  on public.event_teachers (teacher_id);

create index if not exists academy_teachers_teacher_id_idx
  on public.academy_teachers (teacher_id);

alter table public.events enable row level security;
alter table public.academies enable row level security;
alter table public.organizers enable row level security;
alter table public.spots enable row level security;
alter table public.teachers enable row level security;
alter table public.event_teachers enable row level security;
alter table public.academy_teachers enable row level security;
alter table public.reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_organizer_id_fkey'
  ) then
    alter table public.events
      add constraint events_organizer_id_fkey
      foreign key (organizer_id) references public.organizers(id) on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_academy_id_fkey'
  ) then
    alter table public.events
      add constraint events_academy_id_fkey
      foreign key (academy_id) references public.academies(id) on delete set null;
  end if;
end
$$;

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read published academies" on public.academies;
create policy "Public can read published academies"
on public.academies
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read published organizers" on public.organizers;
create policy "Public can read published organizers"
on public.organizers
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read published spots" on public.spots;
create policy "Public can read published spots"
on public.spots
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read published teachers" on public.teachers;
create policy "Public can read published teachers"
on public.teachers
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read event teachers" on public.event_teachers;
create policy "Public can read event teachers"
on public.event_teachers
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read academy teachers" on public.academy_teachers;
create policy "Public can read academy teachers"
on public.academy_teachers
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can insert reports" on public.reports;
create policy "Anyone can insert reports"
on public.reports
for insert
with check (true);

drop policy if exists "Service role can do anything with reports" on public.reports;
create policy "Service role can do anything with reports"
on public.reports
for all
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('event-flyers', 'event-flyers', true)
on conflict (id) do nothing;

drop policy if exists "Public can read event flyers" on storage.objects;
create policy "Public can read event flyers"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'event-flyers');

drop policy if exists "Service role can upload event flyers" on storage.objects;
create policy "Service role can upload event flyers"
on storage.objects
for insert
to service_role
with check (bucket_id = 'event-flyers');
