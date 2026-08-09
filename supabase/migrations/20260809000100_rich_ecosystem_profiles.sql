-- Expand SomosSalsa from an event directory into a location-neutral dance ecosystem.
-- Existing `teachers` records remain the canonical professional profile so we do
-- not create duplicate people when a teacher is also a performer, DJ, or judge.

alter table public.teachers
  add column if not exists profile_kind text not null default 'person',
  add column if not exists professional_roles text[] not null default '{teacher}',
  add column if not exists nationality_country_code text,
  add column if not exists source_url text,
  add column if not exists source_label text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists last_verified_at timestamptz;

alter table public.teachers
  drop constraint if exists teachers_profile_kind_check,
  add constraint teachers_profile_kind_check
    check (profile_kind in ('person', 'couple', 'team')),
  drop constraint if exists teachers_verification_status_check,
  add constraint teachers_verification_status_check
    check (verification_status in ('unverified', 'source_confirmed', 'owner_confirmed')),
  drop constraint if exists teachers_nationality_country_code_check,
  add constraint teachers_nationality_country_code_check
    check (nationality_country_code is null or nationality_country_code ~ '^[A-Z]{2}$');

alter table public.event_teachers
  add column if not exists roles text[] not null default '{teacher}',
  add column if not exists billing_order integer not null default 0,
  add column if not exists notes text;

create table if not exists public.festival_series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  series_type text not null,
  short_description_es text not null default '',
  short_description_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  logo_image_url text,
  banner_image_url text,
  home_city text,
  home_country_code text,
  organizer_id uuid references public.organizers(id) on delete set null,
  website_url text,
  ticket_url text,
  instagram_url text,
  facebook_url text,
  whatsapp_url text,
  source_url text,
  verification_status text not null default 'unverified',
  last_verified_at timestamptz,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint festival_series_country_code_check
    check (home_country_code is null or home_country_code ~ '^[A-Z]{2}$'),
  constraint festival_series_type_check
    check (series_type in ('festival', 'congress')),
  constraint festival_series_verification_status_check
    check (verification_status in ('unverified', 'source_confirmed', 'owner_confirmed'))
);

create table if not exists public.festival_editions (
  id uuid primary key default gen_random_uuid(),
  festival_series_id uuid not null references public.festival_series(id) on delete cascade,
  slug text not null unique,
  name text not null,
  edition_label text,
  summary_es text not null default '',
  summary_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  cover_image_url text,
  starts_on date,
  ends_on date,
  starts_at timestamptz,
  ends_at timestamptz,
  date_status text not null default 'confirmed',
  date_label text,
  city text,
  country_code text,
  time_zone text,
  area text,
  primary_venue_name text,
  address text,
  hotel_info_es text,
  hotel_info_en text,
  ticket_url text,
  registration_url text,
  rules_url text,
  status text not null default 'upcoming',
  source_url text,
  verification_status text not null default 'unverified',
  last_verified_at timestamptz,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint festival_editions_date_status_check check (
    (date_status = 'confirmed' and (starts_on is not null or starts_at is not null))
    or (date_status = 'coming_soon' and starts_on is null and starts_at is null)
  ),
  constraint festival_editions_status_check
    check (status in ('upcoming', 'active', 'finished', 'cancelled')),
  constraint festival_editions_country_code_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint festival_editions_verification_status_check
    check (verification_status in ('unverified', 'source_confirmed', 'owner_confirmed'))
);

alter table public.events
  add column if not exists event_kind text not null default 'social',
  add column if not exists festival_edition_id uuid references public.festival_editions(id) on delete set null;

alter table public.events
  drop constraint if exists events_event_kind_check,
  add constraint events_event_kind_check check (
    event_kind in (
      'social', 'workshop', 'class', 'bootcamp', 'competition',
      'show', 'concert', 'festival', 'congress', 'other'
    )
  );

