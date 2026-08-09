import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { getTeachers } from "@/lib/queries/teachers";
import type { Locale } from "@/types/locale";

export default async function ArtistsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "artists" });
  const artists = await getTeachers(currentLocale);

  return (
    <section className="page-section pb-24 md:pb-16">
      <Container className="space-y-7">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} tone="orange" />
        {artists.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {artists.map((artist) => <TeacherCard key={artist.id} teacher={artist} />)}
          </div>
        ) : (
          <EmptyState title={t("empty")} description={t("emptyDescription")} ctaHref="/submit-teacher" ctaLabel={t("submit")} />
        )}
      </Container>
    </section>
  );
}
