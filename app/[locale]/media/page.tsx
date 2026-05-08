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
import { CustomTypeDialog } from "./components/custom-type-dialog";
import { mediaFilesApi, routesApi } from "@/lib/api-client";
import { type MediaFile, type ListMediaFilesQuery, type DictItem } from "@repo/api-client";
import { createMediaColumns } from "./media-columns";
import { toast } from "sonner";
import { UploadIcon, PlusIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddActionDialog } from "./components/add-action-dialog";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function MediasPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tm = useTranslations("media");
  const ttt = useTranslations("table");
  const tc = useTranslations("common");

  const [medias, setMedias] = useState<MediaFile[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCustomTypeDialogOpen, setIsCustomTypeDialogOpen] = useState(false);
  const [selectedMedias, setSelectedMedias] = useState<MediaFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customTypes, setCustomTypes] = useState<DictItem[]>([]);
  const [type, setType] = useState<string>("");
  const [liveCheck, setLiveCheck] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const mediaColumns = createMediaColumns({
    t: tm,
    tt: ttt,
    tc,
    router,
    onHandleDelete: (media: MediaFile) => {
      setDeleteTarget(media);
      setIsDeleteDialogOpen(true);
    },
    onRefresh: async () => {
      await loadCustomTypes();
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
        const queryParams: ListMediaFilesQuery = {
          page,
          perPage: size,
          ...filterParams,
        };

        const response = await mediaFilesApi.list(queryParams);
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
      await mediaFilesApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess"));
      await loadMedias(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error(tc("deleteFailed"));
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

  // 加载自定义类型列表
  const loadCustomTypes = async () => {
    const response = await routesApi.getDicts("MFILE_TYPE");
    setCustomTypes(response.data || []);
  };

  // 检查定期删除状态
  const checkLiveStatus = async () => {
    const response = await mediaFilesApi.checkLiveStatus();
    setLiveCheck(response.data.msg === "Already Running");
  };

  // 初始化加载
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadMedias();
    void loadCustomTypes();
    void checkLiveStatus();
  }, [router, loadMedias]);

  // 处理导入
  const handleImport = async (files: File[]) => {
    if (files.length === 0) {
      toast.error(tm("selectFile") || "请选择要导入的文件");
      return;
    }

    setIsImporting(true);

    try {
      // 使用 FormData 上传所有文件
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      await mediaFilesApi.upload(formData);

      toast.success(tc("uploadSuccess") || `成功上传 ${files.length} 个文件`);

      // 刷新列表
      await loadMedias(currentPage, pageSize, filters);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Failed to upload media files:", error);
      toast.error(tm("uploadFailed") || "上传失败");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      if (type === "tts") {
        await mediaFilesApi.addTts(data);
      } else {
        await mediaFilesApi.regularDelete(data);
        void checkLiveStatus();
      }
      toast.success(tc("createSuccess"));
      // await loadMedias(1, pageSize, filters);
    } catch (error) {
      console.error("Failed to create media:", error);
      toast.error(tc("createFailed"));
    }
  };

  // 取消定期删除
  const handleCancelRegularDelete = async () => {
    setIsCanceling(true);
    try {
      await mediaFilesApi.cancelRegularDelete();
      toast.success(tm("Cancel Regular Delete Successfully"));
      setLiveCheck(false);
    } catch (error) {
      console.error("Failed to cancel regular delete:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  // 处理批量下载
  const handleBatchDownload = async () => {
    if (selectedMedias.length === 0) {
      toast.info(tc("pleaseSelectDownload") || "请选择要下载的文件");
      return;
    }

    if (selectedMedias.length > 10) {
      toast.info(tc("batchDownloadHint") || "批量下载数量较多，请耐心等待");
    }

    setIsDownloading(true);

    try {
      // 逐个下载文件
      for (const media of selectedMedias) {
        const ext = media.ext || "mp3";
        const src = `/api/media_files/${media.id}.${ext}`;

        // 格式化日期
        const createdAt = media.created_at || "";
        const dateStr = createdAt
          ? new Date(createdAt).toISOString().slice(0, 19).replace(/[T:]/g, "-")
          : "";

        // 构建文件名
        let fileName = media.name || `media_${media.id}`;
        if (!fileName.endsWith(`.${ext}`)) {
          fileName += `.${ext}`;
        }

        // 下载文件
        const downloadLink = document.createElement("a");
        downloadLink.href = src;
        downloadLink.download = dateStr ? `${dateStr}-${fileName}` : fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // 每个下载之间稍微延迟，避免浏览器阻止多个下载
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Failed to download files:", error);
      toast.error(tc("downloadFailed") || "下载失败");
    } finally {
      setIsDownloading(false);
    }
  };

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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {tc("upload files") || "上传文件"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomTypeDialogOpen(true)}
                      >
                        {tm("customType")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setType("tts");
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        TTS
                      </Button>
                      {!liveCheck ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setType("delete");
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          {tm("Regular Delete")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleCancelRegularDelete()}
                          disabled={isCanceling}
                        >
                          {tm("Cancel Regular Delete")}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedMedias.length === 0 || isDownloading}
                        onClick={() => void handleBatchDownload()}
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        {tc("export") || "导出"}
                      </Button>
                    </div>
                  </div>

                  {/* 表格 */}
                  <ListTable<MediaFile>
                    columns={mediaColumns}
                    data={medias}
                    isLoading={isLoading}
                    selection
                    onSelectionChange={setSelectedMedias}
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
        title={tc("upload files") || "上传文件"}
        accept="*/*"
        onImport={handleImport}
        isLoading={isImporting}
      />

      {/* 新增T */}
      <AddActionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        type={type}
      />

      {/* 自定义类型管理 */}
      <CustomTypeDialog
        open={isCustomTypeDialogOpen}
        onOpenChange={setIsCustomTypeDialogOpen}
        onRefresh={() => void loadCustomTypes()}
        customTypes={customTypes}
      />
    </SidebarProvider>
  );
}
