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
import { type IVR, createIvrColumns } from "./ivr-columns";
import { CreateIvrDialog, CreateIvrFormData } from "./components/ivr-table";
import { ivrsApi, type ListIvrsQuery, type ListIvrsResponse } from "@/lib/api-client";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

function parseMediaValue(value: any): any {
  if (!value || value === "") return null;
  if (typeof value === "object") return value;
  const val = String(value).trim();
  if (!val) return null;
  if (val.startsWith("{")) {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
}

function getAudioName(value: any, nameField?: string): string {
  if (nameField) {
    const nameVal = String(nameField).trim();
    if (nameVal) return nameVal;
  }
  const parsed = parseMediaValue(value);
  if (parsed) {
    if (parsed.media_name) return String(parsed.media_name).trim();
    if (parsed.media_path) {
      const mediaPath = String(parsed.media_path).trim();
      if (mediaPath.startsWith("tone_stream://")) {
        return mediaPath.replace("tone_stream://", "");
      }
      if (mediaPath.startsWith("phrase:")) {
        return mediaPath.replace("phrase:", "");
      }
      const parts = mediaPath.split("/");
      return parts[parts.length - 1] || "";
    }
  }
  const val = String(value).trim();
  if (!val) return "";
  if (val.startsWith("tone_stream://")) {
    return val.replace("tone_stream://", "");
  }
  if (val.startsWith("phrase:")) {
    return val.replace("phrase:", "");
  }
  const parts = val.split("/");
  return parts[parts.length - 1] || "";
}

export default function IvrPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("ivr");
  const ttt = useTranslations("table");

  const [ivrs, setIvrs] = useState<IVR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadIvrs = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      setIsLoading(true);
      try {
        const queryParams: ListIvrsQuery = {
          page,
          perPage: size,
        };

        const response = await ivrsApi.list(queryParams);
        const responseData = response.data as ListIvrsResponse;

        const formattedIvrs = (responseData.data || []).map(
          (item: {
            id: number;
            name: string;
            description: string;
            identifier: string;
            greet_long?: any;
            greet_long_name?: string;
            greet_short?: any;
            greet_short_name?: string;
            count_actions?: number;
          }) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            identifier: item.identifier,
            welcomeAudio: getAudioName(item.greet_long, item.greet_long_name),
            shortWelcomeAudio: getAudioName(item.greet_short, item.greet_short_name),
            actionCount: item.count_actions || 0,
          }),
        );

        setIvrs(formattedIvrs);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(Math.ceil((responseData.rowCount || 0) / size) || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (error) {
        console.error("Failed to load ivrs:", error);
        toast.error(tt("loadFailed"));
        setIvrs([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  const handleDeleteIvr = useCallback(
    async (ivr: IVR) => {
      try {
        await ivrsApi.delete(ivr.id);
        toast.success(tt("deleteSuccess"));
        await loadIvrs(currentPage, pageSize);
      } catch (error) {
        console.error("Failed to delete ivr:", error);
        toast.error(tt("deleteFailed"));
      }
    },
    [loadIvrs, currentPage, pageSize, tt],
  );

  const handleCreate = useCallback(
    async (data: CreateIvrFormData) => {
      try {
        await ivrsApi.create(data);
        toast.success(tt("addSuccess"));
        await loadIvrs(1, pageSize);
        setIsCreateOpen(false);
      } catch (error) {
        console.error("Failed to create ivr:", error);
        toast.error(tt("addFailed"));
        throw new Error("create failed");
      }
    },
    [loadIvrs, pageSize, tt],
  );

  // 处理翻页
  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadIvrs(newPage, pageSize);
    },
    [loadIvrs, pageSize],
  );

  // 处理每页数量变化
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadIvrs(1, newSize);
    },
    [loadIvrs],
  );

  // 列配置
  const ivrColumns = useMemo(
    () =>
      createIvrColumns({
        t: tt,
        tt: ttt,
        onDelete: handleDeleteIvr,
      }),
    [tt, ttt, handleDeleteIvr],
  );

  // 初始化
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadIvrs();
  }, [router, loadIvrs]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("ivr")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-end">
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addIvr")}
                    </Button>
                  </div>

                  {/* 表格 */}
                  <div className="rounded-lg border">
                    <ListTable<IVR>
                      columns={ivrColumns}
                      data={ivrs}
                      isLoading={isLoading}
                      emptyText={tt("noIvr")}
                      translationPrefix="table"
                    />
                  </div>

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
                    showTotalCount={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* 新增弹窗 */}
      <CreateIvrDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreate} />
    </SidebarProvider>
  );
}
