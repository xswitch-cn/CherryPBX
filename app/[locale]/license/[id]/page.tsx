"use client";

import { use, useState, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { type License } from "@repo/api-client";
import { licenseApi } from "@/lib/api-client";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { Button } from "@/components/ui/button";
import { EditableTable } from "@/components/ui/editable-table";
import { AddLicenseModuleDialog } from "../components/add-license-module-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

interface LicenseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function LicenseDetailsPage({ params }: LicenseDetailsPageProps) {
  const resolvedParams = use(params);

  const t = useTranslations("pages");
  const tl = useTranslations("license");
  const tc = useTranslations("common");
  const licenseId = resolvedParams.id;

  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [paramData, setParamData] = useState<Array<{ realm: string; params: any[] }>>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteRealm, setDeleteRealm] = useState<string>("");

  const loadLicenseDetail = useCallback(async () => {
    try {
      const response = await licenseApi.getById(licenseId);
      const res = await licenseApi.getParams(licenseId);
      const licenseData = response.data;
      setLicense(licenseData);
      const separated: Record<string, any[]> = {};
      res.data.forEach((item: any) => {
        if (!separated[item.realm]) {
          separated[item.realm] = [];
        }
        separated[item.realm].push(item);
      });
      const paramDatas = Object.keys(separated).map((realm) => ({
        realm,
        params: separated[realm],
      }));
      setParamData(paramDatas);
    } catch (error) {
      console.error("Failed to load license detail:", error);
      toast.error(tc("loadFailed") || "加载许可详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [licenseId, tc]);

  useEffect(() => {
    setIsLoading(true);
    void loadLicenseDetail();
  }, [loadLicenseDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("gateways")} />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{tc("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const handleSave = async (finalData: any) => {
    try {
      await licenseApi.update(licenseId, finalData);
      await loadLicenseDetail();
      toast.success(tc("saveSuccess"));
      return true;
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error(tc("saveFailed"));
      return false;
    }
  };

  const handleAddSuccess = () => {
    void loadLicenseDetail();
  };

  const handleVariableChange = async (key: string, rowData: any) => {
    try {
      await licenseApi.upParams(licenseId, {
        id: rowData.id,
        v: rowData.v,
      });
      toast.success(tc("saveSuccess"));
      await loadLicenseDetail();
    } catch (error) {
      console.error("Failed to update variable:", error);
      toast.error(tc("saveFailed"));
    }
  };

  const handleDeleteParams = async () => {
    setIsDeleting(true);
    try {
      await licenseApi.delParams(deleteRealm, licenseId);
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadLicenseDetail();
    } catch (error) {
      console.error("Failed to delete license:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteRealm("");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("license")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col gap-4">
          <CommonBreadcrumb
            items={[
              { label: t("license"), href: "/license" },
              { label: license?.name, isCurrentPage: true },
            ]}
          />
          <EditableSection
            title="基本信息"
            defaultValues={{
              ...license,
            }}
            onSave={handleSave}
          >
            <EditableField
              label={tl("name")}
              name="name"
              value={license?.name}
              type="text"
              inputPlaceholder="请输入名称"
              required
            />

            <EditableField
              label={tl("description")}
              name="description"
              value={license?.description || "-"}
              type="textarea"
              inputPlaceholder="请输入描述"
              className="md:col-span-2"
            />
            <EditableField label={tc("createdAt")} value={license?.created_at} />
          </EditableSection>
          <div className="flex items-center justify-between">
            <div />
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {tc("add")}
            </Button>
          </div>

          <CollapsibleSection
            data={paramData}
            showDelete={true}
            onDelete={(realm) => {
              setDeleteRealm(realm);
              setIsDeleteDialogOpen(true);
            }}
            renderContent={(item) => (
              <EditableTable
                columns={[
                  { key: "k", header: "名称" },
                  { key: "v", header: "值", type: "text" },
                ]}
                data={item.params || []}
                switchCheckedValue={0}
                switchUncheckedValue={1}
                onChange={({ key, rowData }) => {
                  void handleVariableChange(key, rowData);
                }}
              />
            )}
          />

          <AddLicenseModuleDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            licenseId={licenseId}
            onSuccess={handleAddSuccess}
          />
          {/* 删除确认对话框 */}
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={tl("deleteLicense")}
            description={tc("DeleteItem", {
              item: paramData?.[0]?.realm ? paramData?.[0]?.realm : "",
            })}
            onSubmit={handleDeleteParams}
            deleteText={tc("confirm") || "确定"}
            cancelText={tc("cancel") || "取消"}
            isLoading={isDeleting}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
