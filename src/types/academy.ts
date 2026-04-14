import type { DanceStyle } from "@/types/event";

export type ScheduleClass = {
  time: string;
  name: string;
  level?: string;
};

export type ScheduleDay = {
  day: string;
  classes: ScheduleClass[];
};

export type AcademyRecord = {
  id: string;
  slug: string;
  name: string;
  descriptionEs: string;
  descriptionEn: string;
  coverImageUrl: string;
  bannerImageUrl?: string | null;
  city: string;
  area?: string | null;
  address?: string | null;
  stylesTaught: DanceStyle[];
  styleTags?: string[];
  scheduleText?: string | null;
  scheduleData?: ScheduleDay[] | null;
  levels?: string | null;
  priceText?: string | null;
  trialClass?: boolean;
  modality?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured: boolean;
};

export type LocalizedAcademy = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  bannerImageUrl?: string | null;
  city: string;
  area?: string | null;
  address?: string | null;
  stylesTaught: DanceStyle[];
  styleTags?: string[];
  scheduleText?: string | null;
  scheduleData?: ScheduleDay[] | null;
  levels?: string | null;
  priceText?: string | null;
  trialClass?: boolean;
  modality?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured: boolean;
};
