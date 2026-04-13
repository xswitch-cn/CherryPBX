import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/api-client"],
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL_TARGET;

    if (backendUrl && backendUrl.trim() !== "") {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }

    return [];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
