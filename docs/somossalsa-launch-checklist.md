# SomosSalsa — production launch master plan

Updated: 2026-08-09

## Objective

Launch `somossalsa.com` as the canonical, mobile-first PWA and establish a
stable foundation for richer festival, congress, artist, academy, venue, and
event information. A native application is not part of the current scope.

This document is the source of truth for the rebrand and the product decisions
made through 2026-08-09. The broader strategy documents remain supporting
references, but launch status is tracked here.

## Production milestones

### Release 1 — Indexable foundation

Ship the new brand, canonical domain, neutral geographic model, correct public
content, festival/congress profiles, artist routes, mobile PWA navigation, and
technical SEO. Google indexing begins after this release, not after every future
admin automation is complete.

Required: L0, L1, and the initial L2 measurement/search connection. L5 remains
the broader navigation redesign, but the minimum mobile discovery requirement
inside L1 must already be satisfied.

### Release 2 — Operational content system

Ship time-aware flyers, richer media/video management, duplicate prevention,
and the mobile-first one-person admin workflow. These capabilities go to
production incrementally without delaying initial indexing.

Required: L3, L4, L5, and L6.

### Release 3 — Connected regional content

Expand verified relationships between locations, academies, professionals,
organizers, venues, invitations, and festivals, beginning with Guatemala and
real connections to Costa Rica, Mexico, and other locations.

Required: L7 and ongoing editorial review.

## Captured product decisions

### Brand and positioning

- The product is `SomosSalsa`; secured assets are `somossalsa.com`,
  `somossalsa.app`, and Instagram `@somossalsa.app`.
- The brand promises clarity, openness, neutrality, trust, accessibility,
  connection, and respect. It must not favor one academy or alliance.
- The official mark and multicolor system use blue, red, green, yellow, orange,
  ink, and white with controlled semantic roles. White is the primary canvas;
  no single color must dominate every screen.
- Public copy must avoid unclear claims such as `salsa y bachata sin secretos`.
  The product explains what users can discover instead of making abstract
  promises.
- Festival presentation may acknowledge approved festival colors and assets,
  but the page remains recognizably SomosSalsa and does not copy its official
  website.

### Geographic and entity model

- Guatemala is the first populated location, not the product default or its
  permanent center.
- Country, city/region, timezone, currency, language, and international contact
  information are explicit data.
- Academies, professionals/artists, organizers, places/venues, and festival
  brands are permanent entities.
- Events, workshops, guest invitations, socials, classes, competitions, shows,
  and annual festival/congress editions are time-bound activity.
- Professionals can be people, couples, or teams and can have multiple roles,
  nationalities, bases, affiliations, sources, and verification states.
- A foreign artist invited to Guatemala remains associated with their real
  location. The visit creates a relationship, not a false Guatemalan identity.
- Academy profiles can contain branches, structured weekly schedules, prices,
  trial/drop-in rules, styles, levels, teachers, guest visits, contact methods,
  and recurring activities.
- Professional profiles connect roles, specialties, official accounts,
  nationality, current base, academy/company affiliations, workshops, events,
  and festival appearances.
- Organizer and venue profiles retain reusable contact and location information
  instead of repeating it independently in every event.

### Festivals, congresses, and editions

- `festival` and `congress` are explicit, different types. Duration never
  determines the type.
- Recurring brands receive one permanent profile and separate yearly editions.
- Editions can contain artists, DJs, judges, instructors, schedules, workshops,
  parties, competitions, passes, presale tiers, hotels, rules, venues, galleries,
  videos, official links, and previous/upcoming editions.
- ASBF 2027 and Guatemala Salsa Congress/ALQUIMIA 2026 are the initial rich
  production references.
- Artist cards require a profile-specific portrait or neutral placeholder; an
  ASBF or congress flyer is not an artist portrait.
- A guest workshop such as Celia Pergo at In Motion is a workshop/invitation,
  not a festival.

### Flyers, video, and AI

- A flyer is a sourced campaign asset, not the database or permanent cover.
- Evergreen covers and temporary presale, lineup, schedule, competition, party,
  and logistics assets have different roles.
- Promotional media carries validity dates and can become scheduled, active,
  expired, or archived without destroying history.
- Admin uploads may support MP4, WebM, and QuickTime with progress, poster frame,
  caption, source, role, order, and entity association.
- Public media submissions remain image-only until moderation controls exist.
- Gemini 3.1 Flash-Lite is the selected extraction model. It proposes names,
  roles, dates, places, prices, passes, affiliations, media validity, and likely
  duplicate matches; a human approves publication.
