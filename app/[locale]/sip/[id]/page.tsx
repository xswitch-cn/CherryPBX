"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { sipApi, routesApi } from "@/lib/api-client";
import { type Sip } from "@repo/api-client";
import { toast } from "sonner";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { ContextItem } from "@/lib/api-client";
import { getLabels } from "@/lib/utils";

interface SipDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function SipDetailsPage({ params }: SipDetailsPageProps) {
  const resolvedParams = use(params);

  const t = useTranslations("pages");
  const ts = useTranslations("sip");
  const tc = useTranslations("common");
  const sipId = resolvedParams.id;

  const [sipData, setSipData] = useState<Sip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contexts, setContexts] = useState<ContextItem[]>([]);

  const loadSipDetail = useCallback(async () => {
    try {
      const response = await sipApi.getById(sipId);
      const sips = response.data;
      setSipData(sips);
    } catch (error) {
      console.error("Failed to load sip detail:", error);
      toast.error(tc("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [sipId, tc]);
  const getContexts = async () => {
    const res = await routesApi.getContexts();
    setContexts(res.data?.data || []);
  };

  useEffect(() => {
    setIsLoading(true);
    void getContexts();
    void loadSipDetail();
  }, [loadSipDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("sip")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tc("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleSave = async (finalData: any) => {
    try {
      await sipApi.update(sipId, finalData);
      await loadSipDetail();
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
        <SiteHeader title={t("sip")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col">
          <CommonBreadcrumb
            items={[
              { label: t("sip"), href: "/sip" },
              { label: sipData?.name, isCurrentPage: true },
            ]}
          />
          <EditableSection
            title="基本信息"
            defaultValues={{
              ...sipData,
            }}
            onSave={handleSave}
          >
            <EditableField
              label={ts("name")}
              name="name"
              value={sipData?.name}
              type="text"
              inputPlaceholder="请输入名称"
              required
            />

            <EditableField
              label={tc("description")}
              name="description"
              value={sipData?.description || "-"}
              type="textarea"
              inputPlaceholder="请输入描述"
              className="md:col-span-2"
            />

            <EditableField
              label="SIP IP"
              name="sip_ip"
              value={sipData?.sip_ip_expanded}
              type="text"
              inputPlaceholder="请输入"
            />

            <EditableField
              label={ts("SIP Port")}
              name="sip_port"
              value={sipData?.sip_port_expanded}
              type="text"
              inputPlaceholder="请输入"
            />

            <EditableField
              label="RTP IP"
              name="rtp_ip"
              value={sipData?.rtp_ip_expanded}
              type="text"
              inputPlaceholder="请输入"
            />

            <EditableField
              label={ts("callSource")}
              name="context"
              value={getLabels(contexts, sipData?.context, "name", "key")}
              type="select"
              options={contexts.map((item) => ({
                value: item.key,
                label: item.name,
              }))}
            />
            <EditableField
              label={ts("Inbound Codec")}
              name="icodec"
              value={sipData?.icodec_expanded}
              type="text"
              inputPlaceholder="请输入"
            />
            <EditableField
              label={ts("Outbound Codec")}
              name="ocodec"
              value={sipData?.ocodec_expanded}
              type="text"
              inputPlaceholder="请输入"
            />
          </EditableSection>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
