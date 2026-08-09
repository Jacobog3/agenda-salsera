import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";
import type {
  FestivalArtist,
  FestivalDetail,
  FestivalEditionRecord,
  FestivalMedia,
  FestivalPass,
  FestivalPassPriceTier,
  FestivalScheduleItem,
  FestivalSeriesRecord,
  LocalizedFestivalEdition,
  LocalizedFestivalSeries,
  VerificationStatus
} from "@/types/festival";

const asbfSeries: FestivalSeriesRecord = {
  id: "sample-antigua-sbf",
  slug: "antigua-salsa-bachata-festival",
  name: "Antigua Salsa y Bachata Festival",
  seriesType: "festival",
  shortDescriptionEs: "Festival internacional de salsa y bachata en Antigua Guatemala.",
  shortDescriptionEn: "International salsa and bachata festival in Antigua Guatemala.",
  descriptionEs: "Un perfil permanente que reúne cada edición, sus artistas, agenda, pases, sedes y material oficial.",
  descriptionEn: "A permanent profile bringing together each edition, its artists, schedule, passes, venues, and official media.",
  logoImageUrl: null,
  bannerImageUrl: "https://antiguasbf.com/wp-content/uploads/2026/07/horizontal.jpeg",
  homeCity: "Antigua Guatemala",
  homeCountryCode: "GT",
  websiteUrl: "https://antiguasbf.com",
  ticketUrl: "https://antiguasbf.com",
  instagramUrl: null,
  facebookUrl: null,
  whatsappUrl: "https://wa.me/50256676144",
  verificationStatus: "source_confirmed",
  isFeatured: true
};

const asbf2027: FestivalEditionRecord = {
  id: "sample-antigua-sbf-2027",
  festivalSeriesId: asbfSeries.id,
  slug: "antigua-salsa-bachata-festival-2027",
  name: "Antigua Salsa y Bachata Festival 2027",
  editionLabel: "2027",
  summaryEs: "La próxima edición será del 29 de abril al 3 de mayo de 2027 y ya está anunciando jueces y talleristas internacionales.",
  summaryEn: "The next edition will run from April 29 to May 3, 2027 and is already announcing international judges and instructors.",
  descriptionEs: "ASBF 2027 reunirá salsa y bachata en Antigua Guatemala. La organización ya publicó su primera ronda de jueces y talleristas; las sedes, pases y programa se completarán conforme sean anunciados oficialmente.",
  descriptionEn: "ASBF 2027 will bring salsa and bachata together in Antigua Guatemala. The organizer has published its first round of judges and instructors; venues, passes, and the schedule will be completed as they are officially announced.",
  coverImageUrl: "https://antiguasbf.com/wp-content/uploads/2026/07/horizontal.jpeg",
  startsOn: "2027-04-29",
  endsOn: "2027-05-03",
  startsAt: null,
  endsAt: null,
  dateStatus: "confirmed",
  dateLabel: null,
  city: "Antigua Guatemala",
  countryCode: "GT",
  timeZone: "America/Guatemala",
  area: null,
  primaryVenueName: null,
  address: null,
  hotelInfoEs: null,
  hotelInfoEn: null,
  ticketUrl: null,
  registrationUrl: null,
  rulesUrl: null,
  status: "upcoming",
  verificationStatus: "source_confirmed",
  isFeatured: true
};

const asbf2026: FestivalEditionRecord = {
  id: "sample-antigua-sbf-2026",
  festivalSeriesId: asbfSeries.id,
  slug: "antigua-salsa-bachata-festival-2026",
  name: "Antigua Salsa y Bachata Festival 2026",
  editionLabel: "2026",
  summaryEs: "Cinco días de talleres, competencias, shows y baile social en Antigua Guatemala.",
  summaryEn: "Five days of workshops, competitions, shows, and social dancing in Antigua Guatemala.",
  descriptionEs: "Actividades realizadas en Hotel Casa Santo Domingo y Hotel Tenedor del Cerro.",
  descriptionEn: "Activities held at Hotel Casa Santo Domingo and Hotel Tenedor del Cerro.",
  coverImageUrl: "/images/events/antigua-festival-artistas.png",
  startsOn: "2026-04-30",
  endsOn: "2026-05-04",
  startsAt: "2026-04-30T17:00:00.000Z",
  endsAt: "2026-05-04T07:00:00.000Z",
  dateStatus: "confirmed",
  dateLabel: null,
  city: "Antigua Guatemala",
  countryCode: "GT",
  timeZone: "America/Guatemala",
  area: null,
  primaryVenueName: "Hotel Casa Santo Domingo & Hotel Tenedor del Cerro",
  address: "Antigua Guatemala",
  hotelInfoEs: null,
  hotelInfoEn: null,
  ticketUrl: "https://antiguasbf.com",
  registrationUrl: null,
  rulesUrl: null,
  status: "finished",
  verificationStatus: "source_confirmed",
  isFeatured: false
};

