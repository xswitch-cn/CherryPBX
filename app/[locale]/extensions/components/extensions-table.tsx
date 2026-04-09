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
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  PhoneCallIcon,
  CircleIcon,
  DownloadIcon,
  UploadIcon,
  CloudUploadIcon,
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importFiles, setImportFiles] = React.useState<File[]>([]);

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
                  toast.success(`${t("Make Call")} ${row.original.extn}`);
                }}
              >
                <PhoneCallIcon className="mr-2 h-4 w-4" />
                {t("Make Call")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const locale = document.documentElement.lang || "zh";
                  window.location.href = `/${locale}/extensions/${row.original.id}`;
                }}
              >
                {tt("viewDetails")}
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

  const handleExportExtensions = React.useCallback(
    async (fileType?: string) => {
      const search_extn_status =
        filters.status === "online" || filters.status === "offline" ? filters.status : "all";
      const lang = document.documentElement.lang || "zh";

      try {
        const response = await extensionsApi.download({
          status: search_extn_status,
          language: lang,
          fileType: fileType,
          extn: filters.extn,
          name: filters.name,
        });

        const data = response.data;
        data.sort((a: any, b: any) => {
          return a[0] - b[0];
        });

        void import("xlsx").then((XLSX) => {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([...data]);
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
          XLSX.writeFile(wb, "extensions_download.xlsx", { compression: true });
          toast.success(t("Download successfully!") || "下载成功");
        });
      } catch (error) {
        console.error("Failed to download extensions:", error);
        toast.error(t("Export Failed") || "导出失败");
      }
    },
    [filters, t],
  );

  const handleDownload = async (key: number) => {
    if (key === 0) {
      await handleExportExtensions();
    } else if (key === 1) {
      await handleExportExtensions("wps");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  const handleImport = async () => {
    // 处理文件上传
    if (importFiles.length === 0) {
      toast.error(t("Select Import Attachment") || "请选择要导入的文件");
      return;
    }

    try {
      // 处理每个文件
      for (const file of importFiles) {
        await new Promise<void>((resolve, _reject) => {
          // 读取并解析Excel文件
          const fileReader = new FileReader();
          fileReader.readAsArrayBuffer(file);

          fileReader.onload = async (event) => {
            try {
              const { result } = event.target as FileReader;

              if (!result) {
                throw new Error(t("Import Failed") || "文件读取失败");
              }

              // 动态导入xlsx库
              const xlsxModule = await import("xlsx");
              const XLSX = xlsxModule.default || xlsxModule;

              if (!XLSX || typeof XLSX.read !== "function") {
                throw new Error(t("Import Failed") || "XLSX库加载失败");
              }

              const workbook = XLSX.read(result, { type: "array" });
              let data: any[] = [];

              if (workbook && workbook.Sheets) {
                for (const sheet in workbook.Sheets) {
                  if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
                      raw: false,
                    });
                    data = data.concat(sheetData);
                  }
                }
              }

              // 发送数据到服务器
              const response = await extensionsApi.upload({ extensions: data });

              toast.success(
                `${t("Import Success") || "导入成功"}: ${response.data?.data?.length || 0} 项`,
              );
              resolve();
            } catch (error) {
              console.error(`Failed to parse Excel file ${file.name}:`, error);
              toast.error(`${t("Import Failed") || "导入失败"}: ${file.name}`);
              resolve(); // 继续处理下一个文件
            }
          };

          fileReader.onerror = () => {
            console.error(`Failed to read file ${file.name}`);
            toast.error(`${t("Import Failed") || "导入失败"}: ${file.name}`);
            resolve(); // 继续处理下一个文件
          };
        });
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Failed to import extensions:", error);
      toast.error(t("Import Failed") || "导入失败");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                {t("Export")}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => void handleDownload(0)}>
                {t("Export")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleDownload(1)}>
                {t("Export")}({t("WPS Compatible")})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <UploadIcon className="mr-2 h-4 w-4" />
            {t("Import")}
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
                  {t("noExtensions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("Import") || "导入"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border border-dashed rounded-lg p-10 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-primary");
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  setImportFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
                }
              }}
            >
              <CloudUploadIcon className="mx-auto h-16 w-16 text-primary mb-6" />
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {ttt("Please drag and drop the file here or") || "请将导入文件或选择文件"}
                  <Button
                    variant="default"
                    className="ml-2 bg-primary text-white hover:bg-primary/90"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {ttt("Select File") || "选择文件"}
                  </Button>
                </p>
                <p className="text-xs text-gray-500">
                  {ttt("User upload hint") || "仅支持.xls和.xlsx文件"}
                </p>
              </div>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
            </div>

            {importFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {importFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md">
                    <div className="flex items-center gap-2">
                      <CloudUploadIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      {t("Delete") || "删除"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportFiles([]);
                }}
              >
                {t("close") || "关闭"}
              </Button>
              <Button
                onClick={() => void handleImport()}
                className="ml-2 bg-primary text-white hover:bg-primary/90"
                disabled={importFiles.length === 0}
              >
                {t("submit") || "提交"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
