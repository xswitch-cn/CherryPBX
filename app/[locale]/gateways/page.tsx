"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ListTable, ListPagination } from "@/components/ui/list-components";
import { gatewaysApi } from "@/lib/api-client";
import { type Gateway, type ListGatewaysQuery, type CreateGatewayRequest } from "@repo/api-client";
import { createGatewaysColumns } from "./gateways-columns";
import { CreateGatewayDialog } from "./components/create-gateway-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function GatewaysPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("gateways");
  const tc = useTranslations("common");

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Gateway | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const gatewayColumns = createGatewaysColumns({
    t: tt,
    tt,
    tc,
    onRefresh: async () => {
      await loadGateways();
    },
    router,
    onHandleDelete: (gateway: Gateway) => {
      setDeleteTarget(gateway);
      setIsDeleteDialogOpen(true);
    },
  });

  // 加载网关列表
  const loadGateways = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListGatewaysQuery = {
          page,
          perPage: size,
        };
        const res = await gatewaysApi.getGateways();
        const res1 = await gatewaysApi.getGateways1();

        const gatewayList: any = res?.data || [];
        const gatewayList1: any = res1?.data || [];

        // 构建映射表
        const statusMap = new Map<string, any>();
        gatewayList.forEach((item: any) => {
          if (item.gwname) {
            statusMap.set(item.gwname, { gwstatus: item.gwstatus });
          }
        });

        const stateMap = new Map<string, any>();
        gatewayList1.forEach((item: any) => {
          if (item.name) {
            stateMap.set(item.name, {
              gateway_state: item.gateway_state,
              gateway_status: item.gateway_status,
            });
          }
        });

        if (gatewayList.length > 0) {
          const response = await gatewaysApi.list(queryParams);
          const responseData = response.data;

          const updatedGateways = responseData.data.map((gateway) => {
            const mergedData: any = { ...gateway };
            if (statusMap.has(gateway.name)) {
              Object.assign(mergedData, statusMap.get(gateway.name));
            }
            if (stateMap.has(gateway.name)) {
              Object.assign(mergedData, stateMap.get(gateway.name));
            }
            return mergedData;
          });

          setGateways(updatedGateways || []);
          setTotalCount(responseData.rowCount || 0);
          setPageCount(responseData.pageCount || 0);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (error) {
        console.error("Failed to load gateways:", error);
        toast.error(tt("loadFailed") || "加载网关列表失败");
        setGateways([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  // 删除网关
  const handleDeleteGateway = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await gatewaysApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess") || "网关删除成功");
      await loadGateways(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete gateway:", error);
      toast.error(tc("deleteFailed") || "网关删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, currentPage, pageSize, loadGateways, tc]);

  const handleCreateGateway = useCallback(
    async (_data: CreateGatewayRequest) => {
      try {
        await gatewaysApi.create(_data);
        toast.success(tt("addGatewaySuccess"));
        // 刷新列表（回到第一页）
        await loadGateways(1, pageSize);
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create gateway:", error);
        toast.error(tt("addGatewayFailed"));
      }
    },
    [loadGateways, pageSize, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadGateways(newPage, pageSize);
    },
    [loadGateways, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadGateways(1, newSize);
    },
    [loadGateways],
  );

  // 初始化加载
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadGateways();
  }, [router, loadGateways]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("gateways")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div />
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addGateway")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<Gateway>
                    columns={gatewayColumns}
                    data={gateways}
                    isLoading={isLoading}
                    selection
                    emptyText={tt("noGateways") || "暂无网关数据"}
                    loadingText={tc("loading") || "加载中..."}
                    translationPrefix="table"
                  />

                  {/* 分页 */}
                  <ListPagination
                    currentPage={currentPage}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    translationPrefix="table"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* 新增网关 */}
      <CreateGatewayDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateGateway}
        gateways={gateways}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("deleteGateway")}
        description={tc("DeleteItem", { item: deleteTarget?.name ? deleteTarget?.name : "" })}
        onSubmit={handleDeleteGateway}
        deleteText={tc("confirm") || "确定"}
        cancelText={tc("cancel") || "取消"}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  );
}