- Artist enrichment begins from the supplied event evidence, then proposes
  official sources and identity matches. It never invents a biography from a
  name alone.

### Public PWA and administration

- The current product is one responsive website and installable PWA. Native
  iOS/Android work is not implied by mobile-first design.
- The mobile footer stays at five primary actions. Festivals/congresses become
  discoverable through the information architecture, not a sixth footer item.
- The working navigation proposal is `Inicio`, `Agenda`, `Publicar`,
  `Comunidad`, and `Buscar`, subject to a local visual prototype before rollout.
- The admin is optimized for one person working frequently from a phone:
  searchable queues, short form sections, persistent Save, clear validation,
  relationship search, duplicate warnings, structured academy schedules, and
  field-level AI review.

### Commercial boundary

- Initial ticketing means clear official external purchase/reservation links,
  pass comparison, and measurable outbound clicks.
- SomosSalsa complements official organizer websites. It does not pretend to be
  a payment gateway or copy their sites.
- Native payment processing, invoicing, refunds, fraud handling, and check-in
  remain a separate validated product phase.

## Operating rules

- `somossalsa.com` is the canonical domain.
- `somossalsa.app` is the short acquisition and future PWA-installation domain;
  it does not host a second indexable copy of the site.
- During launch, `somossalsa.app` and the previous Exploraguate domains redirect
  to the equivalent canonical `.com` URL while preserving paths and campaigns.
- `info@somossalsa.com` is the official public contact address; email stays on
  the `.com` identity.
- Guatemala is the first populated location, never an implicit default.
- Permanent entities and time-bound activity remain separate.
- Flyers are source material and campaign assets, not the source of truth.
- Gemini 3.1 Flash-Lite proposes structured information; the admin approves it.
- Public mobile UX and the installed PWA share the same responsive codebase.

## Current implementation state

Completed locally, pending production verification:

- [x] SomosSalsa visual identity, official mark, palette, PWA/social assets, and
      primary public copy migration.
- [x] Canonical-domain configuration support through `NEXT_PUBLIC_SITE_URL`.
- [x] Explicit country/timezone application model and removal of Guatemala as a
      new-record default.
- [x] Database migrations for entity locations, professional roles, permanent
      festival/congress profiles, annual editions, lineup, schedules, passes,
      price tiers, media, and video-capable storage.
- [x] Public festival listing and rich festival/congress profile routes.
- [x] Public artist discovery and canonical artist profile routes.
- [x] Initial ASBF and Guatemala Salsa Congress/ALQUIMIA seed data.
- [x] Protected admin media upload contract and Gemini 3.1 Flash-Lite event-kind
      and artist-candidate extraction foundation.
- [x] GA4 component support controlled by `NEXT_PUBLIC_GA_ID`.

Not yet considered complete:

- [x] Production migrations applied; final public-data QA remains pending.
- [ ] Canonical production deployment and redirects.
- [x] Event type and multi-day duration display correction implemented locally.
- [ ] Known stale-flyer, duplicate, and mobile-navigation fixes.
- [ ] Production GA4, Search Console, sitemap, and indexing verification.
- [ ] Full admin CRUD for festivals, editions, lineups, passes, schedules, and
      time-aware media.

## Execution order

### L0 — Protect the current checkpoint

Owner: development

- [x] Inventory the current uncommitted rebrand and ecosystem changes.
- [x] Run TypeScript, ESLint, and production build checks.
- [x] Review the two pending migrations before applying them.
- [ ] Record a database backup/rollback point before changing production data.
- [ ] Verify that existing records have explicit country and timezone values.

Exit criteria:

- The current branch builds without errors.
- Database changes have an understood forward and rollback procedure.
- No existing public record is silently assigned to Guatemala.

### L1 — Canonical SomosSalsa launch

Owner: development, with domain/deployment access from the product owner

- [x] Apply `20260809000000_add_entity_locations.sql`.
- [x] Apply `20260809000100_rich_ecosystem_profiles.sql`.
- [x] Render `event_kind` as the content type; never infer `Bootcamp` from event
      duration. Production verification remains pending.
- [x] Render multi-day duration independently from the event type. Production
      verification remains pending.
- [ ] Classify Guatemala Salsa Congress as a congress and ALQUIMIA 2026 as its
      edition, linked to its permanent profile.
