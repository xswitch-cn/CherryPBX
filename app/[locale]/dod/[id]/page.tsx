"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { dodsApi, extensionsApi, routesApi, type DOD } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { EditableSection, EditableField } from "@/components/ui/editable-section";

export default function DodDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const dodId = params.id;
  const t = useTranslations("dod");
  const ttt = useTranslations("common");

  const [dod, setDod] = useState<DOD | null>(null);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [nameList, setNameList] = useState<any[]>([]);
  const [withKa, setWithKa] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadDod = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dodsApi.getById(parseInt(dodId, 10));
      setDod(response.data);
      setSelectedType(response.data.type);
    } catch (error) {
      console.error("Failed to load dod:", error);
      toast.error(ttt("loadFailed") || "加载失败");
    } finally {
      setLoading(false);
    }
  }, [dodId, ttt]);

  const loadExtensions = useCallback(async () => {
    try {
      const response = await extensionsApi.list({ page_size: 5000 });
      setExtensions(response.data.data || []);
    } catch (error) {
      console.error("Failed to load extensions:", error);
    }
  }, []);

  const getNameList = useCallback(async (type: string) => {
    try {
      let response;
      if (type === "GATEWAY") {
        response = await routesApi.getGateways();
      } else if (type === "DISTRIBUTORS") {
        response = await routesApi.getDistributors();
      } else {
        response = await routesApi.getTrunks();
      }

      setNameList((response as any).data?.data || []);
    } catch (error) {
      console.error("Failed to load name list:", error);
      setNameList([]);
    }
  }, []);

  const getResourceTypes = useCallback(() => {
    let types = [
      { k: "GATEWAY", v: "GATEWAY" },
      { k: "DISTRIBUTORS", v: "DISTRIBUTORS" },
    ];
    if (withKa) {
      types = [
        { k: "GATEWAY", v: "GATEWAY" },
        { k: "TRUNKS", v: "TRUNKS" },
        { k: "DISTRIBUTORS", v: "DISTRIBUTORS" },
      ];
    }
    setResourceTypes(types);
  }, [withKa]);

  const checkWithKa = useCallback(async () => {
    try {
      const response = await routesApi.getDicts("XUI");
      if (response.data) {
        const isProductGw = response.data.find((item: any) => item.k === "IS_PRODUCT_GW");
        if (isProductGw && isProductGw.v === "false") {
          setWithKa(false);
        } else {
          setWithKa(true);
        }
      } else {
        setWithKa(true);
      }
    } catch (error) {
      console.error("Failed to check with_ka:", error);
      setWithKa(true); // 默认值
    }
  }, []);

  useEffect(() => {
    void checkWithKa();
    void loadDod();
    void loadExtensions();
  }, [loadDod, loadExtensions, checkWithKa]);

  useEffect(() => {
    getResourceTypes();
  }, [withKa, getResourceTypes]);

  useEffect(() => {
    if (selectedType) {
      void getNameList(selectedType);
    }
  }, [selectedType, getNameList]);

  useEffect(() => {
    if (dod?.type) {
      void getNameList(dod.type);
    }
  }, [dod?.type, getNameList]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const handleSave = async (formData: any) => {
    try {
      setLoading(true);

      // 处理表单数据
      const processedData = { ...formData };

      let name = "";
      if (processedData.type) {
        const resource = nameList.find((item) => item.id === processedData.ref_id);
        name = resource?.name || "";
      }

      await dodsApi.update(parseInt(dodId, 10), {
        ...processedData,
        name,
      });

      toast.success(ttt("saveSuccess") || "保存成功");
      await loadDod();
      return true;
    } catch (error: any) {
      console.error("Failed to update dod:", error);
      toast.error(`${ttt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("取消编辑");
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await dodsApi.delete(parseInt(dodId, 10));
      toast.success(ttt("deleteSuccess") || "删除成功");
      router.push(`/${params.locale}/dod`);
    } catch (error: any) {
      console.error("Failed to delete dod:", error);
      toast.error(
        `${ttt("deleteFailed") || "删除失败"}: ${error?.message || error?.text || error}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getResourceOptions = () => {
    return nameList.map((item) => ({
      value: item.id.toString(),
      label: item.name,
    }));
  };

  const getResourceName = () => {
    if (!dod || !dod.ref_id) return "";
    const resource = nameList.find((item) => item.id === dod.ref_id);
    return resource?.name || "";
  };

  if (loading && !dod) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("dod")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">加载中...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!dod) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("dod")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">DOD 不存在</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("dod")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("call"), href: `/${params.locale}/dashboard` },
                    { label: t("dod"), href: `/${params.locale}/dod` },
                    { label: dod.line_number, isCurrentPage: true },
                  ]}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{dod.line_number}</h1>
                    <span className="text-muted-foreground">ID: {dod.id}</span>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    {ttt("delete") || "删除"}
                  </Button>
                </div>

                <EditableSection
                  title={t("dodInfo") || "DOD信息"}
                  defaultValues={{
                    ...dod,
                  }}
                  onSave={handleSave}
                  onCancel={handleCancel}
                >
                  <EditableField
                    label={t("lineNumber") || "线路号码"}
                    name="line_number"
                    value={dod.line_number}
                    type="text"
                    inputPlaceholder={t("lineNumberPlaceholder") || "请输入线路号码"}
                    required
                  />
                  <EditableField
                    label={t("extension") || "分机"}
                    name="numbers"
                    value={dod.numbers}
                    type="select"
                    options={extensions.map((ext) => ({
                      value: ext.extn,
                      label: `${ext.name} | ${ext.extn}`,
                    }))}
                    required
                  />
                  <EditableField
                    label={t("resourceType") + " (DOD)"}
                    name="type"
                    value={dod.type}
                    type="select"
                    options={resourceTypes.map((item: any) => ({
                      value: item.k,
                      label: t(item.v.toLowerCase()) || item.v,
                    }))}
                    required
                    onChange={(value) => {
                      handleTypeChange(value);
                    }}
                  />
                  <EditableField
                    label={t("resourceName") + " (DOD)"}
                    name="ref_id"
                    value={dod.ref_id?.toString() || ""}
                    type="select"
                    options={getResourceOptions()}
                    required
                    disabled={!selectedType}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <EditableField
                      label={t("name") || "名称"}
                      name="name"
                      value={dod.name || ""}
                      type="text"
                      inputPlaceholder={t("namePlaceholder") || "请输入名称"}
                    />
                  </div>
                </EditableSection>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteDod")}
        description={t("deleteItem", { item: dod.line_number })}
        onSubmit={handleDelete}
        deleteText={ttt("confirm") || "确定"}
        cancelText={ttt("cancel") || "取消"}
        isLoading={loading}
      />
    </SidebarProvider>
  );
}
