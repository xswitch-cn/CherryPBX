"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon, UploadIcon, CloudUploadIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ListFilterForm, ListTable, ListPagination } from "@/components/ui/list-components";
import { toast } from "sonner";
import { type User, type ListUsersQuery } from "@repo/api-client";
import { createUserColumns } from "./users-columns";
import {
  CreateUserDialog,
  CreateUserFormData,
  DeleteUserDialog,
  BatchSettingsDialog,
} from "./components/users-table";
import { apiClient, usersApi } from "@/lib/api-client";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function UsersPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("users");
  const ttt = useTranslations("table");

  // 处理删除用户（打开确认对话框）
  const handleDeleteUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  }, []);

  const userColumns = useMemo(
    () => createUserColumns({ t: tt, tt: ttt, onDelete: handleDeleteUser }),
    [tt, ttt, handleDeleteUser],
  );

  const [users, setUsers] = useState<User[]>([]);
  const [contexts, setContexts] = useState<Array<{ id: string | number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<{
    login?: string;
    name?: string;
    type?: string;
  }>({
    login: "",
    name: "",
    type: "ALL",
  });

  // 弹窗状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBatchSettingsOpen, setIsBatchSettingsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // 导入导出相关状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);

  // 加载用户列表
  const loadUsers = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      setIsLoading(true);
      try {
        const queryParams: ListUsersQuery = {
          page,
          perPage: size,
          login: filterParams.login || "",
          name: filterParams.name,
          type: filterParams.type === "ALL" ? undefined : filterParams.type,
        };

        const response = await usersApi.list({ ...queryParams, _t: Date.now().toString() });
        const responseData = response.data as { data: any[]; rowCount: number };

        setUsers(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(Math.ceil((responseData.rowCount || 0) / size) || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error(tt("loadFailed"));
        setUsers([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, filters, tt],
  );

  // 加载上下文
  const loadContexts = useCallback(async () => {
    try {
      const response = await usersApi.contexts();
      // 确保response.data是一个数组
      let contextsData: any[] = [];
      if (Array.isArray(response.data)) {
        contextsData = response.data;
      } else if (response.data && typeof response.data === "object" && "data" in response.data) {
        contextsData = Array.isArray(response.data.data) ? response.data.data : [];
      }
      setContexts(contextsData as Array<{ id: string | number; name: string }>);
    } catch (error) {
      console.error("Failed to load contexts:", error);
      setContexts([]);
    }
  }, []);

  // 创建用户
  const handleCreate = useCallback(
    async (data: CreateUserFormData) => {
      try {
        // 移除extenEnable参数，不传这个字段
        const { extenEnable: _extenEnable, ...createData } = data;
        await usersApi.create(createData);
        toast.success(tt("addSuccess"));
        // 刷新列表（回到第一页）
        await loadUsers(1, pageSize, filters);
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create user:", error);
        toast.error(tt("addFailed"));
        throw new Error("create failed");
      }
    },
    [loadUsers, pageSize, filters, tt],
  );

  // 删除用户
  const handleDelete = useCallback(
    async (id: string) => {
      console.log("Handle delete:", id);
      try {
        console.log("Calling usersApi.delete:", id);
        await usersApi.delete(id);
        console.log("Delete API call successful");
        toast.success(tt("deleteSuccess"));
        // 刷新列表（保持当前页）
        await loadUsers(currentPage, pageSize, filters);
        setIsDeleteOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [loadUsers, currentPage, pageSize, filters, tt],
  );

  // 批量设置用户类型
  const handleBatchSettings = useCallback(
    async (data: { type: string }) => {
      try {
        const username = selectedUsers.map((user) => user.id);
        console.log("Selected users:", selectedUsers);
        console.log("Username array:", username);

        // 调用批量设置API
        await usersApi.batchUpdate({
          type: data.type,
          username: username,
          idle_timeout: 0,
        });

        toast.success("批量设置成功");
        // 刷新列表
        await loadUsers(currentPage, pageSize, filters);
        setIsBatchSettingsOpen(false);
        setSelectedUsers([]);
      } catch (error) {
        console.error("Failed to batch settings:", error);
        toast.error("批量设置失败");
      }
    },
    [loadUsers, currentPage, pageSize, filters, selectedUsers],
  );

  // 处理导出用户
  const handleExportUsers = useCallback(
    async (fileType?: string) => {
      const lang = document.documentElement.lang || "zh";

      try {
        const response = await usersApi.download({
          language: lang,
          fileType: fileType,
          login: filters.login,
          name: filters.name,
          type: filters.type === "ALL" ? undefined : filters.type,
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
    },
    [filters],
  );

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  // 处理导入用户
  const handleImport = async () => {
    // 处理文件上传
    if (importFiles.length === 0) {
      toast.error("请选择要导入的文件");
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
              const response = await usersApi.upload({ users: data });

              toast.success(
                `文件 ${file.name} 导入成功: ${(response as any).data?.data?.length || 0} 项`,
              );
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
      // 刷新用户列表
      await loadUsers(currentPage, pageSize, filters);
    } catch (error) {
      console.error("Failed to import users:", error);
      toast.error("导入失败: 网络错误");
    }
  };

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadUsers(newPage, pageSize, filters);
    },
    [loadUsers, pageSize, filters],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadUsers(1, newSize, filters);
    },
    [loadUsers, filters],
  );

  // 处理筛选
  const handleFilterChange = useCallback(
    (newFilters: { login?: string; name?: string; type?: string }) => {
      void loadUsers(1, pageSize, newFilters);
    },
    [loadUsers, pageSize],
  );

  // 初始化加载
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadUsers();
    void loadContexts();
  }, [router, loadUsers, loadContexts]);

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
        <SiteHeader title={t("users")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  {/* 筛选表单 */}
                  <ListFilterForm
                    fields={[
                      {
                        name: "login",
                        type: "search",
                        placeholder: tt("username"),
                        width: "200px",
                      },
                      {
                        name: "name",
                        type: "search",
                        placeholder: tt("name"),
                        width: "200px",
                      },
                      {
                        name: "type",
                        type: "select",
                        label: tt("type"),
                        options: [
                          { value: "ALL", label: tt("all") },
                          { value: "NORMAL", label: tt("normal") },
                          { value: "AGENT", label: tt("agent") },
                        ],
                        width: "180px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      login: filters.login || "",
                      name: filters.name || "",
                      type: filters.type || "ALL",
                    }}
                    translationPrefix="users"
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

                      <Button size="sm" onClick={() => setIsBatchSettingsOpen(true)}>
                        批量设置
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addUser")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<User>
                    columns={userColumns}
                    data={users}
                    isLoading={isLoading}
                    selection
                    onSelectionChange={(selected) => setSelectedUsers(selected as User[])}
                    emptyText={tt("noUsers")}
                    loadingText={"加载中..."}
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
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        contexts={contexts}
      />

      {/* 删除弹窗 */}
      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
        onSubmit={handleDelete}
      />

      {/* 批量设置弹窗 */}
      <BatchSettingsDialog
        open={isBatchSettingsOpen}
        onOpenChange={setIsBatchSettingsOpen}
        selectedUsers={selectedUsers}
        allUsers={users}
        onSelectionChange={setSelectedUsers}
        onSubmit={handleBatchSettings}
      />

      {/* 导入弹窗 */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入</DialogTitle>
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
                  请将文件拖拽至此处或
                  <Button
                    variant="default"
                    className="ml-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    选择文件
                  </Button>
                </p>
                <p className="text-xs text-gray-500">仅支持.xls和.xlsx文件</p>
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
                      删除
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
                关闭
              </Button>
              <Button
                onClick={() => void handleImport()}
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={importFiles.length === 0}
              >
                提交
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
