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
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { EditableTable } from "@/components/ui/editable-table";
import { DynamicFormDialog, FormConfig } from "@/components/dynamic-form-dialog";

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleVariableChange = async (key: string, rowData: any) => {
    try {
      if (key === "disabled") {
        await sipApi.upDetailParams(sipId, rowData.id, { action: "toggle" });
      } else {
        await sipApi.upDetailParams(sipId, rowData.id, {
          k: rowData.k,
          v: rowData.v,
        });
      }
      toast.success(tc("saveSuccess") || "保存成功");
      await loadSipDetail();
    } catch (error) {
      console.error("Failed to update variable:", error);
      toast.error(tc("saveFailed") || "保存失败");
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await sipApi.deleteDetailParams(sipId, row.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadSipDetail();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    }
  };

  // 定义表单配置
  const formConfig: FormConfig = {
    fields: [
      {
        name: "k",
        label: ts("name"),
        type: "text",
        placeholder: "name",
        required: true,
      },
      {
        name: "v",
        label: tc("value"),
        type: "text",
        placeholder: "value",
        required: true,
      },
    ],
  };

  // 处理添加参数
  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await sipApi.addDetailParams(sipId, {
        k: values.k,
        v: values.v,
      });
      toast.success(tc("saveSuccess") || "添加成功");
      await loadSipDetail();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add param:", error);
      toast.error(tc("saveFailed") || "添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsAddDialogOpen(false);
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
          <div className="flex items-center justify-between mt-8">
            <div />
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {tc("add")}
            </Button>
          </div>
          <EditableTable
            columns={[
              { key: "k", header: "名称", type: "text" },
              { key: "v", header: "值", type: "text" },
              { key: "disabled", header: "启用", type: "switch" },
              {
                key: "action",
                header: tc("actions"),
                type: "action",
                actions: [
                  {
                    type: "delete",
                    label: tc("delete"),
                  },
                ],
              },
            ]}
            data={sipData?.params || []}
            switchCheckedValue={0}
            switchUncheckedValue={1}
            onDelete={(v) => handleDelete(v)}
            onChange={({ key, rowData }) => {
              void handleVariableChange(key, rowData);
            }}
          />

          {/* 新增参数 */}
          <DynamicFormDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            title={tc("Add Param") || "添加参数"}
            config={formConfig}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText={tc("submit")}
            cancelText={tc("cancel")}
            loading={isSubmitting}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
