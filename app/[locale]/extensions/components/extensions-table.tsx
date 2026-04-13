"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";
import { extensionsApi } from "@/lib/api-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Columns3Icon,
  EllipsisVerticalIcon,
  PhoneIcon,
  PhoneCallIcon,
  CircleIcon,
} from "lucide-react";

export const extensionSchema = z.object({
  id: z.number(),
  extn: z.string(),
  name: z.string(),
  context: z.string(),
  domain: z.string(),
  type: z.string(),
  cid_name: z.string(),
  cid_number: z.string(),
  status: z.string(),
});

export function ExtensionsTable({
  data: initialData,
  onDataChange,
  pageSize = 10,
  pageIndex = 0,
  filters = {},
}: {
  data: any[];
  onDataChange?: () => void;
  pageSize?: number;
  pageIndex?: number;
  filters?: { extn?: string; name?: string; status?: string };
}) {
  const t = useTranslations("extensions");
  const tt = useTranslations("table");

  const [data, setData] = React.useState(() => initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    setPagination({
      pageIndex,
      pageSize,
    });
  }, [pageSize, pageIndex]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns = React.useMemo<ColumnDef<z.infer<typeof extensionSchema>>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("id"),
        cell: ({ row }) => <span>{row.original.id}</span>,
      },
      {
        accessorKey: "status",
        header: t("sipStatus"),
        cell: ({ row }) => {
          const status = row.original.status;
          let statusColor = "bg-gray-500";
          let statusText = "text-gray-600";

          if (status === "Online") {
            statusColor = "bg-green-500";
            statusText = "text-green-600";
          } else if (status === "Offline") {
            statusColor = "bg-gray-400";
            statusText = "text-gray-500";
          } else if (status === "Busy") {
            statusColor = "bg-red-500";
            statusText = "text-red-600";
          } else if (status === "Away") {
            statusColor = "bg-yellow-500";
            statusText = "text-yellow-600";
          }

          return (
            <div className="flex items-center gap-1.5">
              <CircleIcon className={`h-3 w-3 ${statusColor} rounded-full`} />
              <span className={statusText}>{status}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "extn",
        header: t("number"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.extn}</span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("name"),
        cell: ({ row }) => <span>{row.original.name}</span>,
      },
      {
        accessorKey: "context",
        header: t("context"),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground">
            {row.original.context}
          </Badge>
        ),
      },
      {
        accessorKey: "domain",
        header: t("domain"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.domain || "-"}</span>
        ),
      },
      {
        accessorKey: "type",
        header: t("type"),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.type}</span>,
      },
      {
        accessorKey: "cid_name",
        header: t("cidName"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.cid_name || "-"}</span>
        ),
      },
      {
        accessorKey: "cid_number",
        header: t("cidNumber"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.cid_number || "-"}</span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">{tt("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  const locale = document.documentElement.lang || "zh";
                  window.location.href = `/${locale}/extensions/${row.original.id}`;
                }}
              >
                {tt("details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void (async () => {
                    try {
                      const response = (await extensionsApi.delete(row.original.id)) as any;
                      if (response?.data?.success || response?.data?.message == "success") {
                        toast.success(t("deleteSuccess") || "删除成功");
                        const updatedData = data.filter((ext) => ext.id !== row.original.id);
                        setData(updatedData);
                        if (onDataChange) {
                          onDataChange();
                        }
                      } else {
                        toast.error(
                          `${t("deleteError") || "删除错误"}: ${response?.data?.message || "未知错误"}`,
                        );
                      }
                    } catch (error: any) {
                      console.error("Failed to delete extension:", error);
                      toast.error(
                        `${t("deleteError") || "删除错误"}: ${error?.message || error?.text || error}`,
                      );
                    }
                  })();
                }}
              >
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tt, onDataChange, data],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("noExtensions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
