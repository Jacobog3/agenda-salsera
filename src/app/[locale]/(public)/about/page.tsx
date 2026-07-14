import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/container";
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
    "aboutTitle",
    "aboutDescription",
    { pathname: "/about", type: "article" }
  );
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <section className="page-section pb-16">
      <Container className="max-w-3xl">
        <div className="space-y-10">
          <header className="space-y-3 border-b border-gray-100 pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {t("eyebrow")}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              {t("intro")}
            </p>
          </header>

          <AboutSection title={t("missionTitle")}>
            <p>{t("missionText")}</p>
          </AboutSection>

          <AboutSection title={t("sourcesTitle")}>
            <p>{t("sourcesIntro")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>{t("sourcesPublic")}</li>
              <li>{t("sourcesDirect")}</li>
              <li>{t("sourcesCommunity")}</li>
            </ul>
          </AboutSection>

          <AboutSection title={t("reviewTitle")}>
            <p>{t("reviewText")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>{t("reviewDates")}</li>
              <li>{t("reviewRelations")}</li>
              <li>{t("reviewExpired")}</li>
            </ul>
          </AboutSection>

          <AboutSection title={t("correctionsTitle")}>
            <p>
              {t("correctionsText")} {" "}
              <a
                href="mailto:info@exploraguate.com"
                className="font-medium text-brand-600 hover:underline"
              >
                info@exploraguate.com
              </a>
              .
            </p>
          </AboutSection>

          <AboutSection title={t("independenceTitle")}>
            <p>{t("independenceText")}</p>
          </AboutSection>
        </div>
      </Container>
    </section>
  );
}

function AboutSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
        {title}
      </h2>
      <div className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
        {children}
      </div>
    </section>
  );
}
