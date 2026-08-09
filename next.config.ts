import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://generativelanguage.googleapis.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join("; ")
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      // Keep the new brand on one canonical domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.somossalsa.com" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "somossalsa.app" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.somossalsa.app" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      },
      // Preserve links from every previous Exploraguate host.
      {
        source: "/:path*",
        has: [{ type: "host", value: "exploraguate.com" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.exploraguate.com" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "salsa.exploraguate.com" }],
        destination: "https://somossalsa.com/:path*",
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
