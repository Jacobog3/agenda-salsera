# Rebranding and Regional Expansion Plan

Last updated: 2026-08-09

## Current Decision

The Puro Salsero alliance is no longer part of the product strategy.

ExploraGuate will be replaced by a new independent brand. This is not only a
visual refresh: the new brand must support a geographically neutral product
that can represent dance scenes, academies, teachers, guest artists, events,
and festivals in any country.

Guatemala is the first location with meaningful data. It is not the center,
parent category, or permanent boundary of the product.

## Product Thesis

Build a trusted discovery platform for the Latin dance ecosystem, starting
with salsa and bachata and growing location by location.

The product should help someone answer:

- Where can I dance?
- Where and with whom can I learn?
- Which academies, teachers, artists, and organizers are connected?
- What is happening at a festival beyond its dates and cover image?
- When was this information last verified, and where did it come from?

Working positioning statement:

> A global discovery and connection platform for Latin dance, built location
> by location.

Working customer-facing promise:

> Discover where to dance and who to learn from.

## Brand Purpose and Values

The deeper problem is not only a lack of listings. Latin-dance information is
often fragmented, informal, difficult for newcomers to understand, and shaped
by closed groups or rivalry between organizations.

The brand purpose is:

> Organize the dance scene so anyone can understand it, enter it, and
> participate without needing insider knowledge.

Core brand values, in priority order:

1. **Clarity**: turn scattered flyers, captions, schedules, prices, and
   relationships into information that is easy to understand.
2. **Openness**: reduce unnecessary secrecy and make useful public information
   accessible to beginners, visitors, and established dancers alike.
3. **Neutrality**: do not represent one academy, organizer, group, or alliance;
   allow different organizations to coexist under the same transparent rules.
4. **Trust**: show sources, last verification dates, uncertainty, corrections,
   and sponsorship clearly.
5. **Accessibility**: explain terminology, levels, prices, expectations, and
   participation requirements without assuming insider knowledge.
6. **Connection**: show real relationships between people, places, academies,
   and activities without turning those relationships into political sides.
7. **Respect**: represent artists and organizations accurately and provide fair
   correction and profile-claiming processes.

The product cannot promise to eliminate rivalry. It can promise not to amplify
it and can build a neutral information layer where users make informed choices.

These values must be implemented, not only communicated. Product requirements
include:

- the same profile structure and editorial criteria for every academy;
- clear labels for sponsored placement;
- no hidden payment-based ranking;
- visible sources and last-updated dates;
- correction and profile-claiming workflows;
- beginner-friendly explanations and filters;
- neutral language that avoids unsupported “best academy” claims;
- public editorial and conflict-of-interest rules.

## Core Principles

1. **Geographically neutral**: no country is assumed in the brand, schema, UI,
   currency, timezone, phone format, or copy.
2. **Structured, not flyer-only**: schedules, prices, artists, venues, passes,
   and relationships should become usable data.
3. **Permanent entities plus activities**: academies, teachers, artists,
   organizers, and festivals persist beyond a single event.
4. **Source-aware**: imported information stores its source, extraction date,
   verification status, and last review date.
5. **Human-reviewed AI**: Gemini accelerates extraction and research but does
   not publish uncertain data autonomously.
6. **Depth before empty breadth**: expansion follows real relationships and
   verified activity rather than bulk-importing shallow listings.
7. **Organizer-friendly**: the platform complements official websites and
   purchase channels instead of impersonating or cloning them.

## Phase 1: Rebrand — Active Now

### 1.1 Brand brief

The new name must:

- work beyond Guatemala and beyond tourism;
- include salsa and bachata without being limited to either one;
- be pronounceable in Spanish and reasonably usable internationally;
- fit academies, teachers, artists, socials, workshops, and festivals;
- be memorable enough for “I found it on ___”;
- avoid sounding only like ticketing, nightlife, or a static directory;
- have realistic domain and social-handle options;
- avoid obvious conflicts with dance platforms, academies, events, apps, and
  registered brands.

Preferred creative territory: discovery + movement + connection.

Avoid as core naming constraints:

- country names or `Guate`;
- `tickets`, `agenda`, or `directory` as the main brand;
- salsa-only or bachata-only names;
- generic institutional tourism language;
- names that depend on accents or difficult spelling.

### 1.2 Candidate validation checklist

