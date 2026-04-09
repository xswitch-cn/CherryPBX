"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { ListFilterForm, ListTable, ListPagination } from "@/components/ui/list-components";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImportDialog } from "@/components/ui/import-dialog";
import { CreateRouteDialog } from "./components/create-route-dialog";
import { routesApi, Route, ListRoutesQuery, ContextItem } from "@/lib/api-client";
import { createRouteColumns } from "./routes-columns";
import { toast } from "sonner";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function RoutesPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("routes");
  const ttt = useTranslations("table");
  const tc = useTranslations("common");

  const [routes, setRoutes] = useState<Route[]>([]);
  const [destinationTypes, setDestinationTypes] = useState<Array<{ id: number; k: string }>>([]);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<{
    name?: string;
    destType?: string;
  }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const routeColumns = createRouteColumns({
    t: tt,
    tt: ttt,
    tc,
    router,
    onHandleDelete: (route: Route) => {
      setDeleteTarget(route);
      setIsDeleteDialogOpen(true);
    },
    onRefresh: async () => {
      await loadRoutes();
    },
  });

  // 加载路由列表
  const loadRoutes = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      setIsLoading(true);
      try {
        const queryParams: ListRoutesQuery = {
          page,
          perPage: size,
          ...filterParams,
        };

        const response = await routesApi.list(queryParams);
        const responseData = response.data;

        setRoutes(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (error) {
        console.error("Failed to load routes:", error);
        toast.error(tt("loadFailed") || "加载路由列表失败");
        setRoutes([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, filters, tt],
  );

  // 删除网关
  const handleDeleteGateway = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await routesApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess") || "路由删除成功");
      await loadRoutes(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete gateway:", error);
      toast.error(tc("deleteFailed") || "路由删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, currentPage, pageSize, loadRoutes, tc]);

  // 创建路由
  const handleCreateRoute = useCallback(
    async (data: {
      name: string;
      description?: string;
      prefix?: string;
      max_length: string;
      context: string;
      dest_type: string;
    }) => {
      try {
        await routesApi.create(data);
        toast.success(tt("addRouteSuccess") || "路由创建成功");
        // 刷新列表（回到第一页）
        await loadRoutes(1, pageSize, filters);
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create route:", error);
        toast.error(tt("addRouteFailed") || "路由创建失败");
      }
    },
    [loadRoutes, pageSize, filters, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadRoutes(newPage, pageSize, filters);
    },
    [loadRoutes, pageSize, filters],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadRoutes(1, newSize, filters);
    },
    [loadRoutes, filters],
  );

  // 处理筛选
  const handleFilterChange = useCallback(
    (newFilters: { name?: string; destType?: string }) => {
      void loadRoutes(1, pageSize, newFilters);
    },
    [loadRoutes, pageSize],
  );

  const destinationType = async () => {
    const res = await routesApi.getDicts("DEST");
    setDestinationTypes(res.data || []);
  };

  const getContexts = async () => {
    const res = await routesApi.getContexts();
    setContexts(res.data?.data || []);
  };

  // 初始化加载
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadRoutes();
    void destinationType();
    void getContexts();
  }, [router, loadRoutes]);

  // 处理导出路由
  const handleExportUsers = useCallback(async () => {
    const lang = document.documentElement.lang || "zh";

    try {
      const response = await routesApi.download({
        language: lang,
        type: "All Route",
        ...filters,
      });

      const data = response.data as any[];
      data.sort((a: any, b: any) => {
        return a[0] - b[0];
      });

      void import("xlsx").then((XLSX) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...data]);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "users_download.xlsx", { compression: true });
        toast.success("下载成功");
      });
    } catch (error) {
      console.error("Failed to download users:", error);
      toast.error("下载用户失败");
    }
  }, [filters]);

  // 处理导入路由
  const handleImport = async (files: File[]) => {
    if (files.length === 0) {
      toast.error("请选择要导入的文件");
      return;
    }

    setIsImporting(true);
    let hasSuccess = false;
    let hasError = false;

    try {
      // 处理每个文件
      for (const file of files) {
        await new Promise<void>((resolve, _reject) => {
          // 读取并解析Excel文件
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);

          fileReader.onload = async (event) => {
            try {
              const { result } = event.target as FileReader;

              if (!result) {
                throw new Error("文件读取失败");
              }

              // 动态导入xlsx库
              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error("XLSX库加载失败");
              }

              const workbook = XLSX.read(result, { type: "array" });
              let data: any[] = [];

              if (workbook && workbook.Sheets) {
                for (const sheet in workbook.Sheets) {
                  if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
                      raw: false,
                    });
                    data = data.concat(sheetData);
                  }
                }
              }

              // 发送数据到服务器
              const response = await routesApi.upload({ routes: data });

              toast.success(
                `文件 ${file.name} 导入成功: ${(response as any).data?.data?.length || 0} 项`,
              );
              hasSuccess = true;
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`文件 ${file.name} 导入失败: 文件解析错误`);
              hasError = true;
              resolve(); // 继续处理下一个文件
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`文件 ${file.name} 读取失败`);
            hasError = true;
            resolve(); // 继续处理下一个文件
          };
        });
      }

      // 只有全部成功时才关闭弹窗并刷新列表
      if (hasSuccess && !hasError) {
        setIsImportModalOpen(false);
        // 刷新路由列表
        await loadRoutes(currentPage, pageSize, filters);
      } else if (hasSuccess && hasError) {
        // 部分成功，刷新列表但不关闭弹窗
        await loadRoutes(currentPage, pageSize, filters);
      }
      // 如果全部失败，保持弹窗打开，不刷新列表
    } catch (error) {
      console.error("Failed to import routes:", error);
      toast.error("导入失败: 网络错误");
      // 网络错误时保持弹窗打开
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("routes")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  {/* 筛选表单 */}
                  <ListFilterForm
                    fields={[
                      {
                        name: "name",
                        type: "search",
                        placeholder: tt("searchRoutes"),
                        width: "200px",
                      },
                      {
                        name: "destType",
                        type: "select",
                        label: tt("destinationType"),
                        options: destinationTypes.map((item) => ({
                          value: item.k,
                          label: tt(item.k),
                        })),
                        width: "180px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      name: filters.name || "",
                      destType: filters.destType || "",
                    }}
                    translationPrefix="routes"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => void handleExportUsers()}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        导出
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        导入
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addRoute")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<Route>
                    columns={routeColumns}
                    data={routes}
                    isLoading={isLoading}
                    selection
                    emptyText={tt("noRoutes") || "暂无路由数据"}
                    loadingText={tt("loading") || "加载中..."}
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

      {/* 新增路由 */}
      <CreateRouteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRoute}
        contexts={contexts}
        destinationTypes={destinationTypes}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("deleteRoute")}
        description={tc("DeleteItem", { item: deleteTarget?.name ? deleteTarget?.name : "" })}
        onSubmit={handleDeleteGateway}
        deleteText={tc("confirm") || "确定"}
        cancelText={tc("cancel") || "取消"}
        isLoading={isDeleting}
      />

      {/* 导入弹窗 */}
      <ImportDialog
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        title="导入"
        accept=".xlsx, .xls"
        acceptDescription="仅支持.xls和.xlsx文件"
        onImport={handleImport}
        isLoading={isImporting}
      />
    </SidebarProvider>
  );
}
