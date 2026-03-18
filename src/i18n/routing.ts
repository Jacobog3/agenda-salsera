import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/events": {
      es: "/eventos",
      en: "/events"
    },
    "/events/[slug]": {
      es: "/eventos/[slug]",
      en: "/events/[slug]"
    },
    "/spots": {
      es: "/lugares",
      en: "/spots"
    },
    "/spots/[slug]": {
      es: "/lugares/[slug]",
      en: "/spots/[slug]"
    },
    "/academies": {
      es: "/academias",
      en: "/academies"
    },
    "/search": {
      es: "/buscar",
      en: "/search"
    },
    "/academies/[slug]": {
      es: "/academias/[slug]",
      en: "/academies/[slug]"
    },
    "/teachers/[slug]": {
      es: "/maestros/[slug]",
      en: "/teachers/[slug]"
    },
    "/submit-event": {
      es: "/enviar-evento",
      en: "/submit-event"
    },
    "/submit-academy": {
      es: "/enviar-academia",
      en: "/submit-academy"
    },
    "/submit-teacher": {
      es: "/enviar-maestro",
      en: "/submit-teacher"
    },
    "/submit-spot": {
      es: "/enviar-lugar",
      en: "/submit-spot"
    },
    "/legal/terms": {
      es: "/legal/terminos",
      en: "/legal/terms"
    },
    "/legal/privacy": {
      es: "/legal/privacidad",
      en: "/legal/privacy"
    }
  }
});

export type AppLocale = (typeof routing.locales)[number];
