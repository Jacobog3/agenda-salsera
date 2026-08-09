import {
  buildAcademyScheduleText,
  inferAcademyPrimaryStyles,
  normalizeAcademyScheduleData,
  normalizeAcademyStyleTags
} from "@/lib/academies/academy-helpers";
import { normalizeCityName } from "@/lib/utils/normalize-city";
import { normalizeCountryCode } from "@/lib/locations";

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export function normalizeAcademyPayload(rawBody: Record<string, unknown>) {
  const countryCode = normalizeCountryCode(rawBody.country_code ?? rawBody.countryCode);
  const styleTags = normalizeAcademyStyleTags(rawBody.style_tags);
  const scheduleData = normalizeAcademyScheduleData(rawBody.schedule_data);
  const scheduleText =
    emptyToNull(rawBody.schedule_text) ??
    buildAcademyScheduleText(scheduleData);

  return {
    name: String(rawBody.name ?? "").trim(),
    description_es: String(rawBody.description_es ?? "").trim(),
    description_en: String(rawBody.description_en ?? rawBody.description_es ?? "").trim(),
    cover_image_url: String(rawBody.cover_image_url ?? "").trim(),
    banner_image_url: emptyToNull(rawBody.banner_image_url),
    city: normalizeCityName(rawBody.city, countryCode),
    country_code: countryCode,
    area: emptyToNull(rawBody.area),
    address: emptyToNull(rawBody.address),
    styles_taught: inferAcademyPrimaryStyles(styleTags, rawBody.styles_taught),
    style_tags: styleTags,
    schedule_text: scheduleText,
    schedule_data: scheduleData,
    levels: emptyToNull(rawBody.levels),
    price_text: emptyToNull(rawBody.price_text),
    trial_class: Boolean(rawBody.trial_class),
    modality: emptyToNull(rawBody.modality) ?? "presencial",
    whatsapp_url: emptyToNull(rawBody.whatsapp_url),
    instagram_url: emptyToNull(rawBody.instagram_url),
    facebook_url: emptyToNull(rawBody.facebook_url),
    website_url: emptyToNull(rawBody.website_url),
    google_place_id: emptyToNull(rawBody.google_place_id),
    is_featured: Boolean(rawBody.is_featured),
    is_published: rawBody.is_published !== false
  };
}
