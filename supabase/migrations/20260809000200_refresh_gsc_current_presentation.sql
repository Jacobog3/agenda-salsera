-- The legacy agenda record now redirects to the permanent congress profile.
-- Keep its data current for API consumers while preserving expired campaign
-- artwork in the richer edition media model rather than as the public cover.
update public.events
set
  cover_image_url = 'https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png',
  gallery_urls = array[]::text[],
  price_amount = 955,
  price_text = '2da preventa vigente hasta el 30 de septiembre · Full Pass Q1,215 / USD 155 · Dancer Pass Q1,150 / USD 145 · Fan Pass Q955 / USD 120',
  currency = 'GTQ'
where slug = 'guatemala-salsa-congress-2026';
