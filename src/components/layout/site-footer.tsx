import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { Container } from "@/components/shared/container";
import { brand } from "@/lib/brand";
import { Mail } from "lucide-react";

export async function SiteFooter() {
  const navigation = await getTranslations("navigation");
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <Container>
        {/* Main content */}
        <div className="py-8 md:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">

            {/* Brand block */}
            <div className="max-w-xs space-y-2">
              <BrandLockup iconSize={32} compact className="text-base md:text-lg" />
              <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
                {t("description")}
              </p>
              <a
                href={`mailto:${brand.email}`}
                aria-label={`Enviar correo a ${brand.name}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-brand-600 md:text-sm"
              >
                <Mail className="h-3 w-3 md:h-3.5 md:w-3.5" />
                {brand.email}
              </a>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:gap-x-8 md:gap-x-12 lg:gap-x-16">
              <div className="space-y-2 md:space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 md:text-[11px]">
                  {t("navigationTitle")}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700 md:space-y-2.5 md:text-sm">
                  <li><Link href="/" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("home")}</Link></li>
                  <li><Link href="/events" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("events")}</Link></li>
                  <li><Link href="/festivals" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("festivals")}</Link></li>
                  <li><Link href="/spots" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("spots")}</Link></li>
                  <li><Link href="/academies" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("academies")}</Link></li>
                  <li><Link href="/artists" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("artists")}</Link></li>
                </ul>
              </div>

              <div className="space-y-2 md:space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 md:text-[11px]">
                  {t("publishTitle")}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700 md:space-y-2.5 md:text-sm">
                  <li><Link href="/submit-event" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("submitEventLabel")}</Link></li>
                  <li><Link href="/submit-academy" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("submitAcademyLabel")}</Link></li>
                  <li><Link href="/submit-teacher" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("submitTeacherLabel")}</Link></li>
                  <li><Link href="/submit-spot" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{navigation("submitSpotLabel")}</Link></li>
                </ul>
              </div>

              <div className="space-y-2 md:space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 md:text-[11px]">
                  {t("legalTitle")}
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700 md:space-y-2.5 md:text-sm">
                  <li><Link href="/about" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{t("about")}</Link></li>
                  <li><Link href="/legal/terms" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{t("terms")}</Link></li>
                  <li><Link href="/legal/privacy" className="inline-flex min-h-11 items-center hover:text-brand-600 transition-colors">{t("privacy")}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-gray-100 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {brand.name} — {t("madeFor")}</p>
          <p>
            {t("developedBy")}{" "}
            <a
              href="https://guatcloud.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gray-700 transition-colors hover:text-brand-600"
            >
              GuatCloud
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