- [ ] Replace or demote any known expired presale flyer before release.
- [ ] Verify the official logo, palette, favicon, manifest, sharing image, public
      copy, and legal identity contain the approved SomosSalsa brand.
- [ ] Verify the public Home, Agenda/Event, Academy, Artist, Place, Festival, and
      Congress routes against production data.
- [ ] Make festivals and congresses reachable in at most two taps on mobile
      without adding a sixth footer item; the full navigation redesign can
      continue in L5.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://somossalsa.com` in production.
- [ ] Deploy the rebrand and new public routes.
- [x] Configure path-preserving redirects from `somossalsa.app` and
      `www.somossalsa.app` to `somossalsa.com` in the application.
- [ ] Attach both `.app` hosts to production, verify HTTPS and confirm that paths
      and campaign query parameters survive the redirect.
- [ ] Add a canonical `/instalar` PWA guide before changing the bare `.app`
      domain into an installation campaign landing point.
- [ ] Redirect controlled Exploraguate hosts while preserving paths and query
      strings.
- [ ] Verify canonical URLs, metadata, Open Graph images, robots, sitemap, legal
      pages, icons, and the PWA manifest.
- [ ] Verify installation and primary flows on a real mobile device.
- [ ] Activate and test the `info@somossalsa.com` mailbox or forwarder.

Exit criteria:

- The canonical site loads over HTTPS and alternate domains redirect correctly.
- Shared event, academy, artist, and festival links render the correct preview.
- Congresses and festivals display their real type and current information.
- The PWA installs and its mobile navigation, forms, and detail pages are usable.

### L2 — Measurement and search activation

Product owner actions:

- [ ] Create or rename the GA4 property and web data stream for SomosSalsa.
- [x] Provide a valid `G-...` measurement ID in the local environment.
- [ ] Configure the approved measurement ID as `NEXT_PUBLIC_GA_ID` in the
      production environment.
- [ ] Create a Google Search Console domain property for `somossalsa.com`.
- [ ] Add the DNS verification record.
- [ ] Submit `https://somossalsa.com/sitemap.xml`.
- [ ] If the previous domain was indexed, document and execute the appropriate
      Search Console domain-migration steps after redirects are live.
- [ ] Update AdSense and controlled social profiles with the new domain.

Development actions:

- [ ] Verify that GA4 loads only when `NEXT_PUBLIC_GA_ID` is configured.
- [ ] Validate page views and key actions in GA4 Realtime/DebugView.
- [ ] Add or verify events for search, external ticket clicks, contact clicks,
      submissions, and historical-to-current navigation.
- [ ] Validate the deployed sitemap and canonical URLs in Search Console.
- [ ] Monitor 404s, redirect chains, indexing, and Core Web Vitals.
- [ ] Keep Spanish as the canonical default-language experience and verify the
      equivalent English URLs, hreflang, metadata, and localized paths.
- [ ] Include only published, canonical, useful URLs in the sitemap.
- [ ] Add or verify appropriate structured data for events, festival/congress
      editions, professionals, academies/organizations, and places.
- [ ] Preserve valuable expired URLs with clear ended state and links to current
      activity; apply `noindex` to thin historical pages rather than deleting
      useful URLs indiscriminately.

Exit criteria:

- A real visit is visible in GA4.
- Search Console verifies the domain and accepts the sitemap.
- Ticket/contact/submission actions have measurable events.

### L3 — Correct event and edition semantics

Owner: development

- [ ] Link legacy festival-like event records to their canonical editions.
- [ ] Define canonical behavior for duplicate event and festival URLs: redirect
      or retain a lightweight agenda occurrence linked to the permanent profile.
- [ ] Add duplicate detection before event creation using normalized title,
      date, venue, organizer, and source.
- [ ] Show a possible-duplicate warning and require an explicit override instead
      of silently creating another record.
- [ ] Prevent concurrent or repeated submissions from creating the same record
      twice at the database/API boundary, not only in the interface.

Exit criteria:

- Permanent profiles and annual editions do not compete as unexplained duplicate
  pages.
- Repeated submission of the same event is detected before insertion.

### L4 — Time-aware flyer and media lifecycle

Owner: development

- [ ] Extend `media_assets` with campaign purpose, validity dates, publication
      state, and optional extracted text/confidence.
- [ ] Distinguish an evergreen edition cover from presale, lineup, schedule,
      competition, party, and logistics flyers.
- [ ] Choose the current featured asset from publication state and validity,
      never only from upload order.
- [ ] Automatically demote expired promotional flyers from primary placement.
- [ ] Preserve expired assets in the edition archive or label them
      `Promoción finalizada` when context is useful.
