import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SubmitDropdown } from "@/components/layout/submit-dropdown";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { SearchLauncher } from "@/components/search/search-launcher";
import { MobileExploreMenu } from "@/components/layout/mobile-explore-menu";
import { Container } from "@/components/shared/container";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  const labels = {
    events:    t("events"),
    festivals: t("festivals"),
    spots:     t("spots"),
    academies: t("academies"),
    resources: t("resources")
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4 md:h-16">

          {/* Logo */}
          <Link href="/" aria-label="SomosSalsa" className="flex shrink-0 items-center">
            <BrandLockup iconSize={36} compact className="text-[17px] md:text-[19px]" />
          </Link>

          {/* Nav — desktop only with active state, mobile uses bottom nav */}
          <DesktopNav labels={labels} />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <SearchLauncher
              label={t("search")}
              compactLabel={t("searchCompact")}
            />
            <LanguageSwitcher />
            <MobileExploreMenu />
            <SubmitDropdown />
          </div>

        </div>
      </Container>
    </header>
  );
}