const congressSeries: FestivalSeriesRecord = {
  id: "sample-guatemala-salsa-congress",
  slug: "guatemala-salsa-congress",
  name: "Guatemala Salsa Congress",
  seriesType: "congress",
  shortDescriptionEs: "Congreso de salsa con talleres, competencias, shows y sociales en Ciudad de Guatemala.",
  shortDescriptionEn: "Salsa congress with workshops, competitions, shows, and socials in Guatemala City.",
  descriptionEs: "Un perfil permanente para conservar cada concepto, fechas, competencias, pases, hospedaje y material oficial.",
  descriptionEn: "A permanent profile preserving each theme, dates, competitions, passes, lodging, and official media.",
  logoImageUrl: "https://www.guatesalsa.com/assets/alquimia-logo-white.png",
  bannerImageUrl: "https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png",
  homeCity: "Ciudad de Guatemala",
  homeCountryCode: "GT",
  websiteUrl: "https://www.guatesalsa.com",
  ticketUrl: "https://salsatickets.com/entradas?evento=17",
  instagramUrl: "https://www.instagram.com/guatesalsa",
  facebookUrl: null,
  whatsappUrl: null,
  verificationStatus: "source_confirmed",
  isFeatured: true
};

const congress2026: FestivalEditionRecord = {
  id: "sample-guatemala-salsa-congress-2026",
  festivalSeriesId: congressSeries.id,
  slug: "guatemala-salsa-congress-alquimia-2026",
  name: "ALQUIMIA — Guatemala Salsa Congress 2026",
  editionLabel: "ALQUIMIA 2026",
  summaryEs: "Talleres, competencias, shows y cinco sociales del 4 al 8 de noviembre.",
  summaryEn: "Workshops, competitions, shows, and five socials from November 4 to 8.",
  descriptionEs: "ALQUIMIA reúne cinco días de talleres, competencias, shows y sociales en Ciudad Cayalá. Para competir se compra primero el Dancer Pass y la inscripción de categorías se completa por separado en Podium System cuando sea habilitado.",
  descriptionEn: "ALQUIMIA brings together five days of workshops, competitions, shows, and socials in Ciudad Cayalá. Competitors first purchase a Dancer Pass and complete category registration separately in Podium System when it becomes available.",
  coverImageUrl: "https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png",
  startsOn: "2026-11-04",
  endsOn: "2026-11-08",
  startsAt: null,
  endsAt: null,
  dateStatus: "confirmed",
  dateLabel: null,
  city: "Ciudad de Guatemala",
  countryCode: "GT",
  timeZone: "America/Guatemala",
  area: "Ciudad Cayalá",
  primaryVenueName: "Ciudad Cayalá",
  address: "Ciudad Cayalá, Ciudad de Guatemala",
  hotelInfoEs: "Hotel sede: AC Hotel Marriott. Habitaciones desde USD 122 por noche con impuestos. Desayuno: USD 10 adicionales por persona. Para obtener la tarifa del congreso, reservar con Vanessa Walter Veliz al +502 3992 6242 y mencionar Guatemala Salsa Congress.",
  hotelInfoEn: "Official hotel: AC Hotel Marriott. Rooms from USD 122 per night including taxes. Breakfast is an additional USD 10 per person. For the congress rate, book with Vanessa Walter Veliz at +502 3992 6242 and mention Guatemala Salsa Congress.",
  ticketUrl: "https://salsatickets.com/entradas?evento=17",
  registrationUrl: "https://salsatickets.com/entradas?evento=17",
  rulesUrl: "https://acrobat.adobe.com/id/urn:aaid:sc:US:52ae0944-05bb-4025-abfc-7377b60f082f",
  status: "upcoming",
  verificationStatus: "source_confirmed",
  isFeatured: true
};

