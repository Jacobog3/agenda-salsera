import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SubmitSpotForm } from "@/components/forms/submit-spot-form";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { MapPinned } from "lucide-react";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "submitSpotTitle", "submitSpotDescription", {
    pathname: "/submit-spot",
    noIndex: true
  });
}

export default async function SubmitSpotPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "submitSpot" });

  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6 md:space-y-8">
        <SectionHeading
          as="h1"
          icon={MapPinned}
          title={t("pageTitle")}
          description={t("pageDescription")}
        />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
          <SubmitSpotForm />
        </div>
      </Container>
    </section>
  );
}
