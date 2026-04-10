"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DodTable } from "./components/dod-table";

const mockDodData = [
  {
    id: 1,
    dodNumber: "010-88888888",
    provider: "中国电信",
    callerId: "主叫显示",
    status: "Active",
    description: "北京总部外显",
    usedBy: "销售部",
  },
  {
    id: 2,
    dodNumber: "021-66666666",
    provider: "中国联通",
    callerId: "主叫显示",
    status: "Active",
    description: "上海分公司外显",
    usedBy: "客服部",
  },
  {
    id: 3,
    dodNumber: "0755-55555555",
    provider: "中国移动",
    callerId: "主叫显示",
    status: "Active",
    description: "深圳外显",
    usedBy: "技术部",
  },
  {
    id: 4,
    dodNumber: "400-1234567",
    provider: "中国电信",
    callerId: "400号码",
    status: "Active",
    description: "全国客服外显",
    usedBy: "客服部",
  },
  {
    id: 5,
    dodNumber: "020-33333333",
    provider: "中国联通",
    callerId: "主叫显示",
    status: "Inactive",
    description: "广州外显-停用",
    usedBy: "广州办",
  },
];

export default function DodPage() {
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
        <SiteHeader title={t("dod")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <DodTable data={mockDodData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
