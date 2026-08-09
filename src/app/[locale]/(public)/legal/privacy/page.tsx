import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/container";
import { brand } from "@/lib/brand";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "privacyTitle", "privacyDescription", {
    pathname: "/legal/privacy",
    type: "article"
  });
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPolicy");

  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl">
        <div className="space-y-8">
          <header className="space-y-3 border-b border-gray-100 pb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-400">{t("updated")}</p>
            <p className="text-sm leading-7 text-gray-600">{t("intro")}</p>
          </header>

          <LegalSection title={t("controllerTitle")}>
            <p>{t("controllerText", { domain: brand.domain })}</p>
            <ContactLine text={t("controllerContact")} />
          </LegalSection>

          <LegalSection title={t("dataTitle")}>
            <LegalSubsection title={t("automaticTitle")}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t("essentialStorage")}</li>
                <li>{t("analyticsData")}</li>
                <li>{t("advertisingData")}</li>
              </ul>
            </LegalSubsection>
            <LegalSubsection title={t("voluntaryTitle")}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t("submissionsData")}</li>
                <li>{t("incidentsData")}</li>
                <li>{t("communicationsData")}</li>
              </ul>
            </LegalSubsection>
          </LegalSection>

          <LegalSection title={t("publicSourcesTitle")}>
            <p>{t("publicSourcesText")}</p>
            <ContactLine text={t("publicSourcesRemoval")} />
          </LegalSection>

          <LegalSection title={t("aiTitle")}>
            <p>{t("aiText")}</p>
            <p className="mt-3">{t("aiAdvice")}</p>
          </LegalSection>

          <LegalSection title={t("localTitle")}>
            <p>{t("localText")}</p>
          </LegalSection>

          <LegalSection title={t("purposesTitle")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t("purposePublish")}</li>
              <li>{t("purposeRelations")}</li>
              <li>{t("purposeOperate")}</li>
              <li>{t("purposeMeasure")}</li>
              <li>{t("purposeAds")}</li>
            </ul>
          </LegalSection>

          <LegalSection title={t("providersTitle")}>
            <p>{t("providersIntro")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>{t("providerSupabase")}</li>
              <li>{t("providerVercel")}</li>
              <li>{t("providerGoogle")}</li>
            </ul>
            <p className="mt-3">{t("internationalText")}</p>
            <ul className="mt-3 space-y-2">
              <li>
                <ExternalLink href="https://policies.google.com/technologies/partner-sites">
                  {t("googleDataLink")}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href="https://supabase.com/privacy">
                  {t("supabasePrivacyLink")}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href="https://vercel.com/legal/privacy-policy">
                  {t("vercelPrivacyLink")}
                </ExternalLink>
              </li>
            </ul>
          </LegalSection>

          <LegalSection title={t("publicationTitle")}>
            <p>{t("publicationText")}</p>
          </LegalSection>

          <LegalSection title={t("retentionTitle")}>
            <p>{t("retentionText")}</p>
          </LegalSection>

          <LegalSection title={t("choicesTitle")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t("choiceAccess")}</li>
              <li>{t("choiceConsent")}</li>
              <li>{t("choiceBrowser")}</li>
            </ul>
            <ul className="mt-3 space-y-2">
              <li>
                <ExternalLink href="https://tools.google.com/dlpage/gaoptout">
                  {t("analyticsOptOutLink")}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href="https://myadcenter.google.com/">
                  {t("adsSettingsLink")}
                </ExternalLink>
              </li>
            </ul>
          </LegalSection>

          <LegalSection title={t("minorsTitle")}>
            <p>{t("minorsText")}</p>
          </LegalSection>

          <LegalSection title={t("changesTitle")}>
            <p>{t("changesText")}</p>
          </LegalSection>

          <LegalSection title={t("contactTitle")}>
            <ContactLine text={t("contactText")} compact />
          </LegalSection>
        </div>
      </Container>
    </section>
  );
}

function ContactLine({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <p className={compact ? undefined : "mt-3"}>
      {text}{" "}
      <a href={`mailto:${brand.email}`} className="font-medium text-brand-600 hover:underline">
        {brand.email}
      </a>
      .
    </p>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-brand-600 hover:underline"
    >
      {children}
    </a>
  );
}

function LegalSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 space-y-2 first:mt-0">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="text-sm leading-7 text-gray-600">{children}</div>
    </section>
  );
}