create table if not exists public.festival_edition_artists (
  festival_edition_id uuid not null references public.festival_editions(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  roles text[] not null default '{}',
  billing_order integer not null default 0,
  notes_es text,
  notes_en text,
  created_at timestamptz not null default now(),
  primary key (festival_edition_id, teacher_id)
);

-- Candidate names let AI capture a lineup immediately without inventing a full
-- professional profile. An admin can later resolve each candidate to teachers.id.
create table if not exists public.festival_edition_artist_candidates (
  id uuid primary key default gen_random_uuid(),
  festival_edition_id uuid not null references public.festival_editions(id) on delete cascade,
  display_name text not null,
  roles text[] not null default '{}',
  affiliation text,
  origin_city text,
  origin_country_code text,
  evidence text,
  source_url text,
  resolved_teacher_id uuid references public.teachers(id) on delete set null,
  resolution_status text not null default 'pending',
  billing_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint festival_artist_candidates_origin_country_check
    check (origin_country_code is null or origin_country_code ~ '^[A-Z]{2}$'),
  constraint festival_artist_candidates_resolution_check
    check (resolution_status in ('pending', 'matched', 'new_profile', 'ignored')),
  unique (festival_edition_id, display_name)
);

create table if not exists public.festival_schedule_items (
  id uuid primary key default gen_random_uuid(),
  festival_edition_id uuid not null references public.festival_editions(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title_es text not null,
  title_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  activity_type text not null default 'other',
  starts_at timestamptz,
  ends_at timestamptz,
  venue_name text,
  room_name text,
  level_label text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint festival_schedule_activity_type_check check (
    activity_type in (
      'registration', 'workshop', 'class', 'bootcamp', 'competition',
      'show', 'social', 'concert', 'break', 'other'
    )
  )
);

create table if not exists public.festival_passes (
  id uuid primary key default gen_random_uuid(),
  festival_edition_id uuid not null references public.festival_editions(id) on delete cascade,
  name_es text not null,
  name_en text not null default '',
  description_es text not null default '',
  description_en text not null default '',
  includes_es text[] not null default '{}',
  includes_en text[] not null default '{}',
  price_amount numeric(10,2),
  currency text,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  purchase_url text,
  availability_status text not null default 'available',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint festival_passes_availability_status_check
    check (availability_status in ('coming_soon', 'available', 'sold_out', 'closed')),
  unique (festival_edition_id, name_es)
);

create table if not exists public.festival_pass_price_tiers (
  id uuid primary key default gen_random_uuid(),
  festival_pass_id uuid not null references public.festival_passes(id) on delete cascade,
  label_es text not null,
  label_en text not null default '',
  starts_on date,
  ends_on date,
  price_amount numeric(10,2) not null,
  currency text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (festival_pass_id, label_es, currency)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete cascade,
  academy_id uuid references public.academies(id) on delete cascade,
  organizer_id uuid references public.organizers(id) on delete cascade,
  festival_series_id uuid references public.festival_series(id) on delete cascade,
  festival_edition_id uuid references public.festival_editions(id) on delete cascade,
  media_type text not null,
  role text not null default 'gallery',
  url text not null,
  storage_path text,
  thumbnail_url text,
  mime_type text,
  width integer,
  height integer,
  duration_seconds integer,
  title_es text,
  title_en text,
  caption_es text,
  caption_en text,
  alt_text_es text,
  alt_text_en text,
  source_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint media_assets_single_owner_check check (
    num_nonnulls(
      event_id, teacher_id, academy_id, organizer_id,
      festival_series_id, festival_edition_id
    ) = 1
  ),
  constraint media_assets_media_type_check
    check (media_type in ('image', 'video', 'document', 'embed')),
  constraint media_assets_role_check check (
    role in (
      'cover', 'logo', 'banner', 'flyer', 'gallery', 'schedule',
      'venue', 'map', 'rules', 'trailer', 'recap', 'other'
    )
  )
);

create index if not exists teachers_professional_roles_idx
  on public.teachers using gin (professional_roles);
create index if not exists festival_series_location_idx
  on public.festival_series (home_country_code, home_city);
create index if not exists festival_editions_series_date_idx
  on public.festival_editions (festival_series_id, starts_at desc);
create index if not exists festival_editions_location_date_idx
  on public.festival_editions (country_code, city, starts_at);
create index if not exists events_festival_edition_id_idx
  on public.events (festival_edition_id);
create index if not exists festival_edition_artists_teacher_id_idx
  on public.festival_edition_artists (teacher_id);
create index if not exists festival_artist_candidates_edition_order_idx
  on public.festival_edition_artist_candidates (festival_edition_id, billing_order);
create index if not exists festival_schedule_items_edition_date_idx
  on public.festival_schedule_items (festival_edition_id, starts_at, sort_order);
create index if not exists festival_passes_edition_order_idx
  on public.festival_passes (festival_edition_id, sort_order);
create index if not exists festival_pass_price_tiers_pass_order_idx
  on public.festival_pass_price_tiers (festival_pass_id, sort_order);
create index if not exists media_assets_event_idx
  on public.media_assets (event_id, sort_order);
create index if not exists media_assets_teacher_idx
  on public.media_assets (teacher_id, sort_order);
create index if not exists media_assets_festival_series_idx
  on public.media_assets (festival_series_id, sort_order);
create index if not exists media_assets_festival_edition_idx
  on public.media_assets (festival_edition_id, sort_order);

alter table public.festival_series enable row level security;
alter table public.festival_editions enable row level security;
alter table public.festival_edition_artists enable row level security;
alter table public.festival_edition_artist_candidates enable row level security;
alter table public.festival_schedule_items enable row level security;
alter table public.festival_passes enable row level security;
alter table public.festival_pass_price_tiers enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "Public can read published festival series" on public.festival_series;
create policy "Public can read published festival series"
on public.festival_series for select to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read published festival editions" on public.festival_editions;
create policy "Public can read published festival editions"
on public.festival_editions for select to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read festival edition artists" on public.festival_edition_artists;
create policy "Public can read festival edition artists"
on public.festival_edition_artists for select to anon, authenticated
using (
  exists (
    select 1 from public.festival_editions edition
    where edition.id = festival_edition_id and edition.is_published = true
  )
);

drop policy if exists "Public can read festival artist candidates" on public.festival_edition_artist_candidates;
create policy "Public can read festival artist candidates"
on public.festival_edition_artist_candidates for select to anon, authenticated
using (
  resolution_status <> 'ignored' and exists (
    select 1 from public.festival_editions edition
    where edition.id = festival_edition_id and edition.is_published = true
  )
);

drop policy if exists "Public can read published festival schedule" on public.festival_schedule_items;
create policy "Public can read published festival schedule"
on public.festival_schedule_items for select to anon, authenticated
using (
  is_published = true and exists (
    select 1 from public.festival_editions edition
    where edition.id = festival_edition_id and edition.is_published = true
  )
);

drop policy if exists "Public can read published festival passes" on public.festival_passes;
create policy "Public can read published festival passes"
on public.festival_passes for select to anon, authenticated
using (
  is_published = true and exists (
    select 1 from public.festival_editions edition
    where edition.id = festival_edition_id and edition.is_published = true
  )
);

drop policy if exists "Public can read festival pass price tiers" on public.festival_pass_price_tiers;
create policy "Public can read festival pass price tiers"
on public.festival_pass_price_tiers for select to anon, authenticated
using (
  exists (
    select 1
    from public.festival_passes pass
    join public.festival_editions edition on edition.id = pass.festival_edition_id
    where pass.id = festival_pass_id
      and pass.is_published = true
      and edition.is_published = true
  )
);

drop policy if exists "Public can read published media" on public.media_assets;
create policy "Public can read published media"
on public.media_assets for select to anon, authenticated
using (is_published = true);

-- Separate media bucket for richer profiles. Public submissions remain image-only,
-- while authenticated admin tools can add MP4/WebM videos up to 200 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dance-media',
  'dance-media',
  true,
  209715200,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read dance media" on storage.objects;
create policy "Public can read dance media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'dance-media');

-- Existing rows keep their current countries. New records must explicitly choose
-- a location; Guatemala is no longer silently assigned by the database.
alter table public.events alter column country_code drop default;
alter table public.events alter column time_zone drop default;
alter table public.academies alter column country_code drop default;
alter table public.teachers alter column country_code drop default;
alter table public.spots alter column country_code drop default;
alter table public.organizers alter column country_code drop default;
alter table public.event_submissions alter column country_code drop default;
alter table public.event_submissions alter column time_zone drop default;
alter table public.academy_submissions alter column country_code drop default;
alter table public.teacher_submissions alter column country_code drop default;
alter table public.spot_submissions alter column country_code drop default;

alter table public.events
  drop constraint if exists events_country_code_check,
  add constraint events_country_code_check check (country_code ~ '^[A-Z]{2}$'),
  drop constraint if exists events_time_zone_check,
  add constraint events_time_zone_check check (length(trim(time_zone)) >= 3);
alter table public.academies
  drop constraint if exists academies_country_code_check,
  add constraint academies_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.teachers
  drop constraint if exists teachers_country_code_check,
  add constraint teachers_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.spots
  drop constraint if exists spots_country_code_check,
  add constraint spots_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.organizers
  drop constraint if exists organizers_country_code_check,
  add constraint organizers_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.event_submissions
  drop constraint if exists event_submissions_country_code_check,
  add constraint event_submissions_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.academy_submissions
  drop constraint if exists academy_submissions_country_code_check,
  add constraint academy_submissions_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.teacher_submissions
  drop constraint if exists teacher_submissions_country_code_check,
  add constraint teacher_submissions_country_code_check check (country_code ~ '^[A-Z]{2}$');
alter table public.spot_submissions
  drop constraint if exists spot_submissions_country_code_check,
  add constraint spot_submissions_country_code_check check (country_code ~ '^[A-Z]{2}$');

-- Promote the known ASBF event into a permanent festival plus a 2026 edition.
insert into public.festival_series (
  slug, name, series_type, short_description_es, short_description_en,
  description_es, description_en, logo_image_url, banner_image_url,
  home_city, home_country_code, website_url, ticket_url, source_url,
  verification_status, is_featured, is_published
)
values (
  'antigua-salsa-bachata-festival',
  'Antigua Salsa y Bachata Festival',
  'festival',
  'Festival internacional de salsa y bachata en Antigua Guatemala.',
  'International salsa and bachata festival in Antigua Guatemala.',
  'Perfil permanente del Antigua Salsa y Bachata Festival. Aquí se reúnen sus ediciones, agenda, artistas, pases, sedes y material oficial.',
  'Permanent profile for the Antigua Salsa and Bachata Festival, including editions, schedule, artists, passes, venues, and official media.',
  null,
  '/images/events/antigua-festival-artistas.png',
  'Antigua Guatemala',
  'GT',
  'https://antiguasbf.com',
  'https://antiguasbf.com',
  'https://antiguasbf.com',
  'source_confirmed',
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  series_type = excluded.series_type,
  short_description_es = excluded.short_description_es,
  short_description_en = excluded.short_description_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  banner_image_url = excluded.banner_image_url,
  home_city = excluded.home_city,
  home_country_code = excluded.home_country_code,
  website_url = excluded.website_url,
  ticket_url = excluded.ticket_url,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.festival_editions (
  festival_series_id, slug, name, edition_label,
  summary_es, summary_en, description_es, description_en,
  cover_image_url, starts_on, ends_on, starts_at, ends_at, date_status, date_label,
  city, country_code, time_zone,
  primary_venue_name, address, ticket_url, source_url,
  verification_status, status, is_featured, is_published
)
select
  series.id,
  'antigua-salsa-bachata-festival-2026',
  'Antigua Salsa y Bachata Festival 2026',
  '2026',
  'Cinco días de talleres, competencias, shows y baile social en Antigua Guatemala.',
  'Five days of workshops, competitions, shows, and social dancing in Antigua Guatemala.',
  coalesce(event.description_es, ''),
  coalesce(event.description_en, ''),
  coalesce(event.cover_image_url, series.banner_image_url),
  case when event.starts_at is not null then (event.starts_at at time zone coalesce(event.time_zone, 'America/Guatemala'))::date else null end,
  case when event.ends_at is not null then (event.ends_at at time zone coalesce(event.time_zone, 'America/Guatemala'))::date else null end,
  event.starts_at,
  event.ends_at,
  case when event.starts_at is null then 'coming_soon' else 'confirmed' end,
  event.date_label,
  coalesce(event.city, series.home_city),
  coalesce(event.country_code, series.home_country_code),
  coalesce(event.time_zone, 'America/Guatemala'),
  event.venue_name,
  event.address,
  coalesce(event.external_url, event.contact_url, series.ticket_url),
  'https://antiguasbf.com',
  'source_confirmed',
  case
    when event.ends_at is not null and event.ends_at < now() then 'finished'
    when event.starts_at is not null and event.starts_at <= now() then 'active'
    else 'upcoming'
  end,
  true,
  true
from public.festival_series series
left join public.events event on event.slug = 'antigua-salsa-bachata-festival-2026'
where series.slug = 'antigua-salsa-bachata-festival'
on conflict (slug) do update set
  festival_series_id = excluded.festival_series_id,
  name = excluded.name,
  summary_es = excluded.summary_es,
  summary_en = excluded.summary_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  date_status = excluded.date_status,
  date_label = excluded.date_label,
  city = excluded.city,
  country_code = excluded.country_code,
  time_zone = excluded.time_zone,
  primary_venue_name = excluded.primary_venue_name,
  address = excluded.address,
  ticket_url = excluded.ticket_url,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  status = excluded.status,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

update public.events event
set
  event_kind = 'festival',
  festival_edition_id = edition.id
from public.festival_editions edition
where event.slug = 'antigua-salsa-bachata-festival-2026'
  and edition.slug = 'antigua-salsa-bachata-festival-2026';

insert into public.media_assets (
  festival_edition_id, media_type, role, url, sort_order, source_url
)
select
  edition.id,
  'image',
  case when gallery.position = 1 then 'flyer' else 'gallery' end,
  gallery.url,
  gallery.position,
  'https://antiguasbf.com'
from public.festival_editions edition
join public.events event on event.slug = 'antigua-salsa-bachata-festival-2026'
cross join lateral unnest(coalesce(event.gallery_urls, '{}')) with ordinality as gallery(url, position)
where edition.slug = 'antigua-salsa-bachata-festival-2026'
  and not exists (
    select 1 from public.media_assets media
    where media.festival_edition_id = edition.id and media.url = gallery.url
  );

-- ASBF already promotes its 2027 edition. It becomes the highlighted upcoming
-- edition while 2026 remains intact as historical material.
insert into public.festival_editions (
  festival_series_id, slug, name, edition_label,
  summary_es, summary_en, description_es, description_en,
  cover_image_url, starts_on, ends_on, date_status, date_label,
  city, country_code, time_zone, ticket_url, source_url,
  verification_status, status, is_featured, is_published
)
select
  series.id,
  'antigua-salsa-bachata-festival-2027',
  'Antigua Salsa y Bachata Festival 2027',
  '2027',
  'La próxima edición se realizará del 29 de abril al 3 de mayo de 2027 y ya comenzó a presentar artistas.',
  'The next edition will run from April 29 to May 3, 2027 and has started announcing artists.',
  'Edición 2027 del Antigua Salsa y Bachata Festival. Las sedes, pases y programa se completarán conforme sean publicados oficialmente.',
  'The 2027 edition of the Antigua Salsa and Bachata Festival. Venues, passes, and schedule will be completed as they are officially announced.',
  'https://antiguasbf.com/wp-content/uploads/2026/07/horizontal.jpeg',
  '2027-04-29',
  '2027-05-03',
  'confirmed',
  null,
  'Antigua Guatemala',
  'GT',
  'America/Guatemala',
  null,
  'https://antiguasbf.com',
  'source_confirmed',
  'upcoming',
  true,
  true
from public.festival_series series
where series.slug = 'antigua-salsa-bachata-festival'
on conflict (slug) do update set
  festival_series_id = excluded.festival_series_id,
  name = excluded.name,
  edition_label = excluded.edition_label,
  summary_es = excluded.summary_es,
  summary_en = excluded.summary_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  date_status = excluded.date_status,
  date_label = excluded.date_label,
  city = excluded.city,
  country_code = excluded.country_code,
  time_zone = excluded.time_zone,
  ticket_url = excluded.ticket_url,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  status = excluded.status,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.festival_edition_artist_candidates (
  festival_edition_id, display_name, roles, evidence, source_url,
  resolution_status, billing_order
)
select
  edition.id,
  'Bersy',
  '{other}',
  'El sitio oficial la presenta dentro de la sección de artistas confirmados para ASBF 2027.',
  'https://antiguasbf.com',
  'pending',
  1
from public.festival_editions edition
where edition.slug = 'antigua-salsa-bachata-festival-2027'
on conflict (festival_edition_id, display_name) do update set
  roles = excluded.roles,
  evidence = excluded.evidence,
  source_url = excluded.source_url,
  billing_order = excluded.billing_order,
  updated_at = now();

insert into public.media_assets (
  festival_edition_id, media_type, role, url,
  title_es, title_en, alt_text_es, alt_text_en, source_url, sort_order
)
select edition.id, media.media_type, media.role, media.url,
  media.title_es, media.title_en, media.alt_text_es, media.alt_text_en,
  'https://antiguasbf.com', media.sort_order
from public.festival_editions edition
cross join (values
  ('image', 'banner', 'https://antiguasbf.com/wp-content/uploads/2026/07/horizontal.jpeg', 'ASBF 2027', 'ASBF 2027', 'Anuncio oficial de ASBF 2027', 'Official ASBF 2027 announcement', 0),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/07/Bersy.jpeg', 'Bersy', 'Bersy', 'Bersy, artista confirmada para ASBF 2027', 'Bersy, confirmed artist for ASBF 2027', 1)
) as media(media_type, role, url, title_es, title_en, alt_text_es, alt_text_en, sort_order)
where edition.slug = 'antigua-salsa-bachata-festival-2027'
  and not exists (
    select 1 from public.media_assets existing
    where existing.festival_edition_id = edition.id and existing.url = media.url
  );

-- Guatemala Salsa Congress is a congress series. ALQUIMIA is the theme/name of
-- its 2026 edition, not a separate one-off festival.
insert into public.festival_series (
  slug, name, series_type, short_description_es, short_description_en,
  description_es, description_en, banner_image_url,
  home_city, home_country_code, website_url, ticket_url,
  instagram_url, source_url, verification_status,
  is_featured, is_published
)
values (
  'guatemala-salsa-congress',
  'Guatemala Salsa Congress',
  'congress',
  'Congreso de salsa con talleres, competencias, shows y sociales en Ciudad de Guatemala.',
  'Salsa congress with workshops, competitions, shows, and socials in Guatemala City.',
  'Perfil permanente del Guatemala Salsa Congress. Cada edición conserva su concepto, fechas, competencias, pases, hospedaje y material oficial.',
  'Permanent profile for Guatemala Salsa Congress. Each edition preserves its theme, dates, competitions, passes, lodging, and official media.',
  'https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png',
  'Ciudad de Guatemala',
  'GT',
  'https://www.guatesalsa.com',
  'https://salsatickets.com/entradas?evento=17',
  'https://www.instagram.com/guatesalsa',
  'https://www.guatesalsa.com',
  'source_confirmed',
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  series_type = excluded.series_type,
  short_description_es = excluded.short_description_es,
  short_description_en = excluded.short_description_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  banner_image_url = excluded.banner_image_url,
  home_city = excluded.home_city,
  home_country_code = excluded.home_country_code,
  website_url = excluded.website_url,
  ticket_url = excluded.ticket_url,
  instagram_url = excluded.instagram_url,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.festival_editions (
  festival_series_id, slug, name, edition_label,
  summary_es, summary_en, description_es, description_en,
  cover_image_url, starts_on, ends_on, date_status,
  city, country_code, time_zone, area, primary_venue_name, address,
  hotel_info_es, hotel_info_en, ticket_url, registration_url, rules_url,
  source_url, verification_status, status, is_featured, is_published
)
select
  series.id,
  'guatemala-salsa-congress-alquimia-2026',
  'ALQUIMIA — Guatemala Salsa Congress 2026',
  'ALQUIMIA 2026',
  'Conectas, creces y te transformas: talleres, competencias, shows y cinco sociales.',
  'Connect, grow, and transform through workshops, competitions, shows, and five socials.',
  'El Guatemala Salsa Congress 2026 presenta ALQUIMIA, una experiencia enfocada en salsa, comunidad, formación y competencia centroamericana.',
  'Guatemala Salsa Congress 2026 presents ALQUIMIA, an experience focused on salsa, community, training, and Central American competition.',
  'https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png',
  '2026-11-04',
  '2026-11-08',
  'confirmed',
  'Ciudad de Guatemala',
  'GT',
  'America/Guatemala',
  'Ciudad Cayalá',
  'Ciudad Cayalá',
  'Ciudad Cayalá, Ciudad de Guatemala',
  'Hotel sede: AC Hotel Marriott. Habitación individual, doble, triple o cuádruple desde USD 122 por noche con impuestos; desayuno adicional.',
  'Official hotel: AC Hotel Marriott. Single, double, triple, or quadruple room from USD 122 per night including taxes; breakfast is extra.',
  'https://salsatickets.com/entradas?evento=17',
  'https://salsatickets.com/entradas?evento=17',
  'https://acrobat.adobe.com/id/urn:aaid:sc:US:52ae0944-05bb-4025-abfc-7377b60f082f',
  'https://www.guatesalsa.com',
  'source_confirmed',
  'upcoming',
  true,
  true
from public.festival_series series
where series.slug = 'guatemala-salsa-congress'
on conflict (slug) do update set
  festival_series_id = excluded.festival_series_id,
  name = excluded.name,
  edition_label = excluded.edition_label,
  summary_es = excluded.summary_es,
  summary_en = excluded.summary_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  date_status = excluded.date_status,
  city = excluded.city,
  country_code = excluded.country_code,
  time_zone = excluded.time_zone,
  area = excluded.area,
  primary_venue_name = excluded.primary_venue_name,
  address = excluded.address,
  hotel_info_es = excluded.hotel_info_es,
  hotel_info_en = excluded.hotel_info_en,
  ticket_url = excluded.ticket_url,
  registration_url = excluded.registration_url,
  rules_url = excluded.rules_url,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  status = excluded.status,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  updated_at = now();

update public.events event
set
  event_kind = 'congress',
  festival_edition_id = edition.id
from public.festival_editions edition
where event.slug = 'guatemala-salsa-congress-2026'
  and edition.slug = 'guatemala-salsa-congress-alquimia-2026';

insert into public.media_assets (
  festival_edition_id, media_type, role, url, title_es, title_en,
  alt_text_es, alt_text_en, source_url, sort_order
)
select edition.id, 'image', 'cover',
  'https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png',
  'Arte oficial ALQUIMIA', 'Official ALQUIMIA artwork',
  'Arte oficial de ALQUIMIA Guatemala Salsa Congress 2026',
  'Official artwork for ALQUIMIA Guatemala Salsa Congress 2026',
  'https://www.guatesalsa.com', 0
from public.festival_editions edition
where edition.slug = 'guatemala-salsa-congress-alquimia-2026'
  and not exists (
    select 1 from public.media_assets existing
    where existing.festival_edition_id = edition.id
      and existing.url = 'https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png'
  );

insert into public.festival_passes (
  festival_edition_id, name_es, name_en, description_es, description_en,
  includes_es, includes_en, purchase_url, availability_status, sort_order, is_published
)
select edition.id, pass.name_es, pass.name_en, pass.description_es, pass.description_en,
  pass.includes_es, pass.includes_en,
  'https://salsatickets.com/entradas?evento=17', 'available', pass.sort_order, true
from public.festival_editions edition
cross join (values
  ('Full Pass', 'Full Pass', 'Acceso más completo de la edición.', 'The most complete access for this edition.', array['Talleres','Competencias','Shows','5 sociales'], array['Workshops','Competitions','Shows','5 socials'], 1),
  ('Dancer Pass', 'Dancer Pass', 'Pase para competidores con acceso amplio.', 'Pass for competitors with broad access.', array['Competir','Shows','5 sociales','Talleres de cortesía'], array['Compete','Shows','5 socials','Courtesy workshops'], 2),
  ('Fan Pass', 'Fan Pass', 'Pase para disfrutar competencias y sociales.', 'Pass for enjoying competitions and socials.', array['Competencias','5 sociales'], array['Competitions','5 socials'], 3)
) as pass(name_es, name_en, description_es, description_en, includes_es, includes_en, sort_order)
where edition.slug = 'guatemala-salsa-congress-alquimia-2026'
on conflict (festival_edition_id, name_es) do update set
  name_en = excluded.name_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  includes_es = excluded.includes_es,
  includes_en = excluded.includes_en,
  purchase_url = excluded.purchase_url,
  availability_status = excluded.availability_status,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.festival_pass_price_tiers (
  festival_pass_id, label_es, label_en, starts_on, ends_on,
  price_amount, currency, sort_order
)
select pass.id, tier.label_es, tier.label_en, tier.starts_on, tier.ends_on,
  tier.price_amount, tier.currency, tier.sort_order
from public.festival_passes pass
join public.festival_editions edition on edition.id = pass.festival_edition_id
join (values
  ('Full Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 1095::numeric, 'GTQ', 1),
  ('Full Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 140::numeric, 'USD', 2),
  ('Full Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 1215::numeric, 'GTQ', 3),
  ('Full Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 155::numeric, 'USD', 4),
  ('Full Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 1365::numeric, 'GTQ', 5),
  ('Full Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 175::numeric, 'USD', 6),
  ('Dancer Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 1050::numeric, 'GTQ', 1),
  ('Dancer Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 130::numeric, 'USD', 2),
  ('Dancer Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 1150::numeric, 'GTQ', 3),
  ('Dancer Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 145::numeric, 'USD', 4),
  ('Dancer Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 1325::numeric, 'GTQ', 5),
  ('Dancer Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 165::numeric, 'USD', 6),
  ('Fan Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 880::numeric, 'GTQ', 1),
  ('Fan Pass', '1ra preventa', '1st presale', date '2026-03-28', date '2026-06-30', 110::numeric, 'USD', 2),
  ('Fan Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 955::numeric, 'GTQ', 3),
  ('Fan Pass', '2da preventa', '2nd presale', date '2026-07-01', date '2026-09-30', 120::numeric, 'USD', 4),
  ('Fan Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 1075::numeric, 'GTQ', 5),
  ('Fan Pass', 'Venta final', 'Final sale', date '2026-10-01', date '2026-11-08', 135::numeric, 'USD', 6)
) as tier(pass_name, label_es, label_en, starts_on, ends_on, price_amount, currency, sort_order)
  on tier.pass_name = pass.name_es
where edition.slug = 'guatemala-salsa-congress-alquimia-2026'
on conflict (festival_pass_id, label_es, currency) do update set
  label_en = excluded.label_en,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  price_amount = excluded.price_amount,
  sort_order = excluded.sort_order;
