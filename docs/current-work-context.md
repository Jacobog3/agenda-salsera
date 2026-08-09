# Current Work Context

## 2026-08-09 — Visible admin error log

- Unexpected client-side admin errors are captured automatically in the private
  `admin_client_error_logs` Supabase table.
- `/admin/errors` provides a mobile-first log with the error message, route,
  timestamp, deployed commit, optional stack, and a copyable diagnostic.
- The latest 20 errors are also kept in local storage as a fallback when the
  database or network is unavailable; the server list keeps the latest 50.
- Logs intentionally exclude passwords, form values, and uploaded image or
  video content.
- The error log is reachable from the desktop admin header and the mobile admin
  menu.
- Migration `20260809000400_admin_client_error_logs.sql` is applied in
  production. Migration history for the previously loaded `20260809000200` and
  `20260809000300` festival payloads was repaired to match production state.
- Responsive browser QA passed at 390×844 and 1280×800.

## 2026-08-09 — Admin media and mobile reliability

- Branch: `codex/admin-mobile-source-ingestion`.
- Video binaries are not uploaded or stored by SomosSalsa. The admin may select
  a local MP4/WebM/QuickTime file only to extract four temporary JPEG frames in
  the browser for Gemini analysis; the video and frames are discarded after the
  draft is applied or the screen is closed.
- Permanent Instagram/Reel or organizer-hosted video remains represented as an
  external sourced media URL in `media_assets`.
- Admin image posts are compressed before upload and before Gemini analysis to
  stay below the Vercel request-body limit.
- Event save now validates required fields on the client, handles non-JSON HTTP
  failures safely, and exposes the actual error instead of collapsing into a
  generic client-side exception. An admin route error boundary provides recovery
  for unexpected render failures.
- Applying AI suggestions no longer trusts raw date/time-zone strings. Local
  event date-times are parsed without browser-time-zone shifts, invalid dates
  are skipped with an actionable warning, country codes are normalized, and an
  invalid or missing time zone is recovered from the event country. Unexpected
  apply errors stay inside the AI panel and preserve the suggestions for review.
- Logout redirects relative to the current request host instead of the old
  localhost fallback.
- Mobile form controls use a 16px font and login no longer autofocuses, avoiding
  the automatic iOS input zoom in the installed PWA.
- Verification completed: `npm run lint`, `npm run typecheck`, and
  `npm run build`.

## 2026-08-09 — SomosSalsa ecosystem expansion

- The official multicolor palette and logo assets are implemented.
- The active execution plan is `docs/ecosystem-expansion-execution-plan.md`.
- The production launch source of truth is `docs/somossalsa-launch-checklist.md`.
- Launch scope is the responsive website and installable PWA; a native app is
  explicitly deferred.
- New migration `20260809000100_rich_ecosystem_profiles.sql` adds professional roles, permanent festival profiles, editions, lineups, schedules, passes, generic media, and a video-capable storage bucket.
- Public `/festivales` and rich festival profile routes are being introduced.
- Festival profiles now distinguish `festival` from `congress`; annual editions remain separate records under one permanent profile.
- ASBF 2027 now includes the nine people/couples announced by the official site,
  their published roles and countries, nine lineup assets, and the official promo
  video. The lineup flyers remain gallery evidence and are not used as artist
  portraits.
- Guatemala Salsa Congress ALQUIMIA 2026 now includes its current dates, passes,
  price stages, competition route, hotel information, tickets, rules, and three
  lineup candidates sourced from the organizer's official ticket provider.
- The current festival content payload is captured in
  `20260809000300_expand_initial_festival_content.sql` and has also been loaded
  idempotently into production through the existing service-role connection.
- Unknown lineup names are stored as artist candidates until an admin resolves them to a canonical professional profile.
- `DEFAULT_COUNTRY_CODE` is intentionally empty and `DEFAULT_TIME_ZONE` is `UTC`; new records must explicitly select a country.
- The production database now includes `20260809000000_add_entity_locations.sql`
  followed by `20260809000100_rich_ecosystem_profiles.sql`.

Last updated: 2026-08-09

## What Was In Progress

The active thread was migrating the admin UX for `teachers`, `events`, and `spots` to match the newer `academies` flow:

- right-side edit sheet on desktop
- `vaul` drawer on mobile for native swipe-to-dismiss
- AI-assisted draft/update tab inside the sheet
- form tab for manual review and save

The earlier Claude session stopped mid-implementation after:

- extracting `useIsDesktop` to `src/hooks/use-is-desktop.ts`
- renaming `AcademyAiPanel` to the generic `EntityAiPanel`
- expanding `/api/admin/ai-update` and `src/lib/admin/ai-update.ts` to support `event` and `spot`
- creating most of `TeacherEditSheet`

## What Was Finished In This Session

### Admin Migration

- `teachers` now uses `TeacherEditSheet` from the admin list page instead of the old inline edit form.
- `events` now uses a new `EventEditSheet` with:
  - cover image + gallery management
  - AI tab via `EntityAiPanel`
  - event dates/times
  - organizer/academy relations
  - related teachers multiselect
  - featured/published toggles
- `spots` now uses a new `SpotEditSheet` with:
  - image upload
  - AI tab via `EntityAiPanel`
  - manual form fields
  - featured/published toggles

### Public-Site Fixes

- Academy detail page already had the duplicate-schedule fix in place:
  - `scheduleText` in the sidebar is only shown when there is no `scheduleData`
- `src/components/academies/academy-pricing.tsx` was updated so price text also splits on `·`, not only new lines

## Files Added

- `src/components/admin/event-edit-sheet.tsx`
- `src/components/admin/spot-edit-sheet.tsx`

## Files With Ongoing Uncommitted Changes

