"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { ListTable } from "@/components/ui/list-components";
import { Button } from "@/components/ui/button";
import { sipApi } from "@/lib/api-client";
import { type Sip, type CreateSipRequest } from "@repo/api-client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { EditableTable } from "@/components/ui/editable-table";
import { CreateSipDialog } from "./components/create-sip-dialog";
import { createSipColumns } from "./sip-columns";

export default function SipPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const ts = useTranslations("sip");
  const tc = useTranslations("common");

  const [sips, setSips] = useState<Sip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sipParams, setSipParams] = useState<any[]>([]);
  const [type, setType] = useState<string>("");

  const sipColumns = createSipColumns({
    t,
    ts,
    tc,
    onRefresh: async () => {
      await loadSips();
    },
    router,
    onHandleDelete: (sip: Sip) => {
      setDeleteTarget(sip);
      setIsDeleteDialogOpen(true);
    },
  });

  // 加载数据列表
  const loadSips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sipApi.list();
      const sipParamsResponse = await sipApi.getSipParams();
      const sipUrlResponse: any = await sipApi.getUrlList();
      const profiles: any = sipUrlResponse?.data?.profiles;
      const responseData =
        response?.data?.map((item) => {
          return {
            ...item,
            url: profiles?.[item?.name]?.info?.url || "",
            state: profiles?.[item?.name]?.status?.state || "",
          };
        }) || [];
      const sipParamsData: any = sipParamsResponse.data;
      setSipParams(sipParamsData.data || []);
      setSips(responseData || []);
    } catch (error) {
      console.error("Failed to load sips:", error);
      toast.error(tc("loadFailed"));
      setSips([]);
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");

    void loadSips();
  }, [router, loadSips]);

  // 删除数据
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await sipApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadSips();
    } catch (error) {
      console.error("Failed to delete sip:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadSips, tc]);

  const handleCreatesip = useCallback(
    async (_data: CreateSipRequest) => {
      try {
        if (type === "param") {
          await sipApi.createParam({ ..._data, realm: "SOFIAGLOBALS" });
        } else {
          await sipApi.create(_data);
        }
        toast.success(tc("createSuccess"));
        await loadSips();
      } catch (error) {
        throw error;
      }
    },
    [loadSips, tc, type],
  );

  const handleVariableChange = async (key: string, rowData: any) => {
    try {
      await sipApi.editParams(
        key === "disabled"
          ? { action: "toggle", id: rowData.id }
          : {
              id: rowData.id,
              k: rowData.k,
              v: rowData.v,
            },
      );
      toast.success(tc("saveSuccess"));
      await loadSips();
    } catch (error) {
      console.error("Failed to update variable:", error);
      toast.error(tc("saveFailed"));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("sip")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div />
            <Button
              size="sm"
              onClick={() => {
                setType("sip");
                setIsCreateDialogOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {ts("addSip")}
            </Button>
          </div>

          {/* 表格 */}
          <ListTable<Sip>
            columns={sipColumns}
            data={sips}
            isLoading={isLoading}
            emptyText={tc("noData") || "暂无数据"}
            loadingText={tc("loading") || "加载中..."}
            translationPrefix="table"
          />

          <CollapsibleSection
            title={ts("SIP Global Params")}
            renderContent={() => (
              <>
                <div className="flex items-center justify-between">
                  <div />
                  <Button
                    size="sm"
                    onClick={() => {
                      setType("param");
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    {tc("add")}
                  </Button>
                </div>
                <EditableTable
                  columns={[
                    { key: "id", header: "ID" },
                    { key: "k", header: tc("name"), type: "text" },
                    { key: "v", header: tc("value"), type: "text" },
                    { key: "disabled", header: tc("enabled"), type: "switch" },
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
                  data={sipParams || []}
                  switchCheckedValue={"0"}
                  switchUncheckedValue={"1"}
                  onDelete={(v) => {
                    void sipApi.deleteParams(v.id);
                  }}
                  onChange={({ key, rowData }) => {
                    void handleVariableChange(key, rowData);
                  }}
                />
              </>
            )}
          />

          {/* 新增 */}
          <CreateSipDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreatesip}
            sips={sips}
            type={type}
          />

          {/* 删除确认对话框 */}
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={ts("deleteSip")}
            description={tc("DeleteItem", { item: deleteTarget?.name ? deleteTarget?.name : "" })}
            onSubmit={handleDelete}
            deleteText={tc("confirm") || "确定"}
            cancelText={tc("cancel") || "取消"}
            isLoading={isDeleting}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
