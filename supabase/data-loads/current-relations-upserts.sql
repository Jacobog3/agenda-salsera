-- Generated for current permanent relationships on 2026-03-19
-- Run after schema-current.sql or after the 20260319_add_entity_relationships migration.

insert into public.organizers (
  slug,
  name,
  description_es,
  description_en,
  city,
  is_featured,
  is_published
)
values
  (
    'antigua-salsa-bachata-festival',
    'Antigua Salsa y Bachata Festival',
    'Marca y organizacion del Antigua Salsa y Bachata Festival, bootcamps y actividades relacionadas en Antigua Guatemala.',
    'Brand and organizing team behind Antigua Salsa y Bachata Festival, bootcamps, and related activities in Antigua Guatemala.',
    'Antigua Guatemala',
    true,
    true
  ),
  (
    'guatemala-salsa-congress',
    'Guatemala Salsa Congress',
    'Marca y organizacion del Guatemala Salsa Congress, sociales de lanzamiento y actividades previas al congreso.',
    'Brand and organizing team behind Guatemala Salsa Congress, launch socials, and activities leading up to the congress.',
    'Ciudad de Guatemala',
    true,
    true
  ),
  (
    'noches-salseras',
    'Noches Salseras',
    'Marca recurrente de sociales salseros en Mixco con ediciones especiales y fechas mensuales.',
    'Recurring salsa social brand in Mixco with special editions and monthly dates.',
    'Mixco',
    false,
    true
  ),
  (
    'salsa-for-you-dance-company',
    'SalsaForYou Dance Company',
    'Marca organizadora de sociales y actividades vinculadas a Salsa for You GT.',
    'Organizer brand for socials and activities linked to Salsa for You GT.',
    'Ciudad de Guatemala',
    false,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  city = excluded.city,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;

insert into public.teachers (
  slug,
  name,
  bio_es,
  bio_en,
  city,
  address,
  styles_taught,
  levels,
  modality,
  class_formats,
  teaching_zones,
  teaching_venues,
  is_featured,
  is_published
)
values
  (
    'nancy-gudiel',
    'Nancy Gudiel',
    'Fundadora, directora y maestra de New Sensation Salsa Studio en Antigua Guatemala.',
    'Founder, director, and teacher at New Sensation Salsa Studio in Antigua Guatemala.',
    'Antigua Guatemala',
    'New Sensation Salsa Studio, Antigua Guatemala',
    '{"salsa","bachata"}',
    'Principiante a avanzado',
    'presencial',
    '{"Grupales","Privadas"}',
    '{"Antigua Guatemala"}',
    '{"New Sensation Salsa Studio"}',
    false,
    false
  ),
  (
    'jose-gudiel',
    'Jose Gudiel',
    'Bailarin, maestro y coreografo de New Sensation Salsa Studio en Antigua Guatemala.',
    'Dancer, teacher, and choreographer at New Sensation Salsa Studio in Antigua Guatemala.',
    'Antigua Guatemala',
    'New Sensation Salsa Studio, Antigua Guatemala',
    '{"salsa","bachata"}',
    'Principiante a avanzado',
    'presencial',
    '{"Grupales","Privadas"}',
    '{"Antigua Guatemala"}',
    '{"New Sensation Salsa Studio"}',
    false,
    false
  ),
  (
    'fatima-gudiel',
    'Fatima Gudiel',
    'Bailarina, coreografa y maestra de New Sensation Salsa Studio en Antigua Guatemala.',
    'Dancer, choreographer, and teacher at New Sensation Salsa Studio in Antigua Guatemala.',
    'Antigua Guatemala',
    'New Sensation Salsa Studio, Antigua Guatemala',
    '{"salsa","bachata"}',
    'Principiante a avanzado',
    'presencial',
    '{"Grupales","Privadas"}',
    '{"Antigua Guatemala"}',
    '{"New Sensation Salsa Studio"}',
    false,
    false
  )
on conflict (slug) do update set
  name = excluded.name,
  bio_es = excluded.bio_es,
  bio_en = excluded.bio_en,
  city = excluded.city,
  address = excluded.address,
  styles_taught = excluded.styles_taught,
  levels = excluded.levels,
  modality = excluded.modality,
  class_formats = excluded.class_formats,
  teaching_zones = excluded.teaching_zones,
  teaching_venues = excluded.teaching_venues,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;

insert into public.academy_teachers (academy_id, teacher_id)
select a.id, t.id
from public.academies a
join public.teachers t on t.slug in ('nancy-gudiel', 'jose-gudiel', 'fatima-gudiel')
where a.slug = 'new-sensation-salsa-studio'
on conflict do nothing;

update public.events e
set academy_id = a.id
from public.academies a
where e.slug = 'friday-night-salsa-party-sfy'
  and a.slug = 'salsa-for-you-gt';

update public.events e
set academy_id = a.id
from public.academies a
where e.slug in ('taller-de-cumbia-ads-marzo', 'ads-saint-patrick-s-day-socialito-mms995qg')
  and a.slug = 'ads-addiction-dance-studio';

update public.events e
set academy_id = a.id
from public.academies a
where e.slug = 'taller-de-salsaton-mmpeo2f9'
  and a.slug = 'comunidad-salsera';

update public.events e
set academy_id = a.id
from public.academies a
where e.slug = 'taller-salsa-lady-style-por-majo-mmu2kb9a'
  and a.slug = 'in-motion-dance-fitness';

update public.events e
set organizer_id = o.id
from public.organizers o
where e.slug in ('antigua-salsa-bachata-festival-2026', 'bachata-bootcamp-erick-nalu-2026')
  and o.slug = 'antigua-salsa-bachata-festival';

update public.events e
set organizer_id = o.id
from public.organizers o
where e.slug in ('guatemala-salsa-congress-lanzamiento', 'guatemala-salsa-congress-2026')
  and o.slug = 'guatemala-salsa-congress';

update public.events e
set organizer_id = o.id
from public.organizers o
where e.slug in ('noches-salseras-cumpleaneros-marzo', 'noches-salseras-2026-mmvb7aff')
  and o.slug = 'noches-salseras';

update public.events e
set organizer_id = o.id
from public.organizers o
where e.slug = 'friday-night-salsa-party-sfy'
  and o.slug = 'salsa-for-you-dance-company';
