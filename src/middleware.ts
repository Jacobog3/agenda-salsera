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

function selectedCountry(request: NextRequest) {
  const cookieCountry = request.cookies.get(SITE_COUNTRY_COOKIE)?.value.toLowerCase();
  if (cookieCountry && isSiteCountrySlug(cookieCountry)) return cookieCountry;

  const detectedCountryCode = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const detectedCountry = SITE_COUNTRIES.find((country) => country.code === detectedCountryCode);
  return detectedCountry?.slug ?? DEFAULT_SITE_COUNTRY.slug;
}

function legacyRedirectPath(pathname: string, country: string) {
  if (pathname === "/" || pathname === "/es") return `/${country}`;
  if (pathname.startsWith("/es/")) return `/${country}${pathname.slice(3)}`;
  if (pathname === "/en") return `/${country}/en`;
  if (pathname.startsWith("/en/")) return `/${country}/en${pathname.slice(3)}`;
  return `/${country}${pathname}`;
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
    return NextResponse.redirect(redirectUrl, 307);
  }

  const country = getSiteCountryBySlug(firstSegment) ?? DEFAULT_SITE_COUNTRY;
  if (request.nextUrl.searchParams.has("country")) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("country");
    return NextResponse.redirect(cleanUrl, 307);
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
    intlResponse.headers.forEach((value, key) => {
      if (key !== "x-middleware-rewrite") response.headers.set(key, value);
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
