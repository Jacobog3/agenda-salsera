-- Generated from current production data on 2026-03-19
-- Stable directory entities only: academies, teachers, and spots.

insert into public.academies (
  slug, name, description_es, description_en, cover_image_url, banner_image_url, city, area, address,
  styles_taught, schedule_text, schedule_data, levels, trial_class, modality,
  whatsapp_url, instagram_url, facebook_url, website_url, is_featured, is_published
)
values
  (
    'academia-latidos', 'Academia Latidos', 'Academia de baile en Ciudad de Guatemala con clases de salsa, bachata, kizomba, cumbia, merengue, tango y otros ritmos, con clase de prueba gratis y planes mensuales.', 'Dance academy in Guatemala City with salsa, bachata, kizomba, cumbia, merengue, tango, and other rhythms, including a free trial class and monthly plans.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/academia-latidos.jpg', null, 'Ciudad de Guatemala', 'Zona 13', 'Av. Las Americas 13 calle 15-33, 2do nivel Body Arts, Zona 13',
    '{salsa,bachata,other}', 'Horarios semanales disponibles en sitio oficial', null, 'Principiante a avanzado', true, 'presencial',
    'https://wa.me/50252087615', null, 'https://www.facebook.com/ComunidadLatidos?locale=es_LA', 'https://www.academialatidos.com/', true, true
  ),
  (
    'academia-tumbao-fenix-dc', 'Academia Tumbao Fenix DC', 'Academia en Zona 5 con clases de salsa y bachata, enfocada en procesos desde cero, practica tecnica y formatos grupales para seguir creciendo en la escena local.', 'Academy in Zone 5 with salsa and bachata classes focused on beginner progression, technical practice, and group formats for growing within the local scene.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/academia-tumbao-fenix-dc.jpg', null, 'Ciudad de Guatemala', 'Zona 5', '40 Avenida 07-29, Colonia Monja Blanca, Zona 5',
    '{salsa,bachata}', 'Lunes a jueves 7:00 PM a 8:15 PM', null, 'Principiante a intermedio', false, 'presencial',
    null, null, 'https://www.facebook.com/profile.php?id=100063633725346&locale=es_LA', null, false, true
  ),
  (
    'ads-addiction-dance-studio', 'ADS - Addiction Dance Studio', 'Studio en Ciudad de Guatemala con clases de salsa, bachata, zumba, jazz, bellydance y latin dance para distintos niveles.', 'Studio in Guatemala City with salsa, bachata, zumba, jazz, bellydance, and Latin dance classes for different levels.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/ads-addiction-dance-studio.jpg', null, 'Ciudad de Guatemala', 'Zona 12', 'Galerias Primma, locales 203 y 204',
    '{salsa,bachata,other}', 'Lunes a jueves 4:00 PM a 9:00 PM · Sabado 9:00 AM a 6:00 PM · Domingo 12:00 PM a 5:00 PM', null, 'Principiante a avanzado', false, 'presencial',
    'https://wa.me/50254663773', null, 'https://www.facebook.com/adsgt?locale=es_LA', 'http://www.addictiondancestudio.com', false, true
  ),
  (
    'comunidad-salsera', 'Comunidad Salsera', 'Academia en Ciudad de Guatemala con enfoque fuerte en salsa y bachata, horarios semanales amplios, talleres y formatos para principiantes e intermedios.', 'Guatemala City academy with a strong focus on salsa and bachata, offering extensive weekly schedules, workshops, and classes for beginner and intermediate levels.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/comunidad-salsera.jpg', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/1773867478934-4p57y6.jpg', 'Ciudad de Guatemala', 'Zona 10', '6ta. Calle 1-32, zona 10, Edificio Valsari, 7mo nivel',
    '{salsa,bachata,other}', 'Lunes a jueves desde 6:00 PM · Sabado y domingo desde 10:00 AM', null, 'Principiante e intermedio', false, 'presencial',
    null, 'https://instagram.com/salseracomunidad', 'https://www.facebook.com/profile.php?id=61550694705790&locale=es_LA', 'https://www.comunidadsalsera.com.gt/', true, true
  ),
  (
    'dance-art', 'Dance Art', 'Academia en Ciudad de Guatemala con clases de salsa, bachata y otros ritmos en un formato de studio urbano.', 'Academy in Guatemala City offering salsa, bachata, and other rhythms in an urban studio format.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/dance-art.jpg', null, 'Ciudad de Guatemala', 'Zona 15', 'Boulevard Vista Hermosa 25-80, zona 15 VH2, edificio Maria del Alma, local 9A',
    '{salsa,bachata,other}', null, null, null, false, 'presencial',
    'https://wa.me/50230938434', null, 'https://www.facebook.com/Danceartguatemala?locale=es_LA', null, false, true
  ),
  (
    'escuela-cubana-de-baile', 'Escuela Cubana de Baile', 'Escuela de baile en Ciudad de Guatemala con enfoque en salsa, rueda de casino, bachata, cumbia y clases privadas o grupales.', 'Dance school in Guatemala City focused on salsa, rueda de casino, bachata, cumbia, and private or group classes.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/escuela-cubana-de-baile.jpg', null, 'Ciudad de Guatemala', 'Zona 15', '2 Calle 14-85, Zona 15, Boulevard Vista Hermosa',
    '{salsa,bachata,other}', null, null, 'Principiante a intermedio', false, 'presencial',
    null, null, 'https://www.facebook.com/escuelacubana2022?locale=es_LA', null, false, true
  ),
  (
    'in-motion-dance-fitness', 'In Motion Dance & Fitness', 'Studio de baile y fitness en Ciudad de Guatemala con oferta amplia de clases y presencia en Majadas.', 'Dance and fitness studio in Guatemala City with a broad class offering and presence in Majadas.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/in-motion-dance-fitness.jpg', null, 'Ciudad de Guatemala', 'Zona 11', '8 Calle 28-00, Zona 11, interior Parque Comercial Majadas',
    '{salsa_bachata,other}', null, null, null, false, 'presencial',
    null, null, 'https://www.facebook.com/profile.php?id=100089353824343&locale=es_LA', 'http://www.inmotiongt.com', false, true
  ),
  (
    'new-sensation-salsa-studio', 'New Sensation Salsa Studio', 'Escuela de salsa y bachata en Antigua Guatemala, fundada por Nancy Gudiel. Clases grupales de lunes a sábado con niveles desde principiante hasta avanzado. Estilos: Salsa On1, Salsa On2, Bachata, Lady Style y Shines. Clase grupal gratuita los lunes a las 5pm.', 'Salsa and bachata dance school in Antigua Guatemala, founded by Nancy Gudiel. Group classes Monday through Saturday for all levels from beginner to advanced. Styles: Salsa On1, Salsa On2, Bachata, Lady Style, and Shines. Free group class on Mondays at 5pm.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/new-sensation-salsa-studio-logo.png', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/new-sensation-salsa-studio-banner.png', 'Antigua Guatemala', null, '6ta Avenida Norte No. 41, Antigua Guatemala',
    '{salsa,bachata}', 'Lun: 5-9:30pm · Mar: 5-8pm · Mié: 6-9pm · Jue: 6-8pm · Sáb: 10am-12pm', '[{"day":"Lunes","classes":[{"name":"Clase grupal gratis","time":"5:00 - 6:00pm","level":"Básico"},{"name":"Salsa On1 Shines y Pareja","time":"6:00 - 7:00pm","level":"Principiante / Intermedio"},{"name":"Fundamentos de la Salsa","time":"7:00 - 8:00pm","level":"Intermedio / Avanzado"},{"name":"Salsa On2 Shines y Pareja","time":"8:00 - 9:30pm","level":"Avanzado"}]},{"day":"Martes","classes":[{"name":"Bachata Lady Style","time":"5:00 - 6:00pm","level":"Intermedio / Avanzado"},{"name":"Salsa Lady Style Shines On1","time":"6:00 - 7:00pm","level":"Principiante / Intermedio"},{"name":"Salsa On1 Shines y Pareja","time":"7:00 - 8:00pm","level":"Intermedio / Avanzado"}]},{"day":"Miércoles","classes":[{"name":"Salsa On1 Shines y Pareja","time":"6:00 - 7:00pm","level":"Intermedio"},{"name":"Bachata Shines y Pareja","time":"7:00 - 8:00pm","level":"Principiante"},{"name":"Salsa On1 Shines y Pareja","time":"8:00 - 9:00pm","level":"Principiante"}]},{"day":"Jueves","classes":[{"name":"Bachata Shines y Pareja","time":"6:00 - 7:00pm","level":"Intermedio / Avanzado"},{"name":"Salsa Lady Style Shines On2","time":"7:00 - 8:00pm","level":"Intermedio / Avanzado"}]},{"day":"Sábado","classes":[{"name":"Bachata Shine y Pareja","time":"10:00 - 11:00am","level":"Principiante"},{"name":"Salsa On1 Shine Pareja","time":"11:00am - 12:00pm","level":"Principiante"}]}]'::jsonb, 'Principiante, Intermedio, Avanzado', true, 'presencial',
    'https://wa.me/50256676144', 'https://instagram.com/new_sensation_salsa', null, null, true, true
  ),
  (
    'ritmo-y-sabor', 'Ritmo y Sabor', 'Academia de baile en Ciudad de Guatemala con oferta de salsa on2, bachata, chachacha, cumbia y otros formatos sociales y tecnicos.', 'Dance academy in Guatemala City offering salsa on2, bachata, cha-cha-cha, cumbia, and other social and technical formats.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/ritmo-y-sabor.jpg', null, 'Ciudad de Guatemala', 'Zona 14', '4 Avenida 16-24, zona 14',
    '{salsa,bachata,other}', 'Horarios disponibles en sitio oficial', null, 'Principiante a intermedio', false, 'presencial',
    'https://wa.me/50248002015', null, 'https://www.facebook.com/ritmoysaborgt?locale=es_LA', 'https://www.ritmoysaborgt.com/', false, true
  ),
  (
    'salsa-for-you-gt', 'Salsa for You GT', 'Academia de salsa y bachata en Zona 11 con clases regulares en Club Majadas y un enfoque social para alumnos que inician o quieren mantenerse activos bailando.', 'Salsa and bachata academy in Zone 11 with recurring classes at Club Majadas and a social approach for students who are starting out or want to stay active dancing.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/salsa-for-you-gt.jpg', null, 'Ciudad de Guatemala', 'Zona 11', 'Club Majadas, Zona 11',
    '{salsa,bachata}', 'Lunes a jueves 6:30 PM a 9:30 PM · Viernes 7:00 PM a 9:00 PM · Sabado 8:00 AM a 9:30 PM', null, 'Principiante a intermedio', false, 'presencial',
    'https://wa.me/50240113135', null, 'https://www.facebook.com/salsaforyougt?locale=es_LA', null, false, true
  ),
  (
    'salsa-latin-guatemala', 'Salsa Latin Guatemala', 'Academia o studio de salsa en Ciudad de Guatemala con presencia publica en zona 13 y referencias de clases regulares.', 'Salsa-focused academy or studio in Guatemala City with public presence in Zona 13 and references to recurring classes.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/salsa-latin-guatemala.jpg', null, 'Ciudad de Guatemala', 'Zona 13', '15 Avenida A 5-09, zona 13',
    '{salsa,bachata}', null, null, null, false, 'presencial',
    'https://wa.me/50242172567', null, 'https://www.facebook.com/profile.php?id=100064892794034&locale=es_LA', null, false, true
  ),
  (
    'sky-dance-academy-estilo-latino', 'Sky Dance Academy / Estilo Latino', 'Academia de baile en Ciudad de Guatemala con enfoque social y latino, talleres, eventos y mejora tecnica.', 'Dance academy in Guatemala City with a Latin social focus, workshops, events, and technical improvement.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/sky-dance-academy-estilo-latino.jpg', null, 'Ciudad de Guatemala', 'Tulam Tzu', '17 Avenida 2-15, Centro Comercial Valle del Sol, Tulam Tzu',
    '{salsa_bachata,other}', null, null, null, false, 'presencial',
    'https://wa.me/50258247100', null, 'https://www.facebook.com/estilolatinoguatemala?locale=es_LA', null, false, true
  ),
  (
    'tempo-dance-academy', 'Tempo Dance Academy', 'Academia en Ciudad de Guatemala con clases de salsa on2, bachata sensual, kizomba y otros ritmos en formato semanal.', 'Academy in Guatemala City offering salsa on2, sensual bachata, kizomba, and other rhythms in a weekly class format.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/tempo-dance-academy.jpg', null, 'Ciudad de Guatemala', 'Zona 16', '11 Avenida 18-03, Local 207, zona 16',
    '{salsa,bachata,other}', 'Clases semanales lunes, martes, miercoles, jueves y sabado', null, 'Principiante a intermedio', false, 'presencial',
    null, null, 'https://www.facebook.com/profile.php?id=100083365981237&locale=es_LA', null, false, true
  ),
  (
    'tumbao-estudio-de-baile-guatemala', 'Tumbao Estudio de Baile Guatemala', 'Estudio en Centro Historico de Ciudad de Guatemala con clases de salsa, bachata, merengue, cumbia, on2, privadas y talleres.', 'Studio in Guatemala City''s Historic Center offering classes in salsa, bachata, merengue, cumbia, and on2, as well as private lessons and workshops.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/academies/facebook/tumbao-estudio-de-baile-guatemala.jpg', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/1773867565433-4yi3vd.jpg', 'Ciudad de Guatemala', 'Zona 1', '14 Calle y 8va Avenida 8-30, zona 1, Centro Historico, a un costado del Teatro Abril',
    '{salsa,bachata,other}', 'Clases regulares y talleres; confirmar horario actual por contacto directo', null, 'Principiante a intermedio', false, 'presencial',
    'https://wa.me/50257032916', 'https://instagram.com/tumbaoestudiogt', 'https://www.facebook.com/tumbaoestudiogt?locale=es_LA', null, false, true
  )
