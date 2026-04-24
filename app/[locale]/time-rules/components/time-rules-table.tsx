"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  EllipsisVerticalIcon,
  ClockIcon,
} from "lucide-react";

export const timeRulesSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string(),
});

interface TimeRulesTableProps {
  data: z.infer<typeof timeRulesSchema>[];
  onDelete?: (rule: z.infer<typeof timeRulesSchema>) => void;
  loading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalCount?: number;
  pageCount?: number;
}

export function TimeRulesTable({
  data: tableData,
  onDelete,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalCount = 0,
  pageCount = 0,
}: TimeRulesTableProps) {
  const t = useTranslations("timeRules");
  const tt = useTranslations("table");
  const [data, setData] = React.useState(tableData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const columns = React.useMemo<ColumnDef<z.infer<typeof timeRulesSchema>>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("ruleName"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
              <ClockIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "description", header: t("description") },
      {
        accessorKey: "created_at",
        header: t("createdAt"),
        cell: ({ row }) => row.original.created_at,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex size-8 text-muted-foreground" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const locale = document.documentElement.lang || "zh";
                  window.location.href = `/${locale}/time-rules/${row.original.id}`;
                }}
              >
                {tt("details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void onDelete?.(row.original)}>
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tt, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      if (newPagination.pageIndex !== pageIndex) {
        onPageChange?.(newPagination.pageIndex + 1);
      }
      if (newPagination.pageSize !== pageSize) {
        onPageSizeChange?.(newPagination.pageSize);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
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
                  {t("noRules")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          {tt("totalCount", { total: totalCount })}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">{tt("rowsPerPage")}</span>
            <Select value={`${pageSize}`} onValueChange={(v) => onPageSizeChange?.(Number(v))}>
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>
                      {ps}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {tt("pageOf", { current: pageIndex + 1, total: pageCount })}
            </span>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange?.(1)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange?.(pageIndex)}
              disabled={pageIndex === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange?.(pageIndex + 2)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange?.(pageCount)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
