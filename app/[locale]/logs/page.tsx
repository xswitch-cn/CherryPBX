"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LogsTable } from "./components/logs-table";

const mockLogsData = [
  {
    id: 1,
    timestamp: "2024-03-15 14:30:25",
    level: "Info",
    source: "SIP",
    message: "SIP注册成功 - 分机 1001",
    details: "来源IP: 192.168.1.101",
  },
  {
    id: 2,
    timestamp: "2024-03-15 14:28:15",
    level: "Warning",
    source: "Trunk",
    message: "中继注册延迟",
    details: "SIP-Trunk-01 响应时间: 3.5s",
  },
  {
    id: 3,
    timestamp: "2024-03-15 14:25:00",
    level: "Error",
    source: "Call",
    message: "呼叫失败",
    details: "主叫: 1002, 被叫: 13800138000, 原因: 无可用路由",
  },
  {
    id: 4,
    timestamp: "2024-03-15 14:20:30",
    level: "Info",
    source: "IVR",
    message: "IVR菜单访问",
    details: "IVR: 主菜单, 来电: 13900139000",
  },
  {
    id: 5,
    timestamp: "2024-03-15 14:15:45",
    level: "Debug",
    source: "System",
    message: "配置重载完成",
    details: "重载模块: dialplan, sip, voicemail",
  },
  {
    id: 6,
    timestamp: "2024-03-15 14:10:00",
    level: "Info",
    source: "Conference",
    message: "会议室创建",
    details: "会议室: 8001, 创建人: 分机 1003",
  },
];

export default function LogsPage() {
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
        <SiteHeader title={t("logs")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <LogsTable data={mockLogsData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
