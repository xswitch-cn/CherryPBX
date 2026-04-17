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
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddLicenseModuleDialog } from "../components/add-license-module-dialog";

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

  const loadLicenseDetail = useCallback(async () => {
    try {
      const response = await licenseApi.getById(licenseId);
      const licenseData = response.data;
      setLicense(licenseData);
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

          <AddLicenseModuleDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            licenseId={licenseId}
            onSuccess={handleAddSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
