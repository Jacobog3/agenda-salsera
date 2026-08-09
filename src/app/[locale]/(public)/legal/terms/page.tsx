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
  return buildMetadata(locale as Locale, "termsTitle", "termsDescription", {
    pathname: "/legal/terms",
    type: "article"
  });
}

export default async function TermsPage() {
  const t = await getTranslations("termsPolicy");

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

          <LegalSection title={t("operatorTitle")}>
            <ContactLine text={t("operatorText")} />
          </LegalSection>

          <LegalSection title={t("serviceTitle")}>
            <p>{t("serviceText")}</p>
            <p className="mt-3">{t("independenceText")}</p>
          </LegalSection>

          <LegalSection title={t("sourcesTitle")}>
            <p>{t("sourcesText")}</p>
            <ContactLine text={t("correctionText")} />
          </LegalSection>

          <LegalSection title={t("submissionsTitle")}>
            <p>{t("submissionsText")}</p>
            <p className="mt-3">{t("moderationText")}</p>
          </LegalSection>

          <LegalSection title={t("aiTitle")}>
            <p>{t("aiText")}</p>
          </LegalSection>

          <LegalSection title={t("accuracyTitle")}>
            <p>{t("accuracyText")}</p>
          </LegalSection>

          <LegalSection title={t("ticketsTitle")}>
            <p>{t("ticketsText")}</p>
          </LegalSection>

          <LegalSection title={t("conductTitle")}>
            <p>{t("conductIntro")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>{t("conductFalse")}</li>
              <li>{t("conductRights")}</li>
              <li>{t("conductSecurity")}</li>
              <li>{t("conductMisuse")}</li>
            </ul>
          </LegalSection>

          <LegalSection title={t("intellectualTitle")}>
            <p>{t("intellectualText")}</p>
          </LegalSection>

          <LegalSection title={t("availabilityTitle")}>
            <p>{t("availabilityText")}</p>
          </LegalSection>

          <LegalSection title={t("liabilityTitle")}>
            <p>{t("liabilityText")}</p>
          </LegalSection>

          <LegalSection title={t("complaintsTitle")}>
            <ContactLine text={t("complaintsText")} compact />
            <p className="mt-3">{t("diacoText")}</p>
            <p className="mt-2">
              <a
                href="https://diaco.gob.gt"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline"
              >
                {t("diacoLink")}
              </a>
            </p>
          </LegalSection>

          <LegalSection title={t("changesTitle")}>
            <p>{t("changesText")}</p>
          </LegalSection>

          <LegalSection title={t("lawTitle")}>
            <p>{t("lawText")}</p>
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

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="text-sm leading-7 text-gray-600">{children}</div>
    </section>
  );
}
