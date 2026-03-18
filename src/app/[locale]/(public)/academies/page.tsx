import { getTranslations } from "next-intl/server";
import { GraduationCap, UserRound } from "lucide-react";
import { AcademyCard } from "@/components/academies/academy-card";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { LastUpdatedBadge } from "@/components/shared/last-updated-badge";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { getAcademies } from "@/lib/queries/academies";
import { getLastUpdatedForTables } from "@/lib/queries/last-updated";
import { getTeachers } from "@/lib/queries/teachers";
import { cn } from "@/lib/utils/cn";
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
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  const currentLocale = locale as Locale;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "academies"
  });
  const [academies, teachers, lastUpdated] = await Promise.all([
    getAcademies(currentLocale),
    getTeachers(currentLocale),
    getLastUpdatedForTables(["academies", "teachers"])
  ]);
  const activeView = filters.view === "teachers" ? "teachers" : "academies";
  const hasItems = activeView === "academies" ? academies.length > 0 : teachers.length > 0;

  return (
    <section className="page-section pb-16">
      <Container className="space-y-6 md:space-y-8">
        <div>
          <SectionHeading title={t("title")} description={t("description")} as="h1" />
          <LastUpdatedBadge date={lastUpdated} locale={currentLocale} />
        </div>

        <div className="inline-flex w-full rounded-[1.25rem] border border-border bg-white p-1.5 shadow-sm sm:w-auto">
          {[
            {
              key: "academies" as const,
              icon: GraduationCap,
              label: t("views.academies"),
              count: academies.length
            },
            {
              key: "teachers" as const,
              icon: UserRound,
              label: t("views.teachers"),
              count: teachers.length
            }
          ].map(({ key, icon: Icon, label, count }) => {
            const active = key === activeView;

            return (
              <Link
                key={key}
                href={{
                  pathname: "/academies",
                  query: key === "teachers" ? { view: "teachers" } : {}
                }}
                className={cn(
                  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none",
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-surface-soft text-foreground"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {hasItems ? (
          activeView === "academies" ? (
            <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
              {academies.map((academy) => (
                <AcademyCard key={academy.id} academy={academy} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title={activeView === "academies" ? t("empty") : t("teachers.empty")}
            description={
              activeView === "academies" ? t("emptyDescription") : t("teachers.emptyDescription")
            }
            ctaHref={
              activeView === "academies"
                ? "/submit-academy"
                : {
                    pathname: "/academies"
                  }
            }
            ctaLabel={activeView === "academies" ? t("emptyCta") : t("teachers.emptyCta")}
          />
        )}
      </Container>
    </section>
  );
}
