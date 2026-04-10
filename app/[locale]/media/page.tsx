"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MediaTable } from "./components/media-table";

const mockMediaData = [
  {
    id: 1,
    fileName: "welcome.wav",
    type: "Audio",
    size: "2.5 MB",
    duration: "15s",
    uploadDate: "2024-03-10",
    usedBy: "IVR-主菜单",
  },
  {
    id: 2,
    fileName: "hold_music.mp3",
    type: "Audio",
    size: "4.8 MB",
    duration: "180s",
    uploadDate: "2024-03-08",
    usedBy: "等待队列",
  },
  {
    id: 3,
    fileName: "voicemail_greeting.wav",
    type: "Audio",
    size: "1.2 MB",
    duration: "10s",
    uploadDate: "2024-03-05",
    usedBy: "语音信箱",
  },
  {
    id: 4,
    fileName: "after_hours.wav",
    type: "Audio",
    size: "1.8 MB",
    duration: "12s",
    uploadDate: "2024-03-01",
    usedBy: "夜间服务",
  },
  {
    id: 5,
    fileName: "conference_intro.wav",
    type: "Audio",
    size: "0.8 MB",
    duration: "5s",
    uploadDate: "2024-02-28",
    usedBy: "会议室",
  },
];

export default function MediaPage() {
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
        <SiteHeader title={t("media")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <MediaTable data={mockMediaData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
