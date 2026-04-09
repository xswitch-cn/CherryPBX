"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  GlobeIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { locales, type Locale } from "@/i18n/config";
import { useAuth } from "@/services/auth";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    // email: string;
    avatar: string;
  };
}) {
  const t = useTranslations("userMenu");
  const tTheme = useTranslations("theme");
  const tLanguage = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout()
      .then(() => {
        console.log("logged out");
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        router.push("/login");
      });
  };

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000`;
    router.push(pathname, { locale: newLocale as Locale });
  };

  const localeLabels: Record<Locale, string> = {
    en: tLanguage("english"),
    zh: tLanguage("chinese"),
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {/* <span className="truncate text-xs text-muted-foreground">{user.email}</span> */}
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  {/* <span className="truncate text-xs text-muted-foreground">{user.email}</span> */}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon />
                {t("account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                {t("billing")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                {t("notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "light" ? (
                  <SunIcon />
                ) : theme === "dark" ? (
                  <MoonIcon />
                ) : (
                  <MonitorIcon />
                )}
                {tTheme("label")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <SunIcon />
                    {tTheme("light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <MoonIcon />
                    {tTheme("dark")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <MonitorIcon />
                    {tTheme("system")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <GlobeIcon />
                {tLanguage("label")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                  {locales.map((loc) => (
                    <DropdownMenuRadioItem key={loc} value={loc}>
                      {localeLabels[loc]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
