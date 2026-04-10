"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SipTable } from "./components/sip-table";

const mockSipData = [
  {
    id: 1,
    settingName: "sip.conf",
    value: "bindaddr=0.0.0.0",
    description: "SIP绑定地址",
    category: "Network",
    status: "Active",
  },
  {
    id: 2,
    settingName: "udpbindaddr",
    value: "0.0.0.0",
    description: "UDP绑定地址",
    category: "Network",
    status: "Active",
  },
  {
    id: 3,
    settingName: "context",
    value: "default",
    description: "默认上下文",
    category: "General",
    status: "Active",
  },
  {
    id: 4,
    settingName: "allowguest",
    value: "no",
    description: "禁止匿名呼叫",
    category: "Security",
    status: "Active",
  },
  {
    id: 5,
    settingName: "allow",
    value: "ulaw,alaw,gsm",
    description: "允许的编解码器",
    category: "Codec",
    status: "Active",
  },
  {
    id: 6,
    settingName: "dtmfmode",
    value: "rfc2833",
    description: "DTMF模式",
    category: "General",
    status: "Active",
  },
];

export default function SipPage() {
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
        <SiteHeader title={t("sip")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <SipTable data={mockSipData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
