"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CdrTable } from "./components/cdr-table";
import { createClient, createCdrsApi, type Cdr, type ListCdrsQuery } from "@repo/api-client";
import { ListPagination } from "@/components/ui/list-components";
import { toast } from "sonner";

const apiClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
});
const cdrsApi = createCdrsApi(apiClient);

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function CdrPage() {
  const router = useRouter();
  const t = useTranslations("pages");

  const [cdrs, setCdrs] = useState<Cdr[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    cidNumber?: string;
    destNumber?: string;
    uuid?: string;
    contextValue?: string;
    groupValue?: string;
    routeID?: string;
    startBillsec?: string;
    endBillsec?: string;
  }>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Use refs to keep track of current values in callbacks
  const filtersRef = useRef(filters);
  const currentPageRef = useRef(currentPage);
  const pageSizeRef = useRef(pageSize);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  const loadCdrs = useCallback(
    async (
      page: number = currentPageRef.current,
      size: number = pageSizeRef.current,
      filterParams: typeof filters = filtersRef.current,
    ) => {
      try {
        const queryParams: ListCdrsQuery = {
          page,
          perPage: size,
        };

        if (filterParams.startDate) queryParams.startDate = filterParams.startDate;
        if (filterParams.endDate) queryParams.endDate = filterParams.endDate;
        if (filterParams.cidNumber) queryParams.cidNumber = filterParams.cidNumber;
        if (filterParams.destNumber) queryParams.destNumber = filterParams.destNumber;
        if (filterParams.uuid) queryParams.uuid = filterParams.uuid;
        if (filterParams.contextValue) queryParams.contextValue = filterParams.contextValue;
        if (filterParams.groupValue) queryParams.groupValue = filterParams.groupValue;
        if (filterParams.routeID) queryParams.routeID = filterParams.routeID;
        if (filterParams.startBillsec) queryParams.startBillsec = filterParams.startBillsec;
        if (filterParams.endBillsec) queryParams.endBillsec = filterParams.endBillsec;

        const response = await cdrsApi.list(queryParams);
        console.log("cdrs response:", response);
        if (response && response.data) {
          setCdrs(response.data.data || []);
          setTotal(response.data.rowCount || 0);
          setPageCount(response.data.pageCount || 0);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err) {
        console.error("Failed to fetch CDRs:", err);
        toast.error("加载通话记录失败");
        setCdrs([]);
        setTotal(0);
        setPageCount(0);
      }
    },
    [], // No dependencies since we use refs
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadCdrs(newPage, pageSizeRef.current, filtersRef.current);
    },
    [loadCdrs],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadCdrs(1, newSize, filtersRef.current);
    },
    [loadCdrs],
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      void loadCdrs(1, pageSizeRef.current, newFilters);
    },
    [loadCdrs],
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadCdrs();
  }, [router, loadCdrs]);

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
        <SiteHeader title={t("cdr")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <CdrTable
                  data={cdrs}
                  rowCount={total}
                  onFilterChange={handleFilterChange}
                  pageSize={pageSize}
                  pageIndex={currentPage - 1}
                />

                <ListPagination
                  currentPage={currentPage}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  totalCount={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  translationPrefix="table"
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
