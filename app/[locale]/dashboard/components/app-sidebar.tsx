"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { NavMain } from "@/app/[locale]/dashboard/components/nav-main";
import { NavSecondary } from "@/app/[locale]/dashboard/components/nav-secondary";
import { NavUser } from "@/app/[locale]/dashboard/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  Settings2Icon,
  CircleHelpIcon,
  CommandIcon,
  UsersIcon,
  PhoneIcon,
  RouteIcon,
  FileTextIcon,
  UsersRoundIcon,
  CogIcon,
  ShieldIcon,
  WrenchIcon,
} from "lucide-react";
import { useAuth } from "@/services/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("sidebar");
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.name || "Loading...",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: t("users"),
        url: "/users",
        icon: <UsersIcon />,
      },
      {
        title: t("extensions"),
        url: "/extensions",
        icon: <PhoneIcon />,
      },
      {
        title: t("cdr"),
        url: "/cdr",
        icon: <FileTextIcon />,
      },
      // {
      //   title: t("conference"),
      //   url: "/conference",
      //   icon: <UsersRoundIcon />,
      // },
      {
        title: t("callManagement"),
        url: "/routes",
        icon: <RouteIcon />,
        items: [
          {
            title: t("routes"),
            url: "/routes",
          },
          // {
          //   title: t("trunks"),
          //   url: "/trunks",
          // },
          {
            title: t("gateways"),
            url: "/gateways",
          },
          {
            title: t("ivr"),
            url: "/ivr",
          },
          {
            title: t("blacklist"),
            url: "/blacklist",
          },
          {
            title: t("did"),
            url: "/did",
          },
          {
            title: t("dod"),
            url: "/dod",
          },
          // {
          //   title: t("featureCodes"),
          //   url: "/feature-codes",
          // },
          {
            title: t("timeRules"),
            url: "/time-rules",
          },
          {
            title: t("numberTransform"),
            url: "/number-transform",
          },
        ],
      },
      {
        title: t("advanced"),
        url: "/sip",
        icon: <CogIcon />,
        items: [
          {
            title: t("sip"),
            url: "/sip",
          },
          {
            title: t("license"),
            url: "/license",
          },
          {
            title: t("media"),
            url: "/media",
          },
        ],
      },
      {
        title: t("security"),
        url: "/ip-blacklist",
        icon: <ShieldIcon />,
        items: [
          {
            title: t("ipBlacklist"),
            url: "/ip-blacklist",
          },
          {
            title: t("acl"),
            url: "/acl",
          },
        ],
      },
      {
        title: t("maintenance"),
        url: "/logs",
        icon: <WrenchIcon />,
        items: [
          {
            title: t("logs"),
            url: "/logs",
          },
          {
            title: t("diagnostics"),
            url: "/diagnostics",
          },
          {
            title: t("backup"),
            url: "/backup",
          },
        ],
      },
    ],
    navSecondary: [
      // {
      //   title: t("settings"),
      //   url: "#",
      //   icon: <Settings2Icon />,
      // },
      {
        title: t("getHelp"),
        url: "http://github.com/xswitch-cn/CherryPBX/wiki",
        icon: <CircleHelpIcon />,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <img src="/cherry.png" alt="Logo" className="size-5 object-contain" />
                <span className="text-base font-semibold">{t("companyName")}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
