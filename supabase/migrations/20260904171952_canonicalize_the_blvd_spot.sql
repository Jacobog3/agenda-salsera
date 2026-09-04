-- Canonical venue for events that name THE BLVD in San Cristobal, Mixco.
-- Event-specific prices, DJs, and conditions remain on each individual event.
with canonical_spot as (
  insert into public.spots (
    slug, name, description_es, description_en, cover_image_url,
    city, country_code, area, address, schedule_es, schedule_en,
    google_maps_url, is_featured, is_published
  ) values (
    'salon-de-eventos-the-blvd',
    'Salón de Eventos THE BLVD',
    'Salón de eventos en Centro Comercial San Cristóbal, Mixco. Ha sido sede de ediciones registradas de Noches Salseras. Los horarios, precios y condiciones se confirman en cada evento.',
    'Event venue in Centro Comercial San Cristóbal, Mixco. It has hosted recorded editions of Noches Salseras. Schedules, prices, and conditions are confirmed for each event.',
    'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/1778184389803-ghi960.jpeg',
    'Mixco', 'GT', 'Ciudad San Cristóbal',
    'Centro Comercial San Cristóbal, Ciudad San Cristóbal, Zona 8, Mixco',
    'Sin horario fijo publicado. Consulta las próximas fechas confirmadas.',
    'No fixed schedule published. Check confirmed upcoming events.',
    'https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n%20de%20Eventos%20THE%20BLVD%2C%20Ciudad%20San%20Crist%C3%B3bal%2C%20Mixco',
    false, true
  )
  on conflict (slug) do update set
    name = excluded.name,
    description_es = excluded.description_es,
    description_en = excluded.description_en,
    city = excluded.city,
    country_code = excluded.country_code,
    area = excluded.area,
    address = excluded.address,
    schedule_es = excluded.schedule_es,
    schedule_en = excluded.schedule_en,
    google_maps_url = excluded.google_maps_url
  returning id
), aliases as (
  select alias, normalized_alias from (values
    ('THE BLVD', 'the blvd'),
    ('Salón de Eventos The Blvd', 'salon de eventos the blvd'),
    ('Salón THE BLVD', 'salon the blvd')
  ) as values(alias, normalized_alias)
)
insert into public.entity_aliases (entity_type, entity_id, alias, normalized_alias, source)
select 'spot', canonical_spot.id, aliases.alias, aliases.normalized_alias, 'import'
from canonical_spot cross join aliases
on conflict (entity_type, entity_id, normalized_alias) do update
set alias = excluded.alias;

update public.events
set spot_id = (select id from public.spots where slug = 'salon-de-eventos-the-blvd')
where venue_name ilike '%the blvd%';
