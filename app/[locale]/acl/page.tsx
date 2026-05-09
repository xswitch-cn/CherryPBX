"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ListTable, ListPagination } from "@/components/ui/list-components";
import { Button } from "@/components/ui/button";
import { AclApi } from "@/lib/api-client";
import { type Acl, type ListAclQuery } from "@repo/api-client";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { CreateAclDialog } from "./components/create-acl-dialog";
import { createAclColumns } from "./acl-columns";
import { PlusIcon } from "lucide-react";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function AcllistPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const ta = useTranslations("acl");
  const tc = useTranslations("common");

  const [aclLists, setAclLists] = useState<Acl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 加载数据列表
  const loadAcllists = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListAclQuery = {
          page,
          perPage: size,
        };
        const response = await AclApi.list(queryParams);
        const responseData = response.data;
        setAclLists(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load acl:", error);
        toast.error(tc("loadFailed"));
      } finally {
        setIsLoading(false);
      }
    },
    [tc],
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");

    // 加载数据
    void loadAcllists();
  }, [router]);

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadAcllists(newPage, pageSize);
    },
    [loadAcllists, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadAcllists(1, newSize);
    },
    [loadAcllists],
  );

  // 删除数据
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await AclApi.delete(deleteTarget.id);
      toast.success(tc("deleteSuccess") || "删除成功");
      await loadAcllists(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete acl:", error);
      toast.error(tc("deleteFailed") || "删除失败");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, currentPage, pageSize, loadAcllists, tc]);

  // 创建数据
  const handleCreate = useCallback(
    async (data: any) => {
      try {
        await AclApi.create(data);
        toast.success(tc("createSuccess"));
        await loadAcllists(1, pageSize);
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create acl:", error);
        toast.error(tc("createFailed"));
        throw new Error("create failed");
      }
    },
    [loadAcllists, tc],
  );

  // 列配置
  const columns = createAclColumns({
    ta,
    tc,
    router,
    onDelete: (item: Acl) => {
      setDeleteTarget(item);
      setIsDeleteDialogOpen(true);
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("acl")} />
        <div className="px-4 lg:px-6 py-4 md:py-6 flex flex-col gap-4">
          {/* 操作栏 */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div />
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {ta("addAcl")}
            </Button>
          </div>

          {/* 表格 */}
          <ListTable<Acl>
            columns={columns}
            data={aclLists}
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

          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={ta("deleteAcl")}
            description={tc("DeleteItem", {
              item: deleteTarget?.name || "",
            })}
            onSubmit={handleConfirmDelete}
            deleteText={tc("confirm") || "确定"}
            cancelText={tc("cancel") || "取消"}
            isLoading={isDeleting}
          />

          {/* 新增对话框 */}
          <CreateAclDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreate}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
