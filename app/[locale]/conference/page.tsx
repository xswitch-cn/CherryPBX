"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ConferenceTable } from "./components/conference-table";

const mockConferenceData = [
  {
    id: 1,
    roomName: "销售会议",
    roomNumber: "8001",
    pin: "1234",
    maxParticipants: 20,
    status: "Active",
    currentParticipants: 5,
  },
  {
    id: 2,
    roomName: "技术讨论",
    roomNumber: "8002",
    pin: "5678",
    maxParticipants: 15,
    status: "Active",
    currentParticipants: 0,
  },
  {
    id: 3,
    roomName: "管理层例会",
    roomNumber: "8003",
    pin: "9999",
    maxParticipants: 10,
    status: "Active",
    currentParticipants: 3,
  },
  {
    id: 4,
    roomName: "客户培训",
    roomNumber: "8004",
    pin: "0000",
    maxParticipants: 50,
    status: "Active",
    currentParticipants: 12,
  },
  {
    id: 5,
    roomName: "项目评审",
    roomNumber: "8005",
    pin: "1111",
    maxParticipants: 8,
    status: "Inactive",
    currentParticipants: 0,
  },
];

export default function ConferencePage() {
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
        <SiteHeader title={t("conference")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ConferenceTable data={mockConferenceData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
