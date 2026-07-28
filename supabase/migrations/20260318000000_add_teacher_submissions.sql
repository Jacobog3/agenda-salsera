create table if not exists public.teacher_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text not null,
  address text,
  styles text,
  levels text,
  modality text default 'presencial',
  class_formats text,
  teaching_venues text,
  schedule_text text,
  image_url text,
  whatsapp text,
  instagram text,
  website text,
  booking_url text,
  contact_name text,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists teacher_submissions_status_idx
  on public.teacher_submissions (status);
