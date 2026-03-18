import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Container } from "@/components/shared/container";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { searchSite } from "@/lib/search/site-search";
import type { Locale } from "@/types/locale";

const SUGGESTIONS = ["salsa", "bachata", "Antigua", "Guatemala"];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "search" });
  const metadata = await buildMetadata(
    currentLocale,
    "homeTitle",
    "homeDescription",
    {
      title: t("pageTitle"),
      description: t("pageDescription"),
      pathname: "/search"
    }
  );

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true
    }
  };
}

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const queryParams = await searchParams;
  const currentQuery = queryParams.query?.trim() ?? "";
  const [t, common] = await Promise.all([
    getTranslations({ locale: currentLocale, namespace: "search" }),
    getTranslations({ locale: currentLocale, namespace: "common" })
  ]);
  const results = currentQuery ? await searchSite(currentLocale, currentQuery) : null;
  const formAction = currentLocale === "es" ? "/buscar" : "/en/search";

  const sections = results ? [
    {
      key: "events" as const,
      title: t("sections.events"),
      items: results.events
    },
    {
      key: "academies" as const,
      title: t("sections.academies"),
      items: results.academies
    },
    {
      key: "teachers" as const,
      title: t("sections.teachers"),
      items: results.teachers
    },
    {
      key: "spots" as const,
      title: t("sections.spots"),
      items: results.spots
    }
  ] : [];

  const totalResults = results?.total ?? 0;

  return (
    <section className="page-section pb-16">
      <Container className="space-y-6 md:space-y-8">
        <SectionHeading
          icon={Search}
          title={t("pageTitle")}
          description={t("pageDescription")}
          as="h1"
        />

        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft md:rounded-3xl md:p-5">
          <form action={formAction} method="GET" className="flex flex-col gap-3 md:flex-row">
            <label htmlFor="site-search" className="sr-only">
              {t("placeholder")}
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="site-search"
                type="search"
                name="query"
                defaultValue={currentQuery}
                placeholder={t("placeholder")}
                className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-300"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {t("submit")}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Link
                key={suggestion}
                href={{ pathname: "/search", query: { query: suggestion } }}
                className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface-soft/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-brand-200 hover:text-foreground"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>

        {!currentQuery ? (
          <EmptyState
            title={t("idleTitle")}
            description={t("idleDescription")}
          />
        ) : totalResults === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription", { query: currentQuery })}
          />
        ) : (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {t("resultsTitle", { query: results!.query })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("resultsCount", { count: totalResults })}
              </p>
            </div>

            {sections.map((section) =>
              section.items.length > 0 ? (
                <div key={section.key} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                      {section.title}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {t("sectionCount", { count: section.items.length })}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {section.items.map((item) => (
                      <SearchResultCard
                        key={`${item.type}-${item.id}`}
                        result={item}
                        typeLabel={t(`types.${item.type}`)}
                        localizedBadges={item.badges.map((badge) =>
                          badge in { salsa: true, bachata: true, salsa_bachata: true, other: true }
                            ? common(`danceStyles.${badge as "salsa" | "bachata" | "salsa_bachata" | "other"}`)
                            : badge
                        )}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
