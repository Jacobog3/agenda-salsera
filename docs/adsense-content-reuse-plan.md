# AdSense Content Reuse Plan

Last confirmed with the product owner: 2026-07-14

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

## Non-goals

- No mandatory event-series model.
- No new admin fields or publication steps.
- No mass generation of thin SEO pages.
- No manual editorial workload imposed on the publisher.
- No automatic ambiguous entity merges.
