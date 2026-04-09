import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./i18n/config";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
  locales,
  defaultLocale,
  localePrefix: "never",
});
