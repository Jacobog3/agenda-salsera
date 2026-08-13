"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { createNavigation } from "next-intl/navigation";
import type { ComponentProps } from "react";
import { routing } from "@/i18n/routing";
import { addCountryToLocalizedPath, getCountrySlugFromPathname } from "@/lib/site-countries";
import type { Locale } from "@/types/locale";

const navigation = createNavigation(routing);

type LinkProps = ComponentProps<typeof navigation.Link>;

export function Link({ href, locale, ...props }: LinkProps) {
  const activeLocale = useLocale() as Locale;
  const browserPathname = usePathname();
  const country = getCountrySlugFromPathname(browserPathname) ?? undefined;
  const targetLocale = (locale ?? activeLocale) as Locale;
  const localizedPath = navigation.getPathname({
    locale: targetLocale,
    href
  } as Parameters<typeof navigation.getPathname>[0]);

  return <NextLink {...props} href={addCountryToLocalizedPath(localizedPath, country)} />;
}
