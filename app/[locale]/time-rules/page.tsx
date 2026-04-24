"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { PlusIcon } from "lucide-react";
import { TimeRulesTable } from "./components/time-rules-table";
import { CreateTimeRuleDialog } from "./components/create-time-rule-dialog";
import { toast } from "sonner";
import { timeRulesApi, type TimeRule, type ListTimeRulesQuery } from "@/lib/api-client";

const DEFAULT_PAGE_SIZE = 10;

export default function TimeRulesPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("timeRules");
  const ttt = useTranslations("common");

  const [timeRules, setTimeRules] = useState<TimeRule[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimeRule | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadTimeRules = useCallback(
    async (page: number = currentPage, size: number = pageSize) => {
      try {
        setLoading(true);
        const queryParams: ListTimeRulesQuery = {
          page,
          page_size: size,
        };

        const response = await timeRulesApi.list(queryParams);
        console.log("Time rules API response:", response);
        const responseData = response.data;

        setTimeRules(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
      } catch (err) {
        console.error("Failed to fetch time rules:", err);
        toast.error(tt("failedToFetchRules"));
        setTimeRules([]);
        setTotalCount(0);
        setPageCount(0);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, tt],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadTimeRules(newPage, pageSize);
    },
    [loadTimeRules, pageSize],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadTimeRules(1, newSize);
    },
    [loadTimeRules],
  );

  const handleCreateTimeRule = useCallback(
    async (data: { name: string; description?: string }) => {
      try {
        await timeRulesApi.create([data]);
        toast.success(tt("addRuleSuccess"));
        await loadTimeRules(1, pageSize);
        setIsCreateDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to create time rule:", error);
        toast.error(`${tt("addRuleFailed")}: ${error?.message || error?.text || error}`);
      }
    },
    [loadTimeRules, pageSize, tt],
  );

  const handleDelete = useCallback((rule: TimeRule) => {
    setDeleteTarget(rule);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await timeRulesApi.delete([deleteTarget.id]);
      toast.success(ttt("deleteSuccess"));
      await loadTimeRules(currentPage, pageSize);
    } catch (error: any) {
      console.error("Failed to delete time rule:", error);
      toast.error(`${ttt("deleteFailed")}: ${error?.message || error?.text || error}`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadTimeRules, currentPage, pageSize, ttt]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadTimeRules();
  }, [router, loadTimeRules]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("timeRules")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addRule")}
                    </Button>
                  </div>
                  <TimeRulesTable
                    data={timeRules}
                    onDelete={handleDelete}
                    loading={loading}
                    pageIndex={currentPage - 1}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    totalCount={totalCount}
                    pageCount={pageCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      <CreateTimeRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTimeRule}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={tt("deleteRule")}
        description={ttt("DeleteItem", { item: deleteTarget?.name ? deleteTarget?.name : "" })}
        onSubmit={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  );
}
