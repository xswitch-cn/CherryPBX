"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NumberTransformTable } from "./components/number-transform-table";
import { CreateNumberTransformDialog } from "./components/create-number-transform-dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  numberTransformApi,
  type NumberTransform,
  type ListNumberTransformsQuery,
} from "@/lib/api-client";

const DEFAULT_PAGE_SIZE = 10;

export default function NumberTransformPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("numberTransform");

  const [numberTransforms, setNumberTransforms] = useState<NumberTransform[]>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [danger] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NumberTransform | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  const loadNumberTransforms = useCallback(async () => {
    try {
      const queryParams: ListNumberTransformsQuery = {
        page: currentPage,
        page_size: pageSize,
      };

      const response = await numberTransformApi.list(queryParams);
      const responseData = response.data;
      setNumberTransforms(responseData.data || []);
    } catch (error) {
      console.error("Failed to load number transforms:", error);
      toast.error(tt("failedToLoad"));
    }
  }, [currentPage, pageSize, tt]);

  useEffect(() => {
    void loadNumberTransforms();
  }, [loadNumberTransforms]);

  const handleDataChange = useCallback(() => {
    void loadNumberTransforms();
  }, [loadNumberTransforms]);

  const handleDelete = useCallback((rule: NumberTransform) => {
    setDeleteTarget(rule);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await numberTransformApi.delete(deleteTarget.id);
      toast.success("删除成功");
      await loadNumberTransforms();
    } catch (error: any) {
      console.error("Failed to delete number transform:", error);
      toast.error(`删除失败: ${error?.message || error?.text || error}`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadNumberTransforms]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("numberTransform")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("new")}
                    </Button>
                  </div>
                  <NumberTransformTable
                    data={numberTransforms}
                    danger={danger}
                    onDelete={handleDelete}
                    onDataChange={handleDataChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <CreateNumberTransformDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onDataChange={handleDataChange}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="删除规则"
        description={`确定要删除规则 "${deleteTarget?.name}" 吗？`}
        onSubmit={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  );
}
