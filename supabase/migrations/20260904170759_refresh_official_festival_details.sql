-- ASBF 2027 now confirms both venues and keeps its official Podium registration
-- link on the festival site. No unannounced passes, schedule, or lodging details
-- are inferred here.
update public.festival_editions
set
  description_es = 'Edición 2027 del Antigua Salsa y Bachata Festival en Tenedor del Cerro Santo Domingo y Hotel Casa Santo Domingo. Los pases y programa se completarán conforme sean publicados oficialmente.',
  description_en = 'The 2027 Antigua Salsa and Bachata Festival edition takes place at Tenedor del Cerro Santo Domingo and Hotel Casa Santo Domingo. Passes and the schedule will be completed as they are officially published.',
  primary_venue_name = 'Tenedor del Cerro Santo Domingo y Hotel Casa Santo Domingo',
  registration_url = 'https://podiumsystem.mx/acceso/antigua.aspx',
  source_url = 'https://antiguasbf.com/',
  verification_status = 'source_confirmed',
  updated_at = now()
where slug = 'antigua-salsa-bachata-festival-2027';
