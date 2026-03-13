export type SpotRecord = {
  id: string;
  slug: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  coverImageUrl: string;
  city: string;
  area?: string | null;
  address?: string | null;
  scheduleEs: string;
  scheduleEn: string;
  coverChargeEs?: string | null;
  coverChargeEn?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  googleMapsUrl?: string | null;
  isFeatured: boolean;
};

export type LocalizedSpot = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  city: string;
  area?: string | null;
  address?: string | null;
  schedule: string;
  coverCharge?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  googleMapsUrl?: string | null;
  isFeatured: boolean;
};
