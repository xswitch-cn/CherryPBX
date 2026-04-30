"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, RouteIcon } from "lucide-react";
import { type MediaFile } from "@repo/api-client";
import { useRouter } from "@/navigation";
import { AudioPlayer } from "@/components/ui/audio-player";
import { formatSizeUnits } from "@/lib/utils";

interface TranslationFunctions {
  t: (key: string, params?: Record<string, any>) => string;
  tt: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createMediaColumns({
  t,
  tt,
  tc,
  router,
  onHandleDelete,
}: TranslationFunctions & { onRefresh?: () => Promise<void> } & {
  router: ReturnType<typeof useRouter>;
  onHandleDelete: (media: MediaFile) => void;
}): ColumnDef<MediaFile>[] {
  return [
    {
      accessorKey: "name",
      header: () => t("name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => t("type"),
      cell: ({ row }) => (
        <span className="capitalize">{row?.original?.type ? tc(row?.original?.type) : "-"}</span>
      ),
    },
    {
      accessorKey: "file_size",
      header: () => t("size"),
      cell: ({ row }) => (
        <span className="capitalize">{formatSizeUnits(row.original.file_size)}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => tc("createdAt"),
    },
    {
      accessorKey: "description",
      header: () => tc("description"),
    },
    {
      accessorKey: "audio",
      header: () => tc("play"),
      cell: ({ row }) => {
        const audioUrl = `/api/media_files/${row.original.id}.${row.original.ext}`;
        return <AudioPlayer url={audioUrl} />;
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
                <span className="sr-only">{tt("edit")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {/* <DropdownMenuItem
                onClick={() => {
                  toast.info(t("editingRoute", { name: row.original.name }));
                }}
              >
                {tt("edit")}
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onClick={() => {
                  toast.success(t("testingRoute", { name: row.original.name }));
                }}
              >
                {t("testRoute")}
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/routes/${row.original.id}`);
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
                {tt("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
