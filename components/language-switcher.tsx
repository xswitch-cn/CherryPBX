"use client";

import { useLocale } from "next-intl";
import { GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/i18n/config";
import { useRouter, usePathname } from "@/navigation";

const COOKIE_NAME = "NEXT_LOCALE";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000`;

    // With localePrefix: "never", we use router.push with locale param
    // The middleware will handle the locale detection
    router.push(pathname, { locale: newLocale });
  };

  const localeLabels: Record<Locale, string> = {
    en: "English",
    zh: "中文",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <GlobeIcon className="h-4 w-4" />
          <span className="text-xs">{localeLabels[locale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {localeLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
