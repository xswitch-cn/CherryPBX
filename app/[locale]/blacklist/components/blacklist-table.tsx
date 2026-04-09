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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  EllipsisVerticalIcon,
  SearchIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightLeftIcon,
  EyeIcon,
} from "lucide-react";

export const blacklistSchema = z.object({
  id: z.number(),
  phoneNumber: z.string(),
  pattern: z.string(),
  type: z.string(),
  status: z.string(),
  description: z.string(),
  addedDate: z.string(),
  lastMatch: z.string(),
  matchCount: z.number(),
});

export function BlacklistTable({ data: initialData }: { data: z.infer<typeof blacklistSchema>[] }) {
  const t = useTranslations("blacklist");
  const tt = useTranslations("table");
  const [data] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<z.infer<typeof blacklistSchema>>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label={tt("selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={tt("selectRow")}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "phoneNumber",
        header: t("phoneNumber"),
        cell: ({ row }) => {
          const isBlock = row.original.type === "Block";
          return (
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isBlock ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
                }`}
              >
                {isBlock ? (
                  <ShieldBanIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <ShieldCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              <span className="font-mono font-medium">{row.original.phoneNumber}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "pattern",
        header: t("pattern"),
        cell: ({ row }) => {
          const patternMap: Record<
            string,
            { label: string; variant: "default" | "secondary" | "outline" }
          > = {
            Exact: { label: t("exact"), variant: "default" },
            Prefix: { label: t("prefix"), variant: "secondary" },
            Regex: { label: t("regex"), variant: "outline" },
          };
          const pattern = patternMap[row.original.pattern] || {
            label: row.original.pattern,
            variant: "default" as const,
          };
          return <Badge variant={pattern.variant}>{pattern.label}</Badge>;
        },
      },
      {
        accessorKey: "type",
        header: t("type"),
        cell: ({ row }) => {
          const isBlock = row.original.type === "Block";
          return (
            <Badge variant={isBlock ? "destructive" : "default"}>
              {isBlock ? t("block") : t("allow")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
          const isActive = row.original.status === "Active";
          return isActive ? (
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-green-600">{t("active")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-red-600">{t("inactive")}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("description"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.description}</span>
        ),
      },
      {
        accessorKey: "matchCount",
        header: t("matchCount"),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.matchCount.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "lastMatch",
        header: t("lastMatch"),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {row.original.lastMatch}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const isBlock = row.original.type === "Block";
          return (
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
                    toast.info(t("editingEntry", { number: row.original.phoneNumber }));
                  }}
                >
                  {tt("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(t("viewingLogs", { number: row.original.phoneNumber }));
                  }}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  {t("viewingLogs", { number: "" }).replace(": ", "")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast.success(isBlock ? t("moveToAllowlist") : t("moveToBlocklist"));
                  }}
                >
                  <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
                  {isBlock ? t("moveToAllowlist") : t("moveToBlocklist")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    toast.error(t("deletedEntry", { number: row.original.phoneNumber }));
                  }}
                >
                  {tt("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tt],
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
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchBlacklist")}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-64 pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon className="mr-2 h-4 w-4" />
                {tt("columns")}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={() => {
              toast.success(t("addEntry"));
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("addEntry")}
          </Button>
        </div>
      </div>

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
                  {t("noBlacklist")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {tt("selectedRows", {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {tt("rowsPerPage")}
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            {tt("pageOf", {
              current: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{tt("goToFirst")}</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{tt("goToPrevious")}</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{tt("goToNext")}</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{tt("goToLast")}</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