const asbfMedia: FestivalMedia[] = [
  {
    id: "sample-asbf-2027-banner",
    mediaType: "image",
    role: "banner",
    url: "https://antiguasbf.com/wp-content/uploads/2026/07/horizontal.jpeg",
    title: "ASBF 2027",
    altText: "Anuncio oficial de ASBF 2027",
    sortOrder: 0
  },
  {
    id: "sample-asbf-2027-bersy",
    mediaType: "image",
    role: "gallery",
    url: "https://antiguasbf.com/wp-content/uploads/2026/07/Bersy.jpeg",
    title: "Bersy Cortez",
    altText: "Bersy Cortez, juez y tallerista de ASBF 2027",
    sortOrder: 1
  },
  {
    id: "sample-asbf-2027-video",
    mediaType: "video",
    role: "trailer",
    url: "https://antiguasbf.com/wp-content/uploads/2026/07/IMG_0162.mp4",
    title: "Video oficial ASBF 2027",
    altText: "Video promocional oficial de ASBF 2027",
    sortOrder: 2
  },
  ...[
    ["jorge-martinez", "d15bcb8a-33e6-4907-b864-97e99b999ea7", "Jorge Martinez"],
    ["hector-kathy", "16e3a36a-def6-44fb-bdc7-f53ff6f1d11b", "Héctor y Kathy"],
    ["magda-liuzza", "e64b0b21-d620-44d6-acba-2218c1c2e68f", "Magda Liuzza"],
    ["gioia-cingolani", "e2657c21-8ece-4ff9-b100-5a4e27a3e221", "Gioia Cingolani"],
    ["marisol-blanco", "52fe5bdc-37e5-447d-905f-815590c3ce64", "Marisol Blanco"],
    ["oswaldo-corzo", "a0a34838-ebb1-4e3c-8dd0-76ab6ac159c1", "Oswaldo Corzo"],
    ["billy-fajardo", "417a5359-bbf3-4b19-8d1d-20119af7ab1e", "Billy Fajardo"],
    ["evelyn-guasa", "b5bc5f94-1d41-4c73-93e2-8500dcaa7573", "Evelyn y Guasa"]
  ].map(([id, fileName, name], index) => ({
    id: `sample-asbf-2027-${id}`,
    mediaType: "image" as const,
    role: "gallery",
    url: `https://antiguasbf.com/wp-content/uploads/2026/08/${fileName}-scaled.jpeg`,
    title: name,
    altText: `${name}, parte del lineup de ASBF 2027`,
    sortOrder: index + 12
  }))
];

const congressMedia: FestivalMedia[] = [
  {
    id: "sample-congress-2026-cover",
    mediaType: "image",
    role: "cover",
    url: "https://www.guatesalsa.com/assets/alquimia-phoenix-portal.png",
    title: "ALQUIMIA 2026",
    altText: "Arte oficial de ALQUIMIA Guatemala Salsa Congress 2026",
    sortOrder: 0
  },
  {
    id: "sample-congress-2026-hotel",
    mediaType: "image",
    role: "venue",
    url: "https://www.guatesalsa.com/assets/hotel-reference.png",
    title: "Hotel sede AC Hotel Marriott",
    altText: "Hospedaje oficial de ALQUIMIA 2026 en AC Hotel Marriott",
    sortOrder: 10
  }
];

const asbfArtistDefinitions: Array<[string, string, string, string[]]> = [
  ["bersy-cortez", "Bersy Cortez", "VE", ["judge", "teacher"]],
  ["jorge-martinez", "Jorge Martinez", "MX", ["judge"]],
  ["hector-kathy", "Héctor y Kathy", "GT", ["judge", "teacher"]],
  ["magda-liuzza", "Magda Liuzza", "IT", ["judge", "teacher"]],
  ["gioia-cingolani", "Gioia Cingolani", "IT", ["judge", "teacher"]],
  ["marisol-blanco", "Marisol Blanco", "CU", ["judge", "teacher"]],
  ["oswaldo-corzo", "Oswaldo Corzo", "MX", ["judge", "teacher"]],
  ["billy-fajardo", "Billy Fajardo", "US", ["judge", "teacher"]],
  ["evelyn-guasa", "Evelyn y Guasa", "CO", ["judge", "teacher"]]
];

