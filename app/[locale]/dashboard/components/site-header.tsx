import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Github } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const t = useTranslations("sidebar");

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium flex-1">{title}</h1>
        <Link
          href="http://github.com/xswitch-cn/CherryPBX"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="text-sm">{t("github")}</span>
        </Link>
      </div>
    </header>
  );
}
