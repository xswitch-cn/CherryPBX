"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrunksTable } from "./components/trunks-table";

// Mock data for trunks (gateways)
const mockTrunks = [
  {
    id: 1,
    name: "Primary SIP Provider",
    type: "SIP",
    host: "sip.provider.com",
    port: 5060,
    status: "Online",
    channels: 30,
    activeCalls: 12,
    registered: true,
    lastRegistration: "2024-01-15 14:30:00",
  },
  {
    id: 2,
    name: "Backup SIP Provider",
    type: "SIP",
    host: "backup-sip.provider.com",
    port: 5060,
    status: "Standby",
    channels: 30,
    activeCalls: 0,
    registered: true,
    lastRegistration: "2024-01-15 14:25:00",
  },
  {
    id: 3,
    name: "PSTN Gateway 1",
    type: "PJSIP",
    host: "192.168.1.100",
    port: 5060,
    status: "Online",
    channels: 32,
    activeCalls: 8,
    registered: true,
    lastRegistration: "2024-01-15 14:30:00",
  },
  {
    id: 4,
    name: "PSTN Gateway 2",
    type: "PJSIP",
    host: "192.168.1.101",
    port: 5060,
    status: "Offline",
    channels: 32,
    activeCalls: 0,
    registered: false,
    lastRegistration: "2024-01-15 10:15:00",
  },
  {
    id: 5,
    name: "International Provider",
    type: "IAX2",
    host: "iax.intl-provider.com",
    port: 4569,
    status: "Online",
    channels: 100,
    activeCalls: 23,
    registered: true,
    lastRegistration: "2024-01-15 14:28:00",
  },
  {
    id: 6,
    name: "Office Branch A",
    type: "SIP",
    host: "branch-a.company.com",
    port: 5060,
    status: "Online",
    channels: 10,
    activeCalls: 3,
    registered: true,
    lastRegistration: "2024-01-15 14:29:00",
  },
  {
    id: 7,
    name: "Office Branch B",
    type: "SIP",
    host: "branch-b.company.com",
    port: 5060,
    status: "Warning",
    channels: 10,
    activeCalls: 9,
    registered: true,
    lastRegistration: "2024-01-15 14:20:00",
  },
  {
    id: 8,
    name: "Cloud PBX Link",
    type: "SIP",
    host: "cloud-pbx.example.com",
    port: 5061,
    status: "Online",
    channels: 50,
    activeCalls: 15,
    registered: true,
    lastRegistration: "2024-01-15 14:30:00",
  },
  {
    id: 9,
    name: "T1 Gateway",
    type: "DAHDI",
    host: "localhost",
    port: 0,
    status: "Online",
    channels: 24,
    activeCalls: 5,
    registered: true,
    lastRegistration: "2024-01-15 14:00:00",
  },
  {
    id: 10,
    name: "GSM Gateway",
    type: "SIP",
    host: "192.168.1.200",
    port: 5060,
    status: "Offline",
    channels: 8,
    activeCalls: 0,
    registered: false,
    lastRegistration: "2024-01-14 18:30:00",
  },
  {
    id: 11,
    name: "VoIP Wholesale",
    type: "SIP",
    host: "wholesale.voip.com",
    port: 5060,
    status: "Online",
    channels: 200,
    activeCalls: 67,
    registered: true,
    lastRegistration: "2024-01-15 14:30:00",
  },
  {
    id: 12,
    name: "Test Trunk",
    type: "SIP",
    host: "test.local",
    port: 5060,
    status: "Disabled",
    channels: 10,
    activeCalls: 0,
    registered: false,
    lastRegistration: "-",
  },
];

export default function TrunksPage() {
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
        <SiteHeader title={t("trunks")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <TrunksTable data={mockTrunks} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
