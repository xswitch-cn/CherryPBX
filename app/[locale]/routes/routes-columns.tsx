"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EllipsisVerticalIcon, RouteIcon } from "lucide-react";
import type { Route } from "@repo/api-client";
import { useRouter } from "@/navigation";
import { Switch } from "@/components/ui/switch";
import { routesApi } from "@/lib/api-client";

interface TranslationFunctions {
  t: (key: string, params?: Record<string, any>) => string;
  tt: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, params?: Record<string, any>) => string;
}

export function createRouteColumns({
  t,
  tt,
  tc,
  router,
  onHandleDelete,
  onRefresh,
}: TranslationFunctions & { onRefresh?: () => Promise<void> } & {
  router: ReturnType<typeof useRouter>;
  onHandleDelete: (route: Route) => void;
}): ColumnDef<Route>[] {
  const handleToggleEnabled = async (route: Route) => {
    try {
      await routesApi.update(route.id.toString(), { action: "toggle" });
      await onRefresh?.();
    } catch (error) {
      console.error("Failed to update gateway status:", error);
    }
  };

  return [
    {
      accessorKey: "name",
      header: () => t("routeName"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "context",
      header: () => t("callSource"),
    },
    {
      accessorKey: "prefix",
      header: () => t("calledPrefix"),
      cell: ({ row }) =>
        row.original.prefix ? (
          <code className="rounded bg-muted px-2 py-1 text-xs">{row.original.prefix}</code>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      accessorKey: "destination",
      header: () => t("destination"),
      cell: ({ row }) => {
        const destination = row.original.body || "-";
        const destType = row.original.dest_type || "";
        const needsTruncation = destination.length > 30;

        const content = (
          <div className="max-w-[200px] truncate text-sm">
            <span className="font-medium text-muted-foreground">{t(destType)}</span>
            <br />
            {destination}
          </div>
        );

        return needsTruncation ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] break-words">
                <p className="text-sm">{destination}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          content
        );
      },
    },
    {
      accessorKey: "disabled",
      header: () => tc("enabled"),
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.disabled === 0}
            onCheckedChange={() => {
              void handleToggleEnabled(row.original);
            }}
          />
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
                {tt("viewDetails")}
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
