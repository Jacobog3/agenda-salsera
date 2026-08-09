import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { env } from "@/lib/utils/env";
import { brand } from "@/lib/brand";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import "@/app/globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const SITE_URL = env.siteUrl;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: SITE_URL,
  logo: `${SITE_URL}${brand.logoPath}`,
  email: brand.email,
  description:
    "Eventos, academias, maestros y lugares de salsa, bachata y baile latino. Empezamos en Guatemala.",
  areaServed: {
    "@type": "Country",
    name: "Guatemala"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brand.name,
  url: SITE_URL
};

export const metadata: Metadata = {
  applicationName: brand.name,
  title: {
    default: "SomosSalsa — La comunidad baila aquí",
    template: `%s | ${brand.name}`
  },
  description:
    "Encontrá eventos, academias, maestros y lugares de salsa y bachata. Empezamos en Guatemala.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: brand.name,
    type: "website",
    images: [`${SITE_URL}${brand.logoPath}`]
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.name
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

export const viewport: Viewport = {
  themeColor: "#0AA9D1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
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
        {/* AdSense — in <head> so the verification crawler finds it in the initial HTML */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2884754691922948"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics measurementId={GA_ID} />
        {children}
      </body>
    </html>
  );
}
