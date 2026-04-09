"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCwIcon } from "lucide-react";

/**
 * 通用列表表格组件 Props
 */
export interface ListTableProps<TData> {
  /** 列定义 */
  columns: ColumnDef<TData, unknown>[];
  /** 表格数据 */
  data: TData[];
  /** 加载状态 */
  isLoading?: boolean;
  /** 启用行选择 */
  selection?: boolean;
  /** 空数据提示文本 */
  emptyText?: string;
  /** 加载中提示文本 */
  loadingText?: string;
  /** 排序变化回调（服务端排序时使用） */
  onSortChange?: (sortField: string, sortOrder: "asc" | "desc") => void;
  /** 选择变化回调 */
  onSelectionChange?: (selected: TData[]) => void;
  /** 国际化翻译前缀 */
  translationPrefix?: string;
}

/**
 * 通用列表表格组件
 *
 * @example
 * ```tsx
 * <ListTable
 *   columns={columns}
 *   data={data}
 *   isLoading={isLoading}
 *   selection
 *   emptyText="暂无数据"
 * />
 * ```
 */
export function ListTable<TData>({
  columns: userColumns,
  data,
  isLoading = false,
  selection = false,
  emptyText,
  loadingText,
  onSortChange,
  onSelectionChange,
  translationPrefix = "table",
}: ListTableProps<TData>) {
  const t = useTranslations(translationPrefix);

  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // 处理排序变化
  const handleSortingChange = React.useCallback(
    (updaterOrValue: unknown) => {
      const newSorting =
        typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;

      setSorting(newSorting as SortingState);

      if (onSortChange && Array.isArray(newSorting) && newSorting.length > 0) {
        const sortItem = newSorting[0];
        onSortChange(sortItem.id, sortItem.desc ? "desc" : "asc");
      }
    },
    [onSortChange, sorting],
  );

  // 处理选择变化
  const handleRowSelectionChange = React.useCallback(
    (updaterOrValue: any) => {
      // 计算新的选择状态
      const newRowSelection =
        typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;

      setRowSelection(newRowSelection);

      if (onSelectionChange) {
        // 计算选中的行数据
        let selectedRows: TData[] = [];

        // 检查 newRowSelection 的类型和格式
        if (typeof newRowSelection === "object" && newRowSelection !== null) {
          if (Object.keys(newRowSelection).every((key) => !isNaN(Number(key)))) {
            selectedRows = data.filter((_, index) => newRowSelection[index] === true);
          }
          // else {
          //   selectedRows = data.filter(row => newRowSelection[row.id] === true);
          // }
        }

        onSelectionChange(selectedRows);
      }
    },
    [data, onSelectionChange, rowSelection],
  );

  // 构建列定义（添加选择列）
  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    if (!selection) {
      return userColumns;
    }

    return [
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
              aria-label={t("selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t("selectRow")}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...userColumns,
    ];
  }, [userColumns, selection, t]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // 服务端分页
    rowCount: data.length,
  });

  // 默认文本
  const defaultEmptyText = emptyText || t("noData") || "暂无数据";
  const defaultLoadingText = loadingText || t("loading") || "加载中...";

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCwIcon className="h-5 w-5 animate-spin" />
                  <span>{defaultLoadingText}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
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
                {defaultEmptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
