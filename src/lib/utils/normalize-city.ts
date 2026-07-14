const CANONICAL_CITY_NAMES = new Map([
  ["guatemala", "Ciudad de Guatemala"],
  ["guatemala city", "Ciudad de Guatemala"],
  ["ciudad de guatemala", "Ciudad de Guatemala"],
  ["antigua", "Antigua Guatemala"],
  ["antigua guatemala", "Antigua Guatemala"]
]);

export function normalizeGuatemalaCityName(value: unknown) {
  const city = String(value ?? "").trim();
  if (!city) return "";

  return CANONICAL_CITY_NAMES.get(city.toLocaleLowerCase("es")) ?? city;
}
