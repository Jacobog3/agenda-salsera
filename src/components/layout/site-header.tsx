import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  return (
    <header className="sticky top-0 z-30 py-2 md:py-3">
      <Container>
        <div className="flex h-12 items-center justify-between gap-3 rounded-full border border-black/[0.05] bg-white/85 px-3 shadow-soft backdrop-blur-2xl md:h-14 md:gap-4 md:px-4">
          <div className="flex items-center gap-3 md:gap-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[11px] font-bold text-white shadow-sm md:h-9 md:w-9 md:text-xs">
                EG
              </span>
              <span className="font-display text-base font-bold tracking-tight text-foreground md:text-lg">
                Exploraguate
              </span>
            </Link>
            <nav className="hidden items-center gap-0.5 rounded-full bg-surface-soft/80 p-1 md:flex">
              <HeaderLink href="/">{t("home")}</HeaderLink>
              <HeaderLink href="/events">{t("events")}</HeaderLink>
              <HeaderLink href="/spots">{t("spots")}</HeaderLink>
              <HeaderLink href="/academies">{t("academies")}</HeaderLink>
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/submit-event">{t("submitEvent")}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}

function HeaderLink({
  href,
  children
}: {
  href: "/" | "/events" | "/spots" | "/academies";
  children: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-white hover:text-foreground hover:shadow-sm"
    >
      {children}
    </Link>
  );
}
