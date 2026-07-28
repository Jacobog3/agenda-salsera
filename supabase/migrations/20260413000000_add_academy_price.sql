-- Add price_text to academies and academy_submissions
alter table public.academies
  add column if not exists price_text text;

alter table public.academy_submissions
  add column if not exists price_text text;
