# AdSense Content Reuse Plan

Last confirmed with the product owner: 2026-07-14

Current stable release: `v0.5.1`

## Primary Goal

Improve the site's accumulated public value and AdSense readiness without adding work to the
current publishing flow.

The admin workflow must remain:

```text
Find flyer -> upload -> AI extraction -> review -> publish
```

The publisher must not be required to classify series, maintain historical pages, write weekly
articles, or manage recurrence states.

## Product Principle

The application should automatically reuse information after publication. Events remain
independent records because each edition may change its theme, schedule, price, guests, or venue.
Historical context and relationships are derived in the background.

## Agreed Sequence

1. Audit all production content and relationships.
2. Normalize safe city and entity matches.
3. Reduce and measure AI extraction cost.
4. Keep expired event URLs accessible while excluding them from the current agenda.
5. Mark expired pages clearly and remove obsolete attendance/contact actions.
6. Automatically apply `noindex` to expired pages with insufficient original value.
7. Show related upcoming events using conservative entity and location signals.
8. Include only quality historical pages in the sitemap.
9. Measure organic visits and transitions from historical pages to current events.
10. Only then consider a small number of automatically derived permanent pages.

## Completed

- Production content audit.
- Safe city normalization for events and academies.
- Conservative event relationship inference.
- Automatic normalization for new writes.
- Mobile admin search and AI apply/save improvements.
- Gemini model benchmark, cost measurement, and Flash-Lite rollout.
- Versioned release and rollback workflow.
- Accessible historical event pages with ended-state UX.
- Quality-based historical indexing: 21 indexable and 38 `noindex` at rollout.
- Historical-to-current recommendation measurement in GA4.
- Analytics-cookie consent now controls whether Google Analytics loads.

## Current Scope

- Keep published expired event detail URLs working.
- Preserve active-only behavior on the home page and event agenda.
- Display an explicit ended-event notice.
- Hide obsolete outbound contact actions.
- Keep low-value historical pages accessible with `noindex,follow`.
- Add quality historical pages to the sitemap.
- Recommend current events using organizer, academy, venue, city, and dance-style signals.

The initial quality threshold requires at least 250 characters of localized description plus a
flyer, city, venue, and identifiable organizer or related academy. With the production inventory
at implementation time, this keeps 21 of 59 expired events indexable and marks 38 as `noindex`.

## Recommendation Measurement (2026-07-14)

- Initial coverage audit: 6 of 59 historical events have a strong upcoming match, 51 have only a
  city/style fallback, and 2 have no recommendation.
- Direct organizer, academy, and venue matches must be described separately from local fallbacks.
- Clicks from historical pages to upcoming events use the GA4 event
  `historical_event_recommendation_click`, including source event, destination event, and
  recommendation type.
- Clicks from a historical page to the full current calendar use
  `historical_event_agenda_click`.
- Google Analytics loads only after explicit analytics-cookie acceptance.

## Current Production Checkpoint (`v0.5.1`)

- Public inventory: 68 events, 17 academies, 4 teachers, and 2 recurring spots.
- Event history: 9 active and 59 expired.
- Event descriptions are bilingual with one empty record in each language; average length is
  about 194 characters in Spanish and 190 in English.
- Permanent entity content remains thin: 2 academy descriptions are empty, 10 academy
  descriptions are under 150 characters, 3 of 4 teacher bios are under 150 characters, and both
  spot descriptions are under 150 characters.
- Relationship coverage remains intentionally conservative: 14 events have `organizer_id` and
  15 have `academy_id`.
- Historical recommendation baseline: 6 strong matches, 51 city/style fallbacks, and 2 without
  a current recommendation.

## Next Actions, In Order

### 1. Add a permanent trust and editorial-method page

Create one bilingual, low-maintenance page explaining:

- who maintains ExploraGuate;
- what problem the site solves;
- how information is collected from public flyers, organizers, and community submissions;
- that information is reviewed before publication;
- how corrections and updates can be requested;
- how expired events and editorial quality are handled.

Link it from the footer and include it in the sitemap. This closes the clearest remaining trust
gap from the initial AdSense audit without adding recurring work.

Status: implemented on `codex/adsense-next-phase-plan` with localized routes `/acerca-de` and
`/en/about`.

### 2. Correct sitemap freshness and connect Search Console

- Stop assigning the current timestamp to every sitemap entry on every request.
- Use real record update/create timestamps when available and stable dates for static pages.
- Confirm the domain property in Google Search Console.
- Submit `/sitemap.xml` and inspect a sample of active, indexable historical, and `noindex`
  historical URLs.

Search Console account actions require the product owner; code changes should remain limited to
accurate metadata and verification support if needed.

Status: sitemap false freshness was removed on `codex/adsense-next-phase-plan`. Search Console
account validation remains pending.

### 3. Observe before creating derived pages

Allow GA4 and Search Console to collect at least 2-4 weeks of data. Review:

- `historical_event_recommendation_click`;
- `historical_event_agenda_click`;
- organic landing pages;
- indexed versus discovered pages;
- queries by city, organizer, venue, and event name.

Do not judge the feature from the first days of low traffic.

### 4. Build only evidence-backed derived pages

After measurement, select at most 1-3 pages supported by both inventory and user/search signals,
for example a city or organizer page. These pages must update from existing records and must not
require weekly manual writing.

### 5. Reapply to AdSense only after validation

Request another review after the trust page is live, sitemap/Search Console checks pass, quality
historical pages are indexed, and the site has had time to accumulate stable crawl and engagement
signals.

## Deferred

- Bulk AI-generated biographies or descriptions. They would require editorial review and could
  create low-value content if published automatically.
- New organizer/venue records inferred from ambiguous names.
- Large article or guide programs that create recurring manual workload.
- Immediate AdSense reapplication before Search Console and content signals stabilize.

## Non-goals

- No mandatory event-series model.
- No new admin fields or publication steps.
- No mass generation of thin SEO pages.
- No manual editorial workload imposed on the publisher.
- No automatic ambiguous entity merges.
