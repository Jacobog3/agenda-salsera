import { getTranslations } from "next-intl/server";
import { SpotCard } from "@/components/spots/spot-card";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getSpots } from "@/lib/queries/spots";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "spotsTitle", "spotsDescription", { pathname: "/spots" });
}

export default async function SpotsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "spots"
  });
  const spots = await getSpots(currentLocale);

  return (
    <section className="page-section pb-16">
      <Container className="space-y-4 md:space-y-8">
        <SectionHeading title={t("title")} description={t("description")} as="h1" />
        {spots.length ? (
          <div className="grid gap-3 md:grid-cols-2 md:gap-5">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("empty")} />
        )}
      </Container>
    </section>
  );
}
