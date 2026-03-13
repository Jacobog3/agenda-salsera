import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async redirects() {
    return [
      // Redirect root domain traffic to salsa subdomain
      {
        source: "/:path*",
        has: [{ type: "host", value: "exploraguate.com" }],
        destination: "https://salsa.exploraguate.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.exploraguate.com" }],
        destination: "https://salsa.exploraguate.com/:path*",
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
