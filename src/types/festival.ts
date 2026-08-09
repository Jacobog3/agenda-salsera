export type VerificationStatus = "unverified" | "source_confirmed" | "owner_confirmed";

export type FestivalSeriesRecord = {
  id: string;
  slug: string;
  name: string;
  seriesType: "festival" | "congress";
  shortDescriptionEs: string;
  shortDescriptionEn: string;
  descriptionEs: string;
  descriptionEn: string;
  logoImageUrl?: string | null;
  bannerImageUrl?: string | null;
  homeCity?: string | null;
  homeCountryCode?: string | null;
  websiteUrl?: string | null;
  ticketUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  whatsappUrl?: string | null;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
};

export type FestivalEditionRecord = {
  id: string;
  festivalSeriesId: string;
  slug: string;
  name: string;
  editionLabel?: string | null;
  summaryEs: string;
  summaryEn: string;
  descriptionEs: string;
  descriptionEn: string;
  coverImageUrl?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  dateStatus: "confirmed" | "coming_soon";
  dateLabel?: string | null;
  city?: string | null;
  countryCode?: string | null;
  timeZone?: string | null;
  area?: string | null;
  primaryVenueName?: string | null;
  address?: string | null;
  hotelInfoEs?: string | null;
  hotelInfoEn?: string | null;
  ticketUrl?: string | null;
  registrationUrl?: string | null;
  rulesUrl?: string | null;
  status: "upcoming" | "active" | "finished" | "cancelled";
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
};

export type FestivalMedia = {
  id: string;
  mediaType: "image" | "video" | "document" | "embed";
  role: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  caption?: string | null;
  altText?: string | null;
  sortOrder: number;
};

export type FestivalPass = {
  id: string;
  name: string;
  description: string;
  includes: string[];
  priceAmount?: number | null;
  currency?: string | null;
  purchaseUrl?: string | null;
  availabilityStatus: "coming_soon" | "available" | "sold_out" | "closed";
  priceTiers: FestivalPassPriceTier[];
};

export type FestivalPassPriceTier = {
  id: string;
  label: string;
  startsOn?: string | null;
  endsOn?: string | null;
  priceAmount: number;
  currency: string;
};

export type FestivalScheduleItem = {
  id: string;
  title: string;
  description: string;
  activityType: string;
  startsAt?: string | null;
  endsAt?: string | null;
  venueName?: string | null;
  roomName?: string | null;
  levelLabel?: string | null;
};

export type FestivalArtist = {
  id: string;
  slug?: string | null;
  name: string;
  profileImageUrl?: string | null;
  city?: string | null;
  countryCode?: string | null;
  roles: string[];
  evidence?: string | null;
  isCandidate?: boolean;
};

export type LocalizedFestivalSeries = Omit<
  FestivalSeriesRecord,
  "shortDescriptionEs" | "shortDescriptionEn" | "descriptionEs" | "descriptionEn"
> & {
  shortDescription: string;
  description: string;
};

export type LocalizedFestivalEdition = Omit<
  FestivalEditionRecord,
  "summaryEs" | "summaryEn" | "descriptionEs" | "descriptionEn" | "hotelInfoEs" | "hotelInfoEn"
> & {
  summary: string;
  description: string;
  hotelInfo?: string | null;
};

export type FestivalDetail = {
  festival: LocalizedFestivalSeries;
  editions: LocalizedFestivalEdition[];
  currentEdition: LocalizedFestivalEdition | null;
  media: FestivalMedia[];
  passes: FestivalPass[];
  schedule: FestivalScheduleItem[];
  artists: FestivalArtist[];
};
