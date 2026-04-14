"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { type Context } from "../contexts-columns";
import { contextsApi, type ListContextsResponse } from "@/lib/api-client";
import { EditableSection, EditableField } from "@/components/ui/editable-section";

export default function ContextDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const contextId = parseInt(params.id || "0");
  const t = useTranslations("pages");
  const tt = useTranslations("contexts");

  const [context, setContext] = useState<Context | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载context详情
  const loadContextDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      // 从API获取数据
      const response = await contextsApi.get(contextId);
      const foundContext = response.data as any;
      if (foundContext) {
        setContext({
          id: foundContext.id,
          name: foundContext.name,
          description: foundContext.description,
          key: foundContext.identifier || foundContext.key,
          didEnabled: foundContext.hotline_enabled === "1",
        });
      } else {
        setContext(null);
      }
    } catch (error) {
      console.error("Failed to load context detail:", error);
      toast.error(tt("loadFailed"));
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [contextId, tt]);

  // 保存编辑
  const handleSave = useCallback(
    async (formData: any) => {
      if (!context) return false;

      try {
        const updateData = {
          name: formData.name,
          description: formData.description,
          hotline_enabled: formData.didEnabled === tt("yes") ? "1" : "0",
        };
        await contextsApi.update(context.id, updateData);
        const updatedContext: Context = {
          ...context,
          ...formData,
          didEnabled: formData.didEnabled === tt("yes") ? true : false,
        };
        setContext(updatedContext);

        toast.success(tt("updateSuccess"));
        return true;
      } catch (error) {
        console.error("Failed to update context:", error);
        toast.error(tt("updateFailed"));
        return false;
      }
    },
    [context, tt],
  );

  const handleCancel = useCallback(() => {}, []);

  // 返回列表页
  const handleBack = useCallback(() => {
    router.push("/contexts");
  }, [router]);

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadContextDetail();
  }, [router, loadContextDetail]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("contexts")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("loading")}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!context) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("contexts")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">{tt("contextNotFound")}</div>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {tt("backToList")}
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("contexts")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  {/* 面包屑导航 */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/contexts">{t("contexts")}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{context.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <EditableSection
                    title={tt("basicInfo")}
                    defaultValues={{
                      ...context,
                      didEnabled: context.didEnabled ? tt("yes") : tt("no"),
                    }}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  >
                    <EditableField
                      label={tt("id")}
                      name="id"
                      value={context.id}
                      type="text"
                      disabled
                    />

                    <EditableField
                      label={tt("name")}
                      name="name"
                      value={context.name}
                      type="text"
                      required
                    />

                    <EditableField
                      label={tt("description")}
                      name="description"
                      value={context.description || "-"}
                      type="textarea"
                    />

                    <EditableField
                      label={tt("identifier")}
                      name="key"
                      value={context.key}
                      type="text"
                    />

                    <EditableField
                      label={tt("didEnabled")}
                      name="didEnabled"
                      value={context.didEnabled}
                      type="switch"
                      switchCheckedValue={tt("yes")}
                      switchUncheckedValue={tt("no")}
                    />
                  </EditableSection>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
