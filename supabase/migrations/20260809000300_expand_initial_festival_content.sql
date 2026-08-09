-- Expand the two launch profiles with newly published, source-backed content.
-- Artist flyers remain edition media and are never used as profile portraits.

update public.festival_series
set
  whatsapp_url = 'https://wa.me/50256676144',
  updated_at = now()
where slug = 'antigua-salsa-bachata-festival';

update public.festival_editions
set
  summary_es = 'La próxima edición será del 29 de abril al 3 de mayo de 2027 y ya está anunciando jueces y talleristas internacionales.',
  summary_en = 'The next edition will run from April 29 to May 3, 2027 and is already announcing international judges and instructors.',
  description_es = 'ASBF 2027 reunirá salsa y bachata en Antigua Guatemala. La organización ya publicó su primera ronda de jueces y talleristas; las sedes, pases y programa se completarán conforme sean anunciados oficialmente.',
  description_en = 'ASBF 2027 will bring salsa and bachata together in Antigua Guatemala. The organizer has published its first round of judges and instructors; venues, passes, and the schedule will be completed as they are officially announced.',
  updated_at = now()
where slug = 'antigua-salsa-bachata-festival-2027';

insert into public.festival_edition_artist_candidates (
  festival_edition_id, display_name, roles, origin_country_code,
  evidence, source_url, resolution_status, billing_order
)
select edition.id, artist.display_name, artist.roles, artist.origin_country_code,
  artist.evidence, artist.source_url, 'pending', artist.billing_order
from public.festival_editions edition
cross join (values
  ('Bersy Cortez', array['judge','teacher']::text[], 'VE', 'El flyer oficial de ASBF 2027 la anuncia desde Venezuela como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/07/Bersy.jpeg', 1),
  ('Jorge Martinez', array['judge']::text[], 'MX', 'El flyer oficial de ASBF 2027 lo anuncia desde México como juez.', 'https://antiguasbf.com/wp-content/uploads/2026/08/d15bcb8a-33e6-4907-b864-97e99b999ea7-scaled.jpeg', 2),
  ('Héctor y Kathy', array['judge','teacher']::text[], 'GT', 'El flyer oficial de ASBF 2027 los anuncia desde Guatemala como jueces y talleristas.', 'https://antiguasbf.com/wp-content/uploads/2026/08/16e3a36a-def6-44fb-bdc7-f53ff6f1d11b-scaled.jpeg', 3),
  ('Magda Liuzza', array['judge','teacher']::text[], 'IT', 'El flyer oficial de ASBF 2027 la anuncia desde Italia como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/08/e64b0b21-d620-44d6-acba-2218c1c2e68f-scaled.jpeg', 4),
  ('Gioia Cingolani', array['judge','teacher']::text[], 'IT', 'El flyer oficial de ASBF 2027 la anuncia desde Italia como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/08/e2657c21-8ece-4ff9-b100-5a4e27a3e221-scaled.jpeg', 5),
  ('Marisol Blanco', array['judge','teacher']::text[], 'CU', 'El flyer oficial de ASBF 2027 la anuncia desde Cuba como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/08/52fe5bdc-37e5-447d-905f-815590c3ce64-scaled.jpeg', 6),
  ('Oswaldo Corzo', array['judge','teacher']::text[], 'MX', 'El flyer oficial de ASBF 2027 lo anuncia desde México como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/08/a0a34838-ebb1-4e3c-8dd0-76ab6ac159c1-scaled.jpeg', 7),
  ('Billy Fajardo', array['judge','teacher']::text[], 'US', 'El flyer oficial de ASBF 2027 lo anuncia desde Estados Unidos como juez y tallerista.', 'https://antiguasbf.com/wp-content/uploads/2026/08/417a5359-bbf3-4b19-8d1d-20119af7ab1e-scaled.jpeg', 8),
  ('Evelyn y Guasa', array['judge','teacher']::text[], 'CO', 'El flyer oficial de ASBF 2027 los anuncia desde Colombia como jueces y talleristas.', 'https://antiguasbf.com/wp-content/uploads/2026/08/b5bc5f94-1d41-4c73-93e2-8500dcaa7573-scaled.jpeg', 9)
) as artist(display_name, roles, origin_country_code, evidence, source_url, billing_order)
where edition.slug = 'antigua-salsa-bachata-festival-2027'
on conflict (festival_edition_id, display_name) do update set
  roles = excluded.roles,
  origin_country_code = excluded.origin_country_code,
  evidence = excluded.evidence,
  source_url = excluded.source_url,
  resolution_status = 'pending',
  billing_order = excluded.billing_order,
  updated_at = now();