on conflict (slug) do update set
  name = excluded.name,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  banner_image_url = excluded.banner_image_url,
  city = excluded.city,
  area = excluded.area,
  address = excluded.address,
  styles_taught = excluded.styles_taught,
  schedule_text = excluded.schedule_text,
  schedule_data = excluded.schedule_data,
  levels = excluded.levels,
  trial_class = excluded.trial_class,
  modality = excluded.modality,
  whatsapp_url = excluded.whatsapp_url,
  instagram_url = excluded.instagram_url,
  facebook_url = excluded.facebook_url,
  website_url = excluded.website_url,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;

insert into public.teachers (
  slug, name, bio_es, bio_en, profile_image_url, banner_image_url, city, area, address,
  styles_taught, levels, modality, class_formats, teaching_zones, teaching_venues,
  schedule_text, schedule_data, booking_url, whatsapp_url, instagram_url, facebook_url, website_url,
  trial_class, price_text, is_featured, is_published
)
values
  (
    'jose-medina', 'Jose Medina', 'Jose Medina es un maestro de salsa y bachata con base en Antigua Guatemala. Trabaja principalmente en clases privadas y bootcamps para alumnos que buscan una experiencia mas flexible y personalizada.', 'Jose Medina is a salsa and bachata instructor based in Antigua Guatemala. He specializes in private lessons and bootcamps for students seeking a more flexible and personalized experience.', 'https://oenwhpcyzznytpoypcfc.supabase.co/storage/v1/object/public/event-flyers/1773854515717-5yjn1m.jpg', null, 'Antigua Guatemala', null, 'Antigua Guatemala',
    '{salsa,bachata}', 'Principiante e intermedio', 'presencial', '{Privadas,Bootcamps}', '{Antigua Guatemala}', '{Antigua Guatemala}',
    'Sabados · 4:00 PM a 5:00 PM', null, null, 'https://wa.me/50235695855', 'https://www.instagram.com/jmedinasalsa/', null, null,
    false, null, true, true
  )
