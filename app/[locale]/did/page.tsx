"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DidTable } from "./components/did-table";

const mockDidData = [
  {
    id: 1,
    didNumber: "010-88888888",
    provider: "中国电信",
    destination: "IVR-主菜单",
    status: "Active",
    description: "北京总部热线",
    monthlyFee: 100,
    assignedTo: "总部",
  },
  {
    id: 2,
    didNumber: "021-66666666",
    provider: "中国联通",
    destination: "分机-1001",
    status: "Active",
    description: "上海分公司",
    monthlyFee: 80,
    assignedTo: "上海分公司",
  },
  {
    id: 3,
    didNumber: "0755-55555555",
    provider: "中国移动",
    destination: "队列-sales",
    status: "Active",
    description: "深圳销售热线",
    monthlyFee: 90,
    assignedTo: "销售部",
  },
  {
    id: 4,
    didNumber: "400-1234567",
    provider: "中国电信",
    destination: "IVR-售后",
    status: "Active",
    description: "全国客服热线",
    monthlyFee: 200,
    assignedTo: "客服部",
  },
  {
    id: 5,
    didNumber: "020-33333333",
    provider: "中国联通",
    destination: "分机-2001",
    status: "Inactive",
    description: "广州办事处",
    monthlyFee: 60,
    assignedTo: "广州办",
  },
];

export default function DidPage() {
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
        <SiteHeader title={t("did")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <DidTable data={mockDidData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
