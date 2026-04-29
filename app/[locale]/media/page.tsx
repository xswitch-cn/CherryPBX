"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ListFilterForm, ListTable, ListPagination } from "@/components/ui/list-components";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ImportDialog } from "@/components/ui/import-dialog";
import { mediasApi } from "@/lib/api-client";
import { type Media, type ListMediasQuery } from "@repo/api-client";
import { createMediaColumns } from "./media-columns";
import { toast } from "sonner";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function MediasPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tm = useTranslations("media");
  const ttt = useTranslations("table");
  const tc = useTranslations("common");

  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<{
    name?: string;
    destType?: string;
  }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedMedias, setSelectedMedias] = useState<any[]>([]);

  console.log(selectedMedias, "//...selectedMedias");

  const mediaColumns = createMediaColumns({
    t: tm,
    tt: ttt,
    tc,
    router,
    onHandleDelete: (media: Media) => {
      setDeleteTarget(media);
      setIsDeleteDialogOpen(true);
    },
    onRefresh: async () => {
      await loadMedias();
    },
  });

  // 加载列表
  const loadMedias = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      setIsLoading(true);
      try {
        const queryParams: ListMediasQuery = {
          page,
          perPage: size,
          ...filterParams,
        };

        const response = await mediasApi.list(queryParams);
        const responseData = response.data;

        setMedias(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (error) {
        console.error("Failed to load medias:", error);
        toast.error(tm("loadFailed") || "加载列表失败");
        setMedias([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, filters, tm],
  );

  // 删除
  const handleDeleteGateway = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // await mediasApi.delete(deleteTarget.id);
      // toast.success(tc("deleteSuccess") || "路由删除成功");
      // await loadMedias(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete gateway:", error);
      toast.error(tc("deleteFailed") || "路由删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, currentPage, pageSize, loadMedias, tc]);

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadMedias(newPage, pageSize, filters);
    },
    [loadMedias, pageSize, filters],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadMedias(1, newSize, filters);
    },
    [loadMedias, filters],
  );

  // 处理筛选
  const handleFilterChange = useCallback(
    (newFilters: { name?: string; destType?: string }) => {
      void loadMedias(1, pageSize, newFilters);
    },
    [loadMedias, pageSize],
  );

  // 初始化加载
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadMedias();
  }, [router, loadMedias]);

  // 处理导出
  // const handleExportUsers = useCallback(async () => {
  //   const lang = document.documentElement.lang || "zh";

  //   try {
  //     const response = await mediasApi.download({
  //       language: lang,
  //       type: "All Route",
  //       ...filters,
  //     });

  //     const data = response.data as any[];
  //     data.sort((a: any, b: any) => {
  //       return a[0] - b[0];
  //     });

  //     void import("xlsx").then((XLSX) => {
  //       const wb = XLSX.utils.book_new();
  //       const ws = XLSX.utils.aoa_to_sheet([...data]);
  //       XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  //       XLSX.writeFile(wb, "users_download.xlsx", { compression: true });
  //       toast.success("下载成功");
  //     });
  //   } catch (error) {
  //     console.error("Failed to download users:", error);
  //     toast.error("下载用户失败");
  //   }
  // }, [filters]);

  // 处理导入
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
              // const response = await mediasApi.upload({ medias: data });

              // toast.success(
              //   `文件 ${file.name} 导入成功: ${(response as any).data?.data?.length || 0} 项`,
              // );
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
        // 刷新列表
        await loadMedias(currentPage, pageSize, filters);
      } else if (hasSuccess && hasError) {
        // 部分成功，刷新列表但不关闭弹窗
        await loadMedias(currentPage, pageSize, filters);
      }
      // 如果全部失败，保持弹窗打开，不刷新列表
    } catch (error) {
      console.error("Failed to import medias:", error);
      toast.error("导入失败: 网络错误");
      // 网络错误时保持弹窗打开
    } finally {
      setIsImporting(false);
    }
  };

  // 处理选择变化
  const handleSelectionChange = useCallback((selected: Media[]) => {
    setSelectedMedias(selected);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("media")} />
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
                        placeholder: tm("name"),
                        width: "200px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      name: filters.name || "",
                      destType: filters.destType || "",
                    }}
                  />

                  {/* <div className="flex items-center justify-between">
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
                      <Button size="sm" onClick={() => setIsBatchSettingsOpen(true)}>
                        批量设置
                      </Button>
                    </div>
                  </div> */}

                  {/* 表格 */}
                  <ListTable<Media>
                    columns={mediaColumns}
                    data={medias}
                    isLoading={isLoading}
                    selection
                    onSelectionChange={(selected) => handleSelectionChange(selected as Media[])}
                    emptyText={tc("noActions") || "暂无数据"}
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

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tm("deleteMedia")}
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
