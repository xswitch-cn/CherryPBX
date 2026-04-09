import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { locales, type Locale } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale as Locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TooltipProvider>{children}</TooltipProvider>
    </NextIntlClientProvider>
  );
}
