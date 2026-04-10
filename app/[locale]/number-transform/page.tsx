"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NumberTransformTable } from "./components/number-transform-table";

const mockNumberTransformData = [
  {
    id: 1,
    ruleName: "去掉区号",
    matchPattern: "^0(\\d+)$",
    replaceWith: "$1",
    direction: "Outbound",
    status: "Active",
  },
  {
    id: 2,
    ruleName: "添加区号",
    matchPattern: "^(\\d{8})$",
    replaceWith: "010$1",
    direction: "Inbound",
    status: "Active",
  },
  {
    id: 3,
    ruleName: "隐藏中间四位",
    matchPattern: "^(\\d{3})\\d{4}(\\d{4})$",
    replaceWith: "$1****$2",
    direction: "Both",
    status: "Active",
  },
  {
    id: 4,
    ruleName: "国际号码转换",
    matchPattern: "^00(\\d+)$",
    replaceWith: "+$1",
    direction: "Outbound",
    status: "Active",
  },
  {
    id: 5,
    ruleName: "手机号加0",
    matchPattern: "^(1\\d{10})$",
    replaceWith: "0$1",
    direction: "Inbound",
    status: "Inactive",
  },
];

export default function NumberTransformPage() {
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
        <SiteHeader title={t("numberTransform")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <NumberTransformTable data={mockNumberTransformData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
