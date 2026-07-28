-- Academy submission requests (pending review)
create table if not exists public.academy_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  city        text not null,
  address     text,
  styles      text,
  whatsapp    text,
  instagram   text,
  website     text,
  contact_name text,
  created_at  timestamptz default now()
);

-- Spot/venue submission requests (pending review)
create table if not exists public.spot_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  city        text not null,
  address     text,
  schedule    text,
  cover_charge text,
  whatsapp    text,
  instagram   text,
  contact_name text,
  created_at  timestamptz default now()
);
