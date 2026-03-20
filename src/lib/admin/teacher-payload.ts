import {
  buildAcademyScheduleText,
  inferAcademyPrimaryStyles,
  normalizeAcademyScheduleData,
  normalizeAcademyStyleTags
} from "@/lib/academies/academy-helpers";

function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }

  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function emptyToNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export function normalizeTeacherPayload(rawBody: Record<string, unknown>) {
  const styleTags = normalizeAcademyStyleTags(rawBody.style_tags);
  const scheduleData = normalizeAcademyScheduleData(rawBody.schedule_data);
  const scheduleText =
    emptyToNull(rawBody.schedule_text) ??
    buildAcademyScheduleText(scheduleData);

  return {
    name: String(rawBody.name ?? "").trim(),
    bio_es: String(rawBody.bio_es ?? "").trim(),
    bio_en: String(rawBody.bio_en ?? rawBody.bio_es ?? "").trim(),
    profile_image_url: emptyToNull(rawBody.profile_image_url),
    banner_image_url: emptyToNull(rawBody.banner_image_url),
    city: String(rawBody.city ?? "").trim(),
    area: emptyToNull(rawBody.area),
    address: emptyToNull(rawBody.address),
    styles_taught: inferAcademyPrimaryStyles(styleTags, rawBody.styles_taught),
    style_tags: styleTags,
    levels: emptyToNull(rawBody.levels),
    modality: emptyToNull(rawBody.modality),
    class_formats: parseStringList(rawBody.class_formats),
    teaching_zones: parseStringList(rawBody.teaching_zones),
    teaching_venues: parseStringList(rawBody.teaching_venues),
    schedule_text: scheduleText,
    schedule_data: scheduleData,
    booking_url: emptyToNull(rawBody.booking_url),
    whatsapp_url: emptyToNull(rawBody.whatsapp_url),
    instagram_url: emptyToNull(rawBody.instagram_url),
    facebook_url: emptyToNull(rawBody.facebook_url),
    website_url: emptyToNull(rawBody.website_url),
    trial_class: Boolean(rawBody.trial_class),
    price_text: emptyToNull(rawBody.price_text),
    is_featured: Boolean(rawBody.is_featured),
    is_published: rawBody.is_published !== false
  };
}
