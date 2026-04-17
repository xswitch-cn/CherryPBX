"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon, UploadIcon, CloudUploadIcon } from "lucide-react";
import { ListTable, ListPagination } from "@/components/ui/list-components";
import { toast } from "sonner";
import { type Blacklist, createBlacklistColumns } from "./blacklist-columns";
import {
  CreateBlacklistDialog,
  DeleteBlacklistDialog,
  CreateBlacklistFormData,
} from "./components/blacklist-table";
import {
  blacklistsApi,
  type ListBlacklistsQuery,
  type ListBlacklistsResponse,
} from "@/lib/api-client";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

// Mock data for Blacklist
const mockBlacklistData = [
  {
    id: 1,
    name: "test",
    description: "test",
    listType: "黑名单",
    userType: "主叫",
  },
];

export default function BlacklistPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("blacklist");
  const ttt = useTranslations("table");

  const [blacklists, setBlacklists] = useState<Blacklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [selectedBlacklist, setSelectedBlacklist] = useState<Blacklist | null>(null);

  // 加载黑白名单列表
  const loadBlacklists = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListBlacklistsQuery = {
          page,
          perPage: size,
        };

        const response = await blacklistsApi.list(queryParams);
        const responseData = response.data as ListBlacklistsResponse;

        // 转换数据格式，确保类型一致
        const formattedBlacklists = (responseData.data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          listType: item.list_type,
          userType: item.limit_user_type,
        }));

        setBlacklists(formattedBlacklists);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(Math.ceil((responseData.rowCount || 0) / size) || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load blacklists:", error);
        toast.error(tt("loadFailed"));
        setBlacklists([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  const handleDeleteBlacklist = useCallback((blacklist: Blacklist) => {
    setSelectedBlacklist(blacklist);
    setIsDeleteOpen(true);
  }, []);

  // 创建黑白名单
  const handleCreate = useCallback(
    async (data: CreateBlacklistFormData) => {
      try {
        // 转换参数名称为 API 所需的格式
        const apiData = {
          name: data.name,
          description: data.description,
          list_type: data.listType,
          limit_user_type: data.userType,
        };
        await blacklistsApi.create(apiData);
        toast.success(tt("addSuccess"));
        await loadBlacklists(1, pageSize);
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create blacklist:", error);
        toast.error(tt("addFailed"));
        throw new Error("create failed");
      }
    },
    [loadBlacklists, pageSize, tt],
  );

  // 删除黑白名单
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await blacklistsApi.delete(id);
        toast.success(tt("deleteSuccess"));
        // 刷新列表（保持当前页）
        await loadBlacklists(currentPage, pageSize);
        setIsDeleteOpen(false);
        setSelectedBlacklist(null);
      } catch (error) {
        console.error("Failed to delete blacklist:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [loadBlacklists, currentPage, pageSize, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadBlacklists(newPage, pageSize);
    },
    [loadBlacklists, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadBlacklists(1, newSize);
    },
    [loadBlacklists],
  );

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  // 处理导入
  const handleImport = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  // 处理导入文件
  const handleImportFiles = useCallback(async () => {
    // 处理文件上传
    if (importFiles.length === 0) {
      toast.error(ttt("selectFileError"));
      return;
    }

    try {
      // 处理每个文件
      for (const file of importFiles) {
        await new Promise<void>((resolve, _reject) => {
          // 读取并解析Excel文件
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);

          fileReader.onload = async (event) => {
            try {
              const { result } = event.target as FileReader;

              if (!result) {
                throw new Error(tt("importFailed"));
              }

              // 动态导入xlsx库
              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error(tt("importFailed"));
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
              await blacklistsApi.import({ lists: data });

              toast.success(`文件 ${file.name} 导入成功: ${data.length} 项`);
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`文件 ${file.name} 导入失败: 文件解析错误`);
              resolve(); // 继续处理下一个文件
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`文件 ${file.name} 读取失败`);
            resolve(); // 继续处理下一个文件
          };
        });
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
      // 刷新黑白名单列表
      await loadBlacklists(1, pageSize);
    } catch (error) {
      console.error("Failed to import blacklists:", error);
      toast.error("导入失败: 网络错误");
    }
  }, [importFiles, loadBlacklists, pageSize, tt, ttt]);

  // 处理导出
  const handleExport = useCallback(async () => {
    try {
      const lang = localStorage.getItem("xui.lang") || undefined;
      const response = await blacklistsApi.download(lang);
      const data = response.data;

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(Array.isArray(data) ? data : [data]);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "blacklists_download.xlsx", { compression: true });
      toast.success(tt("exportSuccess"));
    } catch (error) {
      console.error("Failed to export blacklists:", error);
      toast.error(tt("exportFailed"));
    }
  }, [tt]);

  // 列配置
  const blacklistColumns = useMemo(
    () =>
      createBlacklistColumns({
        t: tt,
        tt: ttt,
        onDelete: handleDeleteBlacklist,
      }),
    [tt, ttt, handleDeleteBlacklist],
  );

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadBlacklists();
  }, [router, loadBlacklists]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("blacklist")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleImport}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {tt("import")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void handleExport()}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        {tt("export")}
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addBlacklist")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<Blacklist>
                    columns={blacklistColumns}
                    data={blacklists}
                    isLoading={isLoading}
                    emptyText={tt("noBlacklists")}
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
      <CreateBlacklistDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {/* 删除弹窗 */}
      <DeleteBlacklistDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        blacklist={selectedBlacklist}
        onSubmit={handleDelete}
      />

      {/* 导入弹窗 */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{ttt("importTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border border-dashed rounded-lg p-10 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
                }
              }}
            >
              <CloudUploadIcon className="mx-auto h-16 w-16 text-primary mb-6" />
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {ttt("dragFiles")}
                  <Button
                    variant="default"
                    className="ml-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {ttt("selectFile")}
                  </Button>
                </p>
                <p className="text-xs text-gray-500">{ttt("fileFormatHint")}</p>
              </div>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
            </div>

            {importFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {importFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md">
                    <div className="flex items-center gap-2">
                      <CloudUploadIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      {ttt("deleteFile")}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFiles([]);
                }}
              >
                {ttt("closeImport")}
              </Button>
              <Button
                onClick={() => void handleImportFiles()}
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={importFiles.length === 0}
              >
                {ttt("submitImport")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
