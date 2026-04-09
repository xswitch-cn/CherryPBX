"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BackupTable } from "./components/backup-table";

const mockBackupData = [
  {
    id: 1,
    backupName: "自动备份-20240315",
    backupDate: "2024-03-15 03:00:00",
    size: "256 MB",
    type: "Scheduled",
    status: "Complete",
  },
  {
    id: 2,
    backupName: "手动备份-更新前",
    backupDate: "2024-03-14 15:30:00",
    size: "248 MB",
    type: "Manual",
    status: "Complete",
  },
  {
    id: 3,
    backupName: "自动备份-20240314",
    backupDate: "2024-03-14 03:00:00",
    size: "245 MB",
    type: "Scheduled",
    status: "Complete",
  },
  {
    id: 4,
    backupName: "系统升级备份",
    backupDate: "2024-03-10 10:00:00",
    size: "230 MB",
    type: "Manual",
    status: "Complete",
  },
  {
    id: 5,
    backupName: "自动备份-20240313",
    backupDate: "2024-03-13 03:00:00",
    size: "240 MB",
    type: "Scheduled",
    status: "Failed",
  },
];

export default function BackupPage() {
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
        <SiteHeader title={t("backup")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <BackupTable data={mockBackupData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
