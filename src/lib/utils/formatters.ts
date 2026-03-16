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

export function extractLowestPriceAmount(
  priceText: string | null | undefined,
  currency?: string | null
) {
  if (!priceText) return null;

  const preferredSymbols =
    currency === "USD" ? ["$"] : currency === "GTQ" ? ["Q"] : ["Q", "$"];
  const fallbackSymbols = ["Q", "$"].filter((symbol) => !preferredSymbols.includes(symbol));

  const findLowest = (symbols: string[]) => {
    if (symbols.length === 0) return null;

    const escapedSymbols = symbols.map((symbol) => symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(?:${escapedSymbols.join("|")})\\s*[\\d,]+`, "g");
    const matches = priceText.match(pattern);

    if (!matches) return null;

    let lowest = Infinity;
    for (const match of matches) {
      const value = Number(match.replace(/[^0-9]/g, ""));
      if (Number.isFinite(value) && value < lowest) {
        lowest = value;
      }
    }

    return lowest === Infinity ? null : lowest;
  };

  return findLowest(preferredSymbols) ?? findLowest(fallbackSymbols);
}

function extractLowestPriceDisplay(
  priceText: string,
  currency?: string | null
) {
  const preferredSymbols =
    currency === "USD" ? ["$"] : currency === "GTQ" ? ["Q"] : ["Q", "$"];
  const fallbackSymbols = ["Q", "$"].filter((symbol) => !preferredSymbols.includes(symbol));

  const findLowest = (symbols: string[]) => {
    if (symbols.length === 0) return null;

    const escapedSymbols = symbols.map((symbol) => symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(?:${escapedSymbols.join("|")})\\s*[\\d,]+`, "g");
    const matches = priceText.match(pattern);

    if (!matches) return null;

    let lowestValue = Infinity;
    let lowestMatch = "";

    for (const match of matches) {
      const value = Number(match.replace(/[^0-9]/g, ""));
      if (Number.isFinite(value) && value < lowestValue) {
        lowestValue = value;
        lowestMatch = match.trim();
      }
    }

    return lowestMatch || null;
  };

  return findLowest(preferredSymbols) ?? findLowest(fallbackSymbols);
}

/**
 * For listing cards: if priceText has multiple price segments,
 * find the lowest actual price (preceded by Q, $ or currency symbol)
 * and show "Desde [price]". Only matches currency-prefixed numbers.
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

  const lowestMatch =
    extractLowestPriceDisplay(priceText, currency) ??
    (() => {
      const lowestAmount = extractLowestPriceAmount(priceText, currency);
      if (lowestAmount === null) return null;
      return `${currency === "USD" ? "$" : "Q"}${lowestAmount}`;
    })();

  if (!lowestMatch) return priceText;

  const prefix = locale === "es" ? "Desde" : "From";
  return `${prefix} ${lowestMatch}`;
}
