import type { DanceStyle } from "@/types/event";

export type AcademyRecord = {
  id: string;
  slug: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  coverImageUrl: string;
  city: string;
  area?: string | null;
  address?: string | null;
  stylesTaught: DanceStyle[];
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured: boolean;
};

export type LocalizedAcademy = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  city: string;
  area?: string | null;
  address?: string | null;
  stylesTaught: DanceStyle[];
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured: boolean;
};
