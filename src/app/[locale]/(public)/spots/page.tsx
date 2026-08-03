import { getTranslations } from "next-intl/server";
import { SpotCard } from "@/components/spots/spot-card";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getSpots } from "@/lib/queries/spots";
import { getLastUpdated } from "@/lib/queries/last-updated";
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
  const [spots, lastUpdated] = await Promise.all([
    getSpots(currentLocale),
    getLastUpdated("spots")
  ]);

  return (
    <section className="page-section pb-16">
      <Container className="space-y-4 md:space-y-8">
        <PageIntro
          title={t("title")}
          description={t("description")}
          lastUpdated={lastUpdated}
          locale={currentLocale}
        />
        {spots.length ? (
          <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} expandable />
            ))}
          </div>
        ) : (
          <EmptyState title={t("empty")} />
        )}
      </Container>
    </section>
  );
}
