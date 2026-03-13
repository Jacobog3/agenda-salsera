import type { Metadata } from "next";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { env } from "@/lib/utils/env";
import "@/app/globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const SITE_URL = env.siteUrl;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ExploraGuate",
  url: SITE_URL,
  logo: `${SITE_URL}/images/exploraguate-logo.png`,
  email: "info@exploraguate.com",
  description:
    "Agenda de salsa y bachata en Guatemala. Eventos, lugares y academias de baile.",
  areaServed: {
    "@type": "Country",
    name: "Guatemala"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ExploraGuate",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/eventos?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export const metadata: Metadata = {
  title: {
    default: "ExploraGuate — Salsa y bachata en Guatemala",
    template: "%s | ExploraGuate"
  },
  description:
    "Agenda de salsa y bachata en Guatemala. Encontrá eventos, lugares y academias de baile cerca de vos.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "ExploraGuate",
    type: "website",
    images: [`${SITE_URL}/images/exploraguate-logo.png`]
  },
  twitter: {
    card: "summary_large_image"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
