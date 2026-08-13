import { headers } from "next/headers";
import {
  DEFAULT_SITE_COUNTRY,
  getSiteCountryByCode,
  SITE_COUNTRIES,
  SITE_COUNTRY_HEADER,
  type SiteCountryCode
} from "@/lib/site-countries";

export async function getCurrentSiteCountryCode(): Promise<SiteCountryCode> {
  if (SITE_COUNTRIES.length === 1) return DEFAULT_SITE_COUNTRY.code;

  const requestHeaders = await headers();
  const requestedCode = requestHeaders.get(SITE_COUNTRY_HEADER) ?? "";
  return getSiteCountryByCode(requestedCode)?.code ?? DEFAULT_SITE_COUNTRY.code;
}

export async function getCurrentSiteCountry() {
  const countryCode = await getCurrentSiteCountryCode();
  return getSiteCountryByCode(countryCode) ?? DEFAULT_SITE_COUNTRY;
}
