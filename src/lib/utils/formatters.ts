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

/**
 * For listing cards: if priceText has multiple prices separated by `·`,
 * extract the lowest number and return "Desde Q[min]" / "From Q[min]".
 * Falls back to the full priceText or formatted priceAmount.
 */
export function formatCardPrice(
  priceText: string | null | undefined,
  priceAmount: number | null | undefined,
  currency: string,
  locale: Locale
): string {
  if (!priceText) {
    return formatCurrency(priceAmount, currency, locale);
  }

  const segments = priceText.split(/[·|/\n]/).map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 1) return priceText;

  const numbers = priceText.match(/\d+/g);
  if (!numbers || numbers.length === 0) return priceText;

  const min = Math.min(...numbers.map(Number));
  const formatted = new Intl.NumberFormat(locale === "es" ? "es-GT" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(min);

  return locale === "es" ? `Desde ${formatted}` : `From ${formatted}`;
}
