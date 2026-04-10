"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ListFilterForm, ListPagination } from "@/components/ui/list-components";
import { ExtensionsTable } from "./components/extensions-table";
import { CreateExtensionDialog } from "./components/create-extension-dialog";
import { toast } from "sonner";
import { type User } from "@repo/api-client";
import {
  extensionsApi,
  routesApi,
  usersApi,
  type Extension,
  type ListExtensionsQuery,
  type ContextItem,
} from "@/lib/api-client";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export default function ExtensionsPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tt = useTranslations("extensions");

  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [filters, setFilters] = useState<{
    extn?: string;
    name?: string;
    status?: string;
  }>({
    extn: "",
    name: "",
    status: "",
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadExtensions = useCallback(
    async (
      page: number = currentPage,
      size: number = pageSize,
      filterParams: typeof filters = filters,
    ) => {
      try {
        const queryParams: ListExtensionsQuery = {
          page,
          page_size: size,
        };

        if (filterParams.extn) queryParams.extn = filterParams.extn;
        if (filterParams.name) queryParams.name = filterParams.name;
        if (filterParams.status && filterParams.status !== "all")
          queryParams.status = filterParams.status;

        const response = await extensionsApi.list(queryParams);
        console.log("extensions response:", response);
        const responseData = response.data;

        setExtensions(responseData.data || []);
        setTotalCount(responseData.rowCount || 0);
        setPageCount(responseData.pageCount || 0);
        setCurrentPage(page);
        setPageSize(size);
        setFilters(filterParams);
      } catch (err) {
        console.error("Failed to fetch extensions:", err);
        toast.error(tt("failedToFetchExtensions") || "加载分机失败");
        setExtensions([]);
        setTotalCount(0);
        setPageCount(0);
      }
    },
    [currentPage, pageSize, filters, tt],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void loadExtensions(newPage, pageSize, filters);
    },
    [loadExtensions, pageSize, filters],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      void loadExtensions(1, newSize, filters);
    },
    [loadExtensions, filters],
  );

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      // 避免重复调用
      if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
        return;
      }

      setFilters(newFilters);
      void loadExtensions(1, pageSize, newFilters);
      console.log("Filter changed:", newFilters);
    },
    [loadExtensions, pageSize, filters],
  );

  const handleDataChange = useCallback(() => {
    void loadExtensions(currentPage, pageSize, filters);
  }, [loadExtensions, currentPage, pageSize, filters]);

  const loadContexts = useCallback(async () => {
    try {
      const response = await routesApi.getContexts();
      setContexts(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load contexts:", error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = (await usersApi.list({ perPage: 100, hpack: false })) as any;
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  // 创建分机
  const handleCreateExtension = useCallback(
    async (data: {
      name: string;
      extn: string;
      password: string;
      context: string;
      login: string;
    }) => {
      try {
        const user = users.find((u) => u.login === data.login);
        if (!user) {
          throw new Error("用户不存在");
        }

        const createData = {
          name: data.name,
          extn: data.extn,
          password: data.password,
          context: data.context,
          user_id: parseInt(user.id, 10),
        };
        await extensionsApi.create(createData);
        toast.success(tt("addExtensionSuccess") || "分机创建成功");
        await loadExtensions(1, pageSize, filters);
        setIsCreateDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to create extension:", error);
        toast.error(
          `${tt("addExtensionFailed") || "分机创建失败"}: ${error?.message || error?.text || error}`,
        );
      }
    },
    [loadExtensions, pageSize, filters, tt, users],
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    void loadExtensions();
    void loadContexts();
    void getUsers();
  }, [router, loadExtensions, loadContexts, getUsers]);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("extensions")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-4">
                  <ListFilterForm
                    fields={[
                      {
                        name: "extn",
                        type: "search",
                        placeholder: tt("number"),
                        width: "200px",
                      },
                      {
                        name: "name",
                        type: "search",
                        placeholder: tt("name"),
                        width: "200px",
                      },
                      {
                        name: "status",
                        type: "select",
                        label: tt("status"),
                        options: [
                          { value: "all", label: tt("all") },
                          { value: "online", label: tt("online") },
                          { value: "offline", label: tt("offline") },
                        ],
                        width: "180px",
                      },
                    ]}
                    onFilterChange={handleFilterChange}
                    defaultValues={{
                      extn: filters.extn || "",
                      name: filters.name || "",
                      status: filters.status || "all",
                    }}
                    translationPrefix="common"
                  />

                  <div className="flex items-center justify-end">
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {tt("addExtension")}
                    </Button>
                  </div>

                  <ExtensionsTable
                    data={extensions}
                    filters={filters}
                    onDataChange={() => handleDataChange()}
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

      <CreateExtensionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateExtension}
        contexts={contexts}
      />
    </SidebarProvider>
  );
}