on conflict (slug) do update set
  name = excluded.name,
  bio_es = excluded.bio_es,
  bio_en = excluded.bio_en,
  profile_image_url = excluded.profile_image_url,
  banner_image_url = excluded.banner_image_url,
  city = excluded.city,
  area = excluded.area,
  address = excluded.address,
  styles_taught = excluded.styles_taught,
  levels = excluded.levels,
  modality = excluded.modality,
  class_formats = excluded.class_formats,
  teaching_zones = excluded.teaching_zones,
  teaching_venues = excluded.teaching_venues,
  schedule_text = excluded.schedule_text,
  schedule_data = excluded.schedule_data,
  booking_url = excluded.booking_url,
  whatsapp_url = excluded.whatsapp_url,
  instagram_url = excluded.instagram_url,
  facebook_url = excluded.facebook_url,
  website_url = excluded.website_url,
  trial_class = excluded.trial_class,
  price_text = excluded.price_text,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;

insert into public.spots (
  slug, name, description_es, description_en, cover_image_url, city, area, address,
  schedule_es, schedule_en, cover_charge_es, cover_charge_en, whatsapp_url, instagram_url, google_maps_url,
  is_featured, is_published
)
values
  (
    'jueves-latino-la-casbah', 'Jueves Latino – Las Vibras de La Casbah', 'Cada jueves noche de música latina y baile en La Casbah, Antigua Guatemala. Ambiente social y pista de baile.', 'Every Thursday, Latin music and dance night at La Casbah, Antigua Guatemala. Social atmosphere and dance floor.', '/images/spots/la-casbah.jpg', 'Antigua Guatemala', 'Centro', null,
    'Jueves · 8:00 PM', 'Thursdays · 8:00 PM', 'Por consumo', 'No cover (minimum consumption)', 'https://wa.me/50256676144', 'https://instagram.com/lasvibrasantigua', null,
    true, true
  ),
  (
    'noches-tropicales-las-palmas', 'Noches Tropicales – Las Palmas', 'Noches de salsa y ritmos tropicales en un ambiente relajado. De martes a domingo en Antigua Guatemala.', 'Salsa and tropical rhythm nights in a relaxed atmosphere. Tuesday through Sunday in Antigua Guatemala.', '/images/spots/las-palmas.jpg', 'Antigua Guatemala', 'Centro', '5a Avenida Norte, Antigua Guatemala',
    'Martes a Domingo · 9:15 PM', 'Tuesday to Sunday · 9:15 PM', 'Por consumo', 'No cover (minimum consumption)', 'https://wa.me/50235695855', 'https://instagram.com/laspalmasantiguaguatemala', null,
    true, true
  )
on conflict (slug) do update set
  name = excluded.name,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  city = excluded.city,
  area = excluded.area,
  address = excluded.address,
  schedule_es = excluded.schedule_es,
  schedule_en = excluded.schedule_en,
  cover_charge_es = excluded.cover_charge_es,
  cover_charge_en = excluded.cover_charge_en,
  whatsapp_url = excluded.whatsapp_url,
  instagram_url = excluded.instagram_url,
  google_maps_url = excluded.google_maps_url,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;
