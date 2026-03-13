export type DanceStyle = "salsa" | "bachata" | "salsa_bachata" | "other";

export type EventRecord = {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  coverImageUrl: string;
  danceStyle: DanceStyle;
  city: string;
  area?: string | null;
  venueName: string;
  address?: string | null;
  startsAt: string;
  priceAmount?: number | null;
  currency: string;
  organizerName: string;
  contactUrl: string;
  externalUrl?: string | null;
  isFeatured: boolean;
};

export type LocalizedEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  danceStyle: DanceStyle;
  city: string;
  area?: string | null;
  venueName: string;
  address?: string | null;
  startsAt: string;
  priceAmount?: number | null;
  currency: string;
  organizerName: string;
  contactUrl: string;
  externalUrl?: string | null;
  isFeatured: boolean;
};