Each serious candidate must be checked for:

- `.com` first; practical regional alternatives only if the `.com` strategy is
  still defensible;
- Instagram handle;
- Facebook page name;
- TikTok handle;
- YouTube handle;
- Google and major search-engine collisions;
- App Store and Google Play collisions;
- existing dance academies, festivals, directories, and ticketing platforms;
- basic trademark collision screening in relevant markets;
- spelling, pronunciation, and negative meanings in Spanish and English;
- ability to create country, city, academy, artist, and festival URLs.

Availability checks are provisional until the domain is registered and the
social account is successfully claimed.

### 1.3 Selection process

1. Generate 30–50 candidates across several creative territories.
2. Remove candidates that fail language, scope, or memorability criteria.
3. Perform quick search and competitor screening.
4. Check domain and social availability for the strongest candidates.
5. Score a shortlist of 3–5 candidates.
6. Test comprehension and recall with dancers, teachers, and organizers.
7. Select the final name.
8. Register the domain and claim important social handles before announcing it.
9. Define the visual identity, voice, descriptor, and tagline.

### 1.4 Migration inventory

After the final name and assets are secured, replace ExploraGuate in:

- public header, footer, logos, icons, favicon, and manifest;
- Spanish and English UI copy;
- metadata, Open Graph, structured data, sitemap, and canonical URLs;
- legal pages and editorial-method pages;
- admin interface and submission emails;
- analytics properties, Search Console, AdSense, and monitoring;
- environment variables and service configuration;
- Supabase content or storage paths where the old brand is user-visible;
- email addresses and sender identity;
- Instagram, Facebook, TikTok, YouTube, and WhatsApp presentation;
- external directory profiles and backlinks under direct control;
- documentation, repository descriptions, README, and deployment settings.

Migration requirements:

- preserve all database records and historical content;
- redirect old public URLs to the closest new URL;
- keep a temporary “ExploraGuate is now ___” notice;
- avoid broken shared links to events and academies;
- measure redirect traffic and indexing during the transition;
- do not delete or abandon the old domain before the migration stabilizes.

## Phase 2: Geography-Neutral Foundation

Guatemala becomes one location in a neutral hierarchy:

```text
Platform
├── Countries
│   └── Cities and regions
├── Academies and locations
├── Teachers and artists
├── Organizers
├── Venues and dance spots
└── Activities and festival editions
```

Required international fields and behaviors include:

- country and country code;
- canonical city and optional region;
- local timezone;
- original currency;
- international phone format;
- languages;
- location-aware meaning of local and international;
- booking/contact methods;
- source and verification timestamps;
- support for multiple academy branches and event venues.

The product may initially show mostly Guatemalan content, but copy and
architecture must not imply that every entity belongs to Guatemala.

## Phase 3: Rich Permanent Profiles

### Academies

Academy profiles should eventually include:

- locations and branches;
- styles, levels, and teaching languages;
- exact weekly schedules;
- prices, trial classes, drop-ins, and partner requirements;
- resident teachers;
- visiting teachers and past workshops;
- socials and recurring activities;
- contact, booking, and verified status.

### Teachers and artists

Profiles should distinguish:

- teacher, performer, DJ, judge, choreographer, and organizer roles;
- city of residence from nationality;
- academy or company affiliations;
- resident positions from guest appearances;
- styles and specialties;
- verified official links;
- related workshops, festivals, academies, and past visits.

Profiles can begin with a low-completeness status and become richer over time:

1. discovered;
2. basic;
3. enriched;
4. claimed or verified.

### Invitations and workshops

A guest workshop is an activity, not a festival.

Example relationship:

```text
Workshop in Guatemala City
├── Host: In Motion Dance Academy
├── Guest artist: Celia Pergo
├── Artist location: Madrid, Spain
└── Affiliation: Marco & Sara dance company
```

The artist is connected to the activity and location without becoming a
Guatemalan entity.

## Phase 4: Festival Profiles and Annual Editions

Large recurring festivals must be permanent profiles, not ordinary one-off
event pages.

Initial Guatemalan candidates:

- Antigua Salsa y Bachata Festival;
- Guatemala Salsa Congress.

Recommended model:

```text
Festival brand
├── Organizer
├── 2026 edition
│   ├── workshops
│   ├── socials and parties
│   ├── competitions
│   ├── shows
│   ├── artists, DJs, and judges
│   ├── venues
│   └── passes and prices
└── 2027 edition
```

