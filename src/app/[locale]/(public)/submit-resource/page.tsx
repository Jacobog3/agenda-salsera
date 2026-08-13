import { PackagePlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SubmitResourceForm } from "@/components/forms/submit-resource-form";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getResources } from "@/lib/queries/resources";
import type { Locale } from "@/types/locale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "submitResourceTitle", "submitResourceDescription", {
    pathname: "/submit-resource",
    noIndex: true
  });
}

export default async function SubmitResourcePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ resource?: string; name?: string; category?: string; mode?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale, namespace: "submitResource" });
  const category = ["dancewear", "dj", "photography", "other"].includes(query.category ?? "")
    ? query.category as "dancewear" | "dj" | "photography" | "other"
    : "dancewear";
  const correctionMode = query.mode === "correction" || Boolean(query.resource);
  const resources = correctionMode ? await getResources(locale as Locale) : [];

  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6 md:space-y-8">
        <SectionHeading
          as="h1"
          icon={PackagePlus}
          title={correctionMode ? t("updatePageTitle") : t("pageTitle")}
          description={correctionMode ? t("updatePageDescription") : t("pageDescription")}
        />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
          <SubmitResourceForm
            resourceSlug={query.resource}
            resourceName={query.name}
            resourceCategory={category}
            correctionMode={correctionMode}
            resourceOptions={resources.map((resource) => ({
              slug: resource.slug,
              name: resource.name,
              category: resource.categories[0] ?? "other"
            }))}
          />
        </div>
      </Container>
    </section>
  );
}