-- Replace the earlier shortened candidate name without deleting any resolved
-- profile. It is hidden only when it is still the unresolved seed.
update public.festival_edition_artist_candidates candidate
set resolution_status = 'ignored', updated_at = now()
from public.festival_editions edition
where candidate.festival_edition_id = edition.id
  and edition.slug = 'antigua-salsa-bachata-festival-2027'
  and candidate.display_name = 'Bersy'
  and candidate.resolved_teacher_id is null;

insert into public.media_assets (
  festival_edition_id, media_type, role, url, mime_type,
  title_es, title_en, alt_text_es, alt_text_en, source_url, sort_order
)
select edition.id, media.media_type, media.role, media.url, media.mime_type,
  media.title_es, media.title_en, media.alt_text_es, media.alt_text_en,
  'https://antiguasbf.com', media.sort_order
from public.festival_editions edition
cross join (values
  ('video', 'trailer', 'https://antiguasbf.com/wp-content/uploads/2026/07/IMG_0162.mp4', 'video/mp4', 'Video oficial ASBF 2027', 'Official ASBF 2027 video', 'Video promocional oficial de ASBF 2027', 'Official promotional video for ASBF 2027', 1),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/d15bcb8a-33e6-4907-b864-97e99b999ea7-scaled.jpeg', 'image/jpeg', 'Jorge Martinez', 'Jorge Martinez', 'Jorge Martinez, juez de ASBF 2027', 'Jorge Martinez, ASBF 2027 judge', 12),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/16e3a36a-def6-44fb-bdc7-f53ff6f1d11b-scaled.jpeg', 'image/jpeg', 'Héctor y Kathy', 'Héctor and Kathy', 'Héctor y Kathy, jueces y talleristas de ASBF 2027', 'Héctor and Kathy, ASBF 2027 judges and instructors', 13),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/e64b0b21-d620-44d6-acba-2218c1c2e68f-scaled.jpeg', 'image/jpeg', 'Magda Liuzza', 'Magda Liuzza', 'Magda Liuzza, juez y tallerista de ASBF 2027', 'Magda Liuzza, ASBF 2027 judge and instructor', 14),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/e2657c21-8ece-4ff9-b100-5a4e27a3e221-scaled.jpeg', 'image/jpeg', 'Gioia Cingolani', 'Gioia Cingolani', 'Gioia Cingolani, juez y tallerista de ASBF 2027', 'Gioia Cingolani, ASBF 2027 judge and instructor', 15),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/52fe5bdc-37e5-447d-905f-815590c3ce64-scaled.jpeg', 'image/jpeg', 'Marisol Blanco', 'Marisol Blanco', 'Marisol Blanco, juez y tallerista de ASBF 2027', 'Marisol Blanco, ASBF 2027 judge and instructor', 16),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/a0a34838-ebb1-4e3c-8dd0-76ab6ac159c1-scaled.jpeg', 'image/jpeg', 'Oswaldo Corzo', 'Oswaldo Corzo', 'Oswaldo Corzo, juez y tallerista de ASBF 2027', 'Oswaldo Corzo, ASBF 2027 judge and instructor', 17),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/417a5359-bbf3-4b19-8d1d-20119af7ab1e-scaled.jpeg', 'image/jpeg', 'Billy Fajardo', 'Billy Fajardo', 'Billy Fajardo, juez y tallerista de ASBF 2027', 'Billy Fajardo, ASBF 2027 judge and instructor', 18),
  ('image', 'gallery', 'https://antiguasbf.com/wp-content/uploads/2026/08/b5bc5f94-1d41-4c73-93e2-8500dcaa7573-scaled.jpeg', 'image/jpeg', 'Evelyn y Guasa', 'Evelyn and Guasa', 'Evelyn y Guasa, jueces y talleristas de ASBF 2027', 'Evelyn and Guasa, ASBF 2027 judges and instructors', 19)
) as media(media_type, role, url, mime_type, title_es, title_en, alt_text_es, alt_text_en, sort_order)
where edition.slug = 'antigua-salsa-bachata-festival-2027'
  and not exists (
    select 1 from public.media_assets existing
    where existing.festival_edition_id = edition.id and existing.url = media.url
  );

