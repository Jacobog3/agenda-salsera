import { Camera, Disc3, PackageSearch, PencilLine, Plus, Shirt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ResourceCard } from "@/components/resources/resource-card";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getResources } from "@/lib/queries/resources";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/types/locale";
import type { ResourceCategory } from "@/types/resource";

const FILTERS: Array<{ value: "all" | ResourceCategory; icon: typeof PackageSearch }> = [
  { value: "all", icon: PackageSearch },
  { value: "dancewear", icon: Shirt },
  { value: "dj", icon: Disc3 },
  { value: "photography", icon: Camera },
  { value: "other", icon: PackageSearch }
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "resourcesTitle", "resourcesDescription", {
    pathname: "/resources"
  });
}

export default async function ResourcesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const query = await searchParams;
  const selectedCategory = ["dancewear", "dj", "photography", "other"].includes(query.category ?? "")
    ? query.category as ResourceCategory
    : "all";
  const [t, resources] = await Promise.all([
    getTranslations({ locale: currentLocale, namespace: "resources" }),
    getResources(currentLocale)
  ]);
  const visibleResources = selectedCategory === "all"
    ? resources
    : resources.filter((resource) => resource.categories.includes(selectedCategory));
  const categoryLabels = {
    dancewear: t("categories.dancewear"),
    dj: t("categories.dj"),
    photography: t("categories.photography"),
    other: t("categories.other")
  } satisfies Record<ResourceCategory, string>;

  return (
    <section className="page-section pb-16">
      <Container className="space-y-6 md:space-y-8">
        <SectionHeading
          as="h1"
          icon={PackageSearch}
          title={t("title")}
          description={t("description")}
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label={t("filterLabel")}>
          {FILTERS.map(({ value, icon: Icon }) => {
            const active = selectedCategory === value;
            const label = value === "all" ? t("categories.all") : categoryLabels[value];
            return (
              <Link
                key={value}
                href={value === "all" ? "/resources" : { pathname: "/resources", query: { category: value } }}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border bg-white text-muted-foreground hover:border-brand-200 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {visibleResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              locale={currentLocale}
              categoryLabels={categoryLabels}
              labels={{
                instagram: t("instagramCta"),
                viewProfile: t("profileCta"),
                verified: t("verified"),
                verifiedPrefix: t("verifiedPrefix"),
                communityRecommendation: t("communityRecommendation"),
                contactOnline: t("contactOnline"),
                actionsLabel: t("actionsLabel"),
                suggestChange: t("suggestChange")
              }}
            />
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-5 text-white shadow-glow md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold md:text-2xl">{t("suggestTitle")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{t("suggestDescription")}</p>
            </div>
            <Link
              href="/submit-resource"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-brand-700 shadow-md hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              {t("suggestCta")}
            </Link>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-5 text-muted-foreground">
          <p>{t("disclaimer")}</p>
          <Link
            href={{ pathname: "/submit-resource", query: { mode: "correction" } }}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 hover:underline"
          >
            <PencilLine className="h-4 w-4" />
            {t("correctionCta")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
