"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DidTable } from "./components/did-table";
import { toast } from "sonner";
import { hotlinesApi, type Hotline } from "@/lib/api-client";
import { ListFilterForm, ListPagination } from "@/components/ui/list-components";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { CreateDidDialog } from "./components/create-did-dialog";
import { ImportDidDialog } from "./components/import-did-dialog";
// @ts-expect-error xlsx zahl payload has no type declarations
import XLSX_ZAHL_PAYLOAD from "xlsx/dist/xlsx.zahl";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function DidPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("did");
  const ttt = useTranslations("common");

  const [dids, setDids] = useState<Hotline[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [filters, setFilters] = useState<{
    line_number?: string;
    numbers?: string;
  }>({
    line_number: "",
    numbers: "",
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const loadDids = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      try {
        const queryParams = {
          page,
          perPage: size,
        };

        if (filterParams.line_number) (queryParams as any).line_number = filterParams.line_number;
        if (filterParams.numbers) (queryParams as any).numbers = filterParams.numbers;

        const response = await hotlinesApi.list(queryParams);
        console.log("response", response);
        const responseData = response.data;

        setDids(responseData?.data || []);
        setTotalCount(responseData?.rowCount || 0);
        setPageCount(responseData?.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (err) {
        console.error("Failed to fetch dids:", err);
        toast.error(tt("failedToFetchDids") || "加载DID失败");
        setDids([]);
        setTotalCount(0);
        setPageCount(0);
      }
    },
    [currentPage, pageSize, filters, tt],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadDids(newPage, pageSize, filters);
    },
    [loadDids, pageSize, filters],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadDids(1, newSize, filters);
    },
    [loadDids, filters],
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
        return;
      }

      setFilters(newFilters);
      void loadDids(1, pageSize, newFilters);
    },
    [loadDids, pageSize, filters],
  );

  const handleDataChange = useCallback(() => {
    void loadDids(currentPage, pageSize, filters);
  }, [loadDids, currentPage, pageSize, filters]);

  const handleExport = async () => {
    const lang = localStorage.getItem("xui.lang");
    try {
      const response = await hotlinesApi.download({ language: lang || "en-US" });
      const data = response.data;

      void import("xlsx").then((XLSX) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...data]);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "dids_download.xlsx", { numbers: XLSX_ZAHL_PAYLOAD, compression: true });
        toast.success(tt("Download successfully!") || "下载成功");
      });
    } catch (error) {
      console.error("Failed to download dids:", error);
      toast.error(tt("Export Failed") || "导出失败");
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadDids();
  }, [router, loadDids]);
  console.log("dids", dids);
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("did")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <ListFilterForm
                    fields={[
                      {
                        name: "line_number",
                        type: "search",
                        placeholder: tt("lineNumber"),
                        width: "200px",
                      },
                      {
                        name: "numbers",
                        type: "search",
                        placeholder: tt("extension"),
                        width: "200px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      line_number: filters.line_number || "",
                      numbers: filters.numbers || "",
                    }}
                    translationPrefix="common"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Button variant="outline" size="sm" onClick={void handleExport}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        {ttt("export")}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImportDialogOpen(true)}
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {ttt("import")}
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addDid")}
                    </Button>
                  </div>

                  <DidTable
                    data={dids}
                    // filters={filters}
                    onDataChange={handleDataChange}
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

      <CreateDidDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleDataChange}
      />

      <ImportDidDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportSuccess={handleDataChange}
      />
    </SidebarProvider>
  );
}
