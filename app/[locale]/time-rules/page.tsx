"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TimeRulesTable } from "./components/time-rules-table";

const mockTimeRulesData = [
  {
    id: 1,
    ruleName: "工作时间",
    description: "周一至周五工作时间",
    timeRange: "09:00-18:00",
    weekdays: "周一,周二,周三,周四,周五",
    status: "Active",
  },
  {
    id: 2,
    ruleName: "午休时间",
    description: "中午休息时间",
    timeRange: "12:00-13:30",
    weekdays: "周一,周二,周三,周四,周五",
    status: "Active",
  },
  {
    id: 3,
    ruleName: "周末",
    description: "周六周日全天",
    timeRange: "00:00-23:59",
    weekdays: "周六,周日",
    status: "Active",
  },
  {
    id: 4,
    ruleName: "节假日",
    description: "法定节假日",
    timeRange: "00:00-23:59",
    weekdays: "全部",
    status: "Inactive",
  },
  {
    id: 5,
    ruleName: "夜间服务",
    description: "非工作时间夜间",
    timeRange: "18:00-09:00",
    weekdays: "周一,周二,周三,周四,周五",
    status: "Active",
  },
];

export default function TimeRulesPage() {
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
        <SiteHeader title={t("timeRules")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <TimeRulesTable data={mockTimeRulesData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
