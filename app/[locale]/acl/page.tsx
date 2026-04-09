"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AclTable } from "./components/acl-table";

const mockAclData = [
  {
    id: 1,
    aclName: "内网允许",
    network: "192.168.0.0/16",
    action: "Allow",
    description: "允许内网访问",
    status: "Active",
  },
  {
    id: 2,
    aclName: "办公网络",
    network: "10.0.0.0/8",
    action: "Allow",
    description: "办公网络访问",
    status: "Active",
  },
  {
    id: 3,
    aclName: "合作伙伴",
    network: "172.16.0.0/12",
    action: "Allow",
    description: "合作伙伴网络",
    status: "Active",
  },
  {
    id: 4,
    aclName: "拒绝恶意IP",
    network: "203.0.113.0/24",
    action: "Deny",
    description: "拒绝恶意IP段",
    status: "Active",
  },
  {
    id: 5,
    aclName: "测试环境",
    network: "192.168.100.0/24",
    action: "Allow",
    description: "测试环境访问",
    status: "Inactive",
  },
];

export default function AclPage() {
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
        <SiteHeader title={t("acl")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <AclTable data={mockAclData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
