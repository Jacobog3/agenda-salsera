-- =============================================================
-- Split ASBF festival from Bachata Bootcamp (previously merged)
-- and update festival with full data from official 2026 flyers
-- =============================================================

-- 1. Update the main ASBF festival with correct data and full gallery
update public.events
set
  title_es        = 'Antigua Salsa y Bachata Festival 2026',
  title_en        = 'Antigua Salsa and Bachata Festival 2026',
  description_es  = 'Festival de salsa y bachata del 30 de abril al 4 de mayo de 2026 en Antigua Guatemala, con actividades en Hotel Casa Santo Domingo y Hotel Tenedor del Cerro. Incluye pre-party, competencias, talleres, shows, sociales y after party. Artistas confirmados: Ana & Guggie, Evelyn "La Negra", Billy & Ahtoy, Alex & Desiree, Kike & Xiomar, Wisley Estacholi, Nicolo de Angelis, Jorge Valcarcel, Juan Pablo & Yoselinn, Nelson Balare, Freddy Rivas y Cristian Castaneda. Precios oficiales: Full Pass Q1,160, Dancer Pass Q1,080, Full Sociales Q760, Viernes Day Pass Q760, Sabado Day Pass Q520, Domingo Day Pass Q800, 1 Taller Q260 y pases sociales desde Q160.',
  description_en  = 'Salsa and bachata festival from April 30 to May 4, 2026 in Antigua Guatemala, with activities at Hotel Casa Santo Domingo and Hotel Tenedor del Cerro. Includes pre-party, competitions, workshops, shows, socials, and after party. Confirmed artists: Ana & Guggie, Evelyn "La Negra", Billy & Ahtoy, Alex & Desiree, Kike & Xiomar, Wisley Estacholi, Nicolo de Angelis, Jorge Valcarcel, Juan Pablo & Yoselinn, Nelson Balare, Freddy Rivas, and Cristian Castaneda. Official prices: Full Pass Q1,160, Dancer Pass Q1,080, Full Sociales Q760, Friday Day Pass Q760, Saturday Day Pass Q520, Sunday Day Pass Q800, 1 Workshop Q260, and social passes starting at Q160.',
  cover_image_url = '/images/events/antigua-festival-artistas.png',
  gallery_urls    = array[
    '/images/events/antigua-festival.png',
    '/images/events/antigua-festival-itinerario-jueves.png',
    '/images/events/antigua-festival-itinerario-viernes.png',
    '/images/events/antigua-festival-itinerario-sabado.png',
    '/images/events/antigua-festival-precios-pass.png',
    '/images/events/antigua-festival-precios-sociales.png',
    '/images/events/antigua-festival-precios-dia.png'
  ],
  venue_name      = 'Hotel Casa Santo Domingo & Hotel Tenedor del Cerro',
  address         = 'Hotel Casa Santo Domingo, 3a Calle Oriente #28 / Hotel Tenedor del Cerro, Antigua Guatemala',
  city            = 'Antigua Guatemala',
  area            = 'Centro',
  starts_at       = '2026-04-30T11:00:00-06:00',
  ends_at         = '2026-05-04T01:00:00-06:00',
  price_amount    = null,
  price_text      = 'Pases desde Q160 hasta Q1,160',
  currency        = 'GTQ',
  organizer_name  = 'Antigua Salsa y Bachata Festival',
  contact_url     = 'https://antiguasbf.com',
  is_featured     = true,
  is_published    = true
where slug = 'antigua-salsa-bachata-festival-2026';

-- 2. Insert the Bachata Bootcamp as its own separate event
insert into public.events (
  slug, title_es, title_en,
  description_es, description_en,
  cover_image_url, gallery_urls,
  dance_style, city, area,
  venue_name, address,
  starts_at, price_amount, currency,
  organizer_name, contact_url,
  is_featured, is_published
)
values (
  'bachata-bootcamp-erick-nalu-2026',
  'Bachata Bootcamp con Erick & Nalu',
  'Bachata Bootcamp with Erick & Nalu',
  'Entrenamiento intensivo de bachata con Erick & Nalu. 6 sesiones de entrenamiento del 20 de marzo al 26 de abril. Presentación final en el Antigua Salsa y Bachata Festival 2026. Precio individual Q300, pareja Q550.',
  'Intensive bachata training with Erick & Nalu. 6 training sessions from March 20 to April 26. Final showcase at the Antigua Salsa y Bachata Festival 2026. Individual Q300, couple Q550.',
  '/images/events/antigua-festival-bootcamp.png',
  '{/images/events/antigua-festival-bootcamp.png}',
  'bachata',
  'Antigua Guatemala',
  'Centro',
  'Por confirmar',
  null,
  '2026-03-20T18:00:00-06:00',
  300,
  'GTQ',
  'Antigua Salsa y Bachata Festival',
  'https://antiguasbf.com',
  false,
  true
)
on conflict (slug) do nothing;