update public.festival_editions
set
  description_es = 'ALQUIMIA reúne cinco días de talleres, competencias, shows y sociales en Ciudad Cayalá. Para competir se compra primero el Dancer Pass y la inscripción de categorías se completa por separado en Podium System cuando sea habilitado.',
  description_en = 'ALQUIMIA brings together five days of workshops, competitions, shows, and socials in Ciudad Cayalá. Competitors first purchase a Dancer Pass and complete category registration separately in Podium System when it becomes available.',
  hotel_info_es = 'Hotel sede: AC Hotel Marriott. Habitación individual, doble, triple o cuádruple desde USD 122 por noche con impuestos. Desayuno: USD 10 adicionales por persona. Para obtener la tarifa del congreso, reservar con Vanessa Walter Veliz al +502 3992 6242 y mencionar Guatemala Salsa Congress.',
  hotel_info_en = 'Official hotel: AC Hotel Marriott. Single, double, triple, or quadruple room from USD 122 per night including taxes. Breakfast is an additional USD 10 per person. For the congress rate, book with Vanessa Walter Veliz at +502 3992 6242 and mention Guatemala Salsa Congress.',
  updated_at = now()
where slug = 'guatemala-salsa-congress-alquimia-2026';

insert into public.festival_edition_artist_candidates (
  festival_edition_id, display_name, roles, evidence, source_url,
  resolution_status, billing_order
)
select edition.id, artist.display_name, array['other']::text[],
  'SalsaTickets, la plataforma de compra enlazada por el organizador, presenta este nombre como parte del lineup de ALQUIMIA 2026.',
  'https://salsatickets.com/agenda', 'pending', artist.billing_order
from public.festival_editions edition
cross join (values
  ('De''Jon Polanski & Clo Ferreira', 1),
  ('Alex Toledo', 2),
  ('Fadi Fusion', 3)
) as artist(display_name, billing_order)
where edition.slug = 'guatemala-salsa-congress-alquimia-2026'
on conflict (festival_edition_id, display_name) do update set
  evidence = excluded.evidence,
  source_url = excluded.source_url,
  billing_order = excluded.billing_order,
  updated_at = now();

insert into public.media_assets (
  festival_edition_id, media_type, role, url, mime_type,
  title_es, title_en, alt_text_es, alt_text_en, source_url, sort_order
)
select edition.id, 'image', 'venue',
  'https://www.guatesalsa.com/assets/hotel-reference.png', 'image/png',
  'Hotel sede AC Hotel Marriott', 'Official hotel AC Hotel Marriott',
  'Hospedaje oficial de ALQUIMIA 2026 en AC Hotel Marriott',
  'Official ALQUIMIA 2026 lodging at AC Hotel Marriott',
  'https://www.guatesalsa.com', 10
from public.festival_editions edition
where edition.slug = 'guatemala-salsa-congress-alquimia-2026'
  and not exists (
    select 1 from public.media_assets existing
    where existing.festival_edition_id = edition.id
      and existing.url = 'https://www.guatesalsa.com/assets/hotel-reference.png'
  );
