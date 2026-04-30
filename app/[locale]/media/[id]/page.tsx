"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { type MediaFile } from "@repo/api-client";
import { mediaFilesApi, routesApi } from "@/lib/api-client";
import { toast } from "sonner";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { formatSizeUnits } from "@/lib/utils";

interface MediaDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function MediaDetailsPage({ params }: MediaDetailsPageProps) {
  const resolvedParams = use(params);

  const t = useTranslations("pages");
  const tm = useTranslations("media");
  const tc = useTranslations("common");
  const mediaId = resolvedParams.id;

  const [media, setMedia] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaType, setMediaType] = useState<any[]>([]);

  const loadMediaDetail = useCallback(async () => {
    try {
      const response = await mediaFilesApi.getById(mediaId);
      setMedia(response.data);
    } catch (error) {
      console.error("Failed to load media detail:", error);
      toast.error(tc("loadFailed") || "加载媒体详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, tc]);

  const getMediaType = async () => {
    const res = await routesApi.getDicts("MFILE_TYPE");
    setMediaType(res.data || []);
  };

  useEffect(() => {
    setIsLoading(true);
    void loadMediaDetail();
    void getMediaType();
  }, [loadMediaDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("media")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tc("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleSave = async (finalData: any) => {
    try {
      await mediaFilesApi.update(mediaId, { ...finalData, id: mediaId });
      await loadMediaDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("media")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col">
          <CommonBreadcrumb
            items={[
              { label: t("media"), href: "/media" },
              { label: media?.name, isCurrentPage: true },
            ]}
          />
          <EditableSection
            title="基本信息"
            defaultValues={{
              ...media,
            }}
            onSave={handleSave}
          >
            <EditableField
              label={tm("name")}
              name="name"
              value={media?.name}
              type="text"
              required
            />
            <EditableField
              label={tm("type")}
              name="type"
              value={media?.type}
              type="select"
              options={mediaType.map((item) => ({
                label: item.k,
                value: item.v,
              }))}
              required
            />

            <EditableField
              label={tc("description")}
              name="description"
              value={media?.description || "-"}
              type="textarea"
              className="md:col-span-2"
            />
            <EditableField label={tm("Ext")} value={media?.ext} type="text" />
            <EditableField
              label={tm("size")}
              value={formatSizeUnits(media?.file_size)}
              type="text"
            />
            <EditableField label={tm("MIME")} value={media?.mime} type="text" />
            <EditableField
              label={tm("Original File Name")}
              value={media?.original_file_name}
              type="text"
            />
            <EditableField label={tm("Channel UUID")} value={media?.channel_uuid} type="text" />
            <EditableField label={tm("Absolute Path")} value={media?.abs_path} type="text" />
            <EditableField label={tm("Relative Path")} value={media?.rel_path} type="text" />
            <EditableField label={tm("Directory")} value={media?.dir_path} type="text" />
            <EditableField label={tc("createdAt")} value={media?.created_at} type="text" />
            <EditableField label={tc("updatedAt")} value={media?.updated_at} type="text" />
          </EditableSection>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
