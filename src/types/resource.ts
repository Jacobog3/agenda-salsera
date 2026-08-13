export type ResourceCategory = "dancewear" | "dj" | "photography" | "other";
export type ResourceKind = "business" | "professional";
export type ResourceVerificationStatus = "unverified" | "source_confirmed" | "owner_confirmed";

export type ResourceRecord = {
  id: string;
  slug: string;
  name: string;
  resourceKind: ResourceKind;
  categories: ResourceCategory[];
  descriptionEs: string;
  descriptionEn: string;
  imageUrl?: string | null;
  city?: string | null;
  countryCode?: string | null;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  websiteUrl?: string | null;
  teacherSlug?: string | null;
  teacherImageUrl?: string | null;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  verificationStatus: ResourceVerificationStatus;
  lastVerifiedAt?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export type LocalizedResource = Omit<ResourceRecord, "descriptionEs" | "descriptionEn"> & {
  description: string;
};
