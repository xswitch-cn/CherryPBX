"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { timeRulesApi, type TimeRule } from "@/lib/api-client";
import { CommonBreadcrumb } from "@/components/ui/common-breadcrumb";
import { EditableSection, EditableField } from "@/components/ui/editable-section";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { TimeRecurrence } from "@/components/xtools/time-recurrence";

export default function TimeRuleDetailPage() {
  const router = useRouter();
  const { id: timeRuleId } = useParams();
  const t = useTranslations("pages");
  const tt = useTranslations("timeRules");
  const ttt = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [timeRule, setTimeRule] = useState<
    (TimeRule & { time_recurrences?: Array<{ id: number; time_recurrence: string }> }) | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 加载时间规则详情
  useEffect(() => {
    const loadTimeRule = async () => {
      if (!timeRuleId) return;

      try {
        setLoading(true);
        const response = await timeRulesApi.getById(parseInt(timeRuleId as string, 10));
        setTimeRule(response.data);
      } catch (error) {
        console.error("Failed to load time rule:", error);
        toast.error(tt("failedToFetchRule") || "加载时间规则失败");
      } finally {
        setLoading(false);
      }
    };

    void loadTimeRule();
  }, [timeRuleId, tt]);

  // 刷新时间规则详情
  const refreshTimeRule = async () => {
    if (!timeRuleId) return;

    try {
      setLoading(true);
      const response = await timeRulesApi.getById(parseInt(timeRuleId as string, 10));
      setTimeRule(response.data);
    } catch (error) {
      console.error("Failed to refresh time rule:", error);
      toast.error(tt("failedToFetchRule") || "加载时间规则失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理删除时间规则
  const handleDelete = async () => {
    if (!timeRule) return;

    try {
      await timeRulesApi.delete([timeRule.id]);
      toast.success(tt("deleteRuleSuccess") || "时间规则删除成功");
      router.push("/time-rules");
    } catch (error: any) {
      console.error("Failed to delete time rule:", error);
      toast.error(
        `${tt("deleteRuleFailed") || "时间规则删除失败"}: ${error?.message || error?.text || error}`,
      );
    }
  };

  // 处理更新时间规则
  const handleUpdateTimeRule = async (data: any) => {
    if (!timeRuleId) return;

    try {
      // 确保name字段存在
      if (!data.name) {
        throw new Error(tt("nameRequired") || "规则名称不能为空");
      }
      const putData = [
        {
          id: Number(timeRuleId),
          name: data.name,
          description: data.description,
        },
      ];
      await timeRulesApi.updateById(putData as any);
      toast.success(tt("saveSuccess") || "保存成功");
      await refreshTimeRule();
    } catch (error: any) {
      console.error("Failed to update time rule:", error);
      toast.error(`${tt("saveFailed") || "保存失败"}: ${error?.message || error?.text || error}`);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("timeRules")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-muted-foreground">{ttt("loading") || "加载中..."}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!timeRule) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title={t("timeRules")} />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-muted-foreground">{tt("ruleNotFound") || "时间规则不存在"}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("timeRules")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CommonBreadcrumb
                  items={[
                    { label: t("timeRules"), href: "/time-rules" },
                    {
                      label: timeRule.name,
                      href: `/${document.documentElement.lang || "zh"}/time-rules/${timeRule.id}`,
                    },
                  ]}
                />

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{timeRule.name}</h1>
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        {ttt("delete") || "删除"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    <EditableSection
                      title={tt("basicInfo")}
                      defaultValues={{ name: timeRule.name, description: timeRule.description }}
                      onSave={async (data) => void handleUpdateTimeRule(data)}
                    >
                      <EditableField label={tt("ruleName")} value={timeRule.name} name="name" />
                      <EditableField
                        label={tt("description")}
                        value={timeRule.description}
                        name="description"
                      />
                    </EditableSection>

                    <TimeRecurrence
                      templateId={timeRule.id}
                      time_recurrences={timeRule.time_recurrences || []}
                      onRefresh={() => void refreshTimeRule()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("deleteRule") || "删除规则"}
        description={
          tt("deleteRuleConfirm", { name: timeRule.name }) ||
          `确定要删除规则 "${timeRule.name}" 吗？`
        }
        onSubmit={handleDelete}
      />
    </SidebarProvider>
  );
}
