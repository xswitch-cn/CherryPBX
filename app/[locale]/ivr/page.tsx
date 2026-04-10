"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IvrTable } from "./components/ivr-table";

// Mock data for IVR
const mockIvrData = [
  {
    id: 1,
    name: "主菜单IVR",
    description: "公司主欢迎菜单，工作时间接待",
    status: "Active",
    timeout: 10,
    timeoutDestination: "分机 1001",
    invalidRetry: 3,
    invalidDestination: "挂断",
    totalCalls: 1256,
    lastCall: "2024-03-15 14:30:22",
  },
  {
    id: 2,
    name: "售后支持IVR",
    description: "售后服务支持语音导航",
    status: "Active",
    timeout: 15,
    timeoutDestination: "队列 support",
    invalidRetry: 2,
    invalidDestination: "重复播放",
    totalCalls: 892,
    lastCall: "2024-03-15 13:45:10",
  },
  {
    id: 3,
    name: "销售咨询IVR",
    description: "销售部门咨询语音导航",
    status: "Active",
    timeout: 12,
    timeoutDestination: "分机 2001",
    invalidRetry: 3,
    invalidDestination: "分机 2000",
    totalCalls: 567,
    lastCall: "2024-03-15 12:20:45",
  },
  {
    id: 4,
    name: "夜间服务IVR",
    description: "非工作时间自动语音服务",
    status: "Inactive",
    timeout: 8,
    timeoutDestination: "语音信箱",
    invalidRetry: 2,
    invalidDestination: "挂断",
    totalCalls: 234,
    lastCall: "2024-03-14 22:15:30",
  },
  {
    id: 5,
    name: "技术支持IVR",
    description: "技术部门支持热线导航",
    status: "Active",
    timeout: 20,
    timeoutDestination: "队列 tech",
    invalidRetry: 4,
    invalidDestination: "分机 3001",
    totalCalls: 445,
    lastCall: "2024-03-15 11:55:00",
  },
  {
    id: 6,
    name: "财务部门IVR",
    description: "财务相关事务语音导航",
    status: "Active",
    timeout: 10,
    timeoutDestination: "分机 4001",
    invalidRetry: 3,
    invalidDestination: "重复播放",
    totalCalls: 178,
    lastCall: "2024-03-15 10:30:15",
  },
  {
    id: 7,
    name: "VIP客户IVR",
    description: "VIP客户专属服务通道",
    status: "Active",
    timeout: 15,
    timeoutDestination: "分机 5001",
    invalidRetry: 5,
    invalidDestination: "分机 5000",
    totalCalls: 89,
    lastCall: "2024-03-15 09:45:33",
  },
  {
    id: 8,
    name: "招聘热线IVR",
    description: "人力资源招聘咨询导航",
    status: "Inactive",
    timeout: 12,
    timeoutDestination: "语音信箱",
    invalidRetry: 2,
    invalidDestination: "挂断",
    totalCalls: 56,
    lastCall: "2024-03-10 16:20:00",
  },
];

export default function IvrPage() {
  const router = useRouter();
  const t = useTranslations("pages");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("ivr")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <IvrTable data={mockIvrData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
