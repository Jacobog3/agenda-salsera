-- Curated community resources are discovery listings, not marketplace inventory.
-- Professional listings may link to an existing canonical artist profile so a
-- teacher who also works as a DJ is never duplicated.

create table if not exists public.community_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  resource_kind text not null default 'business',
  categories text[] not null default '{}',
  description_es text not null default '',
  description_en text not null default '',
  image_url text,
  city text,
  country_code text,
  instagram_url text,
  whatsapp_url text,
  website_url text,
  teacher_id uuid references public.teachers(id) on delete set null,
  source_url text,
  source_label text,
  verification_status text not null default 'unverified',
  last_verified_at timestamptz,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_resources_kind_check
    check (resource_kind in ('business', 'professional')),
  constraint community_resources_categories_check
    check (categories <@ array['dancewear', 'dj', 'photography', 'other']::text[] and cardinality(categories) > 0),
  constraint community_resources_country_code_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint community_resources_verification_status_check
    check (verification_status in ('unverified', 'source_confirmed', 'owner_confirmed')),
  constraint community_resources_contact_check
    check (instagram_url is not null or whatsapp_url is not null or website_url is not null)
);

create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null default 'new',
  resource_id uuid references public.community_resources(id) on delete set null,
  name text not null,
  resource_kind text not null default 'business',
  categories text[] not null default '{}',
  description text,
  city text,
  country_code text,
  instagram text,
  whatsapp text,
  website text,
  submitter_relationship text not null default 'recommendation',
  contact_name text,
  contact_email text,
  status text not null default 'pending',
  created_resource_id uuid references public.community_resources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_submissions_kind_check
    check (resource_kind in ('business', 'professional')),
  constraint resource_submissions_type_check
    check (submission_type in ('new', 'update', 'report')),
  constraint resource_submissions_categories_check
    check (categories <@ array['dancewear', 'dj', 'photography', 'other']::text[] and cardinality(categories) > 0),
  constraint resource_submissions_country_code_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint resource_submissions_relationship_check
    check (submitter_relationship in ('owner', 'recommendation')),
  constraint resource_submissions_status_check
    check (status in ('pending', 'draft_created', 'resolved', 'dismissed')),
  constraint resource_submissions_contact_check
    check (
      (submission_type = 'new' and (instagram is not null or whatsapp is not null or website is not null))
      or
      (submission_type in ('update', 'report') and resource_id is not null and description is not null)
    )
);

-- Events can mention a DJ or another listed provider even when that resource
-- does not yet have a canonical professional profile in `teachers`.
create table if not exists public.event_resources (
  event_id uuid not null references public.events(id) on delete cascade,
  resource_id uuid not null references public.community_resources(id) on delete cascade,
  roles text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  primary key (event_id, resource_id)
);

create index if not exists community_resources_categories_idx
  on public.community_resources using gin (categories);
create index if not exists community_resources_published_idx
  on public.community_resources (is_published, sort_order, name);
create index if not exists resource_submissions_status_idx
  on public.resource_submissions (status, created_at desc);
create index if not exists resource_submissions_resource_idx
  on public.resource_submissions (resource_id, created_at desc);
create index if not exists event_resources_resource_idx
  on public.event_resources (resource_id);

alter table public.community_resources enable row level security;
alter table public.resource_submissions enable row level security;
alter table public.event_resources enable row level security;

drop policy if exists "Public can read published community resources"
  on public.community_resources;
create policy "Public can read published community resources"
on public.community_resources
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Public can read event resources"
  on public.event_resources;
create policy "Public can read event resources"
on public.event_resources
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_resources.event_id
      and events.is_published = true
  )
);

-- Jose Medina remains one canonical person. His verified public profile lists
-- both DJ and dancer, so only his existing professional roles are expanded.
update public.teachers
set professional_roles = (
      select array_agg(distinct role order by role)
      from unnest(coalesce(professional_roles, '{}') || array['dj', 'dancer']) as expanded(role)
    ),
    source_url = coalesce(source_url, 'https://www.instagram.com/jmedinasalsa/'),
    source_label = coalesce(source_label, 'Instagram público'),
    last_verified_at = '2026-08-13T00:00:00-06:00'
where slug = 'jose-medina';

insert into public.community_resources (
  slug, name, resource_kind, categories, description_es, description_en,
  instagram_url, teacher_id, source_url, source_label, verification_status,
  last_verified_at, is_featured, is_published, sort_order
)
values
  (
    'tiendanza', 'Tiendanza', 'business', array['dancewear'],
    'Tienda en línea de zapatos, ropa y accesorios de danza.',
    'Online shop for dance shoes, clothing, and accessories.',
    'https://www.instagram.com/tiendanza/', null,
    'https://www.instagram.com/tiendanza/', 'Perfil público de Instagram',
    'source_confirmed', '2026-08-13T00:00:00-06:00', true, true, 10
  ),
  (
    'mj-dance-store-gt', 'MJ Dance Store', 'business', array['dancewear'],
    'Zapatos de baile diseñados para ofrecer ligereza, giro y estilo.',
    'Dance shoes designed for light movement, turns, and style.',
    'https://www.instagram.com/mjdancestoregt/', null,
    'https://www.instagram.com/mjdancestoregt/', 'Perfil público de Instagram',
    'source_confirmed', '2026-08-13T00:00:00-06:00', true, true, 20
  ),
  (
    'jose-medina-dj', 'Jose Medina', 'professional', array['dj'],
    'DJ y bailarín. También puedes consultar su perfil profesional en SomosSalsa.',
    'DJ and dancer. You can also view his professional profile on SomosSalsa.',
    'https://www.instagram.com/jmedinasalsa/',
    (select id from public.teachers where slug = 'jose-medina' limit 1),
    'https://www.instagram.com/jmedinasalsa/', 'Perfil público de Instagram',
    'source_confirmed', '2026-08-13T00:00:00-06:00', true, true, 30
  ),
  (
    'dj-lux', 'DJ Lux', 'professional', array['dj'],
    'DJ recomendado por la comunidad salsera.',
    'DJ recommended by the salsa community.',
    'https://www.instagram.com/robertolux87/', null,
    'https://www.instagram.com/robertolux87/', 'Recomendación de la comunidad',
    'unverified', null, false, true, 40
  ),
  (
    'dj-pakeyro', 'DJ Pake&ro', 'professional', array['dj'],
    'DJ y bailarín de salsa y bachata recomendado por la comunidad.',
    'Salsa and bachata dancer and DJ recommended by the community.',
    'https://www.instagram.com/pakeyro/', null,
    'https://www.instagram.com/pakeyro/', 'Recomendación de la comunidad',
    'unverified', null, false, true, 50
  ),
  (
    'pako-perez-foto', 'Pako Perez', 'professional', array['photography'],
    'Fotógrafo profesional con trabajo relacionado con la comunidad de baile latino.',
    'Professional photographer whose work includes the Latin dance community.',
    'https://www.instagram.com/pakoperezfoto/', null,
    'https://www.instagram.com/pakoperezfoto/', 'Perfil público de Instagram',
    'source_confirmed', '2026-08-13T00:00:00-06:00', true, true, 60
  )
on conflict (slug) do update set
  name = excluded.name,
  resource_kind = excluded.resource_kind,
  categories = excluded.categories,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  instagram_url = excluded.instagram_url,
  teacher_id = excluded.teacher_id,
  source_url = excluded.source_url,
  source_label = excluded.source_label,
  verification_status = excluded.verification_status,
  last_verified_at = excluded.last_verified_at,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order,
  updated_at = now();
