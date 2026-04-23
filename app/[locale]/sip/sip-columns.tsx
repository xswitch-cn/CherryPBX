"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Sip } from "@repo/api-client";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface TranslationFunctions {
  t: (key: string, params?: Record<string, any>) => string;
  ts: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createSipColumns({
  ts,
  tc,
  router,
  onHandleDelete,
}: TranslationFunctions & {
  router: ReturnType<typeof useRouter>;
  onHandleDelete: (sip: Sip) => void;
}): ColumnDef<Sip>[] {
  return [
    {
      accessorKey: "id",
      header: () => "ID",
    },
    {
      accessorKey: "name",
      header: () => ts("name"),
      cell: ({ row }) => <span className="font-medium text-primary">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: () => ts("description"),
    },
    {
      accessorKey: "url",
      header: () => ts("Data"),
      cell: ({ row }) => {
        const url = row.original.url;
        if (!url) return <span className="text-muted-foreground">-</span>;
        // 如果 URL 太长，截断显示
        const displayUrl = url.length > 50 ? `${url.substring(0, 50)}...` : url;
        return (
          <span className="font-mono text-xs" title={url}>
            {displayUrl}
          </span>
        );
      },
    },
    {
      accessorKey: "disabled",
      header: () => tc("enabled"),
      cell: () => {
        return <Switch />;
      },
    },
    {
      id: "control",
      header: () => tc("control"),
      cell: () => {
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {/* 启动/停止按钮 - 未禁用时显示 */}
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              {tc("start")}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button variant="link" size="sm" className="h-auto p-0 text-destructive">
              {tc("stop")}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-4" />
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">{tc("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/sip/${row.original.id}`);
                }}
              >
                {tc("Details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  onHandleDelete(row.original);
                }}
              >
                {tc("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