const asbfArtists: FestivalArtist[] = asbfArtistDefinitions.map(([id, name, countryCode, roles]) => ({
  id: `sample-candidate-${String(id)}`,
  slug: null,
  name: String(name),
  profileImageUrl: null,
  city: null,
  countryCode: String(countryCode),
  roles,
  evidence: "Anunciado en un flyer oficial de ASBF 2027.",
  isCandidate: true
}));

const congressArtists: FestivalArtist[] = [
  "De'Jon Polanski & Clo Ferreira",
  "Alex Toledo",
  "Fadi Fusion"
].map((name, index) => ({
  id: `sample-congress-candidate-${index + 1}`,
  slug: null,
  name,
  profileImageUrl: null,
  city: null,
  countryCode: null,
  roles: ["other"],
  evidence: "Presentado como parte del lineup de ALQUIMIA 2026 en SalsaTickets.",
  isCandidate: true
}));

const salePeriods = [
  { es: "1ra preventa", en: "1st presale", startsOn: "2026-03-28", endsOn: "2026-06-30" },
  { es: "2da preventa", en: "2nd presale", startsOn: "2026-07-01", endsOn: "2026-09-30" },
  { es: "Venta final", en: "Final sale", startsOn: "2026-10-01", endsOn: "2026-11-08" }
];

function samplePriceTiers(passId: string, locale: Locale, gtq: number[], usd: number[]): FestivalPassPriceTier[] {
  return salePeriods.flatMap((period, index) => ([
    {
      id: `${passId}-${index}-gtq`,
      label: locale === "es" ? period.es : period.en,
      startsOn: period.startsOn,
      endsOn: period.endsOn,
      priceAmount: gtq[index],
      currency: "GTQ"
    },
    {
      id: `${passId}-${index}-usd`,
      label: locale === "es" ? period.es : period.en,
      startsOn: period.startsOn,
      endsOn: period.endsOn,
      priceAmount: usd[index],
      currency: "USD"
    }
  ]));
}

function sampleCongressPasses(locale: Locale): FestivalPass[] {
  const definitions = [
    { id: "full", name: "Full Pass", descriptionEs: "Acceso más completo de la edición.", descriptionEn: "The most complete access for this edition.", includesEs: ["Talleres", "Competencias", "Shows", "5 sociales"], includesEn: ["Workshops", "Competitions", "Shows", "5 socials"], gtq: [1095, 1215, 1365], usd: [140, 155, 175] },
    { id: "dancer", name: "Dancer Pass", descriptionEs: "Pase para competidores con acceso amplio.", descriptionEn: "Pass for competitors with broad access.", includesEs: ["Competir", "Shows", "5 sociales", "Talleres de cortesía"], includesEn: ["Compete", "Shows", "5 socials", "Courtesy workshops"], gtq: [1050, 1150, 1325], usd: [130, 145, 165] },
    { id: "fan", name: "Fan Pass", descriptionEs: "Pase para disfrutar competencias y sociales.", descriptionEn: "Pass for enjoying competitions and socials.", includesEs: ["Competencias", "5 sociales"], includesEn: ["Competitions", "5 socials"], gtq: [880, 955, 1075], usd: [110, 120, 135] }
  ];

  return definitions.map((pass) => ({
    id: `sample-pass-${pass.id}`,
    name: pass.name,
    description: locale === "es" ? pass.descriptionEs : pass.descriptionEn,
    includes: locale === "es" ? pass.includesEs : pass.includesEn,
    priceAmount: null,
    currency: null,
    purchaseUrl: "https://salsatickets.com/entradas?evento=17",
    availabilityStatus: "available",
    priceTiers: samplePriceTiers(pass.id, locale, pass.gtq, pass.usd)
  }));
}