Festival pages can contain:

- festival history and permanent description;
- edition dates, countdown, and status;
- structured agenda by day, time, venue, and activity type;
- linked profiles for artists, teachers, DJs, judges, and organizers;
- passes, prices, inclusions, and official purchase CTA;
- competition categories and rules;
- venue, hotel, transport, and destination guidance;
- FAQs, galleries, bootcamps, launch parties, and related activities;
- previous and upcoming editions;
- official source and last verification date.

Festival presentation may use approved logos, photography, and a controlled
version of the festival palette. The platform's layout, navigation,
accessibility, and component behavior remain consistent. The goal is a better
structured complementary profile, not a copy of the official website.

Possible future organizer offering:

- free editorial profile;
- claimed and verified profile;
- branded premium microsite;
- analytics and purchase-click reporting;
- lead capture or promotional codes;
- reservations or ticketing only after the discovery product is validated.

## Phase 5: AI-Assisted Entity Discovery

The selected operational model is Gemini 3.1 Flash-Lite unless a later
benchmark justifies changing it.

Input sources may include:

- flyer images;
- Reel or video frames;
- Instagram captions;
- event and academy websites;
- organizer-provided documents;
- public schedules and price graphics.

Proposed workflow:

1. Extract names, roles, dates, places, prices, and affiliations.
2. Compare proposed entities with existing database records.
3. Detect likely duplicates and uncertain matches.
4. Find potential official sources where supported.
5. Create drafts for new entities and relationships.
6. Show confidence, source, and missing fields in admin.
7. Require human approval before public publication.

## Phase 6: Relationship-Led Regional Expansion

Expansion does not begin with a bulk directory of Latin America.

New locations enter through real, traceable connections:

- an international artist teaches in Guatemala;
- a Guatemalan artist teaches abroad;
- a local organizer invites a foreign academy or company;
- the product owner attends a festival in another country;
- a listed academy or festival supplies related entities;
- an organizer claims and enriches a profile.

Example:

```text
Trip to Costa Rica
└── Salsa del Barrio festival
    ├── host academy
    ├── location
    ├── organizers
    └── selected participating artists
```

This creates a credible initial node in Costa Rica without pretending to cover
the entire country.

## Phase 7: Validation and Expansion

Measure product value using signals such as:

- searches that reach useful profiles;
- clicks to WhatsApp, Instagram, booking, or official purchase channels;
- repeat visitors and saved/shared pages;
- organizers and academies claiming profiles;
- profile corrections and verified updates;
- historical festival pages leading to current editions;
- successful discovery across connected entities;
- density and freshness per city, not only total record count.

Expand a location when there is enough connected, maintainable information to
offer a useful experience. Global scope is a possible destination, not an
initial content-import target.

## Explicit Non-Goals for the Current Step

- Do not implement payment processing before validating discovery demand.
- Do not copy festival websites or publish unlicensed brand assets.
- Do not automatically publish AI-generated biographies or relationships.
- Do not launch empty country directories for appearance's sake.
- Do not switch production traffic until the database migration, production
  environment, canonical redirects, and contact channel are ready.

## Immediate Next Actions

- [x] Complete the brand brief.
- [x] Generate and evaluate a stronger second candidate pool after rejecting the first round.
- [x] Run preliminary search and conflict screening.
- [x] Check `.com` and initial social signals for the leading candidate.
- [x] Confirm claimability of essential handles from inside each platform.
- [x] Produce a revised scored shortlist using the marketing-weighted criteria.
- [x] Select and secure `SomosSalsa`, `somossalsa.com`, `somossalsa.app`, and `@somossalsa.app`.
- [x] Implement the local code rebrand and country/time-zone data model.
- [x] Verify TypeScript, ESLint, and the production build locally.
- [ ] Apply `supabase/migrations/20260809000000_add_entity_locations.sql` in production.
- [ ] Configure `NEXT_PUBLIC_SITE_URL=https://somossalsa.com` and an active
  `NEXT_PUBLIC_CONTACT_EMAIL` mailbox or forwarder.
- [ ] Deploy, test `.com`, and verify HTTPS redirects from `.app` and the former domains.
- [ ] Submit the domain migration in Search Console and monitor indexing and redirects.
