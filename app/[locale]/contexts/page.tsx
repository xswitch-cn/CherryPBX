"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ListTable, ListPagination } from "@/components/ui/list-components";
import { toast } from "sonner";
import { type Context, createContextColumns } from "./contexts-columns";
import {
  CreateContextDialog,
  DeleteContextDialog,
  CreateContextFormData,
} from "./components/contexts-table";
import { contextsApi, type ListContextsQuery, type ListContextsResponse } from "@/lib/api-client";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function ContextsPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("contexts");
  const ttt = useTranslations("table");

  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);

  // 加载上下文列表
  const loadContexts = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListContextsQuery = {
          page,
          perPage: size,
        };

        const response = await contextsApi.list(queryParams);
        const responseData = response.data as ListContextsResponse;

        // 转换数据格式，确保类型一致
        const formattedContexts = (responseData.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          key: item.identifier,
          didEnabled: item.hotline_enabled === "1",
        }));

        setContexts(formattedContexts);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(Math.ceil((responseData.rowCount || 0) / size) || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load contexts:", error);
        toast.error(tt("loadFailed"));
        setContexts([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  const handleDeleteContext = useCallback((context: Context) => {
    setSelectedContext(context);
    setIsDeleteOpen(true);
  }, []);

  // 处理切换DID启用状态
  const handleToggleDid = useCallback(
    (context: Context, enabled: boolean) => {
      void (async () => {
        try {
          await contextsApi.toggle(context.id);
          setContexts((prev) =>
            prev.map((c) => (c.id === context.id ? { ...c, didEnabled: enabled } : c)),
          );
          toast.success(tt("updateSuccess"));
        } catch (error) {
          console.error("Failed to toggle did:", error);
          toast.error(tt("updateFailed"));
        }
      })();
    },
    [tt],
  );

  // 创建context
  const handleCreate = useCallback(
    async (data: CreateContextFormData) => {
      try {
        await contextsApi.create(data);
        toast.success(tt("addSuccess"));
        await loadContexts(1, pageSize);
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create context:", error);
        toast.error(tt("addFailed"));
        throw new Error("create failed");
      }
    },
    [loadContexts, pageSize, tt],
  );

  // 删除context
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await contextsApi.delete(id);
        toast.success(tt("deleteSuccess"));
        // 刷新列表（保持当前页）
        await loadContexts(currentPage, pageSize);
        setIsDeleteOpen(false);
        setSelectedContext(null);
      } catch (error) {
        console.error("Failed to delete context:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [loadContexts, currentPage, pageSize, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadContexts(newPage, pageSize);
    },
    [loadContexts, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadContexts(1, newSize);
    },
    [loadContexts],
  );

  // 列配置
  const contextColumns = useMemo(
    () =>
      createContextColumns({
        t: tt,
        tt: ttt,
        onDelete: handleDeleteContext,
        onToggleDid: (context, enabled) => handleToggleDid(context, enabled),
      }),
    [tt, ttt, handleDeleteContext, handleToggleDid],
  );

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadContexts();
  }, [router, loadContexts]);

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
                  <div className="flex items-center justify-end">
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addContext")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<Context>
                    columns={contextColumns}
                    data={contexts}
                    isLoading={isLoading}
                    emptyText={tt("noContexts")}
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

      {/* 新增弹窗 */}
      <CreateContextDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {/* 删除弹窗 */}
      <DeleteContextDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        context={selectedContext}
        onSubmit={handleDelete}
      />
    </SidebarProvider>
  );
}
