"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BlacklistTable } from "./components/blacklist-table";

// Mock data for Blacklist
const mockBlacklistData = [
  {
    id: 1,
    phoneNumber: "13800138001",
    pattern: "Exact",
    type: "Block",
    status: "Active",
    description: "骚扰电话",
    addedDate: "2024-03-10 09:30:00",
    lastMatch: "2024-03-15 14:20:33",
    matchCount: 15,
  },
  {
    id: 2,
    phoneNumber: "13900139000",
    pattern: "Exact",
    type: "Block",
    status: "Active",
    description: "诈骗电话",
    addedDate: "2024-03-08 11:45:00",
    lastMatch: "2024-03-14 16:55:12",
    matchCount: 8,
  },
  {
    id: 3,
    phoneNumber: "010-88888888",
    pattern: "Exact",
    type: "Allow",
    status: "Active",
    description: "重要客户",
    addedDate: "2024-03-05 10:00:00",
    lastMatch: "2024-03-15 09:15:00",
    matchCount: 23,
  },
  {
    id: 4,
    phoneNumber: "188*",
    pattern: "Prefix",
    type: "Block",
    status: "Active",
    description: "拦截188号段骚扰",
    addedDate: "2024-03-01 08:00:00",
    lastMatch: "2024-03-15 12:30:45",
    matchCount: 156,
  },
  {
    id: 5,
    phoneNumber: "021-.*",
    pattern: "Regex",
    type: "Block",
    status: "Inactive",
    description: "测试规则-已禁用",
    addedDate: "2024-02-28 14:20:00",
    lastMatch: "2024-03-10 11:00:00",
    matchCount: 5,
  },
  {
    id: 6,
    phoneNumber: "400*",
    pattern: "Prefix",
    type: "Allow",
    status: "Active",
    description: "允许400客服热线",
    addedDate: "2024-02-20 09:00:00",
    lastMatch: "2024-03-15 10:45:22",
    matchCount: 42,
  },
  {
    id: 7,
    phoneNumber: "15900159000",
    pattern: "Exact",
    type: "Block",
    status: "Active",
    description: "推销电话",
    addedDate: "2024-03-12 16:30:00",
    lastMatch: "2024-03-14 18:20:00",
    matchCount: 3,
  },
  {
    id: 8,
    phoneNumber: "0755-.*8888",
    pattern: "Regex",
    type: "Allow",
    status: "Active",
    description: "深圳分公司号码",
    addedDate: "2024-02-15 11:00:00",
    lastMatch: "2024-03-13 15:30:00",
    matchCount: 12,
  },
  {
    id: 9,
    phoneNumber: "170*",
    pattern: "Prefix",
    type: "Block",
    status: "Active",
    description: "拦截170虚拟号段",
    addedDate: "2024-03-01 10:00:00",
    lastMatch: "2024-03-15 08:15:33",
    matchCount: 89,
  },
  {
    id: 10,
    phoneNumber: "18600186000",
    pattern: "Exact",
    type: "Block",
    status: "Active",
    description: "恶意投诉电话",
    addedDate: "2024-03-14 14:00:00",
    lastMatch: "2024-03-14 17:45:00",
    matchCount: 2,
  },
];

export default function BlacklistPage() {
  const router = useRouter();
  const t = useTranslations("pages");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("blacklist")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <BlacklistTable data={mockBlacklistData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
