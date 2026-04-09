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
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CdrFilterForm, type FilterField } from "@/components/ui/cdr-filter-form";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { createClient, type Cdr } from "@repo/api-client";
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
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  PlayIcon,
  DownloadIcon,
} from "lucide-react";
import { CdrDetailDialog } from "./cdr-detail-dialog";
import { usersApi } from "@/lib/api-client";

export function CdrTable({
  data: initialData,
  rowCount = 0,
  onFilterChange,
  pageSize = 10,
  pageIndex = 0,
}: {
  data: any[];
  rowCount?: number;
  onFilterChange?: (filters: {
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
  }) => void;
  pageSize?: number;
  pageIndex?: number;
}) {
  const t = useTranslations("cdr");
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
  const [contexts, setContexts] = React.useState<Array<{ key: string; name: string }>>([]);

  const today = new Date();

  const [filters, setFilters] = React.useState({
    startDate: today.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    cidNumber: "",
    destNumber: "",
    uuid: "",
    contextValue: "",
    groupValue: "",
    routeID: "",
    startBillsec: "",
    endBillsec: "",
  });

  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);
  const [selectedCdr, setSelectedCdr] = React.useState<Cdr | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [currentPlayingId, setCurrentPlayingId] = React.useState<string | null>(null);
  const audioPlayer = React.useRef<HTMLAudioElement | null>(null);
  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  const [waitValue, setWaitValue] = React.useState<string[]>([]);
  const [allCheck, setAllCheck] = React.useState(false);

  React.useEffect(() => {
    audioPlayer.current = new Audio();
    audioPlayer.current.onended = () => {
      setCurrentPlayingId(null);
    };

    return () => {
      if (audioPlayer.current) {
        audioPlayer.current.pause();
        audioPlayer.current.src = "";
        audioPlayer.current = null;
      }
    };
  }, []);

  const apiClient = React.useMemo(
    () =>
      createClient({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
      }),
    [],
  );

  React.useEffect(() => {
    const fetchContexts = async () => {
      try {
        console.log("Fetching contexts...");
        const response = await usersApi.contexts();
        console.log("Contexts response:", response);
        const responseData = response.data as any;
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          console.log("Contexts data:", responseData.data);
          setContexts(responseData.data);
          console.log("Contexts state set:", responseData.data.length, "items");
        } else {
          console.log("No contexts data:", response);
        }
      } catch (error) {
        console.error("Failed to fetch contexts:", error);
      }
    };

    void fetchContexts();
  }, []);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "direction",
        header: "-",
        cell: ({ row }) => {
          const direction = row.original.direction;
          if (!direction) return "-";
          const isInbound = direction === "inbound";
          return (
            <div className="flex items-center justify-center">
              {isInbound ? (
                <PhoneIncomingIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <PhoneOutgoingIcon className="h-4 w-4 text-green-500" />
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "caller_id_info",
        header: t("CID Info"),
        cell: ({ row }) => (
          <div className="max-w-[150px] whitespace-normal">
            <span>{row.original.caller_id_name || "-"}</span>
            <br />
            <span className="text-sm text-muted-foreground">
              {row.original.caller_id_number || "-"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "destination_number",
        header: t("Dest Number"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.destination_number || "-"}</span>
        ),
      },
      {
        accessorKey: "context",
        header: t("Context"),
        cell: ({ row }) => (
          <div>
            <span>{row.original.context || "-"}</span>
          </div>
        ),
      },
      {
        accessorKey: "network_addr",
        header: t("Network Addr"),
        cell: ({ row }) => (
          <span>
            {row.original.network_addr || "-"}
            {row.original.network_port ? ":" : ""}
            {row.original.network_port || ""}
          </span>
        ),
      },
      {
        accessorKey: "start_stamp",
        header: t("Start Time"),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {row.original.start_stamp || "-"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "answer_stamp",
        header: t("Answer Time"),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {row.original.answer_stamp || "-"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "end_stamp",
        header: t("End Time"),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {row.original.end_stamp || "-"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "duration",
        header: t("Duration"),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="font-mono">{row.original.duration || "-"}</span>
          </div>
        ),
      },
      {
        accessorKey: "billsec",
        header: t("Bill Sec"),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="font-mono">{row.original.billsec || "-"}</span>
          </div>
        ),
      },
      {
        accessorKey: "hangup_cause",
        header: t("Cause"),
        cell: ({ row }) => (
          <>
            <span
              className={
                row.original.hangup_cause === "NORMAL_CLEARING" ? "text-green-600" : "text-red-600"
              }
            >
              {t(`${row.original.hangup_cause}`) || t(`${row.original.xui_hangup_cause}`) || "-"}
            </span>
            <br />
            {row.original.hangup_cause !== "MANAGER_REQUEST" && (
              <span>{t(`${row.original.sip_hangup_disposition}`) || "-"}</span>
            )}
          </>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const record = row.original;
          const isPlaying = currentPlayingId === record.uuid;
          const hasMedia = !!record.media_file_id;

          const handlePlayRecording = () => {
            if (!audioPlayer.current || !hasMedia) return;

            if (isPlaying) {
              audioPlayer.current.pause();
              setCurrentPlayingId(null);
            } else {
              audioPlayer.current.pause();
              const fileExtension = record.rel_path?.split(".")[1] || "mp3";
              audioPlayer.current.src = `/api/media_files/${record.media_file_id}.${fileExtension}`;
              audioPlayer.current
                .play()
                .then(() => {
                  setCurrentPlayingId(record.uuid);
                })
                .catch((error) => {
                  console.error(error);
                  setCurrentPlayingId(null);
                });
            }
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <EllipsisVerticalIcon />
                  <span className="sr-only">{tt("viewDetails")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCdr(record as Cdr);
                    setDetailDialogOpen(true);
                  }}
                >
                  {t("viewDetails")}
                </DropdownMenuItem>
                {hasMedia && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handlePlayRecording}>
                      <PlayIcon className="mr-2 h-4 w-4" />
                      {isPlaying ? t("stopRecording") : t("playRecording")}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                      onClick={() => {
                        if (hasMedia) {
                          const fileExtension = record.rel_path?.split(".")[1] || "mp3";
                          const src = `/api/media_files/${record.media_file_id}.${fileExtension}`;
                          const link = document.createElement("a");
                          link.href = src;
                          link.download = `${record.caller_id_number}-${record.destination_number}-${record.start_stamp}.${fileExtension}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          toast.success(t("downloadRecording"));
                        }
                      }}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      {t("downloadRecording")}
                    </DropdownMenuItem> */}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tt, currentPlayingId],
  );

  const table = useReactTable<any>({
    data,
    columns,
    state: {
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.uuid,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filterFields = React.useMemo<FilterField[]>(() => {
    console.log("Creating filterFields with contexts:", contexts);

    const basicFields: FilterField[] = [
      {
        name: "startDate",
        type: "custom",
        render: () => null,
      },
      {
        name: "endDate",
        type: "custom",
        render: () => null,
      },
      {
        name: "dateRange",
        type: "custom",
        render: (form) => (
          <div style={{ width: "280px" }}>
            <DateRangePicker
              startDate={filters.startDate || null}
              endDate={filters.endDate || null}
              onDateChange={(start, end) => {
                form.setValue("startDate", start || "");
                form.setValue("endDate", end || "");

                const newFilters = {
                  ...filters,
                  startDate: start || "",
                  endDate: end || "",
                };
                setFilters(newFilters);
              }}
            />
          </div>
        ),
      },
      {
        name: "cidNumber",
        type: "search",
        placeholder: t("CID Number"),
        width: "150px",
      },
      {
        name: "destNumber",
        type: "search",
        placeholder: t("Dest Number"),
        width: "150px",
      },
      {
        name: "uuid",
        type: "search",
        placeholder: t("Call UUID"),
        width: "200px",
      },
    ];

    const advancedFields: FilterField[] = [
      {
        name: "contextValue",
        type: "select",
        label: t("Context"),
        options: [
          { value: "", label: "全部" },
          ...contexts.map((context) => ({
            value: context.key,
            label: `${context.name}(${context.key})`,
          })),
          { value: "default", label: "default(default)" },
        ],
        width: "180px",
      },
      {
        name: "groupValue",
        type: "search",
        placeholder: t("Groups"),
        width: "150px",
      },
      {
        name: "routeID",
        type: "search",
        placeholder: t("Routes"),
        width: "150px",
      },
      {
        name: "startBillsec",
        type: "search",
        placeholder: t("Bill Sec Minimum"),
        width: "150px",
      },
      {
        name: "endBillsec",
        type: "search",
        placeholder: t("Bill Sec Maximum"),
        width: "150px",
      },
    ];

    return [...basicFields, ...(showAdvancedSearch ? advancedFields : [])];
  }, [contexts, t, showAdvancedSearch, filters]);

  const handleFilterSubmit = (newFilters: Record<string, any>) => {
    const today = new Date().toISOString().split("T")[0];

    if (Object.keys(newFilters).length === 0) {
      const resetFilters = {
        startDate: today,
        endDate: today,
        cidNumber: "",
        destNumber: "",
        uuid: "",
        contextValue: "",
        groupValue: "",
        routeID: "",
        startBillsec: "",
        endBillsec: "",
      };
      setFilters(resetFilters);
      if (onFilterChange) {
        onFilterChange(resetFilters);
      }
      return;
    }

    const updatedFilters = {
      ...filters,
      ...newFilters,
    };

    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handleBatchCheck = (type: string, id: number | string) => {
    let newWaitValue: string[] = [...waitValue];
    let newAllCheck = allCheck;
    let newSelectedType = selectedType;

    if (type === "select") {
      if (id === 0) {
        newWaitValue = data.map((row) => row.uuid);
        newAllCheck = true;
        newSelectedType = 0;
      } else if (id === 1) {
        newWaitValue = table.getRowModel().rows.map((row) => row.original.uuid);
        newAllCheck = false;
        newSelectedType = 1;
      } else if (id === 2) {
        newWaitValue = [];
        newAllCheck = false;
        newSelectedType = 2;
      }
    } else if (type === "solo") {
      const uuid = id as string;
      const index = newWaitValue.indexOf(uuid);
      if (index === -1) {
        newWaitValue.push(uuid);
      } else {
        newWaitValue.splice(index, 1);
      }
      newSelectedType = null;
      newAllCheck = false;
    }

    setWaitValue(newWaitValue);
    setAllCheck(newAllCheck);
    setSelectedType(newSelectedType);
  };

  const handleCdrs = async (fileType?: string) => {
    const {
      startDate,
      endDate,
      startBillsec,
      endBillsec,
      cidNumber,
      destNumber,
      contextValue,
      routeID,
      groupValue,
      uuid,
    } = filters;

    if (!allCheck) {
      let qs = `${startDate ? `startDate=${startDate}` : ""}
                ${endDate ? `&endDate=${endDate}` : ""}
                ${startBillsec ? `&startBillsec=${startBillsec}` : ""}
                ${endBillsec ? `&endBillsec=${endBillsec}` : ""}
                ${cidNumber ? `&cidNumber=${cidNumber}` : ""}
                ${destNumber ? `&destNumber=${destNumber}` : ""}
                ${contextValue ? `&contextValue=${contextValue}` : ""}
                ${routeID ? `&routeID=${routeID}` : ""}
                ${groupValue ? `&groupValue=${groupValue}` : ""}
                ${fileType ? `&fileType=${fileType}` : ""}`;

      const url = `/api/cdrs/uuids_download?${qs}`;

      // 发送请求并处理响应
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      const data = {
        uuids: waitValue,
        language: localStorage.getItem("xui.lang"),
      };

      if (fileType) {
        (data as any).fileType = fileType;
      }

      xhr.send(JSON.stringify(data));

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const responseData = xhr.responseText;
          downloadCSV(responseData, "download_cdrs.csv");
        }
      };
    } else {
      // 跨页选择
      const qs = `${startDate ? `startDate=${startDate}` : ""}
                ${endDate ? `&endDate=${endDate}` : ""}
                ${startBillsec ? `&startBillsec=${startBillsec}` : ""}
                ${endBillsec ? `&endBillsec=${endBillsec}` : ""}
                ${cidNumber ? `&cidNumber=${cidNumber}` : ""}
                ${destNumber ? `&destNumber=${destNumber}` : ""}
                ${contextValue ? `&contextValue=${contextValue}` : ""}
                ${groupValue ? `&groupValue=${groupValue}` : ""}
                ${routeID ? `&routeID=${routeID}` : ""}
                ${uuid ? `&uuid=${uuid}` : ""}
                ${fileType ? `&fileType=${fileType}` : ""}`;

      let url = `/api/cdrs/download?${qs}`;
      const lang = localStorage.getItem("xui.lang");
      if (lang) {
        url += `&language=${lang}`;
      }

      downloadCdrs(url);
    }

    setTimeout(() => {
      setAllCheck(false);
      setWaitValue([]);
      setSelectedType(null);
    }, 1500);
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvData], { type: "text/csv;charset=utf-8;" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success(t("downloadRecording"));
  };

  const downloadCdrs = (url: string) => {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, data], { type: "text/csv;charset=utf-8;" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "cdrs_download" + ".csv";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(t("downloadRecording"));
      })
      .catch((error) => {
        console.error("Failed to download CDRs:", error);
        toast.error("下载话单失败");
      });
  };

  // 处理下载
  const handleDownload = (key: number) => {
    const download = async () => {
      if (key === 0) {
        await handleCdrs();
      } else if (key === 1) {
        await handleCdrs();
      } else if (key === 2) {
      } else if (key === 3) {
        await handleCdrs("wps");
      } else if (key === 4) {
        await handleCdrs("wps");
      }
    };
    void download();
  };

  return (
    <div className="flex flex-col gap-4">
      <CdrFilterForm
        fields={filterFields}
        onFilterChange={handleFilterSubmit}
        defaultValues={{
          startDate: filters.startDate,
          endDate: filters.endDate,
          cidNumber: filters.cidNumber,
          destNumber: filters.destNumber,
          uuid: filters.uuid,
          contextValue: filters.contextValue,
          groupValue: filters.groupValue,
          routeID: filters.routeID,
          startBillsec: filters.startBillsec,
          endBillsec: filters.endBillsec,
        }}
        translationPrefix="cdr"
        showClearButton={true}
        showApplyButton={true}
        renderActions={() => (
          <Button
            variant="ghost"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="mr-2"
          >
            {showAdvancedSearch ? "收起高级搜索" : "高级搜索"}
          </Button>
        )}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                选择
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleBatchCheck("select", 0)}>
                选择所有跨页
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchCheck("select", 1)}>
                选择当前页
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchCheck("select", 2)}>
                清除所有
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={waitValue.length === 0 && selectedType !== 0}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                导出
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleDownload(0)}>仅导出话单</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(3)}>
                仅导出话单(WPS兼容)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(2)}>仅导出录音</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(1)}>导出话单和录音</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(4)}>
                导出话单和录音(WPS兼容)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-muted-foreground">
            已选择 {selectedType === 0 ? rowCount : selectedType === 2 ? 0 : waitValue.length} 项
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allCheck}
                  onChange={() => handleBatchCheck("select", allCheck ? 2 : 0)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={allCheck || waitValue.includes(row.original.uuid)}
                      onChange={() => handleBatchCheck("solo", row.original.uuid)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  {t("noCdr")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CdrDetailDialog
        cdr={selectedCdr}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
