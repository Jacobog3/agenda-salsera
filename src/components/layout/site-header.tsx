import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Home, CalendarDays, MapPinned, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SubmitDropdown } from "@/components/layout/submit-dropdown";
import { Container } from "@/components/shared/container";
import type { LucideIcon } from "lucide-react";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4 md:h-16">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-full">
              <Image
                src="/images/exploraguate-icon.png"
                alt="ExploraGuate"
                width={80}
                height={80}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <span className="font-display text-[15px] font-bold leading-none tracking-normal">
              <span className="text-brand-600">Salsa</span>
              <span className="mx-1 text-gray-300">·</span>
              <span className="text-gray-900">Explora</span>
              <span className="text-brand-600">Guate</span>
            </span>
          </Link>

          {/* Nav — desktop only, mobile uses bottom nav */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            <NavLink href="/" icon={Home}>{t("home")}</NavLink>
            <NavLink href="/events" icon={CalendarDays}>{t("events")}</NavLink>
            <NavLink href="/spots" icon={MapPinned}>{t("spots")}</NavLink>
            <NavLink href="/academies" icon={GraduationCap}>{t("academies")}</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <SubmitDropdown />
          </div>

        </div>
      </Container>
    </header>
  );
}

function NavLink({
  href,
  icon: Icon,
  children
}: {
  href: "/" | "/events" | "/spots" | "/academies";
  icon: LucideIcon;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      {children}
    </Link>
  );
}
