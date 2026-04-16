"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { ListTable, ListPagination } from "@/components/ui/list-components";
import { Button } from "@/components/ui/button";
import { licenseApi } from "@/lib/api-client";
import { type License, type ListLicenseQuery, type CreateLicenseRequest } from "@repo/api-client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CreateLicenseDialog } from "./components/create-license-dialog";
import { createLicenseColumns } from "./license-columns";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function LicensePage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tl = useTranslations("license");
  const tc = useTranslations("common");

  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const licenseColumns = createLicenseColumns({
    t,
    tl,
    tc,
    router,
    onHandleDelete: (license: License) => {
      setDeleteTarget(license);
      setIsDeleteDialogOpen(true);
    },
  });

  // 加载数据列表
  const loadLicenses = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListLicenseQuery = {
          page,
          perPage: size,
        };

        const response = await licenseApi.list(queryParams);
        const responseData = response.data;

        setLicenses(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load licenses:", error);
        toast.error(tc("loadFailed"));
        setLicenses([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tc],
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");

    void loadLicenses();
  }, [router, loadLicenses]);

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadLicenses(newPage, pageSize);
    },
    [loadLicenses, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadLicenses(1, newSize);
    },
    [loadLicenses],
  );

  // 删除数据
  const handleDeleteGateway = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await licenseApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadLicenses(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete license:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, currentPage, pageSize, loadLicenses, tc]);

  const handleCreateLicense = useCallback(
    async (_data: CreateLicenseRequest) => {
      try {
        await licenseApi.create(_data);
        toast.success(tc("createSuccess"));
        // 刷新列表（回到第一页）
        await loadLicenses(1, pageSize);
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create license:", error);
        toast.error(tc("createFailed"));
      }
    },
    [loadLicenses, pageSize, tc],
  );

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("license")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div />
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {tl("addLicense")}
            </Button>
          </div>

          {/* 表格 */}
          <ListTable<License>
            columns={licenseColumns}
            data={licenses}
            isLoading={isLoading}
            emptyText={tc("noData") || "暂无数据"}
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

          {/* 删除确认对话框 */}
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={tl("deleteLicense")}
            description={tc("DeleteItem", { item: deleteTarget?.name ? deleteTarget?.name : "" })}
            onSubmit={handleDeleteGateway}
            deleteText={tc("confirm") || "确定"}
            cancelText={tc("cancel") || "取消"}
            isLoading={isDeleting}
          />

          {/* 新增许可证 */}
          <CreateLicenseDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreateLicense}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