function asVerificationStatus(value: unknown): VerificationStatus {
  return value === "source_confirmed" || value === "owner_confirmed" ? value : "unverified";
}

function isPendingFestivalMigration(message: string) {
  return /festival_series/i.test(message) && /schema cache|could not find the table/i.test(message);
}

function normalizeSeries(row: Record<string, unknown>): FestivalSeriesRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    seriesType: row.series_type === "congress" ? "congress" : "festival",
    shortDescriptionEs: String(row.short_description_es ?? ""),
    shortDescriptionEn: String(row.short_description_en ?? ""),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    logoImageUrl: row.logo_image_url ? String(row.logo_image_url) : null,
    bannerImageUrl: row.banner_image_url ? String(row.banner_image_url) : null,
    homeCity: row.home_city ? String(row.home_city) : null,
    homeCountryCode: row.home_country_code ? String(row.home_country_code) : null,
    websiteUrl: row.website_url ? String(row.website_url) : null,
    ticketUrl: row.ticket_url ? String(row.ticket_url) : null,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : null,
    facebookUrl: row.facebook_url ? String(row.facebook_url) : null,
    whatsappUrl: row.whatsapp_url ? String(row.whatsapp_url) : null,
    verificationStatus: asVerificationStatus(row.verification_status),
    isFeatured: Boolean(row.is_featured)
  };
}

function normalizeEdition(row: Record<string, unknown>): FestivalEditionRecord {
  const status = ["upcoming", "active", "finished", "cancelled"].includes(String(row.status))
    ? String(row.status) as FestivalEditionRecord["status"]
    : "upcoming";
  return {
    id: String(row.id),
    festivalSeriesId: String(row.festival_series_id),
    slug: String(row.slug),
    name: String(row.name),
    editionLabel: row.edition_label ? String(row.edition_label) : null,
    summaryEs: String(row.summary_es ?? ""),
    summaryEn: String(row.summary_en ?? ""),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : null,
    startsOn: row.starts_on ? String(row.starts_on) : null,
    endsOn: row.ends_on ? String(row.ends_on) : null,
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    dateStatus: row.date_status === "coming_soon" ? "coming_soon" : "confirmed",
    dateLabel: row.date_label ? String(row.date_label) : null,
    city: row.city ? String(row.city) : null,
    countryCode: row.country_code ? String(row.country_code) : null,
    timeZone: row.time_zone ? String(row.time_zone) : null,
    area: row.area ? String(row.area) : null,
    primaryVenueName: row.primary_venue_name ? String(row.primary_venue_name) : null,
    address: row.address ? String(row.address) : null,
    hotelInfoEs: row.hotel_info_es ? String(row.hotel_info_es) : null,
    hotelInfoEn: row.hotel_info_en ? String(row.hotel_info_en) : null,
    ticketUrl: row.ticket_url ? String(row.ticket_url) : null,
    registrationUrl: row.registration_url ? String(row.registration_url) : null,
    rulesUrl: row.rules_url ? String(row.rules_url) : null,
    status,
    verificationStatus: asVerificationStatus(row.verification_status),
    isFeatured: Boolean(row.is_featured)
  };
}

function localizeSeries(record: FestivalSeriesRecord, locale: Locale): LocalizedFestivalSeries {
  return {
    ...record,
    shortDescription: locale === "es" ? record.shortDescriptionEs : record.shortDescriptionEn,
    description: locale === "es" ? record.descriptionEs : record.descriptionEn
  };
}

function localizeEdition(record: FestivalEditionRecord, locale: Locale): LocalizedFestivalEdition {
  return {
    ...record,
    summary: locale === "es" ? record.summaryEs : record.summaryEn,
    description: locale === "es" ? record.descriptionEs : record.descriptionEn,
    hotelInfo: locale === "es" ? record.hotelInfoEs : record.hotelInfoEn
  };
}

