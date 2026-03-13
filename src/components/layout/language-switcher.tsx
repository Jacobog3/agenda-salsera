"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="relative inline-flex items-center">
      <Globe className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <span className="sr-only">{t("switchLanguage")}</span>
      <select
        aria-label={t("switchLanguage")}
        className="appearance-none rounded-full border border-border bg-surface-soft/80 py-1.5 pl-7 pr-3 text-xs font-semibold text-foreground outline-none transition focus:border-brand-500 focus:bg-white"
        value={locale}
        onChange={(event) => {
          router.replace(
            pathname as never,
            { locale: event.target.value as (typeof routing.locales)[number] } as never
          );
        }}
      >
        {routing.locales.map((nextLocale) => (
          <option key={nextLocale} value={nextLocale}>
            {nextLocale.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
