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
  GlobeIcon,
  ServerIcon,
  PhoneCallIcon,
  ActivityIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  SearchIcon,
  RefreshCwIcon,
  PowerIcon,
} from "lucide-react";

export const trunkSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  host: z.string(),
  port: z.number(),
  status: z.string(),
  channels: z.number(),
  activeCalls: z.number(),
  registered: z.boolean(),
  lastRegistration: z.string(),
});

export function TrunksTable({ data: initialData }: { data: z.infer<typeof trunkSchema>[] }) {
  const t = useTranslations("trunks");
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

  const columns = React.useMemo<ColumnDef<z.infer<typeof trunkSchema>>[]>(
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
        accessorKey: "name",
        header: t("trunkName"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: t("type"),
        cell: ({ row }) => {
          const type = row.original.type;
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

          switch (type) {
            case "SIP":
              variant = "default";
              break;
            case "PJSIP":
              variant = "secondary";
              break;
            case "IAX2":
              variant = "destructive";
              break;
            case "DAHDI":
              variant = "outline";
              break;
          }

          return <Badge variant={variant}>{type}</Badge>;
        },
      },
      {
        accessorKey: "host",
        header: t("host"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <ServerIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{row.original.host}</span>
            {row.original.port > 0 && (
              <span className="text-xs text-muted-foreground">:{row.original.port}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
          const status = row.original.status;
          let icon = <ActivityIcon className="h-4 w-4" />;
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
          let className = "";

          switch (status) {
            case "Online":
              icon = <CheckCircleIcon className="h-4 w-4 text-green-500" />;
              variant = "default";
              className = "bg-green-500/10 text-green-600 hover:bg-green-500/20";
              break;
            case "Offline":
              icon = <XCircleIcon className="h-4 w-4 text-red-500" />;
              variant = "secondary";
              className = "bg-red-500/10 text-red-600 hover:bg-red-500/20";
              break;
            case "Standby":
              icon = <PowerIcon className="h-4 w-4 text-blue-500" />;
              variant = "secondary";
              className = "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
              break;
            case "Warning":
              icon = <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
              variant = "secondary";
              className = "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
              break;
            case "Disabled":
              icon = <PowerIcon className="h-4 w-4 text-gray-400" />;
              variant = "outline";
              className = "text-gray-500";
              break;
          }

          return (
            <Badge variant={variant} className={`flex w-fit items-center gap-1 ${className}`}>
              {icon}
              {t(status.toLowerCase() as "online" | "offline" | "standby" | "warning" | "disabled")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "channels",
        header: t("channels"),
        cell: ({ row }) => <span className="font-medium">{row.original.channels}</span>,
      },
      {
        accessorKey: "activeCalls",
        header: t("activeCalls"),
        cell: ({ row }) => {
          const active = row.original.activeCalls;
          const total = row.original.channels;
          const percentage = (active / total) * 100;

          let colorClass = "text-green-600";
          if (percentage > 70) colorClass = "text-yellow-600";
          if (percentage > 90) colorClass = "text-red-600";

          return (
            <div className="flex items-center gap-2">
              <PhoneCallIcon className="h-4 w-4 text-muted-foreground" />
              <span className={colorClass}>
                {active}/{total}
              </span>
              <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    percentage > 90
                      ? "bg-red-500"
                      : percentage > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "registered",
        header: t("registered"),
        cell: ({ row }) =>
          row.original.registered ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500" />
          ),
      },
      {
        accessorKey: "lastRegistration",
        header: t("lastRegistration"),
        cell: ({ row }) => {
          const value = row.original.lastRegistration;
          if (value === "-") return <span className="text-muted-foreground text-sm">-</span>;
          const date = new Date(value);
          const formatted = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
          return <span className="text-muted-foreground text-sm">{formatted}</span>;
        },
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
                  toast.info(t("editingTrunk", { name: row.original.name }));
                }}
              >
                {tt("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success(t("reRegistering", { name: row.original.name }));
                }}
              >
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                {t("reRegister")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success(t("viewingStats", { name: row.original.name }));
                }}
              >
                {tt("viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  toast.error(t("deletedTrunk", { name: row.original.name }));
                }}
              >
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
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
              placeholder={t("searchTrunks")}
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
              toast.success(t("addTrunk"));
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("addTrunk")}
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
                  {t("noTrunks")}
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
