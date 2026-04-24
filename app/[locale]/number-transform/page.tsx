"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NumberTransformTable } from "./components/number-transform-table";
import { CreateNumberTransformDialog } from "./components/create-number-transform-dialog";
import { Button } from "@/components/ui/button";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [danger, setDanger] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
      toast.error(tt("failedToLoad") || "加载失败");
    }
  }, [currentPage, pageSize, tt]);

  useEffect(() => {
    void loadNumberTransforms();
  }, [loadNumberTransforms]);

  const toggleDanger = () => {
    setDanger(!danger);
  };

  const handleDataChange = useCallback(() => {
    void loadNumberTransforms();
  }, [loadNumberTransforms]);

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
    </SidebarProvider>
  );
}
