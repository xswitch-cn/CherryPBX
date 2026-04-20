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
import { createConferenceColumns } from "./conference-columns";
import { type Conference } from "@/lib/api-client";
import {
  CreateConferenceDialog,
  DeleteConferenceDialog,
  CreateConferenceFormData,
} from "./components/conference-table";
import {
  conferencesApi,
  type ListConferencesQuery,
  type ListConferencesResponse,
} from "@/lib/api-client";

// 每页显示数量
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function ConferencePage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("conference");
  const ttt = useTranslations("table");

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);

  // 加载会议室列表
  const loadConferences = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListConferencesQuery = {
          page,
          perPage: size,
        };

        const response = await conferencesApi.list(queryParams);
        const responseData = response.data as ListConferencesResponse;

        // 转换数据格式，确保类型一致
        const formattedConferences = (responseData.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          number: item.number,
          domain: item.domain,
          capacity: item.capacity,
        }));

        setConferences(formattedConferences);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(Math.ceil((responseData.rowCount || 0) / size) || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load conferences:", error);
        toast.error(tt("loadFailed"));
        setConferences([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  const handleDeleteConference = useCallback((conference: Conference) => {
    setSelectedConference(conference);
    setIsDeleteOpen(true);
  }, []);

  // 创建会议室
  const handleCreate = useCallback(
    async (data: CreateConferenceFormData) => {
      try {
        await conferencesApi.create(data);
        toast.success(tt("addSuccess"));
        await loadConferences(1, pageSize);
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create conference:", error);
        toast.error(tt("addFailed"));
        throw new Error("create failed");
      }
    },
    [loadConferences, pageSize, tt],
  );

  // 删除会议室
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await conferencesApi.delete(id);
        toast.success(tt("deleteSuccess"));
        // 刷新列表（保持当前页）
        await loadConferences(currentPage, pageSize);
        setIsDeleteOpen(false);
        setSelectedConference(null);
      } catch (error) {
        console.error("Failed to delete conference:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [loadConferences, currentPage, pageSize, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadConferences(newPage, pageSize);
    },
    [loadConferences, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadConferences(1, newSize);
    },
    [loadConferences],
  );

  // 列配置
  const conferenceColumns = useMemo(
    () =>
      createConferenceColumns({
        t: tt,
        tt: ttt,
        onDelete: handleDeleteConference,
      }),
    [tt, ttt, handleDeleteConference],
  );

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadConferences();
  }, [router, loadConferences]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("conference")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-end">
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addConference")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <ListTable<Conference>
                    columns={conferenceColumns}
                    data={conferences}
                    isLoading={isLoading}
                    emptyText={tt("noConferences")}
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
      <CreateConferenceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {/* 删除弹窗 */}
      <DeleteConferenceDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        conference={selectedConference}
        onSubmit={handleDelete}
      />
    </SidebarProvider>
  );
}
