# SomosSalsa — Project Context

## Project Overview

SomosSalsa is a web platform designed to make salsa, bachata, and Latin dance information clear, accessible, and connected.

The first active location is **Guatemala**, where people currently rely heavily on WhatsApp groups and social posts to share information about:

- social dance events
- academies
- instructors
- workshops
- job opportunities
- dance-related services

WhatsApp works for communication but is **not good for organizing information**.

Important information quickly gets buried in chat messages.

SomosSalsa centralizes this information in a **clean, searchable, mobile-friendly platform**.

---

# Product Vision

The long-term vision is to create the clearest directory and discovery layer for the **Latin dance community**, starting in Guatemala and expanding by city across Latin America and later other regions.

Guatemala is a location in the platform, not part of the brand identity or a permanent geographic boundary. Permanent profiles for academies, teachers, artists, organizers, festivals, venues, and event editions should preserve knowledge that currently disappears in flyers and chats.

---

# MVP Scope

The first version should focus on simplicity and validation.

Users should be able to:

1. Discover upcoming salsa and bachata events
2. Browse dance academies
3. View event details
4. Submit new events
5. Easily navigate the platform on mobile

This is **not a social network**.

This is a **discovery and directory platform**.

---

# Language Requirements

The platform must support **Spanish and English**.

Primary language:

Spanish

Secondary language:

English

Key rules:

- Spanish is the default language
- The user experience should be designed primarily for Spanish speakers
- English support must exist from the beginning
- The codebase must remain fully in English
- All UI text must be translatable

Important:

Do not hardcode UI text inside components.

All text should come from a translation system.

---

# Technology Stack

The project uses the following stack:

Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Supabase

Hosting:
- Vercel (free tier)

The architecture must remain **simple and scalable**.

Avoid unnecessary complexity.

---

# Coding Rules

All code must be written in English.

All comments must be written in English.

Important remarks should use the format:

Naming conventions must be clear and consistent.

Avoid overengineering.

Keep solutions simple and maintainable.

---

# UI and Design Principles

This project must NOT look like a generic developer dashboard.

The UI must feel like a **modern consumer product**.

Key design goals:

- mobile-first design
- clean visual hierarchy
- modern card-based layouts
- rounded corners
- subtle shadows
- balanced whitespace
- pleasant typography
- visually appealing event cards
- simple and elegant forms
- strong call-to-action buttons

Avoid:

- generic templates
- default Tailwind demo styles
- cramped layouts
- dense tables
- outdated bootstrap-style UI

The interface should feel **polished and intentional**.

---

# Design System Guidelines

Use **shadcn/ui** as a base component system.

Customize components so the interface does not look like a default example.

Define consistent design tokens:

- color palette
- spacing scale
- border radius
- card styles
- button variants
- input styles
- container widths
- section spacing

---

# User Experience Goals

The product should feel:

- modern
- simple
- welcoming
- community-oriented
- trustworthy
- useful

Mobile usability is the **highest priority**.

The experience should feel natural on mobile screens first and scale well to desktop.

---

# MVP Pages

## Home Page

Contains:

- hero section explaining the platform
- upcoming events section
- featured academies
- CTA to submit an event

---

## Events Listing Page

Displays upcoming events.

Each event card should include:

- event image or flyer
- event title
- date
- location
- price
- organizer

Optional filters:

- city
- dance style
- date

---

## Event Detail Page

Shows:

- event title
- cover image
- date
- time
- location
- price
- organizer
- description
- CTA button linking to organizer contact

---

## Academies Listing Page

Directory of dance academies.

Each academy card should show:

- academy name
- location
- styles taught
- contact links

---

## Academy Detail Page

Shows:

- academy name
- description
- location
- styles taught
- contact links

Optional:

- related events

---

## Submit Event Page

Simple event submission form.

Fields:

- event title
- description
- image URL
- dance style
- date
- time
- price
- city
- venue
- organizer name
- contact link

The form must be visually clean and easy to use.

---

# Database Models

## Event

Fields:

- id
- title
- slug
- description
- cover_image_url
- dance_style
- city
- area
- venue_name
- address
- date
- start_time
- price
- currency
- organizer_name
- contact_url
- external_url
- is_featured
- created_at

---

## Academy

Fields:

- id
- name
- slug
- description
- cover_image_url
- city
- area
- address
- styles_taught
- whatsapp_url
- instagram_url
- website_url
- is_featured
- created_at

---

# What NOT To Build Yet

Do not build:

- complex authentication
- payment systems
- chat systems
- social feeds
- complex admin dashboards

Keep the MVP lightweight.

---

# SEO Guidelines

Apply good SEO practices:

- semantic HTML
- clean URLs
- descriptive metadata
- OpenGraph metadata
- logical heading structure

The architecture should support bilingual metadata.

---

# Performance Goals

The platform should:

- load quickly on mobile
- use optimized images
- minimize JavaScript
- avoid unnecessary client rendering

---

# Accessibility

Ensure:

- good color contrast
- accessible forms
- keyboard navigation
- clear button states

---

# Content Style

Use realistic placeholder content relevant to Guatemala and the salsa/bachata community.

Avoid lorem ipsum.

Tone should feel:

- friendly
- clear
- local
- welcoming
- community-driven

---

# Development Process

When implementing features, follow this order:

1. Define architecture
2. Define database schema
3. Define internationalization approach
4. Scaffold the Next.js project
5. Implement design system
6. Build pages
7. Add sample data
8. Improve UI polish

---

# Quality Bar

If any interface looks generic, improve it.

Focus on:

- spacing
- typography
- hierarchy
- card layouts
- mobile usability

The final result should feel like a **modern polished product**, not a quick developer prototype.
