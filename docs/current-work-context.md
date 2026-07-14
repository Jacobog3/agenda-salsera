# Current Work Context

Last updated: 2026-04-14

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
