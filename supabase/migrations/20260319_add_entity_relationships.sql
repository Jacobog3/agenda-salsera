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

alter table public.events
  add column if not exists organizer_id uuid references public.organizers(id) on delete set null,
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

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

create index if not exists events_organizer_id_idx
  on public.events (organizer_id);

create index if not exists events_academy_id_idx
  on public.events (academy_id);

create index if not exists event_teachers_teacher_id_idx
  on public.event_teachers (teacher_id);

create index if not exists academy_teachers_teacher_id_idx
  on public.academy_teachers (teacher_id);

alter table public.organizers enable row level security;
alter table public.event_teachers enable row level security;
alter table public.academy_teachers enable row level security;

drop policy if exists "Public can read published organizers" on public.organizers;
create policy "Public can read published organizers"
on public.organizers
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
