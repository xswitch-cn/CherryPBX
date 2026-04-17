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
} from "@tanstack/react-table";
import { toast } from "sonner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EllipsisVerticalIcon, PhoneOutgoingIcon } from "lucide-react";

export const dodSchema = z.object({
  id: z.number(),
  dodNumber: z.string(),
  provider: z.string(),
  callerId: z.string(),
  status: z.string(),
  description: z.string(),
  usedBy: z.string(),
});

import { dodsApi } from "@/lib/api-client";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export function DodTable({
  data: initialData,
  onDataChange,
}: {
  data: any[];
  onDataChange?: () => void;
  pageSize: number;
  pageIndex: number;
}) {
  const t = useTranslations("dod");
  const ttt = useTranslations("common");
  const [data] = React.useState(() => initialData);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDod, setSelectedDod] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!selectedDod) return;

    try {
      setLoading(true);
      await dodsApi.delete(selectedDod.id);
      toast.success(t("deletedDod", { number: selectedDod.line_number }));
      if (onDataChange) {
        onDataChange();
      }
      setDeleteDialogOpen(false);
      setSelectedDod(null);
    } catch (error) {
      console.error("Failed to delete dod:", error);
      toast.error(ttt("deleteFailed") || "删除失败");
    } finally {
      setLoading(false);
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "line_number",
        header: t("lineNumber"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
              <PhoneOutgoingIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-mono font-medium">{row.original.line_number}</span>
          </div>
        ),
      },
      { accessorKey: "extn", header: t("extension") },
      { accessorKey: "resource_type", header: t("resourceType") },
      { accessorKey: "resource_name", header: t("resourceName") },
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
                <span className="sr-only">{ttt("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  const locale = document.documentElement.lang || "zh";
                  window.location.href = `/${locale}/dod/${row.original.id}`;
                }}
              >
                详情
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSelectedDod(row.original);
                  setDeleteDialogOpen(true);
                }}
              >
                {ttt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, ttt],
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
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
        title={t("deleteDod")}
        description={t("deleteItem", { item: selectedDod?.line_number })}
        deleteText={ttt("confirm") || "确定"}
        cancelText={ttt("cancel") || "取消"}
        isLoading={loading}
      />
    </div>
  );
}
