# SomosSalsa ecosystem expansion — execution plan

Updated: 2026-08-09

## Product direction

SomosSalsa is a location-neutral dance discovery platform. Guatemala is the first documented market, not the product default or the center of the data model.

The product organizes two kinds of information:

1. Permanent profiles: academies, professionals/artists, organizers, venues, and festival brands.
2. Time-bound activity: socials, classes, workshops, competitions, concerts, festival editions, and the sessions inside an edition.

## Brand system

The official palette is multicolor with stable semantic roles:

- Blue `#0AA9D1`: navigation, trust, primary product actions.
- Red `#C52F5A`: events, publishing, urgency, and calls to action.
- Green `#18B57C`: places, location, availability, and confirmation.
- Yellow `#F4D55F`: academies, discovery, highlights, and friendly emphasis.
- Orange `#FB923C`: artists, people, secondary highlights, and warmth.
- Ink `#10263B`: headings and high-contrast text.

White remains the primary canvas. A screen should normally use one lead color and one or two supporting colors, rather than distributing every brand color equally.

## Data model

### Professional profiles

The existing `teachers` table remains the canonical person/couple/team record. It is expanded with:

- `profile_kind`: person, couple, or team.
- `professional_roles`: teacher, dancer, performer, DJ, judge, choreographer, organizer, etc.
- nationality and current base as separate concepts.
- source, verification level, and last verification date.

This avoids duplicate records when the same guest teaches a workshop, performs at a congress, and appears at an academy.

### Festivals and congresses

- `festival_series`: permanent brand and official links.
- `festival_series.series_type`: explicit distinction between a festival and a congress.
- `festival_editions`: the edition for a specific year/date/location.
- `festival_edition_artists`: lineup with role and billing order.
- `festival_edition_artist_candidates`: source-backed names awaiting identity resolution.
- `festival_schedule_items`: workshops, competitions, shows, socials, and logistics.
- `festival_passes`: price, inclusions, availability, and purchase URL.
- `festival_pass_price_tiers`: multiple currencies and time-bound presale stages.
- `media_assets`: images, flyers, schedules, videos, PDFs, and embeds associated with any supported entity.
- `events.festival_edition_id`: links a normal event or workshop to its parent edition.

### Media

- Images remain compatible with the existing `event-flyers` bucket.
- Rich media uses the `dance-media` bucket.
- Admin video formats: MP4, WebM, and QuickTime, up to 200 MB.
- Public submission forms remain image-only until moderation and abuse controls are defined.
- Video files are stored separately from metadata so captions, thumbnails, source, role, order, and entity association stay searchable.

## Execution phases

### Phase 1 — Brand and neutral foundation

- [x] Replace Exploraguate identity with SomosSalsa.
- [x] Integrate the official logo assets.
- [x] Apply the multicolor semantic palette.
- [x] Remove Guatemala from hero and metadata positioning.
- [x] Stop assigning Guatemala automatically to new records in application helpers.
- [x] Add an explicit country placeholder to forms.
- [ ] Apply the location and ecosystem migrations in Supabase.
- [ ] Verify every existing record has an explicit country before release.

### Phase 2 — Festival/congress MVP

- [x] Add permanent festival and edition schema.
- [x] Add public festival listing and rich detail page.
- [x] Promote Antigua Salsa y Bachata Festival into a permanent festival profile plus its 2026 edition.
- [x] Add ASBF 2027 as the active edition with official dates, artwork, and its first announced artist candidate.
- [x] Add Guatemala Salsa Congress as a congress profile and ALQUIMIA as its 2026 edition.
- [x] Capture ALQUIMIA passes, price stages, official hotel, ticket link, and competition rules.
- [x] Preserve its flyers as edition media.
- [ ] Add admin CRUD for festival series, editions, lineup, passes, and schedule.
- [ ] Link existing festival-like events to their edition.
- [ ] Add edition comparison/history and structured Festival/Event SEO data.

### Phase 3 — Artists and guest discovery

- [x] Expand the professional profile schema to support multiple roles and verification.
- [ ] Rename public discovery language from only “maestros” to “artistas y profesionales”.
- [x] Add artist listing and `/artistas/[slug]` canonical pages.
- [ ] Add role and location filters to artist discovery.
- [x] Add initial admin fields for profile type, roles, nationality, base, sources, and verification.
- [ ] Add structured affiliations and duplicate-resolution controls.
- [ ] Associate Celia Pergo with the In Motion guest workshops as the first guest-profile workflow.
- [ ] Add source-aware duplicate detection before creating a professional profile.

### Phase 4 — Video and AI ingestion

- [x] Add a media schema that supports video and a protected admin upload endpoint.
- [x] Configure the media bucket contract and limits in migration.
- [ ] Build the admin media manager with upload progress, poster frame, captions, role, source, and ordering.
- [x] Extend Gemini 3.1 Flash-Lite extraction to return event kind, festival edition, and source-backed candidate artists with roles, affiliation, and origin.
- [ ] Extend Gemini 3.1 Flash-Lite extraction to return structured passes, price tiers, and source confidence.
- [ ] Extract representative frames from uploaded videos before sending material to Gemini.
- [ ] Present matches and new-profile candidates for human approval; never create people automatically without review.

### Phase 5 — Geographic growth and data quality

- [ ] Add country/city landing pages and make location a first-class filter everywhere.
- [ ] Seed verified Guatemala profiles and relationships.
- [ ] Add Costa Rica records gathered from the Salsa del Barrio visit.
- [ ] Add the Fusion Salsa Fest profile and edition after source verification.
- [ ] Define completeness scores and stale-data review queues.
- [ ] Add claimed-profile and owner-confirmed workflows.

### Phase 6 — Ticketing readiness

- [ ] First support official external ticket links and clear pass comparison.
- [ ] Add reservation/order tracking only after organizer workflow validation.
- [ ] Evaluate payment processing, invoicing, refunds, fraud, and check-in as a separate product phase.

## Immediate release order

1. Run TypeScript, lint, and production build checks.
2. Apply `20260809000000_add_entity_locations.sql`.
3. Apply `20260809000100_rich_ecosystem_profiles.sql`.
4. Verify ASBF 2026/2027 and Guatemala Salsa Congress/ALQUIMIA 2026 records in Supabase.
5. Deploy the public festival pages.
6. Build admin festival and artist editing before importing more external records at scale.

## Guardrails

- Every imported fact keeps a source URL or source label when possible.
- Event flyers stay attached to the event or edition; they are never reused as an artist profile photo.
- Artist portraits require a profile-specific source. Until then, the public card uses a neutral placeholder.
- AI proposes structured changes; a human approves identity matches and publication.
- A workshop with an invited foreign artist remains a workshop, not a festival.
- A recurring congress gets a permanent profile and separate editions.
- A professional has one canonical profile even when they have multiple roles or affiliations.
- Location must be explicit; missing location is incomplete data, never implicit Guatemala.
