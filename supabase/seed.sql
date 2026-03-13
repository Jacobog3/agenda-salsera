-- ============================================
-- SalsaGuate - Seed data from real flyers
-- Run this in Supabase SQL Editor
-- ============================================

-- Clean existing data first
delete from public.events;
delete from public.spots;

-- =====================
-- EVENTS
-- =====================

-- 1. Super Sesión de Salsa (Minerva Guatemala)
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'super-sesion-de-salsa-minerva',
  'Super Sesión de Salsa',
  'Super Salsa Session',
  'Sasón y cocteles con la mejor salsa en vivo. Noche de baile y ritmo en Minerva Guatemala.',
  'Seasoning and cocktails with the best live salsa. A night of dance and rhythm at Minerva Guatemala.',
  '/images/events/super-sesion-salsa.png',
  'salsa',
  'Ciudad de Guatemala',
  null,
  'Sasón y Cocteles',
  null,
  '2026-03-12T19:00:00-06:00',
  null,
  'GTQ',
  'Minerva Guatemala',
  'https://instagram.com/minervaguatemala',
  false,
  true
);

-- 2. Friday Night Salsa Party (SalsaForYou)
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'friday-night-salsa-party-sfy',
  'Friday Night Salsa Party',
  'Friday Night Salsa Party',
  'Noche de salsa con SalsaForYou. Dress code playero, música y baile hasta las 12:30 AM.',
  'Salsa night with SalsaForYou. Beach dress code, music and dancing until 12:30 AM.',
  '/images/events/salsa-party-sfy.png',
  'salsa',
  'Ciudad de Guatemala',
  'Majadas',
  'Club Majadas SFY',
  'Interior Club Majadas',
  '2026-03-13T20:30:00-06:00',
  50,
  'GTQ',
  'SalsaForYou Dance Company',
  'https://instagram.com/salsaforyou',
  true,
  true
);

-- 3. Noches Salseras - Cumpleañeros (Rony Molina)
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'noches-salseras-cumpleaneros-marzo',
  'Noches Salseras 2026 – Cumpleañeros',
  'Salsa Nights 2026 – Birthday Edition',
  'Noche salsera con DJ Guaterumbero y fotos de Pako Pérez. Cumpleañeros entran gratis con DPI. Patrocina Don Chicharrón.',
  'Salsa night with DJ Guaterumbero and photos by Pako Pérez. Birthday guests enter free with ID. Sponsored by Don Chicharrón.',
  '/images/events/noches-salseras-march.png',
  'salsa_bachata',
  'Mixco',
  'San Cristóbal, Zona 8',
  'Salón de Eventos The Blvd',
  'Centro Comercial San Cristóbal, Cd. San Cristóbal, Z.8 Mixco',
  '2026-03-14T20:00:00-06:00',
  60,
  'GTQ',
  'Rony Molina',
  'https://wa.me/50255442548',
  true,
  true
);

-- 4. Dame Una Pata Bailando
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'dame-una-pata-bailando-marzo',
  'Dame Una Pata Bailando',
  'Give Me a Leg Dancing',
  'Social salsero con entrada Q50 + 4 libras de concentrado. Noche de baile y convivencia.',
  'Salsa social with Q50 entry + 4 lbs of concentrate. A night of dancing and community.',
  '/images/events/dame-una-pata-bailando.png',
  'salsa_bachata',
  'Mixco',
  'San Cristóbal, Zona 8',
  'Salón de Eventos The Blvd',
  'Centro Comercial San Cristóbal, Cd. San Cristóbal, Z.8 Mixco',
  '2026-03-20T20:00:00-06:00',
  50,
  'GTQ',
  'Rony Molina',
  'https://wa.me/50255442548',
  false,
  true
);

-- 5. Guatemala Salsa Congress - Gran Social de Lanzamiento
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'guatemala-salsa-congress-lanzamiento',
  'Guatemala Salsa Congress – Gran Social de Lanzamiento',
  'Guatemala Salsa Congress – Grand Launch Social',
  'Gran social de lanzamiento del Guatemala Salsa Congress 2026. Save the date para el evento más grande de salsa en Guatemala.',
  'Grand launch social for Guatemala Salsa Congress 2026. Save the date for the biggest salsa event in Guatemala.',
  '/images/events/guatemala-salsa-congress.png',
  'salsa',
  'Ciudad de Guatemala',
  null,
  'Por confirmar',
  null,
  '2026-03-28T20:00:00-06:00',
  null,
  'GTQ',
  'Guatemala Salsa Congress',
  'https://instagram.com/guatemalasalsacongress',
  true,
  true
);

