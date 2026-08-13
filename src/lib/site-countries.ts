import type { Locale } from "@/types/locale";

export const SITE_COUNTRIES = [
  {
    slug: "gt",
    code: "GT",
    name: { es: "Guatemala", en: "Guatemala" }
  }
] as const;

export type SiteCountrySlug = (typeof SITE_COUNTRIES)[number]["slug"];
export type SiteCountryCode = (typeof SITE_COUNTRIES)[number]["code"];

export const DEFAULT_SITE_COUNTRY = SITE_COUNTRIES[0];
export const SITE_COUNTRY_CODES = SITE_COUNTRIES.map((country) => country.code);
export const SITE_COUNTRY_COOKIE = "site_country";
export const SITE_COUNTRY_HEADER = "x-site-country";

export function isSiteCountrySlug(value: string): value is SiteCountrySlug {
  return SITE_COUNTRIES.some((country) => country.slug === value.toLowerCase());
}

export function getSiteCountryBySlug(value: string) {
  return SITE_COUNTRIES.find((country) => country.slug === value.toLowerCase()) ?? null;
}

export function getSiteCountryByCode(value: string) {
  return SITE_COUNTRIES.find((country) => country.code === value.toUpperCase()) ?? null;
}

export function getSiteCountryName(countryCode: string, locale: Locale) {
  return getSiteCountryByCode(countryCode)?.name[locale] ?? countryCode;
}

export function getCountrySlugFromPathname(pathname: string): SiteCountrySlug | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  return isSiteCountrySlug(firstSegment) ? firstSegment : null;
}

export function stripCountryFromPathname(pathname: string) {
  const country = getCountrySlugFromPathname(pathname);
  if (!country) return pathname || "/";
  const stripped = pathname.slice(country.length + 1);
  return stripped || "/";
}

export function addCountryToLocalizedPath(
  localizedPath: string,
  country: SiteCountrySlug = DEFAULT_SITE_COUNTRY.slug
) {
  if (!localizedPath.startsWith("/")) return localizedPath;
  if (getCountrySlugFromPathname(localizedPath)) return localizedPath;
  return localizedPath === "/" ? `/${country}` : `/${country}${localizedPath}`;
}

const SEGMENT_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  eventos: { es: "eventos", en: "events" },
  events: { es: "eventos", en: "events" },
  festivales: { es: "festivales", en: "festivals" },
  festivals: { es: "festivales", en: "festivals" },
  lugares: { es: "lugares", en: "spots" },
  spots: { es: "lugares", en: "spots" },
  academias: { es: "academias", en: "academies" },
  academies: { es: "academias", en: "academies" },
  recursos: { es: "recursos", en: "resources" },
  resources: { es: "recursos", en: "resources" },
  artistas: { es: "artistas", en: "artists" },
  artists: { es: "artistas", en: "artists" },
  maestros: { es: "maestros", en: "teachers" },
  teachers: { es: "maestros", en: "teachers" },
  buscar: { es: "buscar", en: "search" },
  search: { es: "buscar", en: "search" },
  "acerca-de": { es: "acerca-de", en: "about" },
  about: { es: "acerca-de", en: "about" },
  "enviar-evento": { es: "enviar-evento", en: "submit-event" },
  "submit-event": { es: "enviar-evento", en: "submit-event" },
  "enviar-academia": { es: "enviar-academia", en: "submit-academy" },
  "submit-academy": { es: "enviar-academia", en: "submit-academy" },
  "enviar-maestro": { es: "enviar-maestro", en: "submit-teacher" },
  "submit-teacher": { es: "enviar-maestro", en: "submit-teacher" },
  "enviar-lugar": { es: "enviar-lugar", en: "submit-spot" },
  "submit-spot": { es: "enviar-lugar", en: "submit-spot" },
  "recomendar-recurso": { es: "recomendar-recurso", en: "suggest-resource" },
  "suggest-resource": { es: "recomendar-recurso", en: "suggest-resource" }
};

export function switchCountryPathLocale(pathname: string, locale: Locale) {
  const country = getCountrySlugFromPathname(pathname) ?? DEFAULT_SITE_COUNTRY.slug;
  let localPath = stripCountryFromPathname(pathname);
  if (localPath === "/en") localPath = "/";
  if (localPath.startsWith("/en/")) localPath = localPath.slice(3);

  const segments = localPath.split("/").filter(Boolean);
  if (segments[0] === "legal" && segments[1]) {
    const legalPage = segments[1];
    segments[1] = legalPage === "terminos" || legalPage === "terms"
      ? locale === "es" ? "terminos" : "terms"
      : locale === "es" ? "privacidad" : "privacy";
  } else if (segments[0] && SEGMENT_TRANSLATIONS[segments[0]]) {
    segments[0] = SEGMENT_TRANSLATIONS[segments[0]][locale];
  }

  const suffix = segments.length ? `/${segments.join("/")}` : "";
  return locale === "es" ? `/${country}${suffix}` : `/${country}/en${suffix}`;
}

export function publicUrlPath(pathname: string, country = DEFAULT_SITE_COUNTRY.slug) {
  return addCountryToLocalizedPath(pathname, country);
}
