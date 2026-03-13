# Exploraguate Architecture

## Product Direction

Exploraguate starts as a salsa and bachata discovery product for Guatemala and expands later into other communities.

## Architecture Summary

- One Next.js App Router application.
- Server Components by default.
- Supabase as the only backend service.
- `next-intl` for localization.
- Public content is read from Supabase.
- Event submissions are written through server-side handlers.

## Routing

- Spanish default locale without URL prefix.
- English locale under `/en`.
- Localized public pathnames:
  - `/eventos`
  - `/academias`
  - `/enviar-evento`
  - `/en/events`
  - `/en/academies`
  - `/en/submit-event`

## Data Strategy

- Keep shared fields in canonical columns.
- Keep bilingual fields in dedicated `*_es` and `*_en` columns.
- Avoid CMS complexity for the MVP.

## UI Strategy

- Consumer product interface, not dashboard UI.
- Mobile-first layouts.
- Design tokens centralized in CSS variables.
- Reusable section and card primitives.

## Deployment

- Deploy on Vercel free tier.
- Use Supabase hosted project for database and asset URLs.
