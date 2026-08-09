import type { Locale } from "@/types/locale";

// New records are intentionally location-neutral. A country must be selected;
// Guatemala remains an option and existing Guatemalan records keep their value.
export const DEFAULT_COUNTRY_CODE = "";
export const DEFAULT_TIME_ZONE = "UTC";

export const COUNTRY_OPTIONS = [
  { code: "GT", timeZone: "America/Guatemala" },
  { code: "CR", timeZone: "America/Costa_Rica" },
  { code: "MX", timeZone: "America/Mexico_City" },
  { code: "ES", timeZone: "Europe/Madrid" },
  { code: "CO", timeZone: "America/Bogota" },
  { code: "SV", timeZone: "America/El_Salvador" },
  { code: "HN", timeZone: "America/Tegucigalpa" },
  { code: "NI", timeZone: "America/Managua" },
  { code: "PA", timeZone: "America/Panama" },
  { code: "DO", timeZone: "America/Santo_Domingo" },
  { code: "US", timeZone: "America/New_York" }
] as const;

export function normalizeCountryCode(value: unknown, fallback = DEFAULT_COUNTRY_CODE) {
  const countryCode = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : fallback;
}

export function getDefaultTimeZone(countryCode: string) {
  return COUNTRY_OPTIONS.find((country) => country.code === countryCode)?.timeZone
    ?? DEFAULT_TIME_ZONE;
}

const COUNTRY_CURRENCIES: Record<string, string> = {
  GT: "GTQ",
  CR: "CRC",
  MX: "MXN",
  ES: "EUR",
  CO: "COP",
  SV: "USD",
  HN: "HNL",
  NI: "NIO",
  PA: "USD",
  DO: "DOP",
  US: "USD"
};

export function getDefaultCurrency(countryCode: string) {
  const normalized = normalizeCountryCode(countryCode);
  return normalized ? COUNTRY_CURRENCIES[normalized] ?? "USD" : "";
}

export function getCountryName(countryCode: string, locale: Locale) {
  const code = normalizeCountryCode(countryCode);
  if (!code) return "";

  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatLocation(
  city: string,
  countryCode: string,
  locale: Locale,
  options?: { includeCountry?: boolean }
) {
  const country = getCountryName(countryCode, locale);
  if (options?.includeCountry === false || !country) return city;
  if (!city) return country;
  return `${city}, ${country}`;
}

export function getLocationKey(city: string, countryCode: string) {
  return `${normalizeCountryCode(countryCode)}:${city.trim().toLocaleLowerCase("es")}`;
}

export function zonedDateTimeToIso(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(utcGuess));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const representedUtc = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute)
    );
    utcGuess += Date.UTC(year, month - 1, day, hour, minute) - representedUtc;
  }

  return new Date(utcGuess).toISOString();
}

export function isoToZonedDateTimeFields(isoString: string, timeZone: string) {
  if (!isoString) return { date: "", time: "" };

  // Gemini returns event wall-clock times without an offset. Those values are
  // already local to the suggested event time zone and must not be shifted as
  // if they were UTC. Stored database timestamps include an offset and still
  // follow the time-zone conversion below.
  const localDateTime = isoString.trim().match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2}(?:\.\d{1,3})?)?$/
  );
  if (localDateTime) {
    return { date: localDateTime[1], time: localDateTime[2] };
  }

  const date = new Date(isoString);
  if (!Number.isFinite(date.getTime())) return { date: "", time: "" };

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
}
