-- Public country routes require every resource and recommendation to have an
-- explicit market. Guatemala is the only active country at launch.

update public.community_resources
set country_code = 'GT'
where country_code is null;

update public.resource_submissions
set country_code = coalesce(
  country_code,
  (
    select resource.country_code
    from public.community_resources as resource
    where resource.id = resource_submissions.resource_id
  ),
  'GT'
)
where country_code is null;

alter table public.community_resources
  alter column country_code set not null;

alter table public.resource_submissions
  alter column country_code set not null;

create index if not exists community_resources_country_published_idx
  on public.community_resources (country_code, is_published, sort_order, name);