function sampleFestivalDetail(locale: Locale, slug: string): FestivalDetail | null {
  if (slug === asbfSeries.slug) {
    return {
      festival: localizeSeries(asbfSeries, locale),
      editions: [asbf2027, asbf2026].map((edition) => localizeEdition(edition, locale)),
      currentEdition: localizeEdition(asbf2027, locale),
      media: asbfMedia,
      passes: [],
      schedule: [],
      artists: asbfArtists
    };
  }

  if (slug === congressSeries.slug) {
    return {
      festival: localizeSeries(congressSeries, locale),
      editions: [localizeEdition(congress2026, locale)],
      currentEdition: localizeEdition(congress2026, locale),
      media: congressMedia,
      passes: sampleCongressPasses(locale),
      schedule: [],
      artists: congressArtists
    };
  }

  return null;
}

const sampleSeries = [asbfSeries, congressSeries];

export async function getFestivals(locale: Locale): Promise<LocalizedFestivalSeries[]> {
  if (!isSupabaseConfigured) return sampleSeries.map((series) => localizeSeries(series, locale));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("festival_series")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    if (!isPendingFestivalMigration(error.message)) {
      console.error("[festivals] Supabase error:", error.message);
    }
    return sampleSeries.map((series) => localizeSeries(series, locale));
  }

  return (data ?? []).map((row) => localizeSeries(normalizeSeries(row), locale));
}

export async function getFestivalBySlug(locale: Locale, slug: string): Promise<FestivalDetail | null> {
  if (!isSupabaseConfigured) return sampleFestivalDetail(locale, slug);
  const remote = await fetchFestivalDetail(locale, slug);
  return remote ?? sampleFestivalDetail(locale, slug);
}

export async function getFestivalSeriesSlugByEditionId(editionId: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    if (editionId === asbf2026.id || editionId === asbf2027.id) return asbfSeries.slug;
    if (editionId === congress2026.id) return congressSeries.slug;
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: edition, error: editionError } = await supabase
    .from("festival_editions")
    .select("festival_series_id")
    .eq("id", editionId)
    .maybeSingle();

  if (editionError || !edition?.festival_series_id) return null;

  const { data: series, error: seriesError } = await supabase
    .from("festival_series")
    .select("slug")
    .eq("id", edition.festival_series_id)
    .eq("is_published", true)
    .maybeSingle();

  return seriesError || !series?.slug ? null : String(series.slug);
}