These also include work inherited from the interrupted Claude session:

- `src/app/admin/(protected)/teachers/page.tsx`
- `src/app/admin/(protected)/events/page.tsx`
- `src/app/admin/(protected)/spots/page.tsx`
- `src/app/api/admin/ai-update/route.ts`
- `src/components/academies/academy-pricing.tsx`
- `src/components/admin/academy-ai-panel.tsx`
- `src/components/admin/academy-edit-sheet.tsx`
- `src/components/admin/teacher-edit-sheet.tsx`
- `src/components/admin/event-edit-sheet.tsx`
- `src/components/admin/spot-edit-sheet.tsx`
- `src/hooks/use-is-desktop.ts`
- `src/lib/admin/ai-update.ts`

## Verification Status

Validated after the latest changes:

- `npm run typecheck`
- `npm run lint`

Both passed successfully.

## Still Pending / Worth Checking Next

- Manual browser QA for the new admin sheets on desktop and mobile
- Confirm the event create flow feels good now that it uses the sheet instead of the old inline section
- Verify the academy production deploy on Vercel if pricing still looks missing in production
- Decide whether the old `AdminEventForm` should be kept for reference or removed after confidence is high

## Release and Rollback Rule (Effective 2026-07-14)

- All new work must happen on a `codex/*` feature branch; `main` is the stable production line.
- Verified production deployments receive semantic version tags.
- Code rollback and Supabase data rollback are separate operations.
- Database cleanup requires a dry run, explicit confirmation, guarded writes, and a restorable snapshot for future bulk/destructive updates.
- Schema changes are forward-only migrations; applied migrations are never edited.
- The full checklist is documented in `docs/release-and-rollback.md`.

## Current Checkpoint

- Branch: `codex/admin-mobile-data-normalization`
- Scope: mobile-first admin improvements, content audit and normalization tooling,
  canonical city handling, safe event relationship inference, and verified production
  city/relationship cleanup.
- Verification completed before checkpoint: `npm run typecheck`, `npm run lint`, and
  `npm run build`.
- Do not tag this release until its deployment has been verified in production.

## AI Cost Optimization (2026-07-14)

- Branch: `codex/ai-provider-benchmark`
- Added token and estimated-cost logging for flyer parsing, admin AI updates, and automatic translation.
- Centralized the Gemini model behind `GEMINI_MODEL`.
- Benchmarked three real event flyers with Gemini 3 Flash Preview, Gemini 3.1 Flash-Lite,
  GPT-5 nano, and GPT-5.4 nano.
- Gemini 3.1 Flash-Lite was selected as the default because it preserved comparable
  extraction quality while reducing measured cost by about 51% and latency by about 43%.
- Rollback does not require code changes: set `GEMINI_MODEL=gemini-3-flash-preview`.
- GPT-5 nano remains a possible future translation-only optimization, but using a second
  provider is intentionally deferred because its absolute savings are small.

## Expired Event Mobile Flow (2026-07-14)

- Branch: `codex/admin-expired-event-mobile-flow`
- Event search now checks both active and expired records, regardless of the selected tab.
- Search results show whether each event is active or expired, reducing the steps needed to
  locate and edit older records.
- After applying AI suggestions, the event form shows a clear confirmation and points to the
  persistent mobile save action.

## AdSense Content Reuse (2026-07-14)

- The source-of-truth product plan is `docs/adsense-content-reuse-plan.md`.
- The primary goal is to improve AdSense readiness by automatically preserving value from
  published content without adding steps to the flyer publishing workflow.
- Current branch: `codex/public-expired-event-history`.
- Current scope: accessible expired URLs, explicit ended state, conservative `noindex`, removal
  of obsolete CTAs, related upcoming events, and quality-only historical sitemap inclusion.
- Follow-up branch: `codex/historical-recommendation-measurement` distinguishes direct entity
  matches from city/style fallbacks and measures historical-to-current event clicks in GA4.

## Current Stable Checkpoint (2026-07-14)

- Stable production release: `v0.5.1` (`e755007`).
- PRs #1 through #5 are merged and their Vercel production deployments were verified.
- The next recommended implementation is a bilingual trust/editorial-method page, followed by
  accurate sitemap timestamps and Search Console validation.
- GA4 and Search Console should collect 2-4 weeks of evidence before building derived permanent
  pages or requesting another AdSense review.
- Full priorities and constraints remain in `docs/adsense-content-reuse-plan.md`.
- Branch `codex/adsense-next-phase-plan` now implements the bilingual trust/editorial-method page
  and removes misleading request-time `lastModified` values from every sitemap entry.

## SomosSalsa Rebrand (2026-08-09)

- Selected brand: `SomosSalsa`.
- Secured assets: `somossalsa.com` in AWS Route 53, `somossalsa.app` in GoDaddy, and Instagram handle `@somossalsa.app`.
- Canonical product domain: `somossalsa.com`; `somossalsa.app` is the short acquisition and future
  PWA-installation domain, and redirects to the canonical site instead of duplicating it.
- Official public contact: `info@somossalsa.com`.
- Positioning: clear, accessible, transparent, and neutral between academies.
- Geographic model: Guatemala is the first active location, not the center or limit of the platform.
- The local code migration on branch `codex/rebranding-strategy` now covers the visual identity,
  metadata, legal copy, PWA and social-sharing assets, entity countries, and per-event time zones.
- Local verification passed with TypeScript, ESLint, and the production build.
- Production rollout still requires configuring `NEXT_PUBLIC_SITE_URL=https://somossalsa.com`,
  activating and testing `info@somossalsa.com`, deploying the application, and validating
  canonical redirects and Search Console. The two SomosSalsa migrations are already applied.
