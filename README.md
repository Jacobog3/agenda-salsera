# Exploraguate

Exploraguate is a bilingual event and community discovery platform for Guatemala.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- Supabase
- Vercel

## Principles

- Spanish is the default user experience.
- English is fully supported as a secondary locale.
- All code and comments are written in English.
- All user-facing strings come from the translation layer.
- The architecture stays lightweight and compatible with the Vercel free tier.

## Initial Scope

- Home page
- Events listing and detail pages
- Academies listing and detail pages
- Submit event page

## Local Development

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev`.

## Environment Variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