async function fetchFestivalDetail(locale: Locale, slug: string): Promise<FestivalDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data: seriesRow, error: seriesError } = await supabase
    .from("festival_series")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (seriesError || !seriesRow) return null;
  const series = normalizeSeries(seriesRow);
  const { data: editionRows, error: editionsError } = await supabase
    .from("festival_editions")
    .select("*")
    .eq("festival_series_id", series.id)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("starts_on", { ascending: false, nullsFirst: false })
    .order("starts_at", { ascending: false, nullsFirst: false });

  if (editionsError) {
    console.error("[festival-editions] Supabase error:", editionsError.message);
    return null;
  }

  const editionRecords = (editionRows ?? []).map((row) => normalizeEdition(row));
  const current = editionRecords.find((edition) => edition.status === "active")
    ?? editionRecords.find((edition) => edition.status === "upcoming")
    ?? editionRecords[0]
    ?? null;

  if (!current) {
    return {
      festival: localizeSeries(series, locale),
      editions: [],
      currentEdition: null,
      media: [],
      passes: [],
      schedule: [],
      artists: []
    };
  }

  const [mediaResult, passResult, scheduleResult, artistResult, candidateResult] = await Promise.all([
    supabase.from("media_assets").select("*").eq("festival_edition_id", current.id).eq("is_published", true).order("sort_order"),
    supabase.from("festival_passes").select("*").eq("festival_edition_id", current.id).eq("is_published", true).order("sort_order"),
    supabase.from("festival_schedule_items").select("*").eq("festival_edition_id", current.id).eq("is_published", true).order("starts_at").order("sort_order"),
    supabase.from("festival_edition_artists").select("teacher_id,roles,billing_order,teachers(id,slug,name,profile_image_url,city,country_code)").eq("festival_edition_id", current.id).order("billing_order"),
    supabase.from("festival_edition_artist_candidates").select("*").eq("festival_edition_id", current.id).neq("resolution_status", "ignored").order("billing_order")
  ]);

  const passRows = passResult.data ?? [];
  const passIds = passRows.map((row) => String(row.id));
  const tierResult = passIds.length > 0
    ? await supabase.from("festival_pass_price_tiers").select("*").in("festival_pass_id", passIds).order("sort_order")
    : { data: [] };
  const tiersByPass = new Map<string, FestivalPassPriceTier[]>();
  for (const row of tierResult.data ?? []) {
    const passId = String(row.festival_pass_id);
    const tier: FestivalPassPriceTier = {
      id: String(row.id),
      label: String(locale === "es" ? row.label_es : row.label_en || row.label_es),
      startsOn: row.starts_on ? String(row.starts_on) : null,
      endsOn: row.ends_on ? String(row.ends_on) : null,
      priceAmount: Number(row.price_amount),
      currency: String(row.currency)
    };
    tiersByPass.set(passId, [...(tiersByPass.get(passId) ?? []), tier]);
  }

  const media: FestivalMedia[] = (mediaResult.data ?? []).map((row) => ({
    id: String(row.id),
    mediaType: row.media_type as FestivalMedia["mediaType"],
    role: String(row.role),
    url: String(row.url),
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    title: locale === "es" ? row.title_es : row.title_en,
    caption: locale === "es" ? row.caption_es : row.caption_en,
    altText: locale === "es" ? row.alt_text_es : row.alt_text_en,
    sortOrder: Number(row.sort_order ?? 0)
  }));
  const passes: FestivalPass[] = passRows.map((row) => ({
    id: String(row.id),
    name: String(locale === "es" ? row.name_es : row.name_en || row.name_es),
    description: String(locale === "es" ? row.description_es : row.description_en || row.description_es),
    includes: ((locale === "es" ? row.includes_es : row.includes_en) as string[] | null) ?? [],
    priceAmount: row.price_amount == null ? null : Number(row.price_amount),
    currency: row.currency ? String(row.currency) : null,
    purchaseUrl: row.purchase_url ? String(row.purchase_url) : null,
    availabilityStatus: row.availability_status as FestivalPass["availabilityStatus"],
    priceTiers: tiersByPass.get(String(row.id)) ?? []
  }));
  const schedule: FestivalScheduleItem[] = (scheduleResult.data ?? []).map((row) => ({
    id: String(row.id),
    title: String(locale === "es" ? row.title_es : row.title_en || row.title_es),
    description: String(locale === "es" ? row.description_es : row.description_en || row.description_es),
    activityType: String(row.activity_type),
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    venueName: row.venue_name ? String(row.venue_name) : null,
    roomName: row.room_name ? String(row.room_name) : null,
    levelLabel: row.level_label ? String(row.level_label) : null
  }));
  const artists: FestivalArtist[] = (artistResult.data ?? []).flatMap((row) => {
    const profile = Array.isArray(row.teachers) ? row.teachers[0] : row.teachers;
    if (!profile || typeof profile !== "object") return [];
    const teacher = profile as Record<string, unknown>;
    return [{
      id: String(teacher.id),
      slug: String(teacher.slug),
      name: String(teacher.name),
      profileImageUrl: teacher.profile_image_url ? String(teacher.profile_image_url) : null,
      city: teacher.city ? String(teacher.city) : null,
      countryCode: teacher.country_code ? String(teacher.country_code) : null,
      roles: Array.isArray(row.roles) ? row.roles.map(String) : []
    }];
  });
  const resolvedIds = new Set(artists.map((artist) => artist.id));
  for (const row of candidateResult.data ?? []) {
    if (row.resolved_teacher_id && resolvedIds.has(String(row.resolved_teacher_id))) continue;
    artists.push({
      id: `candidate-${String(row.id)}`,
      slug: null,
      name: String(row.display_name),
      profileImageUrl: null,
      city: row.origin_city ? String(row.origin_city) : null,
      countryCode: row.origin_country_code ? String(row.origin_country_code) : null,
      roles: Array.isArray(row.roles) ? row.roles.map(String) : [],
      evidence: row.evidence ? String(row.evidence) : null,
      isCandidate: true
    });
  }

  return {
    festival: localizeSeries(series, locale),
    editions: editionRecords.map((edition) => localizeEdition(edition, locale)),
    currentEdition: localizeEdition(current, locale),
    media,
    passes,
    schedule,
    artists
  };
}
