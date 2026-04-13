"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon, UploadIcon, ChevronDownIcon } from "lucide-react";
import { ListFilterForm, ListPagination } from "@/components/ui/list-components";
import { ExtensionsTable } from "./components/extensions-table";
import { CreateExtensionDialog } from "./components/create-extension-dialog";
import { toast } from "sonner";
import { type User } from "@repo/api-client";
import {
  extensionsApi,
  routesApi,
  usersApi,
  type Extension,
  type ListExtensionsQuery,
  type ContextItem,
} from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CloudUploadIcon } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function ExtensionsPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("extensions");
  const ttt = useTranslations("common");

  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [filters, setFilters] = useState<{
    extn?: string;
    name?: string;
    status?: string;
  }>({
    extn: "",
    name: "",
    status: "",
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadExtensions = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      try {
        const queryParams: ListExtensionsQuery = {
          page,
          page_size: size,
        };

        if (filterParams.extn) queryParams.extn = filterParams.extn;
        if (filterParams.name) queryParams.name = filterParams.name;
        if (filterParams.status && filterParams.status !== "all")
          queryParams.status = filterParams.status;

        const response = await extensionsApi.list(queryParams);
        console.log("extensions response:", response);
        const responseData = response.data;

        setExtensions(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (err) {
        console.error("Failed to fetch extensions:", err);
        toast.error(tt("failedToFetchExtensions") || "加载分机失败");
        setExtensions([]);
        setTotalCount(0);
        setPageCount(0);
      }
    },
    [currentPage, pageSize, filters, tt],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadExtensions(newPage, pageSize, filters);
    },
    [loadExtensions, pageSize, filters],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadExtensions(1, newSize, filters);
    },
    [loadExtensions, filters],
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      // 避免重复调用
      if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
        return;
      }

      setFilters(newFilters);
      void loadExtensions(1, pageSize, newFilters);
      console.log("Filter changed:", newFilters);
    },
    [loadExtensions, pageSize, filters],
  );

  const handleDataChange = useCallback(() => {
    void loadExtensions(currentPage, pageSize, filters);
  }, [loadExtensions, currentPage, pageSize, filters]);

  const loadContexts = useCallback(async () => {
    try {
      const response = await routesApi.getContexts();
      setContexts(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load contexts:", error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = (await usersApi.list({ perPage: 100, hpack: false })) as any;
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  // 创建分机
  const handleCreateExtension = useCallback(
    async (data: {
      name: string;
      extn: string;
      password: string;
      context: string;
      login: string;
    }) => {
      try {
        const user = users.find((u) => u.login === data.login);
        if (!user) {
          throw new Error("用户不存在");
        }

        const createData = {
          name: data.name,
          extn: data.extn,
          password: data.password,
          context: data.context,
          user_id: parseInt(user.id, 10),
        };
        await extensionsApi.create(createData);
        toast.success(tt("addExtensionSuccess") || "分机创建成功");
        await loadExtensions(1, pageSize, filters);
        setIsCreateDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to create extension:", error);
        toast.error(
          `${tt("addExtensionFailed") || "分机创建失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [loadExtensions, pageSize, filters, tt, users],
  );

  // 导出分机
  const handleExportExtensions = useCallback(
    async (fileType?: string) => {
      const search_extn_status =
        filters.status === "online" || filters.status === "offline" ? filters.status : "all";
      const lang = document.documentElement.lang || "zh";

      try {
        const response = await extensionsApi.download({
          status: search_extn_status,
          language: lang,
          fileType: fileType,
          extn: filters.extn,
          name: filters.name,
        });

        const data = response.data;
        data.sort((a: any, b: any) => {
          return a[0] - b[0];
        });

        void import("xlsx").then((XLSX) => {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([...data]);
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
          XLSX.writeFile(wb, "extensions_download.xlsx", { compression: true });
          toast.success(tt("Download successfully!") || "下载成功");
        });
      } catch (error) {
        console.error("Failed to download extensions:", error);
        toast.error(tt("Export Failed") || "导出失败");
      }
    },
    [filters, tt],
  );

  const handleDownload = async (key: number) => {
    if (key === 0) {
      await handleExportExtensions();
    } else if (key === 1) {
      await handleExportExtensions("wps");
    }
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  // 导入分机
  const handleImport = async () => {
    // 处理文件上传
    if (importFiles.length === 0) {
      toast.error(tt("Select Import Attachment") || "请选择要导入的文件");
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
                throw new Error(tt("Import Failed") || "文件读取失败");
              }

              // 动态导入xlsx库
              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error(tt("Import Failed") || "XLSX库加载失败");
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
              const response = await extensionsApi.upload({ extensions: data });

              toast.success(
                `${tt("Import Success") || "导入成功"}: ${response.data?.data?.length || 0} 项`,
              );
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`${tt("Import Failed") || "导入失败"}: ${file.name}`);
              resolve(); // 继续处理下一个文件
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`${tt("Import Failed") || "导入失败"}: ${file.name}`);
            resolve(); // 继续处理下一个文件
          };
        });
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
      void loadExtensions(currentPage, pageSize, filters);
    } catch (error) {
      console.error("Failed to import extensions:", error);
      toast.error(tt("Import Failed") || "导入失败");
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadExtensions();
    void loadContexts();
    void getUsers();
  }, [router, loadExtensions, loadContexts, getUsers]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("extensions")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <ListFilterForm
                    fields={[
                      {
                        name: "extn",
                        type: "search",
                        placeholder: tt("number"),
                        width: "200px",
                      },
                      {
                        name: "name",
                        type: "search",
                        placeholder: tt("name"),
                        width: "200px",
                      },
                      {
                        name: "status",
                        type: "select",
                        label: tt("status"),
                        options: [
                          { value: "all", label: tt("all") },
                          { value: "online", label: tt("online") },
                          { value: "offline", label: tt("offline") },
                        ],
                        width: "180px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      extn: filters.extn || "",
                      name: filters.name || "",
                      status: filters.status || "all",
                    }}
                    translationPrefix="common"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            {tt("Export")}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => void handleDownload(0)}>
                            {tt("Export")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void handleDownload(1)}>
                            {tt("Export")}({tt("WPS Compatible")})
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImportModalOpen(true)}
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {tt("Import")}
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addExtension")}
                    </Button>
                  </div>

                  <ExtensionsTable
                    data={extensions}
                    filters={filters}
                    onDataChange={() => handleDataChange()}
                    pageSize={pageSize}
                    pageIndex={currentPage - 1}
                  />

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

      <CreateExtensionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateExtension}
        contexts={contexts}
      />

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{tt("Import") || "导入"}</DialogTitle>
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
                  {ttt("Please drag and drop the file here or") || "请将导入文件或选择文件"}
                  <Button
                    variant="default"
                    className="ml-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {ttt("Select File") || "选择文件"}
                  </Button>
                </p>
                <p className="text-xs text-gray-500">
                  {ttt("User upload hint") || "仅支持.xls和.xlsx文件"}
                </p>
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
                      {tt("Delete") || "删除"}
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
                {tt("close") || "关闭"}
              </Button>
              <Button
                onClick={() => void handleImport()}
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={importFiles.length === 0}
              >
                {tt("submit") || "提交"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
