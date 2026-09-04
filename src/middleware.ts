import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import {
  DEFAULT_SITE_COUNTRY,
  getSiteCountryBySlug,
  isSiteCountrySlug,
  SITE_COUNTRIES,
  SITE_COUNTRY_COOKIE,
  SITE_COUNTRY_HEADER
} from "@/lib/site-countries";

const intlMiddleware = createMiddleware(routing);

function canonicalizeLegacyCatalogPath(pathname: string) {
  if (pathname === "/maestros") return "/artistas";
  if (pathname.startsWith("/maestros/")) return "/artistas" + pathname.slice("/maestros".length);
  if (pathname === "/en/teachers") return "/en/artists";
  if (pathname.startsWith("/en/teachers/")) return "/en/artists" + pathname.slice("/en/teachers".length);
  return pathname;
}

function selectedCountry(request: NextRequest) {
  const cookieCountry = request.cookies.get(SITE_COUNTRY_COOKIE)?.value.toLowerCase();
  if (cookieCountry && isSiteCountrySlug(cookieCountry)) return cookieCountry;

  const detectedCountryCode = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const detectedCountry = SITE_COUNTRIES.find((country) => country.code === detectedCountryCode);
  return detectedCountry?.slug ?? DEFAULT_SITE_COUNTRY.slug;
}

function legacyRedirectPath(pathname: string, country: string) {
  const canonicalPath = canonicalizeLegacyCatalogPath(pathname);
  if (canonicalPath === "/" || canonicalPath === "/es") return `/${country}`;
  if (canonicalPath.startsWith("/es/")) return `/${country}${canonicalPath.slice(3)}`;
  if (canonicalPath === "/en") return `/${country}/en`;
  if (canonicalPath.startsWith("/en/")) return `/${country}/en${canonicalPath.slice(3)}`;
  return `/${country}${canonicalPath}`;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const session = request.cookies.get("admin_session");
      if (!session?.value) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  if (!isSiteCountrySlug(firstSegment)) {
    const country = selectedCountry(request);
    const redirectUrl = request.nextUrl.clone();
    const unsupportedCountryPrefix = /^[a-z]{2}$/.test(firstSegment) && !["es", "en"].includes(firstSegment);
    redirectUrl.pathname = unsupportedCountryPrefix
      ? `/${country}${pathname.slice(firstSegment.length + 1)}`
      : legacyRedirectPath(pathname, country);
    return NextResponse.redirect(redirectUrl, 308);
  }

  const country = getSiteCountryBySlug(firstSegment) ?? DEFAULT_SITE_COUNTRY;
  const countryPath = pathname.slice(firstSegment.length + 1) || "/";
  const canonicalCountryPath = canonicalizeLegacyCatalogPath(countryPath);
  if (canonicalCountryPath !== countryPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${country.slug}${canonicalCountryPath}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (request.nextUrl.searchParams.has("country")) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("country");
    return NextResponse.redirect(cleanUrl, 308);
  }

  const internalUrl = request.nextUrl.clone();
  const withoutCountry = pathname.slice(firstSegment.length + 1);
  internalUrl.pathname = withoutCountry || "/";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SITE_COUNTRY_HEADER, country.code);
  const localizedRequest = new NextRequest(internalUrl, {
    headers: requestHeaders,
    method: request.method
  });
  localizedRequest.cookies.set(SITE_COUNTRY_COOKIE, country.slug);

  const intlResponse = intlMiddleware(localizedRequest);
  const rewriteTarget = intlResponse.headers.get("x-middleware-rewrite");
  const redirectTarget = intlResponse.headers.get("location");
  let response = intlResponse;

  if (!redirectTarget) {
    response = NextResponse.rewrite(rewriteTarget ?? internalUrl, {
      request: { headers: requestHeaders }
    });
    // next-intl builds its Link hreflang alternates from the rewritten,
    // country-stripped URL, so they point at "/" and "/en" instead of
    // "/gt" and "/gt/en". Those contradict the correct <link rel="alternate">
    // tags rendered from metadata, and Google discards conflicting hreflang
    // annotations outright — so drop the header and let the HTML tags stand.
    const droppedHeaders = new Set(["x-middleware-rewrite", "link"]);
    intlResponse.headers.forEach((value, key) => {
      if (!droppedHeaders.has(key)) response.headers.set(key, value);
    });
  }

  response.cookies.set(SITE_COUNTRY_COOKIE, country.slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}

export const config = {
  matcher: [
    "/",
    "/(es|en|gt)/:path*",
    "/admin/:path*",
    "/admin",
    "/((?!api|_next|_vercel|.*\\..*).*)"]
};
