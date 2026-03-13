import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoIcon } from "@/components/brand/logo-icon";
import { Container } from "@/components/shared/container";
import { Mail } from "lucide-react";

export async function SiteFooter() {
  const navigation = await getTranslations("navigation");
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <Container>
        {/* Main content */}
        <div className="py-10 md:py-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

            {/* Brand block */}
            <div className="max-w-xs space-y-3">
              <div className="flex items-center gap-2">
                <LogoIcon size={36} />
                <p className="font-display text-lg font-bold leading-none tracking-normal">
                  <span className="text-gray-900">Explora</span>
                  <span className="text-brand-600">Guate</span>
                </p>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                {t("description")}
              </p>
              <a
                href="mailto:info@exploraguate.com"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-600"
              >
                <Mail className="h-3.5 w-3.5" />
                info@exploraguate.com
              </a>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 md:gap-x-16">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {t("navigationTitle")}
                </p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li><Link href="/" className="hover:text-brand-600 transition-colors">{navigation("home")}</Link></li>
                  <li><Link href="/events" className="hover:text-brand-600 transition-colors">{navigation("events")}</Link></li>
                  <li><Link href="/spots" className="hover:text-brand-600 transition-colors">{navigation("spots")}</Link></li>
                  <li><Link href="/academies" className="hover:text-brand-600 transition-colors">{navigation("academies")}</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {t("publishTitle")}
                </p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li><Link href="/submit-event" className="hover:text-brand-600 transition-colors">{navigation("submitEventLabel")}</Link></li>
                  <li><Link href="/submit-academy" className="hover:text-brand-600 transition-colors">{navigation("submitAcademyLabel")}</Link></li>
                  <li><Link href="/submit-spot" className="hover:text-brand-600 transition-colors">{navigation("submitSpotLabel")}</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {t("legalTitle")}
                </p>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li><Link href="/legal/terms" className="hover:text-brand-600 transition-colors">{t("terms")}</Link></li>
                  <li><Link href="/legal/privacy" className="hover:text-brand-600 transition-colors">{t("privacy")}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-gray-100 py-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ExploraGuate — {t("madeFor")}</p>
          <p>
            {t("developedBy")}{" "}
            <a
              href="https://guatcloud.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gray-500 transition-colors hover:text-brand-600"
            >
              GuatCloud
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
