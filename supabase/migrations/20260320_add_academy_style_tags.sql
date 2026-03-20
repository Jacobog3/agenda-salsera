alter table public.academies
  add column if not exists style_tags text[] not null default '{}';

update public.academies
set style_tags = (
  select coalesce(array_agg(distinct label order by label), '{}')
  from (
    select case style
      when 'salsa' then 'Salsa'
      when 'bachata' then 'Bachata'
      when 'salsa_bachata' then 'Salsa y Bachata'
      else 'Otros'
    end as label
    from unnest(styles_taught) as style
  ) mapped
)
where coalesce(array_length(style_tags, 1), 0) = 0;
