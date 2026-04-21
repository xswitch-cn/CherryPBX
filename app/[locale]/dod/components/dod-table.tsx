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
import { dodsApi, extensionsApi } from "@/lib/api-client";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EllipsisVerticalIcon } from "lucide-react";
import { Link } from "@/navigation";

export const dodSchema = z.object({
  id: z.string(),
  line_number: z.string(),
  extn: z.string(),
  extn_id: z.string(),
  type: z.string(),
  name: z.string(),
  ref_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string(),
});

export function DodTable({
  data: initialData,
  onDataChange,
  pageSize = 10,
  pageIndex = 0,
}: {
  data: any[];
  onDataChange?: () => void;
  pageSize?: number;
  pageIndex?: number;
}) {
  const t = useTranslations("dod");
  const tt = useTranslations("table");
  const ttt = useTranslations("common");

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
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "id", desc: true }]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDod, setSelectedDod] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [extensions, setExtensions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchExtensions = async () => {
      try {
        const response = await extensionsApi.list({ page: 1, perPage: 1000 });
        if (response?.data?.data) {
          setExtensions(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch extensions:", error);
      }
    };

    void fetchExtensions();
  }, []);

  const handleDelete = async () => {
    if (!selectedDod) return;

    try {
      setLoading(true);
      const response = (await dodsApi.delete(selectedDod.id)) as any;
      if (response?.data?.success || response?.data?.message == "success") {
        toast.success(ttt("deleteSuccess") || "删除成功");
        const updatedData = data.filter((dod) => dod.id !== selectedDod.id);
        setData(updatedData);
        if (onDataChange) {
          onDataChange();
        }
      } else {
        toast.error(`${t("deleteError") || "删除错误"}: ${response?.data?.message || "未知错误"}`);
      }
      setDeleteDialogOpen(false);
      setSelectedDod(null);
    } catch (error: any) {
      console.error("Failed to delete dod:", error);
      toast.error(`${t("deleteError") || "删除错误"}: ${error?.message || error?.text || error}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo<ColumnDef<z.infer<typeof dodSchema>>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("id"),
        cell: ({ row }) => <span>{row.original.id}</span>,
      },
      {
        accessorKey: "line_number",
        header: t("lineNumber"),
        cell: ({ row }) => <span>{row.original.line_number}</span>,
      },
      {
        accessorKey: "extn",
        header: t("extension"),
        cell: ({ row }) => {
          const extn = row.original.extn;
          const extension = extensions.find((ext) => ext.extn === extn);
          if (extension) {
            return (
              <Link href={`/extensions/${extension.id}`} className="text-primary hover:underline">
                {extn}
              </Link>
            );
          }
          return <span>{extn}</span>;
        },
      },
      {
        accessorKey: "type",
        header: t("resourceType"),
        cell: ({ row }) => <span>{row.original.type || "-"}</span>,
      },
      {
        accessorKey: "name",
        header: t("resourceName"),
        cell: ({ row }) => <span>{row.original.name || "-"}</span>,
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
                  window.location.href = `/${locale}/dod/${row.original.id}`;
                }}
              >
                {tt("details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSelectedDod(row.original);
                  setDeleteDialogOpen(true);
                }}
              >
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tt, extensions],
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
                  {t("noDod")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSubmit={handleDelete}
        title={ttt("Confirm to Delete ?") || "确认删除"}
        description={t("deleteItem", { item: selectedDod?.line_number })}
        deleteText={ttt("confirm") || "确认"}
        cancelText={ttt("cancel") || "取消"}
        isLoading={loading}
      />
    </div>
  );
}
