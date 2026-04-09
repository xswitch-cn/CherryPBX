import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "@/i18n/config";

// next-intl 尚未支持 proxy 导出，暂时使用 middleware
export const proxy = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
