-- Resolve the one remaining exact professional candidate against its canonical profile.
-- The event was created directly in the canonical events table, so its id is also
-- the submission reference used by the review inbox.

do $$
declare
  nancy_id uuid := 'ecbab78d-ce56-4f3b-9531-a21e1cf353f0';
  target_event_id uuid := '05ceca8c-39fe-4e9a-a658-6c0a5ea4f974';
begin
  insert into public.entity_aliases (
    entity_type,
    entity_id,
    alias,
    normalized_alias,
    source
  )
  values (
    'professional',
    nancy_id,
    'Nancy Gudiel',
    'nancy gudiel',
    'admin_manual'
  )
  on conflict (entity_type, entity_id, normalized_alias) do nothing;

  update public.submission_mentions
  set
    resolution_status = 'matched',
    resolved_entity_id = nancy_id,
    resolved_at = now()
  where id = 'c32e9c76-bddb-4d4c-962d-bddf7218bb75'
    and resolution_status = 'candidate'
    and entity_type = 'professional'
    and normalized_name = 'nancy gudiel';

  insert into public.event_teachers (event_id, teacher_id)
  values (target_event_id, nancy_id)
  on conflict (event_id, teacher_id) do nothing;
end;
$$;
