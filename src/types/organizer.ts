export type OrganizerRecord = {
  id: string;
  slug: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  logoImageUrl?: string | null;
  bannerImageUrl?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
};

export type OrganizerSummary = Pick<
  OrganizerRecord,
  "id" | "slug" | "name" | "websiteUrl" | "instagramUrl" | "facebookUrl" | "whatsappUrl"
>;
