import { getTranslations } from "next-intl/server";
import { HeaderBrand } from "@/components/layout/header-brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SubmitDropdown } from "@/components/layout/submit-dropdown";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { SearchLauncher } from "@/components/search/search-launcher";
import { Container } from "@/components/shared/container";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  const labels = {
    home:      t("home"),
    events:    t("events"),
    spots:     t("spots"),
    academies: t("academies")
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4 md:h-16">

          <HeaderBrand />

          {/* Nav — desktop only with active state, mobile uses bottom nav */}
          <DesktopNav labels={labels} />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <SearchLauncher
              label={t("search")}
              compactLabel={t("searchCompact")}
            />
            <LanguageSwitcher />
            <SubmitDropdown />
          </div>

        </div>
      </Container>
    </header>
  );
}
