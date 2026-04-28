"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { type License } from "@repo/api-client";
import { licenseApi } from "@/lib/api-client";
import { toast } from "sonner";
import { PlusIcon, DownloadIcon, UploadIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { Button } from "@/components/ui/button";
import { EditableTable } from "@/components/ui/editable-table";
import { AddLicenseModuleDialog } from "../components/add-license-module-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { mediaFilesApi } from "@/lib/api-client";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Create JSON - 创建并下载 JSON 文件
  const handleCreateJSON = async () => {
    if (!license) return;

    try {
      // 调用 API 创建 JSON
      await licenseApi.createJson(licenseId);

      // 查询媒体文件
      const response = await mediaFilesApi.list({ name: license.name });
      const filteredData = response.data.data?.filter(
        (item: any) => item.name === `${license.name}.${item.ext}`,
      );

      if (filteredData && filteredData.length === 1) {
        const fileId = filteredData[0].id;
        const ext = filteredData[0].ext;
        const src = `/api/media_files/${fileId}.${ext}`;

        // 触发下载
        const downloadLink = document.createElement("a");
        downloadLink.href = src;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (error) {
      console.error("Failed to create JSON:", error);
    }
  };

  // Upload License File - 上传许可证文件
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("license_id", licenseId);

      await licenseApi.uploadLicense(formData);

      toast.success(tc("uploadSuccess"));
      await loadLicenseDetail();
    } catch (error) {
      console.error("Failed to upload license:", error);
      toast.error(tc("uploadFailed"));
    } finally {
      // 重置 input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Apply New License - 应用新许可证
  const handleApplyNewLicense = async () => {
    try {
      // 发送 sighup 信号重新加载配置
      await licenseApi.applyNewLicense();

      toast.success(tl("applySuccess") || "Successfull applied new license");

      // 重新加载许可证信息
      await loadLicenseDetail();
    } catch (error) {
      console.error("Failed to apply license:", error);
      toast.error(tl("applyFailed") || "应用许可证失败");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("license")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col">
          <CommonBreadcrumb
            items={[
              { label: t("license"), href: "/license" },
              { label: license?.name, isCurrentPage: true },
            ]}
          />
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <Link href="/api/license/req">
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {tl("Download Fingerprint")}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => void handleCreateJSON()}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                {tl("Create JSON")}
              </Button>
            </div>
          </div>
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
          <div className="flex items-center justify-between mt-8">
            <div />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                {tc("add")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUploadClick()}>
                <UploadIcon className="mr-2 h-4 w-4" />
                {tl("Upload License File")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => void handleApplyNewLicense()}>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                {tl("Apply New License")}
              </Button>
            </div>
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".lic,.license,.json"
              onChange={(e) => void handleFileUpload(e)}
              style={{ display: "none" }}
            />
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
                data={item?.params || []}
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
