import type { Locale } from "@/types/locale";

const GT_TIMEZONE = "America/Guatemala";

export function formatEventDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: GT_TIMEZONE
  }).format(new Date(date));
}

export function formatEventDateTime(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: GT_TIMEZONE
  }).format(new Date(date));
}

export function formatEventDateRange(startsAt: string, endsAt: string, locale: Locale) {
  const fmt = new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: GT_TIMEZONE
  });
  const start = fmt.format(new Date(startsAt));
  const end = new Intl.DateTimeFormat(locale === "es" ? "es-GT" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: GT_TIMEZONE
  }).format(new Date(endsAt));
  return `${start} – ${end}`;
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string,
  locale: Locale
) {
  if (amount === null || amount === undefined) {
    return locale === "es" ? "Gratis" : "Free";
  }

  return new Intl.NumberFormat(locale === "es" ? "es-GT" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}
