import { getTranslations } from "next-intl/server";
import { AcademyCard } from "@/components/academies/academy-card";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getAcademies } from "@/lib/queries/academies";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "academiesTitle", "academiesDescription", { pathname: "/academies" });
}

export default async function AcademiesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "academies"
  });
  const academies = await getAcademies(currentLocale);

  return (
    <section className="page-section pb-16">
      <Container className="space-y-6 md:space-y-8">
        <SectionHeading title={t("title")} description={t("description")} as="h1" />
        {academies.length ? (
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {academies.map((academy) => (
              <AcademyCard key={academy.id} academy={academy} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("empty")}
            description={t("emptyDescription")}
            ctaHref="/submit-academy"
            ctaLabel={t("emptyCta")}
          />
        )}
      </Container>
    </section>
  );
}