-- 6. Antigua Salsa y Bachata Festival (entrenamiento + Bachata Bootcamp Erick & Nalu + presentación)
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, gallery_urls, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'antigua-salsa-bachata-festival-2026',
  'Antigua Salsa y Bachata Festival 2026',
  'Antigua Salsa and Bachata Festival 2026',
  '6 días de entrenamiento del 20 de marzo al 26 de abril. Incluye Bachata Bootcamp con Erick & Nalu. Presentación final: sábado 2 de mayo. Precio individual Q300, pareja Q550. El festival de salsa y bachata más importante de Antigua.',
  '6 training days from March 20 to April 26. Includes Bachata Bootcamp with Erick & Nalu. Final presentation: Saturday May 2. Individual Q300, couple Q550. The most important salsa and bachata festival in Antigua.',
  '/images/events/antigua-festival.png',
  '{/images/events/antigua-festival-bootcamp.png}',
  'salsa_bachata',
  'Antigua Guatemala',
  'Centro',
  'Por confirmar',
  null,
  '2026-05-02T18:00:00-06:00',
  300,
  'GTQ',
  'Antigua Salsa y Bachata Festival',
  'https://instagram.com/antiguasalsabachatafestival',
  true,
  true
);

-- 7. Taller de Cumbia – ADS
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'taller-de-cumbia-ads-marzo',
  'Taller de Cumbia – ADS',
  'Cumbia Workshop – ADS',
  'Taller de cumbia con DJ Juank. Ven a disfrutar y aprender a bailar cumbia este sábado.',
  'Cumbia workshop with DJ Juank. Come enjoy and learn to dance cumbia this Saturday.',
  '/images/events/taller-cumbia-ads.png',
  'other',
  'Ciudad de Guatemala',
  'Zona 5',
  'ADS Zona 5',
  'Bulevar La Asunción, Novicentro Zona 5, Local 59, Segundo Nivel',
  '2026-03-14T12:30:00-06:00',
  50,
  'GTQ',
  'Juan Carlos Altún',
  'https://wa.me/50242359551',
  false,
  true
);

-- 8. Buena Vista Social Club - TrovaJazz
insert into public.events (slug, title_es, title_en, description_es, description_en, cover_image_url, dance_style, city, area, venue_name, address, starts_at, price_amount, currency, organizer_name, contact_url, is_featured, is_published)
values (
  'buena-vista-social-club-trovajazz',
  'Musicantes presenta: Buena Vista Social Club',
  'Musicantes presents: Buena Vista Social Club',
  'Noche de son cubano con Musicantes en TrovaJazz. Percusión y voz: Erick Carrillo, bajo: El Bardo, guitarra: Jandir Rodríguez, tiple: Diego Zarat, trompeta: Julio Oliva, trombón: Miguelangel Ixcoy.',
  'Cuban son night with Musicantes at TrovaJazz. Percussion and vocals: Erick Carrillo, bass: El Bardo, guitar: Jandir Rodríguez, tiple: Diego Zarat, trumpet: Julio Oliva, trombone: Miguelangel Ixcoy.',
  '/images/events/buena-vista-social-club.png',
  'salsa',
  'Ciudad de Guatemala',
  null,
  'TrovaJazz',
  null,
  '2026-03-14T21:00:00-06:00',
  85,
  'GTQ',
  'Musicantes',
  'https://viveloonline.com',
  true,
  true
);

-- =====================
-- SPOTS (recurring venues)
-- =====================

-- 1. Noches Tropicales – Las Palmas
insert into public.spots (slug, name, description_es, description_en, cover_image_url, city, area, address, schedule_es, schedule_en, cover_charge_es, cover_charge_en, whatsapp_url, instagram_url, is_featured, is_published)
values (
  'noches-tropicales-las-palmas',
  'Noches Tropicales – Las Palmas',
  'Noches de salsa y ritmos tropicales en un ambiente relajado. De martes a domingo en Antigua Guatemala.',
  'Salsa and tropical rhythm nights in a relaxed atmosphere. Tuesday through Sunday in Antigua Guatemala.',
  '/images/spots/las-palmas.jpg',
  'Antigua Guatemala',
  'Centro',
  '5a Avenida Norte, Antigua Guatemala',
  'Martes a Domingo · 9:15 PM',
  'Tuesday to Sunday · 9:15 PM',
  'Por consumo',
  'No cover (minimum consumption)',
  'https://wa.me/50235695855',
  'https://instagram.com/laspalmasantiguaguatemala',
  true,
  true
);

-- 2. Jueves Latino – La Casbah
insert into public.spots (slug, name, description_es, description_en, cover_image_url, city, area, address, schedule_es, schedule_en, cover_charge_es, cover_charge_en, whatsapp_url, instagram_url, is_featured, is_published)
values (
  'jueves-latino-la-casbah',
  'Jueves Latino – Las Vibras de La Casbah',
  'Cada jueves noche de música latina y baile en La Casbah, Antigua Guatemala. Ambiente social y pista de baile.',
  'Every Thursday, Latin music and dance night at La Casbah, Antigua Guatemala. Social atmosphere and dance floor.',
  '/images/spots/la-casbah.jpg',
  'Antigua Guatemala',
  'Centro',
  null,
  'Jueves · 8:00 PM',
  'Thursdays · 8:00 PM',
  'Por consumo',
  'No cover (minimum consumption)',
  'https://wa.me/50256676144',
  'https://instagram.com/lasvibrasantigua',
  true,
  true
);
