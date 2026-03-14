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
 * For listing cards: if priceText has multiple price segments,
 * find the one with the lowest numeric value and show "Desde [segment]".
 * Preserves original currency symbols from the text (Q, $, USD, etc.).
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

  const segments = priceText.split(/[·|\-\n]/).map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 1) return priceText;

  let lowestValue = Infinity;
  let lowestSegment = segments[0];

  for (const seg of segments) {
    const nums = seg.match(/[\d,]+/g);
    if (!nums) continue;
    const val = Math.min(...nums.map((n) => Number(n.replace(/,/g, ""))));
    if (val < lowestValue) {
      lowestValue = val;
      lowestSegment = seg;
    }
  }

  const prefix = locale === "es" ? "Desde" : "From";
  return `${prefix} ${lowestSegment}`;
}
