"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FeatureCodesTable } from "./components/feature-codes-table";

const mockFeatureCodesData = [
  {
    id: 1,
    code: "*97",
    featureName: "语音信箱",
    description: "访问个人语音信箱",
    status: "Active",
  },
  {
    id: 2,
    code: "*98",
    featureName: "群组语音信箱",
    description: "访问群组语音信箱",
    status: "Active",
  },
  {
    id: 3,
    code: "*72",
    featureName: "呼叫转移",
    description: "设置无条件呼叫转移",
    status: "Active",
  },
  {
    id: 4,
    code: "*73",
    featureName: "取消呼叫转移",
    description: "取消呼叫转移设置",
    status: "Active",
  },
  {
    id: 5,
    code: "*78",
    featureName: "免打扰开启",
    description: "开启免打扰模式",
    status: "Active",
  },
  {
    id: 6,
    code: "*79",
    featureName: "免打扰关闭",
    description: "关闭免打扰模式",
    status: "Active",
  },
  {
    id: 7,
    code: "*90",
    featureName: "呼叫前转",
    description: "设置遇忙呼叫前转",
    status: "Active",
  },
  {
    id: 8,
    code: "*91",
    featureName: "取消呼叫前转",
    description: "取消遇忙呼叫前转",
    status: "Inactive",
  },
];

export default function FeatureCodesPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
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
        <SiteHeader title={t("featureCodes")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <FeatureCodesTable data={mockFeatureCodesData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
