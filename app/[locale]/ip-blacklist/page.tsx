"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IpBlacklistTable } from "./components/ip-blacklist-table";

const mockIpBlacklistData = [
  {
    id: 1,
    ipAddress: "192.168.1.100",
    reason: "暴力破解尝试",
    addedDate: "2024-03-15 10:30:00",
    expiryDate: "永久",
    status: "Active",
  },
  {
    id: 2,
    ipAddress: "10.0.0.50",
    reason: "扫描攻击",
    addedDate: "2024-03-14 15:20:00",
    expiryDate: "2024-04-14",
    status: "Active",
  },
  {
    id: 3,
    ipAddress: "172.16.0.25",
    reason: "异常呼叫频率",
    addedDate: "2024-03-13 09:00:00",
    expiryDate: "永久",
    status: "Active",
  },
  {
    id: 4,
    ipAddress: "203.0.113.45",
    reason: "SIP泛洪攻击",
    addedDate: "2024-03-12 18:45:00",
    expiryDate: "2024-03-19",
    status: "Inactive",
  },
  {
    id: 5,
    ipAddress: "198.51.100.10",
    reason: "注册攻击",
    addedDate: "2024-03-10 08:30:00",
    expiryDate: "永久",
    status: "Active",
  },
];

export default function IpBlacklistPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("ipBlacklist")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <IpBlacklistTable data={mockIpBlacklistData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
