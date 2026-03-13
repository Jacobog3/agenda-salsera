import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";

export async function SiteFooter() {
  const navigation = await getTranslations("navigation");
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.04] bg-white/60 py-8 md:py-12">
      <Container className="space-y-6 md:space-y-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.7fr_0.8fr] md:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[11px] font-bold text-white">
                EG
              </span>
              <p className="font-display text-lg font-bold text-foreground">
                Exploraguate
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("navigationTitle")}
            </p>
            <div className="flex flex-col gap-2.5 text-foreground/70">
              <Link href="/" className="transition-colors hover:text-brand-600">
                {navigation("home")}
              </Link>
              <Link href="/events" className="transition-colors hover:text-brand-600">
                {navigation("events")}
              </Link>
              <Link href="/spots" className="transition-colors hover:text-brand-600">
                {navigation("spots")}
              </Link>
              <Link href="/academies" className="transition-colors hover:text-brand-600">
                {navigation("academies")}
              </Link>
              <Link href="/submit-event" className="transition-colors hover:text-brand-600">
                {navigation("submitEvent")}
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("contactTitle")}
            </p>
            <div className="flex flex-col gap-2.5 text-foreground/70">
              <a
                href="mailto:hola@exploraguate.com"
                className="transition-colors hover:text-brand-600"
              >
                hola@exploraguate.com
              </a>
              <a
                href="https://instagram.com/exploraguate"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-brand-600"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/50200000000"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-brand-600"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-black/[0.04] pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:pt-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <p>{t("rights", { year })}</p>
            <div className="flex gap-3">
              <Link href="/legal/terms" className="underline-offset-2 hover:text-foreground hover:underline">
                {t("terms")}
              </Link>
              <Link href="/legal/privacy" className="underline-offset-2 hover:text-foreground hover:underline">
                {t("privacy")}
              </Link>
            </div>
          </div>
          <p>
            {t("developedBy")}{" "}
            <a
              href="https://guatcloud.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground/60 transition-colors hover:text-brand-600"
            >
              GuatCloud
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
