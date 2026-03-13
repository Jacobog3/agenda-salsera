import { getTranslations } from "next-intl/server";
import { SubmitEventForm } from "@/components/forms/submit-event-form";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(
    locale as Locale,
    "submitEventTitle",
    "submitEventDescription"
  );
}

export default async function SubmitEventPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "submitEvent"
  });

  return (
    <section className="page-section pb-16">
      <Container className="max-w-3xl space-y-6 md:space-y-8">
        <SectionHeading title={t("title")} description={t("description")} />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
          <SubmitEventForm />
        </div>
      </Container>
    </section>
  );
}
