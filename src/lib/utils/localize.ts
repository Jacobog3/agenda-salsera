import type { AcademyRecord, LocalizedAcademy } from "@/types/academy";
import type { EventRecord, LocalizedEvent } from "@/types/event";
import type { SpotRecord, LocalizedSpot } from "@/types/spot";
import type {
  TeacherRecord,
  LocalizedTeacher
} from "@/types/teacher";
import type { Locale } from "@/types/locale";

export function localizeEvent(event: EventRecord, locale: Locale): LocalizedEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: locale === "es" ? event.titleEs : event.titleEn,
    description: locale === "es" ? event.descriptionEs : event.descriptionEn,
    coverImageUrl: event.coverImageUrl,
    galleryUrls: event.galleryUrls,
    danceStyle: event.danceStyle,
    city: event.city,
    area: event.area,
    venueName: event.venueName,
    address: event.address,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    priceAmount: event.priceAmount,
    priceText: event.priceText,
    currency: event.currency,
    organizerName: event.organizerName,
    organizerId: event.organizerId,
    academyId: event.academyId,
    contactUrl: event.contactUrl,
    externalUrl: event.externalUrl,
    isFeatured: event.isFeatured,
    createdAt: event.createdAt
  };
}

export function localizeAcademy(
  academy: AcademyRecord,
  locale: Locale
): LocalizedAcademy {
  return {
    id: academy.id,
    slug: academy.slug,
    name: academy.name,
    description: locale === "es" ? academy.descriptionEs : academy.descriptionEn,
    coverImageUrl: academy.coverImageUrl,
    bannerImageUrl: academy.bannerImageUrl,
    city: academy.city,
    area: academy.area,
    address: academy.address,
    stylesTaught: academy.stylesTaught,
    styleTags: academy.styleTags ?? [],
    scheduleText: academy.scheduleText,
    scheduleData: academy.scheduleData,
    levels: academy.levels,
    priceText: academy.priceText,
    trialClass: academy.trialClass,
    modality: academy.modality,
    whatsappUrl: academy.whatsappUrl,
    instagramUrl: academy.instagramUrl,
    facebookUrl: academy.facebookUrl,
    websiteUrl: academy.websiteUrl,
    isFeatured: academy.isFeatured
  };
}

export function localizeSpot(spot: SpotRecord, locale: Locale): LocalizedSpot {
  return {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    description: locale === "es" ? spot.descriptionEs : spot.descriptionEn,
    coverImageUrl: spot.coverImageUrl,
    city: spot.city,
    area: spot.area,
    address: spot.address,
    schedule: locale === "es" ? spot.scheduleEs : spot.scheduleEn,
    coverCharge: locale === "es" ? spot.coverChargeEs : spot.coverChargeEn,
    whatsappUrl: spot.whatsappUrl,
    instagramUrl: spot.instagramUrl,
    googleMapsUrl: spot.googleMapsUrl,
    isFeatured: spot.isFeatured
  };
}

export function localizeTeacher(
  teacher: TeacherRecord,
  locale: Locale
): LocalizedTeacher {
  return {
    id: teacher.id,
    slug: teacher.slug,
    name: teacher.name,
    bio: locale === "es" ? teacher.bioEs : teacher.bioEn,
    profileImageUrl: teacher.profileImageUrl,
    bannerImageUrl: teacher.bannerImageUrl,
    city: teacher.city,
    area: teacher.area,
    address: teacher.address,
    stylesTaught: teacher.stylesTaught,
    styleTags: teacher.styleTags ?? [],
    levels: teacher.levels,
    modality: teacher.modality,
    classFormats: teacher.classFormats,
    teachingZones: teacher.teachingZones,
    teachingVenues: teacher.teachingVenues,
    scheduleText: teacher.scheduleText,
    scheduleData: teacher.scheduleData,
    bookingUrl: teacher.bookingUrl,
    whatsappUrl: teacher.whatsappUrl,
    instagramUrl: teacher.instagramUrl,
    facebookUrl: teacher.facebookUrl,
    websiteUrl: teacher.websiteUrl,
    trialClass: teacher.trialClass,
    priceText: teacher.priceText,
    isFeatured: teacher.isFeatured
  };
}
