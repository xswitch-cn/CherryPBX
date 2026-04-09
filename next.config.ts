import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Config options here
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;

    // 只有当 BACKEND_URL 存在且不为空时，才返回代理规则
    if (backendUrl && backendUrl.trim() !== "") {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }

    // 否则返回空数组，表示“无代理”
    // 此时 /api/* 请求将直接由 Next.js 处理（通常会导致 404，除非你有 API Routes）
    // 或者由外部的 Nginx处理
    return [];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
