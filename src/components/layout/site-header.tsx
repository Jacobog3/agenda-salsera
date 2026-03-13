import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Home, CalendarDays, MapPinned, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SubmitDropdown } from "@/components/layout/submit-dropdown";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { Container } from "@/components/shared/container";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  const navItems = [
    { href: "/" as const, icon: Home, label: t("home") },
    { href: "/events" as const, icon: CalendarDays, label: t("events") },
    { href: "/spots" as const, icon: MapPinned, label: t("spots") },
    { href: "/academies" as const, icon: GraduationCap, label: t("academies") }
  ];

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

          {/* Nav — desktop only with active state, mobile uses bottom nav */}
          <DesktopNav items={navItems} />

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
