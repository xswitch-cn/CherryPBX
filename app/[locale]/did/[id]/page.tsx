"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { hotlinesApi, extensionsApi, type Hotline } from "@/lib/api-client";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { EditableSection, EditableField } from "@/components/ui/editable-section";

export default function DidDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const didId = params.id;
  const locale = params.locale || "zh";

  const t = useTranslations("pages");
  const tt = useTranslations("did");
  const ttt = useTranslations("common");

  const [did, setDid] = useState<Hotline | null>(null);
  const [loading, setLoading] = useState(true);
  const [extensions, setExtensions] = useState<
    Array<{ id: number; extn: string; name: string; domain: string }>
  >([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDid = useCallback(async () => {
    if (!didId) return;

    try {
      setLoading(true);
      const response = await hotlinesApi.get(didId);
      const didData = response.data;
      setDid(didData);
    } catch (error) {
      console.error("Failed to fetch did:", error);
      toast.error(tt("failedToFetchDid") || "加载DID失败");
    } finally {
      setLoading(false);
    }
  }, [didId, tt]);

  const loadExtensions = useCallback(async () => {
    try {
      const response = await extensionsApi.list({ page_size: 5000 });
      const extensionData = response.data.data || [];
      setExtensions(extensionData);
    } catch (error) {
      console.error("Failed to load extensions:", error);
      toast.error(ttt("failedToLoadExtensions") || "加载分机失败");
    }
  }, [ttt]);

  useEffect(() => {
    void loadDid();
    void loadExtensions();
  }, [loadDid, loadExtensions]);

  const handleSubmit = async (data: any) => {
    if (!didId) return;

    try {
      setSubmitting(true);

      // 处理表单数据
      const processedData = { ...data };

      await hotlinesApi.update(didId, processedData);
      toast.success(tt("updatedDidSuccess") || "DID更新成功");
      await loadDid();
      return true;
    } catch (error: any) {
      console.error("Failed to update did:", error);
      toast.error(
        `${tt("updatedDidFailed") || "DID更新失败"}: ${error?.message || error?.text || error}`,
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!didId) return;

    try {
      setSubmitting(true);
      await hotlinesApi.delete(didId);
      toast.success(tt("deletedDid") || "DID删除成功");
      router.push(`/${locale}/did`);
    } catch (error: any) {
      console.error("Failed to delete did:", error);
      toast.error(
        `${tt("deletedDidFailed") || "DID删除失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("did")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-muted-foreground">{ttt("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!did) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("did")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-muted-foreground">{tt("didNotFound") || "DID不存在"}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleCancel = () => {
    console.log("取消编辑");
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("did")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("did"), href: `/${locale}/did` },
                    { label: did.line_number, isCurrentPage: true },
                  ]}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{did.line_number}</h1>
                    <span className="text-muted-foreground">ID: {did.id}</span>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    {ttt("delete") || "删除"}
                  </Button>
                </div>

                <EditableSection
                  title={tt("didInfo") || "DID信息"}
                  defaultValues={{
                    ...did,
                  }}
                  onSave={handleSubmit}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={tt("DID Number")}
                    name="line_number"
                    value={did.line_number}
                    type="text"
                    inputPlaceholder={tt("lineNumberPlaceholder") || "请输入线路号码"}
                    required
                  />
                  <EditableField
                    label={tt("Binding Extension")}
                    name="numbers"
                    value={did.numbers}
                    type="select"
                    options={extensions.map((ext) => ({
                      value: ext.extn,
                      label: `${ext.name} | ${ext.extn}`,
                    }))}
                    required
                  />
                  <EditableField
                    label={tt("description")}
                    name="description"
                    value={did.description || ""}
                    type="text"
                    inputPlaceholder={tt("descriptionPlaceholder") || "请输入描述"}
                  />
                </EditableSection>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSubmit={handleDelete}
        title={tt("deleteDid")}
        description={tt("deleteItem", { item: did.line_number })}
        deleteText={ttt("confirm") || "确定"}
        cancelText={ttt("cancel") || "取消"}
        isLoading={submitting}
      />
    </SidebarProvider>
  );
}
