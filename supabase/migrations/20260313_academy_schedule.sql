-- Add schedule and contact fields to academies
alter table public.academies
  add column if not exists schedule_text   text,
  add column if not exists levels          text,
  add column if not exists trial_class     boolean default false,
  add column if not exists modality        text default 'presencial',
  add column if not exists cover_image_url text default '';

-- Add same fields to academy_submissions
alter table public.academy_submissions
  add column if not exists schedule_text  text,
  add column if not exists levels         text,
  add column if not exists trial_class    boolean default false,
  add column if not exists modality       text default 'presencial',
  add column if not exists image_url      text,
  add column if not exists dance_style    text default 'salsa_bachata',
  add column if not exists status         text default 'pending';

create index if not exists academy_submissions_status_idx
  on public.academy_submissions (status);
