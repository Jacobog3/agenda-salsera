# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Exploraguate** — a bilingual (Spanish/English) event and community discovery platform for Guatemala, focused initially on the salsa and bachata dance community.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check (tsc --noEmit)
```

## Architecture

### Routing

- **Public site**: `src/app/[locale]/(public)/` — Next.js App Router with `next-intl`
- **Admin panel**: `src/app/admin/` — separate route tree, cookie-based auth (`admin_session`)
- **API routes**: `src/app/api/` — public submission endpoints + `src/app/api/admin/` for admin CRUD

Spanish is the default locale (no URL prefix). English routes are under `/en`. Pathnames are localized (e.g., `/eventos` ↔ `/en/events`). Locale routing is configured in `src/i18n/routing.ts`.

Middleware (`src/middleware.ts`) handles both: intl routing for public routes, session guard for `/admin/*`.

### Data Layer

- **Supabase** is the only backend. Schema migrations live in `supabase/migrations/`.
- Bilingual content uses `*_es` / `*_en` column pairs directly in the database — no CMS.
- Supabase clients: `src/lib/supabase/server.ts` (Server Components/Route Handlers), `src/lib/supabase/browser.ts` (Client Components), `src/lib/supabase/admin.ts` (admin ops with service role key).
- Query helpers live in `src/lib/queries/`.
- Type definitions for DB models: `src/types/` (event, academy, teacher, spot, organizer, locale).

### i18n

- `next-intl` v4. Message files: `src/i18n/messages/es.json` and `en.json`.
- All user-facing strings must come from these message files — no hardcoded UI text in components.
- Use the `useTranslations` hook in Client Components, `getTranslations` in Server Components.

### Components

Organized by domain under `src/components/`: `events/`, `academies/`, `teachers/`, `spots/`, `home/`, `search/`, `forms/`, `layout/`, `admin/`, `brand/`, `shared/`, `ui/`.

shadcn/ui primitives live in `src/components/ui/`. Design tokens are CSS variables in `src/app/globals.css`.

### Key Principles

- Server Components by default; add `"use client"` only when needed.
- Mobile-first layouts. Consumer product UI — not a dashboard.
- Never hardcode UI strings — always use the translation layer.
- All code and comments in English; UI content in Spanish (primary) and English.
- Keep solutions simple; avoid overengineering. No auth systems, payments, or social features in MVP scope.