- [ ] Ask Gemini 3.1 Flash-Lite to propose embedded dates and expiration, with
      mandatory human confirmation.
- [ ] Extract representative video frames for Gemini rather than treating the
      full video as an unstructured opaque upload.
- [ ] Render approved video/reel media on the related event, edition, or profile
      with a poster image, caption, mobile-friendly loading, and accessible
      controls.
- [ ] Add an admin queue for expiring, expired, and undated promotional media.

Exit criteria:

- An expired presale flyer cannot remain the main current offer unnoticed.
- Current dates, prices, passes, artists, and schedules exist as editable data,
  independent of the artwork.
- Replacing the highlighted flyer does not destroy historical evidence.

### L5 — Mobile-first public information architecture

Owner: product decision, then development

- [ ] Prototype the five-slot PWA navigation before replacing the current bar.
- [ ] Recommended model: `Inicio`, `Agenda`, `Publicar`, `Comunidad`, `Buscar`.
- [ ] In Agenda, expose `Todos`, `Sociales`, `Talleres`, and
      `Festivales y congresos` without adding a sixth footer item.
- [ ] In Comunidad, expose academies, artists/professionals, and places.
- [ ] Add a home section for upcoming festivals and congresses.
- [ ] Test thumb reach, safe-area spacing, keyboard behavior, and small-screen
      layout in browser and installed-PWA modes.

Exit criteria:

- Festivals and congresses are discoverable in at most two taps on mobile.
- The footer remains readable and does not exceed five primary actions.
- The design works as a responsive PWA; it does not depend on native-app code.

### L6 — One-person mobile admin

Owner: development

- [ ] Replace the current entity-by-entity menu with a home queue for pending
      review, duplicates, incomplete records, stale schedules, expiring flyers,
      and unpublished changes.
- [ ] Keep desktop sheets and mobile drawers, but split long forms into short
      sections with a persistent Save action.
- [ ] Give academy schedules a dedicated structured editor with copy-day,
      duplicate-row, reorder, and quick-disable actions.
- [ ] Add inline relationship search for academies, artists, organizers, venues,
      festival editions, and locations.
- [ ] Show save state, validation errors, unsaved changes, and update history.
- [ ] Let AI draft changes from text, image, or video while showing a field-level
      diff before approval.

Exit criteria:

- A schedule change is practical on a phone without editing raw text.
- An event or profile can be found, reviewed, corrected, and saved without
  navigating multiple unrelated screens.
- Duplicate, stale, and incomplete data becomes an actionable queue.

### L7 — Content expansion

Owner: editorial/data, supported by development

- [ ] Complete ASBF 2027 and Guatemala Salsa Congress/ALQUIMIA 2026 profiles.
- [ ] Add profile-specific portraits for confirmed artists; never use an event
      flyer as the artist image.
- [ ] Add Celia Pergo and connect her to the In Motion guest workshops, Madrid,
      and her documented affiliation.
- [ ] Enrich Guatemala academies, professionals, venues, and organizers first.
- [ ] Add Costa Rica and Mexico records through verified relationships and
      attended festivals rather than shallow bulk imports.
- [ ] Add Fusion Salsa Fest only after official-source verification.
- [ ] Add source, last-reviewed date, verification state, and correction path to
      every permanent profile type.
- [ ] Add country and city discovery pages only when they contain enough current,
      connected information to be useful and indexable.

Exit criteria:

- Each published fact has a source or a clearly identified submission origin.
- Artists, academies, events, locations, and editions are connected rather than
  repeated as unstructured text.

## Deferred scope

These items are intentionally outside the launch critical path:

- Native iOS or Android applications.
- Internal payment processing, invoicing, refunds, fraud, or check-in.
- Automatically publishing AI-discovered people without review.
- Bulk international scraping without source and identity-resolution controls.

## Launch dashboard

Release 1 is ready only when all L0 and L1 exit criteria are met and production
measurement/search ownership is prepared. L2 begins immediately after the
canonical deploy: GA4 can be checked in real time and the sitemap can then be
submitted to Search Console. Google must not be sent to the new sitemap before
canonical URLs and redirects are live.

L3 fixes duplication and long-term data integrity before large-scale imports.
L4 through L7 then progress in small verified production releases. Admin media,
AI enrichment, and regional expansion do not block initial indexing, but every
public page must satisfy the same accuracy, source, canonical, and mobile-quality
rules before it is published.
