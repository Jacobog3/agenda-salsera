import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { env } from "@/lib/utils/env";
import type { Locale } from "@/types/locale";

type MetadataKey =
  | "homeTitle"
  | "homeDescription"
  | "eventsTitle"
  | "eventsDescription"
  | "spotsTitle"
  | "spotsDescription"
  | "academiesTitle"
  | "academiesDescription"
  | "submitEventTitle"
  | "submitEventDescription";

export async function buildMetadata(
  locale: Locale,
  titleKey: MetadataKey,
  descriptionKey: MetadataKey
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t(titleKey);
  const description = t(descriptionKey);

  return {
    title,
    description,
    metadataBase: new URL(env.siteUrl),
    openGraph: {
      title,
      description,
      siteName: t("siteName"),
      locale,
      type: "website"
    }
  };
}
